import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { SolanaSwapInfo } from "./solanaSwapInfo";

export namespace SolanaEvent {
  export namespace Tx {
    export interface Payload {
      signer: string
      signature: string
      raw: ParsedTransactionWithMeta,
      parsed: {
        swap: SolanaSwapInfo | null
      }
    }
  }
}
