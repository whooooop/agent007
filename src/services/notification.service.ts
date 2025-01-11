import { Logger } from "../utils/logger";
import { AppTelegramClient } from "../clients/telegram.client";

export class NotificationService {
  private readonly logger = new Logger('NotificationService');
  private readonly telegramClient: AppTelegramClient;

  constructor(telegramClient: AppTelegramClient) {
    this.telegramClient = telegramClient;

    this.logger.info('created');
  }

  sendMessage (message: string) {
    // const connection = await this.telegram.client.getConnection()
    // await connection.sendMessage(chatId, {
    //   message,
    //   parseMode: 'html'
    // })
  }
}
