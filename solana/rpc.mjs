import { Connection, PublicKey } from '@solana/web3.js'
import { Metaplex } from '@metaplex-foundation/js'
import { Logger } from '../utils/logger.mjs'
import { promisify } from 'util'
import { RequestStackHelper } from './helpers/request-stack-helper.mjs'

const logger = new Logger('solana/rpc')
const sleep = promisify(setTimeout);

export class SolanaRpc {
    endpoint = 'https://api.mainnet-beta.solana.com';
    requestStack = new RequestStackHelper(5000);

    createConnection() {
        return new Connection(this.endpoint, {
            disableRetryOnRateLimit: true
        });
    }

    async request(method, ...args) {
        return this.requestStack.addRequest(async () => {
            try {
                const connection = this.createConnection();
                return await connection[method].apply(connection, args);
            } catch (e) {
                if (e?.message?.includes('429')) {
                    console.log('retry')
                    return this.request(method, ...args);
                } else {
                    throw Error(e);
                }
            }
        });
    }

    async getParsedTransaction(signature) {
        logger.log('get tx', signature);
        const tx = await this.request('getParsedTransaction', signature, { maxSupportedTransactionVersion: 0 });
        // await sleep(5000);
        return tx;
    }

    /**
     * Returns confirmed signatures for transactions involving an
     * address backwards in time from the provided signature or most recent confirmed block
     *
     * @param address queried address
     * @param options
     */
    async getFinalizedSignaturesForAddress(address, options) {
        const accountPublicKey = new PublicKey(address);
        const signatures = await this.request('getSignaturesForAddress', accountPublicKey, options, 'finalized');
        logger.log('received signatures', signatures?.length);
        // await sleep(5000);
        return signatures;
    }

    // https://github.com/cryptoloutre/fetch-token-and-its-metadata
    async getTokensMetadata(mintAddress) {
        logger.log('get token metadata', mintAddress);
        const connection = this.createConnection();
        const metaplex = Metaplex.make(connection);

        const mintPublicKey = new PublicKey(mintAddress);
        const metadataAccount = metaplex
            .nfts()
            .pdas()
            .metadata({ mint: mintPublicKey });

        const metadataAccountInfo = await this.request('getAccountInfo', metadataAccount);
        await sleep(5000);

        if (metadataAccountInfo) {
            const token = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
            return {
                address: token.address.toString(),
                name: token.name,
                symbol: token.symbol,
                description: token.json?.description || null,
                image: token.json?.image || null,
                decimals: token.mint.decimals
            }
        } else {
            return null;
        }
    }
}
