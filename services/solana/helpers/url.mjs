import { getTokenAccountAddress } from './token.mjs'

export function getPumpfunUrl(mintAddress) {
  return `https://pump.fun/coin/${ mintAddress }`
}

export function getDexscreenerUrl(mintAddress, accountAddress) {
  return `https://dexscreener.com/solana/${ mintAddress }${ accountAddress ? `?maker=${ accountAddress }` : '' }`
}

export function getSolscanTxUrl(signature) {
  return `https://solscan.io/tx/${ signature }`
}

export async function getTokenAccountUrl(accountAddress, tokenMintAddress) {
  const tokenAccount = await getTokenAccountAddress(accountAddress, tokenMintAddress)
  return `https://solscan.io/account/${ tokenAccount }`
}

export function getSolscanTokenUrl(mintAddress) {
  return `https://solscan.io/token/${ mintAddress }`
}

export function getJupSwapUrl(mintAddress) {
  return `https://jup.ag/swap/SOL-${ mintAddress }?referrer=91tabVGJ5NzFQSTigN1Noz2Qo8Vdd8fzw2gGJ5RTgWK1&feeBps=10`
}

export function getRaydiumSwapUrl(outputMint, inputMint = 'sol') {
  return `https://raydium.io/swap/?inputMint=${ inputMint }&outputMint=${ outputMint }&referrer=F3Ry3WUAA5dZ9wjutBZ2jxJeVnB3BseQG7jkcT4gTApr`
}
