import { SolanaRpc } from '../sol-rpc/index.mjs'
import { Loop } from '../../utils/loop.mjs'
import { Logger } from '../../utils/logger.mjs'
import { Throttle } from '../../utils/throttle.mjs'

const logger = new Logger('pumpfun')

export class Pumpfun {

  pumpfunTokenMintAuthorityAddress = 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM'
  lastSignature = null

  async initialize(app) {
    const throttle = new Throttle()

    this.rpc = await app.inject(SolanaRpc)
    this.loop = new Loop(10000, () => this.loopHandler())

    this.tokenRequestThrottle = throttle.throttle((...args) => this.getTokenInfo(...args))
  }

  newTokenDetect() {
    this.loop.run()
  }

  async getTokenInfo(signature) {
    const txInfo = await this.rpc.getParsedTransaction(signature)
    const instruction = txInfo.transaction.message.instructions.find(instruction => instruction?.parsed?.type === 'createIdempotent')
    const mintAddress = instruction?.parsed?.info?.mint

    if (!mintAddress) return

    const tokenMetadata = await this.rpc.getTokensMetadata(mintAddress);

    logger.log('token', tokenMetadata)
  }

  async loopHandler() {
    const signatures = await this.rpc.getFinalizedSignaturesForAddress(this.pumpfunTokenMintAuthorityAddress, {
      until: this.lastSignature,
      limit: 500
    })

    if (!this.lastSignature) {
      this.lastSignature = signatures[0].signature
      return
    }

    this.tokenRequestThrottle(this.lastSignature)
    this.lastSignature = signatures[0].signature
  }

}
