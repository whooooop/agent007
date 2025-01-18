import { Logger } from "../../utils/logger";
import { SolanaClient } from "./solana.client";
import { getAnotherTokenFromSwap, getTokenAccountAddress, solAddress } from "../../helpers/token";
import { SolanaRepository } from "../../repositories/solana.repository";
import * as chalk from 'chalk';
import {
  GetProgramAccountsResponse,
  ParsedInnerInstruction,
  ParsedInstruction,
  ParsedTransactionWithMeta, SignaturesForAddressOptions
} from "@solana/web3.js";
import { absBigInt } from "../../helpers/bigint";
import { SolanaSwapInfo } from "./types/solanaSwapInfo";
import { SolanaTokenMetadataEntity } from "../../entities/solanaTokenMetadata.entity";
import { SolanaAccountTokenSwapEntity } from "../../entities/solanaAccountTokenSwap.entity";
import { SolanaAccountWatchEntity } from "../../entities/solanaAccountWatch.entity";
import { SolanaEvent } from "./types/solana.events";
import { Loop } from "../../utils/loop";

export class SolanaServce {
  private readonly logger = new Logger(SolanaServce.name);

  private readonly solanaClient: SolanaClient;
  private readonly solanaRepository: SolanaRepository;
  private readonly accountTxWatch: Map<string, Set<(payload: SolanaEvent.Tx.Payload) => {}>> = new Map();

  constructor(
    solanaRepository: SolanaRepository,
    solanaClient: SolanaClient
  ) {
    this.solanaRepository = solanaRepository;
    this.solanaClient = solanaClient;

    const loop = new Loop(60000, () => this.watchAccountsHandler());
    loop.run();

    this.logger.info('service created');
  }

  private async addAccountToWatch(account: string): Promise<SolanaAccountWatchEntity> {
    const accountInfo = await this.solanaRepository.getAccountWatchInfo(account);
    if (accountInfo) {
      return accountInfo;
    }

    const signatures = await this.solanaClient.getSignaturesForAddress(account, { limit: 1 });
    const lastSignature = signatures[0]?.signature;
    return this.solanaRepository.addAccountToWatch(account, lastSignature);
  }

  async watchAccountTx(accountAddress: string, handler: ((payload: SolanaEvent.Tx.Payload) => {})){
    await this.addAccountToWatch(accountAddress);
    if (!this.accountTxWatch.has(accountAddress)) {
      this.accountTxWatch.set(accountAddress, new Set());
    }
    this.accountTxWatch.get(accountAddress).add(handler);
  }

  async watchAccountsHandler() {
    for (const account of Object.keys(this.accountTxWatch)) {
      try {
        await this.findAccountNewTxs(account);
      } catch (e) {
        this.logger.error('fail find account new txs', account, e);
      }
    }
  }

  async indexAccountToken(accountAddress: string, mintAddress: string) {
    this.logger.debug('index account token', accountAddress);
    const accountTokenAddress = await getTokenAccountAddress(accountAddress, mintAddress);
    const txs = await this.solanaClient.getSignaturesForAddress(accountTokenAddress, { limit: 500 });
    const signatures: string[] = txs.map(({ signature }) => signature);
    const indexedSignatures = await this.solanaRepository.getAccountTokenSwapsBySignatures(signatures);
    const indexedSignaturesMap = new Set(indexedSignatures.map(({signature}) => signature));

    for (const signature of signatures) {
      if (!indexedSignaturesMap.has(signature)) {
        const rawTransaction = await this.solanaClient.getParsedTransaction(signature);
        await this.indexTx(rawTransaction);
      }
    }
  }

  async indexTx(transaction: ParsedTransactionWithMeta): Promise<void> {
    const signer = this.getTxSigner(transaction);
    const signature = transaction.transaction.signatures[0];
    const swapInfo = await this.getSwapInfo(transaction);

    if (swapInfo) {
      this.logger.info(
        'add swap:',
        `${chalk.green(`+${swapInfo.tokenIn.amount} ${ this.returnSymbolIfSol(swapInfo.tokenIn.mint) }`)}`,
        `${chalk.red(`-${swapInfo.tokenOut.amount} ${ this.returnSymbolIfSol(swapInfo.tokenOut.mint) }`)}`
      );

      await this.solanaRepository.setAccountTokenSwap(signature, {
        account: signer,
        token_out: swapInfo.tokenOut.mint,
        token_in: swapInfo.tokenIn.mint,
        amount_out: swapInfo.tokenOut.amount,
        amount_in: swapInfo.tokenIn.amount,
        block_time: transaction.blockTime
      });
    }
  }

  async indexToken(mintAddress: string): Promise<SolanaTokenMetadataEntity | null> {
    const tokenMetadata = await this.solanaClient.getTokenMetadata(mintAddress);
    if (tokenMetadata) {
      await this.solanaRepository.setTokenMetadata(mintAddress, tokenMetadata);
      return tokenMetadata;
    } else {
      return null;
    }
  }

