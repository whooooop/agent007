import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import { Logger } from './utils/logger.mjs'
import { Storage } from './utils/storage.mjs'

const storageTelegram = new Storage('telegram');
const storageUsers = new Storage('telegram/username')
const logger = new Logger('telegram');

const watchList = [
    {
        username: '@dimmao',
        chatIds: [
            '-1001369370434' // Крипто Нарния (18+), ID: -1001369370434, Тип: Канал
        ]
    }
]

let connection = null

async function getClient () {
    if (connection) return connection;
    const { session } = await storageTelegram.read('session', { session: '' });
    const stringSession = new StringSession(session);
    const telegramConfig = await storageTelegram.read('config');
    connection = new TelegramClient(stringSession, parseInt(telegramConfig.apiId), telegramConfig.apiHash, {
        connectionRetries: 5,
    });
    if (session) {
        await connection.connect()
    }

    return connection
}

export async function auth () {
    logger.log('Loading Telegram client...');
    await storageTelegram.remove('session')
    const client = await getClient()

    await client.start({
        phoneNumber: async () => await input.text('Phone number:'),
        password: async () => await input.password('Password:'),
        phoneCode: async () =>
            await input.text('Code:'),
        onError: (err) => logger.error(err),
    });

    logger.log('You are logged in');
    await storageTelegram.write('session', { session: client.session.save() });
    await client.disconnect();
}

async function getDialogs() {
    const client = await getClient();
    const dialogs = await client.getDialogs(); // Получение списка диалогов
    for (const dialog of dialogs) {
        console.log(`${dialog.title}, ID: ${dialog.id}}`);
    }
}

async function getMessages(chatId, filter){
    const client = await getClient();
    const chatEntity = await client.getEntity(chatId);
    logger.log(`Get Messages from chat(${chatId}):`, JSON.stringify(filter))
    return client.getMessages(chatEntity, filter);
}

async function forwardMessage(fromChatId, messageId) {
    const client = await getClient();
    const telegramConfig = await storageTelegram.read('config');
    await client.forwardMessages(telegramConfig.logChatId, { messages: messageId, fromPeer: fromChatId });
}

export async function loop () {
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
                const messages = await getMessages(chatId, filter);
                logger.log(username, `Chat id (${chatId})`, `messages (${messages.length})`);

                for (const message of messages.reverse()) {
                    logger.log(username, `Chat id (${chatId})`, `message(${message.id})`);

                    if (message.replyTo) {
                        await forwardMessage(chatId, message.replyTo.replyToMsgId);
                    }
                    await forwardMessage(chatId, message.id)

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
