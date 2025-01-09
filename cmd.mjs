import { App } from './app.mjs'

const app = new App()
const args = process.argv.slice(2)

app.initialize().then(async () => {
  if (args.includes('start')) {
    app.start()
  } else if (args.includes('install')) {
    await app.install()
  } else if (args.includes('test')) {
    await app.test()
  } else {
    console.log(`Unknown command:`, args)
    console.log(`Use:`, [
      'install',
      'start'
    ])
  }
})
