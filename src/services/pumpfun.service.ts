import { Logger } from "../utils/logger";

export class PumpfunService {
  private readonly logger = new Logger('PumpfunService');

  constructor() {
    this.logger.info('service created');
  }
}



// export class Pumpfun {
//
//   pumpfunTokenMintAuthorityAddress = 'TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM'
//   lastSignature = null
//
//   async initialize(app) {
//     const throttle = new Throttle()
//
//     this.rpc = await app.inject(SolanaRpc)
//     this.loop = new Loop(10000, () => this.loopHandler())
//
//     this.tokenRequestThrottle = throttle.throttle((...args) => this.getTokenInfo(...args))
//   }
//
//   newTokenDetect() {
//     this.loop.run()
//   }
//
//   async getTokenInfo(signature) {
//     const txInfo = await this.rpc.getParsedTransaction(signature)
//     const instruction = txInfo.transaction.message.instructions.find(instruction => instruction?.parsed?.type === 'createIdempotent')
//     const mintAddress = instruction?.parsed?.info?.mint
//
//     if (!mintAddress) return
//
//     const tokenMetadata = await this.rpc.getTokensMetadata(mintAddress);
//
//     logger.log('token', tokenMetadata)
//   }
//
//   async loopHandler() {
//     const signatures = await this.rpc.getFinalizedSignaturesForAddress(this.pumpfunTokenMintAuthorityAddress, {
//       until: this.lastSignature,
//       limit: 500
//     })
//
//     if (!this.lastSignature) {
//       this.lastSignature = signatures[0].signature
//       return
//     }
//
//     this.tokenRequestThrottle(this.lastSignature)
//     this.lastSignature = signatures[0].signature
//   }
//
// }
