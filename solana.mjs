import { Connection, PublicKey } from "@solana/web3.js"
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { resolve } from 'path'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { promisify } from 'util'
import { Metaplex } from "@metaplex-foundation/js";

const sleep = promisify(setTimeout);
const connection = new Connection("https://api.mainnet-beta.solana.com");
const walletAddress = "5r9oGowohVtsXa2xGhDL7rdYpM2ufYXmb9aJvyyi6oaD";
const cachePath = resolve(process.cwd(), './cache/solana/metadata');
const metaplex = Metaplex.make(connection);
const solTokenAddress = "So11111111111111111111111111111111111111112";

export async function monitorTokens(walletAddress) {
    const publicKey = new PublicKey(walletAddress);

    // Получить токены
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID
    });

    for (const { account, pubkey } of tokenAccounts.value) {
        try {
            const decodedData = AccountLayout.decode(account.data);

            if (decodedData.amount.toString() === '0') continue;
            const mint = new PublicKey(decodedData.mint).toString();
            // const amount = u64.fromBuffer(decodedData.amount).toString();
            const metadata = await getTokenMetadata(decodedData.mint);

            console.log(`Token Account: ${pubkey.toString()}`);
            console.log(`Mint: ${mint}`);
            console.log(`Metadata`, metadata);
            console.log(`Balance: ${decodedData.amount.toString()}`);
            console.log(`========`);
        } catch (error) {
            console.error("Error decoding account data:", error);
        }
    }
}

// https://github.com/cryptoloutre/fetch-token-and-its-metadata
export async function getTokenMetadata (mintAddress, tokenProgramId = TOKEN_PROGRAM_ID) {
    const cacheFilePath = resolve(cachePath, `${mintAddress}.json`)

    try {
        const data = await readFile(cacheFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        try {
            const mintPublicKey = new PublicKey(mintAddress);

            const metadataAccount = metaplex
                .nfts()
                .pdas()
                .metadata({ mint: mintPublicKey });

            const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

            if (metadataAccountInfo) {
                const token = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
                const metadata = {
                    model: token.model,
                    json: token.json,
                    name: token.name,
                    symbol: token.symbol,
                    uri: token.uri,
                    address: token.address.toString(),
                    decimals: token.mint.decimals
                }
                await mkdir(cachePath, { recursive: true })
                await writeFile(cacheFilePath, JSON.stringify(metadata))
                await sleep(2000);
                return metadata;
            }
        } catch (error) {
            console.error("Error fetching token metadata:", error);
        }
    }
}

export async function getSignatures(accountAddress) {
    const publicKey = new PublicKey(accountAddress);

    try {
        // Получите список подписей транзакций
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 2 }, 'finalized');
        console.log('signatures', signatures)
        // Переберите транзакции и извлеките данные
        for (const signature of signatures) {
            await getBalanceChangesBySignature(signature, mintAddress)
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

export async function getBalanceChangesBySignature(signature) {
    try {
        const transaction = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
        const signer = transaction.transaction.message.accountKeys.find(account => account.signer);

            // console.log('postTokenBalances', transaction.meta)
        console.log(`Транзакция: ${signature}`);
        const counterparty =

        console.log('meta:', JSON.stringify(transaction))

        console.log('postBalances:', transaction.meta.postBalances)
        console.log('postTokenBalances:', transaction.meta.postTokenBalances)
        console.log('preBalances:', transaction.meta.preBalances)
        console.log('preTokenBalances:', transaction.meta.preTokenBalances)

        const preBalance = transaction.meta.preBalances;
        const postBalance = transaction.meta.postBalances;

        console.log(`Изменение баланса: ${postBalance[0] - preBalance[0]} лампортов`);
        console.log(`======`);
    } catch (error) {
        console.error('Ошибка:', error);
    }
}



// monitorTokens(walletAddress);
// getTokenMetadata("HaP8r3ksG76PhQLTqR8FYBeNiQpejcFbQmiHbg787Ut1")
// getTokenMetadata("J7Q9gHS3FoXideE6Yk43gQPk7YMbr3wi15FGChVzpump")
// getBalanceChanges('GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z')
// getBalanceChangesBySignature('5MguzGEcuN2heqfgF3PZE485XWMWH7HgRshMs41xVHUhR5aoSbr3Lzorqg4zqRbdNgb25e3aCrCfU6V7ApLS4vBj')
getBalanceChangesBySignature('2dnPjyFdRQKDZwCNBYBt3tLoPmjdZxkVafHmdHp1mxETe17bPJNtT1PfHvbqkct1tDQpgQnXnNKRxV1i5rnb8Tpi')
