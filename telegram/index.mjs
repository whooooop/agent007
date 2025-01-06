import { Logger } from '../utils/logger.mjs'
import { Storage } from '../utils/storage.mjs'
import { TelegramClientService } from './client.mjs'
import input from 'input'

const storageUsers = new Storage('telegram/username')
const logger = new Logger('telegram');
const testChatId = 5008441322;

const watchList = [
    {
        username: '@dimmao',
        chatIds: [
            '-1001369370434' // Крипто Нарния (18+), ID: -1001369370434
        ]
    }
]

export class Telegram {
    processing = false;
    interval = null;
    loopDelay = 30000;

    storageTelegram = new Storage('telegram');

    constructor(app) {
        this.client = new TelegramClientService();
    }

    async install () {
        const useTelegramClientApp = await input.confirm('Use Telegram client APP');
        if (useTelegramClientApp) {
            console.log('Create your app here', 'https://my.telegram.org/auth');
            const config = await this.storageTelegram.read('config', {});
            await this.storageTelegram.write('config', {
                apiId: await input.text('Telegram API ID:', { default: config.apiId }),
                apiHash: await input.text('Telegram API Hash:', { default: config.apiHash }),
                logChatId: await input.text('Telegram log Chat id:', { default: config.logChatId }),
            });
            await this.client.auth();
        }
    }

    async watch () {
        this.interval = setInterval(async () => {
            if (this.processing) return;
            try {
                this.processing = true;
                await this.loop();
            } finally {
                this.processing = false;
            }
        }, this.loopDelay);
    }

    async loop () {
        for (const { username, chatIds } of watchList) {
            let cacheData = await storageUsers.read(username, { chats: {} });
            logger.log(username);
            for (const chatId of chatIds) {
                logger.log(username, `Chat id (${chatId})`);
                try {
                    let filter = { fromUser: username, limit: 10 }
                    if (cacheData.chats[chatId]?.lastId) {
                        filter.minId = cacheData.chats[chatId].lastId;
                    }
                    const messages = await this.client.getMessages(chatId, filter);
                    logger.log(username, `Chat id (${chatId})`, `messages (${messages.length})`);

                    for (const message of messages.reverse()) {
                        logger.log(username, `Chat id (${chatId})`, `message(${message.id})`);

                        if (message.replyTo) {
                            await this.client.forwardMessage(chatId, message.replyTo.replyToMsgId);
                        }
                        await this.client.forwardMessage(chatId, message.id)

                        try {
                            cacheData.chats[chatId] = cacheData.chats[chatId] || {}
                            cacheData.chats[chatId].lastId = message.id;
                        } catch (e) {}
                    }
                    await storageUsers.write(username, cacheData);
                } catch (e) {
                    logger.error(e);
                }
            }
        }
    }
}
