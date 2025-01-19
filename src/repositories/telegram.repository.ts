import { Repository } from 'typeorm';
import { Logger } from '../utils/logger';
import { Database } from '../core/database';
import { TelegramAccountWatchEntity } from "../entities/telegramAccountWatch.entity";

export class TelegramRepository {
  private readonly logger = new Logger(TelegramRepository.name);

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

  async updateLastMessageId(username: string, chat_id: string, last_message_id: number): Promise<void> {
    this.logger.verbose('update last message id', username, chat_id, last_message_id);
    await this.telegramAccountWatchRepository.update(
      { username, chat_id },
      { last_message_id }
    );
  }
}
