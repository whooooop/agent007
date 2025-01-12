import { Logger } from "../utils/logger";
import { AppTelegramClient } from "../clients/telegram.client";

export class NotificationService {
  private readonly logger = new Logger('NotificationService');
  private readonly telegramClient: AppTelegramClient;

  constructor(telegramClient: AppTelegramClient) {
    this.telegramClient = telegramClient;

    this.logger.info('service created');
  }

  async sendMessage (chatId: string, message: string) {
    await this.telegramClient.sendMessage(chatId, {
      message,
      parseMode: 'html'
    });
  }

  async forwardMessage(chaId: string, fromChatId: string, messageId: number) {
    await this.telegramClient.forwardMessage(chaId, fromChatId, messageId);
  }
}
