import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Logger } from '../../utils/logger';
import { Logger as TgLogger } from "telegram/extensions";
import input from 'input';
import * as messageMethods from "telegram/client/messages";
import { Api } from "telegram/tl";
import { AppTelegramClientConfig } from "./types/telegramClientConfig.types";

/**
 * TelegramClientService handles the connection and interactions with the Telegram API.
 * It manages session persistence, authentication, and common Telegram operations like fetching dialogs and forwarding messages.
 */
export class AppTelegramClient {
  private readonly logger = new Logger('TelegramClient');

  private connection: TelegramClient | null = null;
  private storageTelegram: Storage;
  private readonly config: AppTelegramClientConfig;

  constructor(config: AppTelegramClientConfig) {
    this.config = config;
    this.logger.info('client created');
  }

  /**
   * Establishes a connection to the Telegram API.
   * If a session is already saved, it uses the saved session to reconnect.
   * @returns {Promise<TelegramClient>} The Telegram client instance.
   */
  async getConnection(): Promise<TelegramClient> {
    if (this.connection) return this.connection;

    const stringSession = new StringSession(this.config.session);
    const levels = Array.from(Logger.levels).filter(level => level === 'info');

    // Initialize the Telegram client
    this.connection = new TelegramClient(stringSession, this.config.apiId, this.config.apiHash, {
      connectionRetries: 1000,
      retryDelay: 5000,
      autoReconnect: true,
      // @ts-ignore
      baseLogger: new Logger('NativeTelegramClient', levels) as TgLogger
    });

    // Connect using the saved session if available
    if (this.config.session) {
      await this.connection.connect();
    }

    return this.connection;
  }

  /**
   * Authenticates the user by starting a new Telegram session.
   * The user will be prompted for their phone number, password (if enabled), and a confirmation code.
   * The session will be saved for future use.
   * @returns {Promise<void>}
   */
  async auth(): Promise<void> {
    this.logger.info('Loading Telegram client...');

    // Remove any existing session before starting a new one
    await this.storageTelegram.remove('session');

    // Get the Telegram connection
    const connection = await this.getConnection();

    // Start the authentication process
    await connection.start({
      phoneNumber: async () => await input.text('Phone number:'),
      password: async () => await input.password('Password:'),
      phoneCode: async () => await input.text('Code:'),
      onError: (err) => this.logger.error(err),
    });

    this.logger.info('You are logged in');

    // Save the session for future use
    await this.storageTelegram.write('session', { session: connection.session.save() });

    // Disconnect after successful authentication
    await connection.disconnect();
  }

  /**
   * Fetches and logs all dialogs (chats, channels, etc.) associated with the authenticated user.
   * @returns {Promise<void>}
   */
  async getDialogs(): Promise<void> {
    const connection = await this.getConnection();
    const dialogs = await connection.getDialogs();

    for (const dialog of dialogs) {
      console.log(`${dialog.title}, ID: ${dialog.id}`);
    }
  }

  /**
   * Retrieves messages from a specific chat.
   * @param chatId The ID or username of the chat to retrieve messages from.
   * @param filter Optional filters to apply when fetching messages.
   * @returns {Promise<any>} The list of messages.
   */
  async getMessages(chatId: string | number, filter?: Partial<messageMethods.IterMessagesParams>): Promise<import("telegram/Helpers").TotalList<Api.Message>> {
    const connection = await this.getConnection();
    const chatEntity = await connection.getEntity(chatId);
    this.logger.verbose('get messages', chatId, filter);

    return connection.getMessages(chatEntity, filter);
  }

  async sendMessage(chatId: string, params: messageMethods.SendMessageParams): Promise<Api.Message>{
    this.logger.debug('send message', chatId);
    this.logger.verbose('params', params);

    const connection = await this.getConnection();
    return connection.sendMessage(chatId, params);
  }

  /**
   * Forwards a message from one chat to another.
   * The destination chat is defined in the configuration file.
   * @returns {Promise<void>}
   */
  async forwardMessage(chatId: string, fromPeer: string, messageId: number): Promise<void> {
    this.logger.debug('forward message', chatId, fromPeer, messageId);

    const connection = await this.getConnection();

    // Forward the message to the log chat
    await connection.forwardMessages(chatId, {
      messages: messageId,
      fromPeer,
    });
  }
}
