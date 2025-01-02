import { auth } from './telegram.mjs'
import { watch } from './watch.mjs'
import { init } from './init.mjs'

const args = process.argv.slice(2);

if (args.includes('tgauth')) {
    await auth();
} else if (args.includes('watch')) {
    watch()
}  else if (args.includes('init')) {
    init()
} else {
    console.log(`Unknown command:`, args);
    console.log(`Use:`, [
        'tgauth',
        'init',
        'watch'
    ])
}