  async getAccountTokens(accountAddress: string): Promise<GetProgramAccountsResponse> {
    return this.solanaClient.getTokenAccountsByOwner(accountAddress);
  }

  async findAccountNewTxs(accountAddress: string) {
    const { last_signature } = await this.solanaRepository.getAccountWatchInfo(accountAddress);
    const signatures = await this.solanaClient.getSignaturesForAddress(accountAddress, { limit: 1000, until: last_signature });

    for (const {signature} of signatures.reverse()) {
      try {
        const rawTransaction = await this.solanaClient.getParsedTransaction(signature);

        await this.indexTx(rawTransaction);
        await this.solanaRepository.updateLastSignatureForAccountToWatch(accountAddress, signature);
        const swap = await this.getSwapInfo(rawTransaction);

        const eventData = {
          signature,
          signer: accountAddress,
          raw: rawTransaction,
          parsed: {
            swap
          }
        }

        if (swap) {
          const mintSwap = getAnotherTokenFromSwap(swap);
          await this.indexAccountToken(accountAddress, mintSwap);
        }

        if (this.accountTxWatch.has(accountAddress)) {
          for (const handler of this.accountTxWatch.get(accountAddress)) {
            await handler(eventData);
          }
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * Sends a statistical summary of token swaps for a given account to a specified chat.
   * @param accountAddress - The Solana wallet address to generate statistics for.
   * @returns A Promise that resolves when the message is sent.
   */
  async getAccountSolSwaps(accountAddress: string): Promise<{ txsIn: SolanaAccountTokenSwapEntity[], txsOut: SolanaAccountTokenSwapEntity[] }> {
    // Fetch incoming and outgoing SOL swaps for the given account
    const txsIn = await this.solanaRepository.getAllSwapsToken(accountAddress, solAddress, 'in');
    const txsOut = await this.solanaRepository.getAllSwapsToken(accountAddress, solAddress, 'out');
    return { txsIn, txsOut }
  }

  /**
   * Fetches token swap details and associated token metadata for a given wallet and token address.
   * @param walletAddress - The wallet address to query swaps for.
   * @param tokenAddress - The token address to filter swaps by.
   * @returns An object containing swaps and token metadata.
   */
  async getIndexedAccountTokenSwaps(walletAddress: string, tokenAddress: string): Promise<{ swaps: SolanaAccountTokenSwapEntity[]; tokens: Record<string, SolanaTokenMetadataEntity> }> {
    // Fetch token swap details from the repository
    const swaps = await this.solanaRepository.getAccountTokenSwaps(walletAddress, tokenAddress);
    // getTokensFromSwaps
    // Extract unique token addresses from the swaps
    const tokensAddress = Array.from(new Set(swaps.flatMap(swap => [swap.token_in, swap.token_out])));

    // Fetch token metadata for the extracted token addresses
    const tokens = await this.getTokensMetadata(tokensAddress);

    return { swaps, tokens };
  }

  /**
   * Fetches token metadata from the repository or from the Solana network if not already cached.
   * @param addresses - Array of token mint addresses to fetch metadata for.
   * @returns A map of token metadata indexed by token address.
   */
  async getTokensMetadata(addresses: string[]): Promise<Record<string, SolanaTokenMetadataEntity>> {
    // Retrieve cached token metadata from the repository
    const tokensMetadata = await this.solanaRepository.getTokensMetadata(addresses);
    const tokens: Record<string, SolanaTokenMetadataEntity> = tokensMetadata.reduce((result, item) => {
      result[item.address] = item;
      return result;
    }, {});

    // Identify tokens that need to be fetched from the Solana network
    const fetchedTokenAddresses = new Set(Object.keys(tokens));
    const tokensForFetch = addresses.filter((tokenAddress) => !fetchedTokenAddresses.has(tokenAddress));

    // Fetch metadata for tokens that are not already cached
    for (const tokenAddress of tokensForFetch) {
      const tokenMetadata = await this.indexToken(tokenAddress);
      if (tokenMetadata) {
        tokens[tokenAddress] = tokenMetadata;
      }
    }

    return tokens;
  }

  private getTxSigner(transaction: ParsedTransactionWithMeta): string {
    return transaction.transaction.message.accountKeys.find(({signer}) => signer).pubkey.toString();
  }

  private async getSwapInfo(transaction: ParsedTransactionWithMeta): Promise<SolanaSwapInfo | null> {
    const signer = this.getTxSigner(transaction);
    // console.log(JSON.stringify(transaction));

    if (!signer) return null;

    const preBalances = transaction.meta?.preTokenBalances || [];
    const postBalances = transaction.meta?.postTokenBalances || [];

    const balancesMap: Record<number, any> = {};
    const signerBalances: any[] = [];
    const otherSideBalances: any[] = [];
    let tokenIn: { mint: string; amount: string } = { mint: '', amount: '0' };
    let tokenOut: { mint: string; amount: string } = { mint: '', amount: '0' };

    // Create balance map from pre and post token balances
    for (const balance of preBalances) {
      balancesMap[balance.accountIndex] = {
        mint: balance.mint,
        owner: balance.owner,
        preAmount: BigInt(balance.uiTokenAmount.amount || '0'),
        postAmount: BigInt(0),
      };
    }

    for (const balance of postBalances) {
      if (balancesMap[balance.accountIndex]) {
        balancesMap[balance.accountIndex].postAmount = BigInt(balance.uiTokenAmount.amount || '0');
      } else {
        balancesMap[balance.accountIndex] = {
          mint: balance.mint,
          owner: balance.owner,
          preAmount: BigInt(0),
          postAmount: BigInt(balance.uiTokenAmount.amount || '0'),
        };
      }
    }

    // Calculate balance changes
    for (const accountIndex in balancesMap) {
      const balance = balancesMap[accountIndex];
      balance.change = balance.postAmount - balance.preAmount;
      balance.signer = balance.owner === signer;

      if (balance.signer) {
        signerBalances.push(balance);
      } else {
        otherSideBalances.push(balance);
      }
    }

    // this.logger.debug('signerBalances', signerBalances);
    // this.logger.debug('otherSideBalances', otherSideBalances);

    const excludeTokens = transaction.meta.innerInstructions?.reduce((result: { mint: string, amount: bigint }[], instruction: ParsedInnerInstruction) => {
      instruction.instructions.forEach((item: ParsedInstruction) => {
        if (
          (item.parsed?.type === 'burn' && item.parsed?.info) ||
          (item.parsed?.type === 'mintTo' && item.parsed?.info.account !== signer)
        ) {
          result.push({
            mint: item.parsed.info.mint,
            amount: BigInt(item.parsed.info.amount)
          });
        }
      });
      return result;
    }, []) || [];

    // Calculate token changes
    const signerChangesByToken = signerBalances.reduce((result: Record<string, bigint>, balance) => {
      result[balance.mint] = (result[balance.mint] || 0n) + balance.change;
      return result;
    }, {});

    const otherSideChangesByToken = otherSideBalances.reduce((result: Record<string, bigint>, balance) => {
      result[balance.mint] = (result[balance.mint] || 0n) + balance.change;
      return result;
    }, {});

    excludeTokens.forEach(({ mint, amount }) => {
      if (otherSideChangesByToken[mint]) {
        delete otherSideChangesByToken[mint];
      }
    });

    // this.logger.debug('signer changes by token', signerChangesByToken);
    // this.logger.debug('other side changes by token', otherSideChangesByToken);

    const signerSwapTokens = Object.keys(signerChangesByToken).filter((mint) => signerChangesByToken[mint] !== BigInt(0));
    const otherSideSwapTokens = Object.keys(otherSideChangesByToken).filter((mint) => otherSideChangesByToken[mint] !== BigInt(0));

    // console.log('signerSwapTokens', signerSwapTokens)
    // console.log('otherSideSwapTokens', otherSideSwapTokens)

    if (signerSwapTokens.length === 1 && otherSideSwapTokens.length === 2) {
      const swapTokenMint = signerSwapTokens[0];
      const signerSwapToken = {
        mint: swapTokenMint,
        amount: signerChangesByToken[swapTokenMint].toString(),
      };

      const otherSideSwapTokenMint = otherSideSwapTokens.find((mint) => mint !== swapTokenMint);
      if (!otherSideSwapTokenMint) return null;

      const otherSideSwapToken = {
        mint: otherSideSwapTokenMint,
        amount: otherSideChangesByToken[otherSideSwapTokenMint].toString(),
      };

      if (signerChangesByToken[swapTokenMint] > 0n) {
        tokenIn = signerSwapToken;
        tokenOut = otherSideSwapToken;
      } else {
        tokenIn = otherSideSwapToken;
        tokenOut = signerSwapToken;
      }

      return {
        tokenIn: {
          mint: tokenIn.mint,
          amount: absBigInt(BigInt(tokenIn.amount)).toString(),
        },
        tokenOut: {
          mint: tokenOut.mint,
          amount: absBigInt(BigInt(tokenOut.amount)).toString(),
        },
      };
    }

    return null;
  }

  private returnSymbolIfSol(mintAddress: string) {
    return mintAddress === solAddress ? 'SOL' : mintAddress;
  }

  async getInfoAroundSwap(mintAddress: string, options: SignaturesForAddressOptions) {
    const signatures = await this.solanaClient.getSignaturesForAddress(mintAddress, options);
    const signers = [];

    for (const { signature } of signatures) {
      // const txInfo = await this.indexTx(signature);
      const txInfo = await this.solanaClient.getParsedTransaction(signature);
      const swapInfo = await this.getSwapInfo(txInfo);
      const signer = this.getTxSigner(txInfo);
      signers.push({ signer, signature, swapInfo });
      console.log('signature', signature);
    }

    return { signers }
  }
}
