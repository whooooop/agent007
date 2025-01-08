import {
    getDexscreenerUrl,
    getJupSwapUrl, getRaydiumSwapUrl,
    getSolscanTokenUrl,
    getSolscanTxUrl,
    getTokenAccountUrl
} from '../helpers/url.mjs'
import { applyDecimalsBigInt } from '../helpers/bigint.mjs'
import { getDateTimeByBlockTime } from '../helpers/date.js'
import { getBalanceBySwaps, solAddress } from '../helpers/token.mjs'

const NW = `\r\n`;

export async function swapTemplate (accountAddress, tokenSwap, swaps) {
    const token = swaps.tokens[tokenSwap];
    const tokenAccountUrl = await getTokenAccountUrl(accountAddress, tokenSwap);
    const dexscreenerUrl = getDexscreenerUrl(tokenSwap, accountAddress);
    const solscanTokenUrl = getSolscanTokenUrl(tokenSwap);
    const jupUrl = getJupSwapUrl(tokenSwap);
    const raydiumUrl = getRaydiumSwapUrl(tokenSwap);

    let message = '';

    if (swaps.swaps.length === 1) {
        message += `🆕 `;
    }

    message += `<b><a href="${dexscreenerUrl}">${token.symbol} (${token.name})</a></b>` + NW;

    if (token.description) {
        message += token.description + NW;
    }

    message += NW;

    const balanceTokenSwap = applyDecimalsBigInt(
        getBalanceBySwaps(tokenSwap, swaps),
        swaps.tokens[tokenSwap].decimals
    );
    const solProfit = applyDecimalsBigInt(
        getBalanceBySwaps(solAddress, swaps),
        swaps.tokens[solAddress].decimals
    );

    for (const swap of swaps.swaps) {
        const isBuy = swap.token_in === tokenSwap;
        const date = getDateTimeByBlockTime(swap.block_time);
        const icon = isBuy ? '🟢 ' : '🔴 ';
        const tokenIn = swaps.tokens[swap.token_in];
        const tokenOut = swaps.tokens[swap.token_out];
        const amountIn = applyDecimalsBigInt(swap.amount_in, tokenIn.decimals);
        const amountOut = applyDecimalsBigInt(swap.amount_out, tokenOut.decimals);
        const txUrl = getSolscanTxUrl(swap.signature);
        message += icon + `<a href="${txUrl}">${date}</a> ${amountOut} <b>${tokenOut.symbol}</b> for ${amountIn} <b>${tokenIn.symbol}</b>` + NW;
    }

    message += `---` + NW + NW;
    message += `Balance: ${balanceTokenSwap} ${swaps.tokens[tokenSwap].symbol}` + NW;
    message += `Profit: ${solProfit} Sol` + NW + NW;
    message += `---` + NW;

    message += `<a href="${dexscreenerUrl}">Dexscreener</a>` + NW;
    message += `<a href="${jupUrl}">Jupiter</a>` + NW;
    message += `<a href="${raydiumUrl}">Raydium</a>` + NW + NW;
    message += `<a href="${solscanTokenUrl}">Solscan Token</a>` + NW;
    message += `<a href="${tokenAccountUrl}">All swaps</a>` + NW;

    return message;
}
