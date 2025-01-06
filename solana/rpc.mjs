import { Connection, PublicKey } from '@solana/web3.js'
import { Metaplex } from '@metaplex-foundation/js'
import { Logger } from '../utils/logger.mjs'
import { promisify } from 'util'

const logger = new Logger('solana/rpc')
const sleep = promisify(setTimeout);

export class SolanaRpc {
    constructor() {
        this.connection = new Connection('https://api.mainnet-beta.solana.com');
        this.metaplex = Metaplex.make(this.connection)
    }

    async getParsedTransaction(signature) {
        logger.log('get tx', signature);
        const tx = await this.connection.getParsedTransaction(
            signature,
            { maxSupportedTransactionVersion: 0 }
        );
        await sleep(5000);
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
        const signatures = await this.connection.getSignaturesForAddress(accountPublicKey, options, 'finalized');
        logger.log('received signatures', signatures.length);
        await sleep(5000);
        return signatures;
    }

    // https://github.com/cryptoloutre/fetch-token-and-its-metadata
    async getTokensMetadata(mintAddress) {
        logger.log('get token metadata', mintAddress);

        const mintPublicKey = new PublicKey(mintAddress);
        const metadataAccount = this.metaplex
            .nfts()
            .pdas()
            .metadata({ mint: mintPublicKey });

        const metadataAccountInfo = await this.connection.getAccountInfo(metadataAccount);
        await sleep(2000);

        if (metadataAccountInfo) {
            const token = await this.metaplex.nfts().findByMint({ mintAddress: mintPublicKey })
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
