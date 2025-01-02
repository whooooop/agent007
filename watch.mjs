import { loop as loopTg } from './telegram.mjs'
import { Logger } from './utils/logger.mjs'
const logger = new Logger('watch');

let processing = false;

export function watch() {
    logger.log('running', 'loop interval 30s');

    setInterval(async () => {
        if (processing) return
        try {
            processing = true
            await loopTg()
        } finally {
            processing = false
        }
    }, 30000)
}
