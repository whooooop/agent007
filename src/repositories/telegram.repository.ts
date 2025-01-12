import { Repository } from 'typeorm';
import { Logger } from '../utils/logger';
import { Database } from '../core/database';
import { TelegramAccountWatchEntity } from "../entities/telegramAccountWatch.entity";
import { TelegramNotificationEntity } from "../entities/telegramNotification.entity";

export class TelegramRepository {
  private readonly logger = new Logger('TelegramRepository');

  private readonly database: Database;

  constructor(
    database: Database
  ) {
    this.database = database;
    this.logger.info('repository created');
  }

  private get telegramAccountWatchRepository(): Repository<TelegramAccountWatchEntity> {
    return this.database.getRepository(TelegramAccountWatchEntity);
  }

  private get telegramNotificationRepository(): Repository<TelegramNotificationEntity> {
    return this.database.getRepository(TelegramNotificationEntity);
  }

  getAccountWatchInfoById(id: string): Promise<TelegramAccountWatchEntity | null> {
    return this.telegramAccountWatchRepository.findOne({
      where: { id }
    })
  }

  getNotificationsByAccountWatchId(account_watch_id: string): Promise<TelegramNotificationEntity[]> {
    return this.telegramNotificationRepository.find({
      where: { telegram_account_watch_id: account_watch_id }
    });
  }

  findAccountWatchInfo(username: string, chat_id: string): Promise<TelegramAccountWatchEntity | null> {
    return this.telegramAccountWatchRepository.findOne({
      where: { username, chat_id }
    });
  }

  getAccountsWatchInfo(): Promise<TelegramAccountWatchEntity[]> {
    return this.telegramAccountWatchRepository.find();
  }

  async getOrCreateAccountWatchInfo(username: string, chat_id: string, last_message_id: number | null): Promise<TelegramAccountWatchEntity> {
    this.logger.info('create or get account to watch', username, chat_id);
    await this.telegramAccountWatchRepository.upsert(
      { username, chat_id, last_message_id },
      ['username', 'chat_id']
    );
    const accountInfo = await this.telegramAccountWatchRepository.findOne({
      where: { username, chat_id }
    })
    return accountInfo;
  }

  async addNotification(telegram_account_watch_id: string, chat_id: string) {
    await this.telegramNotificationRepository.upsert(
      { telegram_account_watch_id, chat_id },
      ['telegram_account_watch_id', 'chat_id']
    );
  }

  async updateLastMessageId(username: string, chat_id: string, last_message_id: number): Promise<void> {
    await this.telegramAccountWatchRepository.update(
      { username, chat_id },
      { last_message_id }
    );
  }

  // async addAccountToWatch(accountAddress: string, lastSignature: string, chatId: string | null = null): Promise<SolanaAccountWatchEntity> {
  //   this.logger.info('add account to watch', accountAddress, lastSignature);
  //   return this.accountWatchRepository.save({
  //     account: accountAddress,
  //     active: true,
  //     last_signature: lastSignature,
  //     chat_id: chatId,
  //   });
  // }
  //
  // async updateLastSignatureForAccountToWatch(accountAddress: string, lastSignature: string): Promise<SolanaAccountWatchEntity> {
  //   return this.accountWatchRepository.save({
  //     account: accountAddress,
  //     last_signature: lastSignature,
  //   });
  // }
  //
  // async getAccountsToWatch(): Promise<SolanaAccountWatchEntity[]> {
  //   return this.accountWatchRepository.find();
  // }
  //
  // async getAccountWatchInfo(accountAddress): Promise<SolanaAccountWatchEntity> {
  //   return this.accountWatchRepository.findOne({
  //     where: {
  //       account: accountAddress
  //     }
  //   });
  // }
  //
  // async getAccountTokenSwaps(walletAddress: string, tokenAddress: string): Promise<SolanaAccountTokenSwapEntity[]> {
  //   return this.accountTokenSwapRepository
  //     .createQueryBuilder('swap')
  //     .where('swap.account = :account', { account: walletAddress })
  //     .andWhere('(swap.token_in = :token OR swap.token_out = :token)', { token: tokenAddress })
  //     .orderBy('swap.block_time', 'DESC')
  //     .getRawMany();
  // }
  //
  // async setAccountTokenSwap(signature: string, data: Partial<SolanaAccountTokenSwapEntity>): Promise<SolanaAccountTokenSwapEntity> {
  //   return this.accountTokenSwapRepository.save({
  //     signature,
  //     ...data,
  //   });
  // }
  //
  // async getAccountTokenSwapsBySignatures(signatures: string[]): Promise<SolanaAccountTokenSwapEntity[]> {
  //   return this.accountTokenSwapRepository
  //     .createQueryBuilder('swap')
  //     .select('swap.*')
  //     .where('swap.signature IN (:...signatures)', { signatures })
  //     .getRawMany();
  // }
  //
  // async getAllSwapsToken(accountAddress: string, mintAddress: string, dir: 'in' | 'out' = 'in'): Promise<SolanaAccountTokenSwapEntity[]> {
  //   return this.accountTokenSwapRepository.find({
  //     where: {
  //       account: accountAddress,
  //       [`token_${dir}`]: mintAddress,
  //     },
  //   });
  // }
  //
  // async getTokensMetadata(tokens: string[]): Promise<SolanaTokenMetadataEntity[]> {
  //   return this.tokenMetadataRepository
  //     .createQueryBuilder('token')
  //     .select('token.*')
  //     .where('token.address IN (:...tokens)', { tokens })
  //     .getRawMany();
  // }
  //
  // async setTokenMetadata(address: string, data: Partial<SolanaTokenMetadataEntity>): Promise<SolanaTokenMetadataEntity> {
  //   return this.tokenMetadataRepository.save({
  //     address,
  //     ...data,
  //   });
  // }
}
