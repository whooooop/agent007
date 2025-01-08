import { TelegramClient } from 'telegram';
import { Storage } from '../utils/storage.mjs'
import { StringSession } from 'telegram/sessions/index.js';
import { Logger } from '../utils/logger.mjs'
import input from 'input'

const logger = new Logger('telegram/client');

export class TelegramClientService {
    connection = null;
    storageTelegram = new Storage('telegram');

    constructor() {}

    async getConnection () {
        if (this.connection) return this.connection;
        const { session } = await this.storageTelegram.read('session', { session: '' });
        const stringSession = new StringSession(session);
        const telegramConfig = await this.storageTelegram.read('config');
        this.connection = new TelegramClient(stringSession, parseInt(telegramConfig.apiId), telegramConfig.apiHash, {
            connectionRetries: 1000,
        });
        if (session) {
            await this.connection.connect()
        }

        return this.connection;
    }

    async auth () {
        logger.log('Loading Telegram client...');
        await this.storageTelegram.remove('session');
        const connection = await this.getConnection();

        await connection.start({
            phoneNumber: async () => await input.text('Phone number:'),
            password: async () => await input.password('Password:'),
            phoneCode: async () =>
                await input.text('Code:'),
            onError: (err) => logger.error(err),
        });

        logger.log('You are logged in');
        await this.storageTelegram.write('session', { session: connection.session.save() });
        await connection.disconnect();
    }

    async getDialogs() {
        const connection = await this.getConnection();
        const dialogs = await connection.getDialogs();
        for (const dialog of dialogs) {
            console.log(`${dialog.title}, ID: ${dialog.id}}`);
        }
    }

    async getMessages(chatId, filter){
        const connection = await this.getConnection();
        const chatEntity = await connection.getEntity(chatId);
        return connection.getMessages(chatEntity, filter);
    }

    async forwardMessage(fromChatId, messageId) {
        const connection = await this.getConnection();
        const telegramConfig = await this.storageTelegram.read('config');
        await connection.forwardMessages(telegramConfig.logChatId, { messages: messageId, fromPeer: fromChatId });
    }
}
