import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'

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

export async function getTokenAccountAddress (accountAddress, tokenMintAddress) {
    const accountPublicKey = new PublicKey(accountAddress);
    const tokenMintPublicKey = new PublicKey(tokenMintAddress);

    // (associated token account)
    const tokenAccount = await getAssociatedTokenAddress(
        tokenMintPublicKey,
        accountPublicKey
    );

    return tokenAccount.toBase58();
}

export function getSolscanTokenUrl(mintAddress) {
    return `https://solscan.io/token/${mintAddress}`;
}
