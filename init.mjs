import input from 'input'
import { Storage } from './utils/storage.mjs'
import { auth } from './telegram.mjs'

const storageTelegram = new Storage('telegram');

export async function init () {
    const useTelegramClientApp = await input.confirm('Use Telegram client APP');
    if (useTelegramClientApp) {
        console.log('Create your app here', 'https://my.telegram.org/auth');
        const config = await storageTelegram.read('config', {});
        await storageTelegram.write('config', {
            apiId: await input.text('Telegram API ID:', { default: config.apiId }),
            apiHash: await input.text('Telegram API Hash:', { default: config.apiHash }),
            logChatId: await input.text('Telegram log Chat id:', { default: config.logChatId }),
        });
        await auth();
    }
}

