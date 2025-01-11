
export interface SolanaSwapInfoToken {
  mint: string,
  amount: string
}

export interface SolanaSwapInfo {
  tokenIn: SolanaSwapInfoToken,
  tokenOut: SolanaSwapInfoToken,
}
