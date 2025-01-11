import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Logger } from '../utils/logger';
import input from 'input';

export interface TelegramClientServiceConfig {
  apiId: number,
  apiHash: string,
  session?: string
  logChatId?: string
}

/**
 * TelegramClientService handles the connection and interactions with the Telegram API.
 * It manages session persistence, authentication, and common Telegram operations like fetching dialogs and forwarding messages.
 */
export class AppTelegramClient {
  private readonly logger = new Logger('TelegramClient');

  private connection: TelegramClient | null = null;
  private storageTelegram: Storage;
  private readonly config: TelegramClientServiceConfig;

  constructor(config: TelegramClientServiceConfig) {
    this.config = config;
    this.logger.info('created');
  }

  /**
   * Establishes a connection to the Telegram API.
   * If a session is already saved, it uses the saved session to reconnect.
   * @returns {Promise<TelegramClient>} The Telegram client instance.
   */
  async getConnection(): Promise<TelegramClient> {
    if (this.connection) return this.connection;

    const stringSession = new StringSession(this.config.session);

    // Initialize the Telegram client
    this.connection = new TelegramClient(stringSession, this.config.apiId, this.config.apiHash, {
      connectionRetries: 1000,
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
  async getMessages(chatId: string | number, filter?: any): Promise<any> {
    const connection = await this.getConnection();
    const chatEntity = await connection.getEntity(chatId);
    return connection.getMessages(chatEntity, filter);
  }

  /**
   * Forwards a message from one chat to another.
   * The destination chat is defined in the configuration file.
   * @param fromChatId The ID or username of the chat to forward the message from.
   * @param messageId The ID of the message to be forwarded.
   * @returns {Promise<void>}
   */
  async forwardMessage(fromChatId: string | number, messageId: number | number[]): Promise<void> {
    const connection = await this.getConnection();

    // Forward the message to the log chat
    await connection.forwardMessages(this.config.logChatId, {
      messages: messageId,
      fromPeer: fromChatId,
    });
  }
}
