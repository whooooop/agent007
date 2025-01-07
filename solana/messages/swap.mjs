import { getDexscreenerUrl, getSolscanTokenUrl, getSolscanTxUrl, getTokenAccountUrl } from '../helpers/url.mjs'
import { applyDecimalsBigInt } from '../helpers/bigint.mjs'

const NW = `\r\n`;

export async function swapTemplate (accountAddress, tokenSwap, swaps) {
    const token = swaps.tokens[tokenSwap];
    const tokenAccountUrl = await getTokenAccountUrl(accountAddress, tokenSwap);
    const dexscreenerUrl = getDexscreenerUrl(tokenSwap, accountAddress);
    const solscanTokenUrl = getSolscanTokenUrl(tokenSwap);

    let message = '';

    if (swaps.swaps.length === 1) {
        message += `🆕 `;
    }

    message += `<b><a href="${dexscreenerUrl}">${token.symbol} (${token.name})</a></b>` + NW;

    if (token.description) {
        message += token.description + NW;
    }

    message += NW;

    for (const swap of swaps.swaps) {
        const isBuy = swap.token_in === tokenSwap;
        const icon = isBuy ? '🟢 ' : '🔴 ';
        const tokenIn = swaps.tokens[swap.token_in];
        const tokenOut = swaps.tokens[swap.token_out];
        const amountIn = applyDecimalsBigInt(swap.amount_in, tokenIn.decimals);
        const amountOut = applyDecimalsBigInt(swap.amount_out, tokenOut.decimals);
        const txUrl = getSolscanTxUrl(swap.signature);

        message += icon + `<a href="${txUrl}">Swap</a> ${amountOut} <b>${tokenOut.symbol}</b> for ${amountIn} <b>${tokenIn.symbol}</b>` + NW;
    }

    message += `---` + NW;
    message += `<a href="${dexscreenerUrl}">Dexscreener</a>` + NW;
    message += `<a href="${solscanTokenUrl}">Solscan Token</a>` + NW;
    message += `<a href="${tokenAccountUrl}">All swaps</a>` + NW;

    return message;
}
