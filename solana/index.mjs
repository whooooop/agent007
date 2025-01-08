import { Logger } from '../utils/logger.mjs'

import chalk from 'chalk'
import { SolanaRepository } from './repository.mjs'
import { SolanaRpc } from './rpc.mjs'
import { Telegram } from '../telegram/index.mjs'
import { absBigInt } from './helpers/bigint.mjs'
import { getAnotherTokenFromSwap, getTokenAccountAddress, getTokensFromSwaps } from './helpers/token.mjs'
import { swapTemplate } from './messages/swap.mjs'
import { promisify } from 'util'

const logger = new Logger('solana');
const sleep = promisify(setTimeout);

export class Solana {
    processing = false;
    interval = null;
    loopDelay = 40000;

    async initialize (app) {
        this.rpc = await app.inject(SolanaRpc);
        this.repository = await app.inject(SolanaRepository);
        this.telegram = await app.inject(Telegram);
    }

    async watch () {
        this.interval = setInterval(async () => {
            if (this.processing) return;
            try {
                this.processing = true;
                await this.loop();
            } finally {
                this.processing = false;
            }
        }, this.loopDelay);
    }

    async loop() {
        const accounts = await this.repository.getAccountsToWatch()
        for (const account of accounts) {
            await this.updateWatchAccount(account);
        }
    }

    async addAccountToWatch (accountAddress, chatId = null) {
        const signatures = await this.rpc.getFinalizedSignaturesForAddress(accountAddress, { limit: 1 });
        const lastSignature = signatures[0].signature;
        await this.repository.addAccountToWatch(accountAddress, lastSignature, chatId);
    }

    async test() {
        const account = 'GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z';
        // const signature = 'M8QmNPqeoGS6QXYUqCSNBdb5Tjnd7SS4Uqaw2dZivm1jvNU3Jef3FyoCrXtJi42g6iUCEvwMx87RVurPSTwUg7R';
        // const tx = await this.addTx(signature);
        // if (tx.swap) {
        //     const tokenSwap = getAnotherTokenFromSwap(tx.swap);
        //     const tokenAccountAddress = await getTokenAccountAddress(account, tokenSwap);
        //     await this.indexAccountToken(tokenAccountAddress);
        //     await this.swapNotification(account, tokenSwap, '5008441322');
        // }

        // setInterval(async () => {
        //     try {
        //         const r1 = await this.rpc.getFinalizedSignaturesForAddress(account, { limit: 1 });
        //         console.log('r1', r1)
        //     } catch (e) {
        //         console.log('eeeee', e)
        //     }
        // }, 2000);
    }

    async updateWatchAccount({ account, last_signature, chat_id }) {
        logger.log('Find new tx`s by account', account, last_signature);
        const signatures = await this.rpc.getFinalizedSignaturesForAddress(account, { limit: 1000, until: last_signature });

        for (const { signature } of signatures.reverse()) {
            const tx = await this.addTx(signature);
            await this.repository.updateLastSignatureForAccountToWatch(account, signature);
            if (tx.swap) {
                const tokenSwap = getAnotherTokenFromSwap(tx.swap);
                const tokenAccountAddress = await getTokenAccountAddress(account, tokenSwap);
                await this.indexAccountToken(tokenAccountAddress);
                await this.swapNotification(account, tokenSwap, chat_id);
            }
        }
    }

    async swapNotification (accountAddress, tokenSwap, chatId) {
        const swaps = await this.getAccountTokenSwaps(accountAddress, tokenSwap);
        const message = await swapTemplate(accountAddress, tokenSwap, swaps);

        const connection = await this.telegram.client.getConnection();
        await connection.sendMessage(chatId, {
            message,
            parseMode: 'html'
        });
    }

    async indexAccountToken(accountTokenAddress, limit = 100) {
        const signatures = await this.rpc.getFinalizedSignaturesForAddress(accountTokenAddress, { limit });
        const indexedSignatures = await this.repository.getAccountTokenSwapsBySignatures(signatures.map(({signature}) => signature));
        const indexedSignaturesMap = new Set(indexedSignatures.map(({signature}) => signature));

        for (const { signature } of signatures) {
            if (!indexedSignaturesMap.has(signature)) {
                await this.addTx(signature);
            }
        }
    }

    async addTx(signature) {
        const transaction = await this.rpc.getParsedTransaction(signature);
        const signer = transaction.transaction.message.accountKeys.find(({signer}) => signer).pubkey;

        const swapInfo = getSwapInfo(transaction);
        if (swapInfo) {
            logger.log(
                'add swap:',
                `${ chalk.green(`+${ swapInfo.tokenIn.amount } ${ swapInfo.tokenIn.mint }`) }`,
                `${ chalk.red(`-${ swapInfo.tokenOut.amount } ${ swapInfo.tokenOut.mint }`) }`
            );

            await this.repository.setAccountTokenSwap(signature, {
                account: signer.toString(),
                token_out: swapInfo.tokenOut.mint,
                token_in: swapInfo.tokenIn.mint,
                amount_out: swapInfo.tokenOut.amount,
                amount_in: swapInfo.tokenIn.amount,
                block_time: transaction.blockTime
            });
        }

        return {
            signature,
            signer: signer.toString(),
            transaction,
            swap: swapInfo
        }
    }

