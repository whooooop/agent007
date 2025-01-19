import { PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
export const solAddress: string = 'So11111111111111111111111111111111111111112';

interface Swap {
  tokenIn: { mint: string };
  tokenOut: { mint: string };
}

interface SwapDetails {
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
}


export function getAnotherTokenFromSwap(swap: Swap): string {
  return swap.tokenOut.mint === solAddress ? swap.tokenIn.mint : swap.tokenOut.mint;
}

export function getTokenAccountAddress(accountAddress: string, tokenMintAddress: string): string {
  const accountPublicKey = new PublicKey(accountAddress);
  const tokenMintPublicKey = new PublicKey(tokenMintAddress);

  const [address] = PublicKey.findProgramAddressSync(
    [accountPublicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintPublicKey.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  return address.toBase58();
}

export function getTokensFromSwaps(swaps: SwapDetails[]): string[] {
  return Array.from(
    new Set(
      swaps.reduce<string[]>((tokens, swap) => {
        tokens.push(swap.token_in);
        tokens.push(swap.token_out);
        return tokens;
      }, [])
    )
  );
}

export function getBalanceBySwaps(mintAddress: string, swaps: SwapDetails[]): string {
  let value = BigInt(0);
  for (const swap of swaps) {
    if (swap.token_in === mintAddress) {
      value += BigInt(swap.amount_in);
    } else if (swap.token_out === mintAddress) {
      value -= BigInt(swap.amount_out);
    }
  }
  return value.toString();
}
