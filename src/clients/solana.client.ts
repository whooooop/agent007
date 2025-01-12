import {
  Connection,
  PublicKey,
  ConfirmedSignatureInfo, ParsedTransactionWithMeta, RpcResponseAndContext, GetProgramAccountsResponse
} from '@solana/web3.js';
import { Metaplex, NftWithToken } from '@metaplex-foundation/js';
import { Logger } from '../utils/logger';
import { RequestStackHelper } from '../utils/requestStackHelper';
import { promisify } from 'util';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SolanaTokenMetadataEntity } from "../entities/solanaTokenMetadata.entity";

const sleep = promisify(setTimeout);

interface SignatureOptions {
  limit?: number;
  before?: string;
  until?: string;
}

interface TokenMetadata {
  address: string;
  name: string;
  symbol: string;
  description: string | null;
  image: string | null;
  decimals: number;
  createdOn?: string;
  twitter?: string;
  website?: string;
}

export class SolanaClient {
  private readonly logger = new Logger('SolanaClient');
  private endpoint: string = 'https://api.mainnet-beta.solana.com';
  private requestStack: RequestStackHelper;

  constructor() {
    this.requestStack = new RequestStackHelper(5000);
    this.logger.info('client created');
  }

  createConnection(): Connection {
    return new Connection(this.endpoint, {
      disableRetryOnRateLimit: true,
    });
  }

  async request<T>(method: string, ...args: any[]): Promise<T> {
    return this.requestStack.addRequest(async () => {
      const connection = this.createConnection();
      return await connection[method].apply(connection, args);
    });
  }

  async getParsedTransaction(signature: string): Promise<ParsedTransactionWithMeta | null> {
    this.logger.info('get tx', signature);
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

  async getSignaturesForAddress(address: string, options?: SignatureOptions): Promise<Array<ConfirmedSignatureInfo>> {
    const accountPublicKey = new PublicKey(address);
    const signatures = await this.request<Promise<Array<ConfirmedSignatureInfo>>>('getSignaturesForAddress', accountPublicKey, options, 'finalized');
    this.logger.info('received signatures', signatures?.length);
    return signatures;
  }

  async getTokensMetadata(mintAddress: string): Promise<SolanaTokenMetadataEntity | null> {
    try {
      return await this.requestStack.addRequest(async () => {
        this.logger.info('get token metadata', mintAddress);
        const connection = this.createConnection();
        const metaplex = Metaplex.make(connection);

        const mintPublicKey = new PublicKey(mintAddress);
        const metadataAccount = metaplex.nfts().pdas().metadata({ mint: mintPublicKey });

        this.logger.info('metadataAccount', metadataAccount);
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
      this.logger.error('Failed fetch token metadata', mintAddress);
      return null;
    }
  }
}
