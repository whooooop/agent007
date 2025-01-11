import { Repository } from 'typeorm';
import { Logger } from '../utils/logger';
import { Database } from '../core/database';
import { SolanaTokenMetadataEntity,  } from "../entities/solanaTokenMetadata.entity";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";
import { SolanaAccountWatchEntity } from "../entities/solanaAccountWatch.entity";

export class SolanaRepository {
  private readonly logger = new Logger('solana/repository');

  private tokenMetadataRepository: Repository<SolanaTokenMetadataEntity>;
  private accountTokenSwapRepository!: Repository<SolanaAccountTokenSwapEntity>;
  private accountWatchRepository!: Repository<SolanaAccountWatchEntity>;

  async initialize(app: any): Promise<void> {
    const database: Database = await app.inject(Database);

    this.tokenMetadataRepository = database.getRepository(SolanaTokenMetadataEntity);
    this.accountTokenSwapRepository = database.getRepository(SolanaAccountTokenSwapEntity);
    this.accountWatchRepository = database.getRepository(SolanaAccountWatchEntity);
  }

  async addAccountToWatch(accountAddress: string, lastSignature: string, chatId: string | null = null): Promise<SolanaAccountWatchEntity> {
    this.logger.info('add account to watch', accountAddress, lastSignature);
    return this.accountWatchRepository.save({
      account: accountAddress,
      active: true,
      last_signature: lastSignature,
      chat_id: chatId,
    });
  }

  async updateLastSignatureForAccountToWatch(accountAddress: string, lastSignature: string): Promise<SolanaAccountWatchEntity> {
    return this.accountWatchRepository.save({
      account: accountAddress,
      last_signature: lastSignature,
    });
  }

  async getAccountsToWatch(): Promise<SolanaAccountWatchEntity[]> {
    return this.accountWatchRepository.find();
  }

  async getAccountTokenSwaps(walletAddress: string, tokenAddress: string): Promise<SolanaAccountTokenSwapEntity[]> {
    return this.accountTokenSwapRepository
      .createQueryBuilder('swap')
      .select([
        'swap.signature',
        'swap.account',
        'swap.token_in',
        'swap.token_out',
        'swap.amount_in',
        'swap.amount_out',
        'swap.block_time',
      ])
      .where('swap.account = :account', { account: walletAddress })
      .andWhere('(swap.token_in = :token OR swap.token_out = :token)', { token: tokenAddress })
      .orderBy('swap.block_time', 'DESC')
      .getMany();
  }

  async setAccountTokenSwap(signature: string, data: Partial<SolanaAccountTokenSwapEntity>): Promise<SolanaAccountTokenSwapEntity> {
    return this.accountTokenSwapRepository.save({
      signature,
      ...data,
    });
  }

  async getAccountTokenSwapsBySignatures(signatures: string[]): Promise<SolanaAccountTokenSwapEntity[]> {
    return this.accountTokenSwapRepository
      .createQueryBuilder('swap')
      .select('swap.*')
      .where('swap.signature IN (:...signatures)', { signatures })
      .getRawMany();
  }

  async getAllSwapsToken(accountAddress: string, mintAddress: string, dir: 'in' | 'out' = 'in'): Promise<SolanaAccountTokenSwapEntity[]> {
    return this.accountTokenSwapRepository.find({
      where: {
        account: accountAddress,
        [`token_${dir}`]: mintAddress,
      },
    });
  }

  async getTokensMetadata(tokens: string[]): Promise<SolanaTokenMetadataEntity[]> {
    return this.tokenMetadataRepository
      .createQueryBuilder('token')
      .select('token.*')
      .where('token.address IN (:...tokens)', { tokens })
      .getRawMany();
  }

  async setTokenMetadata(address: string, data: Partial<SolanaTokenMetadataEntity>): Promise<SolanaTokenMetadataEntity> {
    return this.tokenMetadataRepository.save({
      address,
      ...data,
    });
  }
}
