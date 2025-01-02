import input from 'input'
import { Storage } from './utils/storage.mjs'

const storageTelegram = new Storage('telegram');

export async function init () {
    const useTelegramClientApp = await input.confirm('Use Telegram client APP');
    if (useTelegramClientApp) {
        await storageTelegram.write('config', {
            apiId: await input.text('Telegram API ID:'),
            apiHash: await input.text('Telegram API Hash:'),
            logChatId: await input.text('Telegram log Chat id:'),
        });
    }
}

