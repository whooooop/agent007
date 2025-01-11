import { Solana } from './services/solana/index.mjs'
import { Telegram } from './services/telegram/index.mjs'
import { CoreApp } from './core/app.mjs'
import { Pumpfun } from './services/pumpfun/index.mjs'

export class App extends CoreApp {
  constructor() {
    super()
  }

  async initialize() {
    this.telegram = await this.inject(Telegram)
    this.solana = await this.inject(Solana)
    this.pumpfun = await this.inject(Pumpfun)
  }

  async start() {
    // this.solana.addAccountToWatch('GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z', '-1002376488914')
    this.solana.watch()
    this.telegram.watch()
  }

  async test() {
    this.solana.test()
    // this.pumpfun.newTokenDetect()
  }

  async install() {
    await this.telegram.install()
  }
}
