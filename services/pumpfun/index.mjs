import { SolanaRpc } from '../solana/rpc.mjs'

export class Pumpfun {
  async initialize(app) {
    this.rpc = await app.inject(SolanaRpc)
  }
}
