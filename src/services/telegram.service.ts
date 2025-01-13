import { Logger } from "../utils/logger";
import { AppTelegramClient } from "../clients/telegram.client";
import { TelegramRepository } from "../repositories/telegram.repository";
import { AppEvents } from "../core/event";
import { TelegramAccountWatchEntity } from "../entities/telegramAccountWatch.entity";
import { EventsRegistry } from "../config/events.config";
import * as messageMethods from "telegram/client/messages";
import { TelegramNotificationEntity } from "../entities/telegramNotification.entity";
import input from "input";

export class TelegramService {
  private readonly logger = new Logger('TelegramService');

  private readonly appEvents: AppEvents;
  private readonly telegramClient: AppTelegramClient;
  private readonly telegramRepository: TelegramRepository;

  constructor(
    appEvents: AppEvents,
    telegramRepository: TelegramRepository,
    telegramClient: AppTelegramClient,
  ) {
    this.appEvents = appEvents;
    this.telegramClient = telegramClient;
    this.telegramRepository = telegramRepository;

    this.logger.info('service created');
  }

  getAccountsToWatch(): Promise<TelegramAccountWatchEntity[]> {
    return this.telegramRepository.getAccountsWatchInfo();
  }

  async addAccountToWatch(username: string, chat_id: string, notification_chat_id: string): Promise<TelegramAccountWatchEntity> {
    let accountInfo = await this.telegramRepository.findAccountWatchInfo(username, chat_id);

    if (!accountInfo) {
      accountInfo = await this.telegramRepository.addAccountWatchInfo(username, chat_id, null);
    }

    await this.telegramRepository.addNotification(accountInfo.id, notification_chat_id);

    this.logger.info('account added successfully', username);

    return accountInfo;
  }

  async findNewMessageByAccount(telegram_account_watch_id: string): Promise<void> {
    const accountInfo = await this.telegramRepository.getAccountWatchInfoById(telegram_account_watch_id);

    this.logger.verbose('find new message by', accountInfo);

    if (!accountInfo) {
      this.logger.error('account not found', telegram_account_watch_id);
      return;
    }

    let filter: Partial<messageMethods.IterMessagesParams> = { fromUser: '@' + accountInfo.username, limit: 10 };
    if (accountInfo.last_message_id) {
      filter.minId = accountInfo.last_message_id;
    }

    const messages = await this.telegramClient.getMessages(accountInfo.chat_id, filter);

    for (const message of messages.reverse()) {
      await this.appEvents.emit(EventsRegistry.TelegramAccountNewMessageEvent, {
        username: accountInfo.username,
        chat_id: accountInfo.chat_id,
        message: {
          id: message.id,
          replyToMsgId: message.replyTo?.replyToMsgId
        }
      });
      await this.telegramRepository.updateLastMessageId(
        accountInfo.username,
        accountInfo.chat_id,
        message.id
      );
    }
  }

  async getTelegramNotifications(username: string, chat_id: string): Promise<TelegramNotificationEntity[]>{
    const accountInfo = await this.telegramRepository.findAccountWatchInfo(username, chat_id);
    if (!accountInfo) {
      return [];
    }
    return this.telegramRepository.getNotificationsByAccountWatchId(accountInfo.id);
  }
}

// async install() {
//   const useTelegramClientApp = await input.confirm('Use Telegram client APP')
//   if (useTelegramClientApp) {
//     console.log('Create your app here', 'https://my.telegram.org/auth')
//     const config = await this.storageTelegram.read('config', {})
//     await this.storageTelegram.write('config', {
//       apiId: await input.text('Telegram API ID:', {default: config.apiId}),
//       apiHash: await input.text('Telegram API Hash:', {default: config.apiHash}),
//       logChatId: await input.text('Telegram log Chat id:', {default: config.logChatId})
//     })
//     await this.client.auth()
//   }
// }
