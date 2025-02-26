import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { SolanaSwapInfo } from "./solanaSwapInfo";

export interface SolanaTxPayload {
  signer: string;
  signature: string;
  raw: ParsedTransactionWithMeta;
  parsed: {
    swap: SolanaSwapInfo | null;
  };
}

export interface SolanaSwapPayload {
  info: SolanaSwapInfo;
}

export const SolanaEvent = {
  Tx: {
    Name: 'solana.tx' as const,
  },
  Swap: {
    Name: 'solana.swap' as const,
  }
} as const;

export type SolanaEventPayloads = {
  [SolanaEvent.Tx.Name]: SolanaTxPayload;
  [SolanaEvent.Swap.Name]: SolanaSwapPayload;
};
