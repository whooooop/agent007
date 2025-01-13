import { Logger } from "../utils/logger";
import { EventsRegistry } from "../config/events.config";
import { AppEvents } from "../core/event";
import { TelegramAccountNewMessagePayload } from "../types/appEvents";
import { Loop } from "../utils/loop";
import { NotificationService } from "../services/notification.service";
import { TelegramService } from "../services/telegram.service";

export class TelegramManager {
  private readonly logger = new Logger('TelegramManager');

  private readonly appEvents: AppEvents;
  private readonly telegramService: TelegramService;
  private readonly notificationService: NotificationService;

  private readonly watchAccountsLoop: Loop;

  constructor(
    appEvents: AppEvents,
    telegramService: TelegramService,
    notificationService: NotificationService
  ) {
    this.appEvents = appEvents;
    this.telegramService = telegramService;
    this.notificationService = notificationService;

    this.appEvents.on(EventsRegistry.TelegramAccountNewMessageEvent, (payload) => this.onNewMessage(payload));

    this.watchAccountsLoop = new Loop(10000, () => this.watchAccountsHandler())

    this.logger.info('manager created');
  }

  watchAccounts() {
    this.watchAccountsLoop.run();
  }

  private async watchAccountsHandler() {
    const accounts = await this.telegramService.getAccountsToWatch();

    for (const { id, username } of accounts) {
      try {
        await this.telegramService.findNewMessageByAccount(id);
      } catch (e) {
        this.logger.error('fail find new messages', username);
      }
    }
  }

  private async onNewMessage({ message, username, chat_id: fromChatId }: TelegramAccountNewMessagePayload) {
    this.logger.info('new message from', username);

    const notifications = await this.telegramService.getTelegramNotifications(username, fromChatId);

    for (const { chat_id } of notifications) {
      if (message.replyToMsgId) {
        await this.notificationService.forwardMessage(chat_id, fromChatId, message.replyToMsgId);
      }
      await this.notificationService.forwardMessage(chat_id, fromChatId, message.id);
    }
  }
}
