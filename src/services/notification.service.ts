import { Logger } from "../utils/logger";
import { AppTelegramClient } from "../clients/telegram.client";

export class NotificationService {
  private readonly logger = new Logger('NotificationService');
  private readonly telegramClient: AppTelegramClient;

  constructor(telegramClient: AppTelegramClient) {
    this.telegramClient = telegramClient;

    this.logger.info('service created');
  }

  async sendMessage (chatId: string, message: string): Promise<void> {
    try {
      await this.telegramClient.sendMessage(chatId, {
        message,
        parseMode: 'html'
      });
    } catch (e) {
      this.logger.error('send message', chatId, e);
    }
  }

  async forwardMessage(chatId: string, fromChatId: string, messageId: number): Promise<void>  {
    try {
      await this.telegramClient.forwardMessage(chatId, fromChatId, messageId);
    } catch (e) {
      this.logger.error('forward message', chatId, fromChatId, messageId, e);
    }
  }
}
