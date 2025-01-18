import { Logger } from "../../utils/logger";
import { AppTelegramClient } from "./telegram.client";
import { TelegramRepository } from "../../repositories/telegram.repository";
import { TelegramAccountWatchEntity } from "../../entities/telegramAccountWatch.entity";
import * as messageMethods from "telegram/client/messages";
import { TelegramNotificationEntity } from "../../entities/telegramNotification.entity";
import { TelegramEvent } from "./types/telegram.events";
import { Loop } from "../../utils/loop";

export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private readonly telegramClient: AppTelegramClient;
  private readonly telegramRepository: TelegramRepository;

  private readonly usernameMessageWatch: Map<string, Set<(payload: TelegramEvent.Message.Payload) => {}>> = new Map();

  constructor(
    telegramRepository: TelegramRepository,
    telegramClient: AppTelegramClient,
  ) {
    this.telegramClient = telegramClient;
    this.telegramRepository = telegramRepository;

    const loop = new Loop(50000, () => this.watchUsernameMessagesHandler());
    loop.run();

    this.logger.info('service created');
  }

  async watchUsernameMessages (username: string, chatId: string, handler: ((payload: TelegramEvent.Message.Payload) => {})){
    const { id } = await this.addAccountToWatch(username, chatId);

    if (!this.usernameMessageWatch.has(id)) {
      this.usernameMessageWatch.set(id, new Set());
    }
    this.usernameMessageWatch.get(id).add(handler);
  }

  async watchUsernameMessagesHandler() {
    for (const id of Object.keys(this.usernameMessageWatch)) {
      try {
        await this.findNewMessageByAccount(id);
      } catch (e) {
        this.logger.error('fail find new messages', e);
      }
    }
  }

  async addAccountToWatch(username: string, chat_id: string): Promise<TelegramAccountWatchEntity> {
    let accountInfo = await this.telegramRepository.findAccountWatchInfo(username, chat_id);

    if (!accountInfo) {
      accountInfo = await this.telegramRepository.addAccountWatchInfo(username, chat_id, null);
    }

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
      await this.telegramRepository.updateLastMessageId(
        accountInfo.username,
        accountInfo.chat_id,
        message.id
      );

      if (this.usernameMessageWatch.has(telegram_account_watch_id)) {
        for (const handler of this.usernameMessageWatch.get(telegram_account_watch_id)) {
          handler({
            username: accountInfo.username,
            chat_id: accountInfo.chat_id,
            message: {
              id: message.id,
              replyToMsgId: message.replyTo?.replyToMsgId
            }
          });
        }
      }
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
