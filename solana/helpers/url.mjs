import { getTokenAccountAddress, solAddress } from './token.mjs'

export function getPumpfunUrl(mintAddress) {
    return `https://pump.fun/coin/${mintAddress}`;
}

export function getDexscreenerUrl(mintAddress, accountAddress) {
    return `https://dexscreener.com/solana/${mintAddress}${accountAddress ? `?maker=${accountAddress}` : ''}`;
}

export function getSolscanTxUrl(signature) {
    return `https://solscan.io/tx/${signature}`;
}

export async function getTokenAccountUrl(accountAddress, tokenMintAddress) {
    const tokenAccount = await getTokenAccountAddress(accountAddress, tokenMintAddress);
    return `https://solscan.io/account/${tokenAccount}`;
}

export function getSolscanTokenUrl(mintAddress) {
    return `https://solscan.io/token/${mintAddress}`;
}

export function getJupSwapUrl(mintAddress) {
    return `https://jup.ag/swap/SOL-${mintAddress}`
}

export function getRaydiumSwapUrl(outputMint, inputMint = solAddress) {
    return `https://raydium.io/swap/?inputMint=${inputMint}&outputMint=${outputMint}`
}