    async getAccountTokenSwaps(walletAddress, tokenAddress) {
        const swaps = await this.repository.getAccountTokenSwaps(walletAddress, tokenAddress);
        const tokensAddress = getTokensFromSwaps(swaps);
        const tokens = await this.getTokensMetadata(tokensAddress);
        return { swaps, tokens }
    }

    async getTokensMetadata(addresses) {
        const tokensMetadata = await this.repository.getTokensMetadata(addresses);
        const tokens = tokensMetadata.reduce((r, i) => { r[i.address] = i; return r;}, {});
        const fetchedTokenAddresses = new Set(Object.keys(tokens));
        const tokensForFetch = addresses.filter(tokenAddress => !fetchedTokenAddresses.has(tokenAddress));

        for (const tokenAddress of tokensForFetch) {
            const tokenMetadata = await this.rpc.getTokensMetadata(tokenAddress);
            await this.repository.setTokenMetadata(tokenAddress, tokenMetadata);
            tokens[tokenAddress] = tokenMetadata;
        }

        return tokens;
    }

}

export function getSwapInfo(transaction, {debug = false} = {debug: false}) {
    const signer = transaction.transaction.message.accountKeys.find(({signer}) => signer).pubkey
    const preBalances = transaction.meta.preTokenBalances || []
    const postBalances = transaction.meta.postTokenBalances || []
    const balancesMap = {}
    const signerBalances = []
    const otherSideBalances = []
    let tokenIn = {}
    let tokenOut = {}

    for (const balance of preBalances) {
        balancesMap[balance.accountIndex] = {
            mint: balance.mint,
            owner: balance.owner,
            preAmount: BigInt(balance.uiTokenAmount.amount || '0'),
            postAmount: BigInt(0)
        }
    }

    for (const balance of postBalances) {
        if (balancesMap[balance.accountIndex]) {
            balancesMap[balance.accountIndex].postAmount = BigInt(balance.uiTokenAmount.amount || '0')
        } else {
            balancesMap[balance.accountIndex] = {
                mint: balance.mint,
                owner: balance.owner,
                preAmount: BigInt(0),
                postAmount: BigInt(balance.uiTokenAmount.amount || '0')
            }
        }
    }

    for (const accountIndex in balancesMap) {
        const balance = balancesMap[accountIndex]
        balance.change = balance.postAmount - balance.preAmount
        balance.signer = balance.owner.toString() === signer.toString()

        if (balance.owner.toString() === signer.toString()) {
            signerBalances.push(balance)
        } else {
            otherSideBalances.push(balance)
        }
    }

    const signerChangesByToken = signerBalances.reduce((result, balance) => {
        result[balance.mint] = (result[balance.mint] || 0n) + balance.change
        return result
    }, {})
    const otherSideChangesByToken = otherSideBalances.reduce((result, balance) => {
        result[balance.mint] = (result[balance.mint] || 0n) + balance.change
        return result
    }, {})

    const signerSwapTokens = Object.keys(signerChangesByToken)
    const otherSideSwapTokens = Object.keys(otherSideChangesByToken).filter(mint => otherSideChangesByToken[mint] !== 0n)

    if (debug) {
        logger.debug('signerChangesByToken', signerChangesByToken)
        logger.debug('otherSideChangesByToken', otherSideChangesByToken)
    }

    if (signerSwapTokens.length === 1 && otherSideSwapTokens.length === 2) {
        const swapTokenMint = signerSwapTokens[0]
        const signerSwapToken = {
            mint: signerSwapTokens[0],
            amount: signerChangesByToken[signerSwapTokens[0]].toString()
        }
        const otherSideSwapTokenMint = otherSideSwapTokens.filter((mint) => mint !== signerSwapToken.mint)[0]
        const otherSideSwapToken = {
            mint: otherSideSwapTokenMint,
            amount: otherSideChangesByToken[otherSideSwapTokenMint].toString()
        }

        if (signerChangesByToken[swapTokenMint] > 0n) {
            tokenIn = signerSwapToken
            tokenOut = otherSideSwapToken
        } else {
            tokenIn = otherSideSwapToken
            tokenOut = signerSwapToken
        }

        return {
            tokenIn: {
                mint: tokenIn.mint,
                amount: absBigInt(tokenIn.amount).toString()
            },
            tokenOut: {
                mint: tokenOut.mint,
                amount: absBigInt(tokenOut.amount).toString()
            }
        }
    }

    return null;
}
