import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { applyDecimalsBigInt } from './bigint.mjs'

export const solAddress = 'So11111111111111111111111111111111111111112'

export function getAnotherTokenFromSwap(swap) {
  if (swap.tokenOut.mint === solAddress) {
    return swap.tokenIn.mint
  } else {
    return swap.tokenOut.mint
  }
}

export async function getTokenAccountAddress(accountAddress, tokenMintAddress) {
  const accountPublicKey = new PublicKey(accountAddress)
  const tokenMintPublicKey = new PublicKey(tokenMintAddress)

  // (associated token account)
  const tokenAccount = await getAssociatedTokenAddress(
    tokenMintPublicKey,
    accountPublicKey
  )

  return tokenAccount.toBase58()
}

export function getTokensFromSwaps(swaps) {
  return Array.from(
    new Set(
      swaps.reduce((tokens, swap) => {
        tokens.push(swap.token_in)
        tokens.push(swap.token_out)
        return tokens
      }, [])
    )
  )
}

export function getBalanceBySwaps(mintAddress, swaps) {
  let value = BigInt(0)
  for (const swap of swaps.swaps) {
    if (swap.token_in === mintAddress) {
      value = value + BigInt(swap.amount_in)
    } else if (swap.token_out === mintAddress) {
      value = value - BigInt(swap.amount_out)
    }
  }
  return value.toString()
}
