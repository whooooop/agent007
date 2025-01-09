import { Solana } from './solana/index.mjs'
import { Telegram } from './telegram/index.mjs'
import { CoreApp } from './core/app.mjs'

export class App extends CoreApp {
  constructor() {
    super()
  }

  async initialize() {
    this.telegram = await this.inject(Telegram)
    this.solana = await this.inject(Solana)
  }

  async start() {
    // this.solana.addAccountToWatch('GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z', '-1002376488914')
    this.solana.watch()
    this.telegram.watch()
  }

  async test() {
    this.solana.test()
  }

  async install() {
    await this.telegram.install()
  }
}
