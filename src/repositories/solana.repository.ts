import { Repository } from 'typeorm';
import { Logger } from '../utils/logger';
import { Database } from '../core/database';
import { SolanaTokenMetadataEntity,  } from "../entities/solanaTokenMetadata.entity";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";
import { SolanaAccountWatchEntity } from "../entities/solanaAccountWatch.entity";
import { SolanaNotificationEntity, SolanaNotificationEvent } from "../entities/solanaNotification.entity";

export class SolanaRepository {
  private readonly logger = new Logger('SolanaRepository');

  private readonly database: Database;

  constructor(
    database: Database
  ) {
    this.database = database;
  }

  private get tokenMetadataRepository(): Repository<SolanaTokenMetadataEntity> {
    return this.database.getRepository(SolanaTokenMetadataEntity);
  }

  private get accountTokenSwapRepository(): Repository<SolanaAccountTokenSwapEntity> {
    return this.database.getRepository(SolanaAccountTokenSwapEntity);
  }

  private get accountWatchRepository(): Repository<SolanaAccountWatchEntity> {
    return this.database.getRepository(SolanaAccountWatchEntity);
  }

  private get accountNotificationRepository(): Repository<SolanaNotificationEntity> {
    return this.database.getRepository(SolanaNotificationEntity);
  }

  async addAccountToWatch(accountAddress: string, lastSignature: string): Promise<SolanaAccountWatchEntity> {
    this.logger.info('add account to watch', accountAddress, lastSignature);
    return this.accountWatchRepository.save({
      account: accountAddress,
      last_signature: lastSignature
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

  async getAccountWatchInfo(accountAddress): Promise<SolanaAccountWatchEntity> {
    return this.accountWatchRepository.findOne({
      where: {
        account: accountAddress
      }
    });
  }

  async getAccountTokenSwaps(walletAddress: string, tokenAddress: string): Promise<SolanaAccountTokenSwapEntity[]> {
    return this.accountTokenSwapRepository
      .createQueryBuilder('swap')
      .where('swap.account = :account', { account: walletAddress })
      .andWhere('(swap.token_in = :token OR swap.token_out = :token)', { token: tokenAddress })
      .orderBy('swap.block_time', 'DESC')
      .getRawMany();
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

  async addNotification(account: string, chat_id: string, event: SolanaNotificationEvent) {
    await this.accountNotificationRepository.upsert(
      { account, chat_id, event },
      ['account', 'chat_id', 'event']
    );
  }

  getNotificationsByAccount(account: string, event?: SolanaNotificationEvent): Promise<SolanaNotificationEntity[]> {
    return this.accountNotificationRepository.find({
      where: { account, event }
    });
  }
}
