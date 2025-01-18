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

  findAccountWatchInfo(username: string, chat_id: string): Promise<TelegramAccountWatchEntity | null> {
    return this.telegramAccountWatchRepository.findOne({
      where: { username, chat_id }
    });
  }

  async addAccountWatchInfo(username: string, chat_id: string, last_message_id: number | null): Promise<TelegramAccountWatchEntity> {
    this.logger.debug('add account to watch', username, chat_id);

    return this.telegramAccountWatchRepository.save({ username, chat_id, last_message_id });
  }

  async addNotification(telegram_account_watch_id: string, chat_id: string) {
    await this.telegramNotificationRepository.upsert(
      { telegram_account_watch_id, chat_id },
      ['telegram_account_watch_id', 'chat_id']
    );
  }

  getNotificationsByAccountWatchId(account_watch_id: string): Promise<TelegramNotificationEntity[]> {
    return this.telegramNotificationRepository.find({
      where: { telegram_account_watch_id: account_watch_id }
    });
  }

  async updateLastMessageId(username: string, chat_id: string, last_message_id: number): Promise<void> {
    this.logger.verbose('update last message id', username, chat_id, last_message_id);
    await this.telegramAccountWatchRepository.update(
      { username, chat_id },
      { last_message_id }
    );
  }
}
