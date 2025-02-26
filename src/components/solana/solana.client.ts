import {
  Connection,
  PublicKey,
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  RpcResponseAndContext,
  GetProgramAccountsResponse,
  SignaturesForAddressOptions
} from '@solana/web3.js';
import { Metaplex, NftWithToken } from '@metaplex-foundation/js';
import { Logger } from '../../utils/logger';
import { RequestStackHelper } from '../../utils/requestStackHelper';
import { promisify } from 'util';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SolanaTokenMetadataEntity } from "../../entities/solanaTokenMetadata.entity";

const sleep = promisify(setTimeout);

export interface SolanaClientConfig {
  endpoint: string,
  stackTimeout: number
}

export class SolanaClient {
  private readonly logger = new Logger('SolanaClient');
  private readonly endpoint: string;
  private requestStack: RequestStackHelper;

  constructor(config: SolanaClientConfig = { endpoint: 'https://api.mainnet-beta.solana.com', stackTimeout: 5000 }) {
    this.requestStack = new RequestStackHelper(config.stackTimeout || 5000);
    this.endpoint = config.endpoint || 'https://api.mainnet-beta.solana.com';
    this.logger.info('client created');
  }

  createConnection(): Connection {
    return new Connection(this.endpoint, {
      disableRetryOnRateLimit: true
    });
  }

  async request<T>(method: string, ...args: any[]): Promise<T> {
    // this.logger.debug('request', method);
    const result = await this.requestStack.addRequest(async () => {
      const connection = this.createConnection();
      return await connection[method].apply(connection, args);
    });
    // console.dir(result, { depth: Infinity, colors: true });
    return result
  }

  async getParsedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    this.logger.verbose('get tx', signature);
    const tx = await this.request<ParsedTransactionWithMeta | null>('getParsedTransaction', signature, { maxSupportedTransactionVersion: 0 });
    return tx;
  }

  async getTokenAccountsByOwner(accountAddress: string): Promise<GetProgramAccountsResponse> {
    const accountPublicKey = new PublicKey(accountAddress);
    const result = await this.request<Promise<RpcResponseAndContext<GetProgramAccountsResponse>>>('getTokenAccountsByOwner', accountPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    return result.value;
  }

  async getSignaturesForAddress(address: string, options?: SignaturesForAddressOptions): Promise<Array<ConfirmedSignatureInfo>> {
    const accountPublicKey = new PublicKey(address);
    return this.request<Promise<Array<ConfirmedSignatureInfo>>>('getSignaturesForAddress', accountPublicKey, options, 'finalized');
  }

  async getTokenMetadata(mintAddress: string): Promise<SolanaTokenMetadataEntity | null> {
    try {
      return await this.requestStack.addRequest(async () => {
        this.logger.debug('get token metadata', mintAddress);
        const connection = this.createConnection();
        const metaplex = Metaplex.make(connection);

        const mintPublicKey = new PublicKey(mintAddress);
        const metadataAccount = metaplex.nfts().pdas().metadata({ mint: mintPublicKey });

        const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);
        await sleep(5000);

        if (metadataAccountInfo) {
          const token = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey }) as NftWithToken;
          return {
            address: token.address.toString(),
            name: token.name,
            symbol: token.symbol,
            description: token.json?.description || '',
            image: token.json?.image || '',
            decimals: token.mint.decimals,
            createdOn: token.json?.createdOn || '',
            twitter: token.json?.twitter || '',
            website: token.json?.website || '',
          };
        } else {
          return null;
        }
      });
    } catch (e) {
      this.logger.error('Failed fetch token metadata', mintAddress, e);
      return null;
    }
  }
}
