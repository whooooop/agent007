import { getTokenAccountAddress } from './token';

export function getPumpfunUrl(mintAddress: string): string {
  return `https://pump.fun/coin/${mintAddress}`;
}

export function getDexscreenerUrl(mintAddress: string, accountAddress?: string): string {
  return `https://dexscreener.com/solana/${mintAddress}${accountAddress ? `?maker=${accountAddress}` : ''}`;
}

export function getGmgnUrl(mintAddress: string, accountAddress?: string): string {
  return `https://gmgn.ai/sol/token/${mintAddress}?tab=activity${accountAddress ? `&maker=${accountAddress}` : ''}`;
}

export function getSolscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}`;
}

export function getAccountUrl(accountAddress: string): string {
  return `https://solscan.io/account/${accountAddress}`;
}

export function getTokenAccountUrl(accountAddress: string, tokenMintAddress: string): string {
  const tokenAccount = getTokenAccountAddress(accountAddress, tokenMintAddress);
  return getAccountUrl(tokenAccount);
}

export function getSolscanTokenUrl(mintAddress: string): string {
  return `https://solscan.io/token/${mintAddress}`;
}

export function getJupSwapUrl(mintAddress: string, fee = 10): string {
  return `https://jup.ag/swap/SOL-${mintAddress}?referrer=91tabVGJ5NzFQSTigN1Noz2Qo8Vdd8fzw2gGJ5RTgWK1&feeBps=${fee}`;
}

export function getRaydiumSwapUrl(outputMint: string, inputMint: string = 'sol'): string {
  return `https://raydium.io/swap/?inputMint=${inputMint}&outputMint=${outputMint}&referrer=F3Ry3WUAA5dZ9wjutBZ2jxJeVnB3BseQG7jkcT4gTApr`;
}
