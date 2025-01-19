import {
  getAccountUrl,
  getDexscreenerUrl,
  getJupSwapUrl, getRaydiumSwapUrl,
  getSolscanTokenUrl,
  getSolscanTxUrl,
  getTokenAccountUrl
} from '../helpers/url'
import { getDateTimeByBlockTime } from '../helpers/date'
import { getBalanceBySwaps, solAddress } from '../helpers/token'
import { applyDecimalsBigInt } from '../helpers/bigint'
import { SolanaTokenMetadataEntity } from "../entities/solanaTokenMetadata.entity";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";

const NW = `\r\n`;

export async function swapTemplate(
  accountAddress: string,
  tokenSwap: string,
  swaps: SolanaAccountTokenSwapEntity[],
  tokens: Record<string, SolanaTokenMetadataEntity>
) {
  const token = tokens[tokenSwap];
  const tokenAccountUrl = getTokenAccountUrl(accountAddress, tokenSwap);
  const dexscreenerUrl = getDexscreenerUrl(tokenSwap, accountAddress);
  const solscanTokenUrl = getSolscanTokenUrl(tokenSwap);
  const solscanAccountUrl = getAccountUrl(accountAddress);

  let message = '';
  let swapType: 'buy' | 'sell';

  if (swaps.length === 1) {
    message += `🆕 `;
  }

  message += `<b><a href="${ dexscreenerUrl }">${ token.symbol } (${ token.name })</a></b>` + NW;
  message += `<a href="${ solscanTokenUrl }">${ tokenSwap }</a>` + NW + NW;
  message += `<a href="${ solscanAccountUrl }">${ accountAddress }</a>` + NW + NW;

  if (token.description) {
    message += token.description + NW;
  }

  message += NW;

  const balanceTokenSwap = applyDecimalsBigInt(
    getBalanceBySwaps(tokenSwap, swaps),
    tokens[tokenSwap].decimals || 6
  );
  const solProfit = applyDecimalsBigInt(
    getBalanceBySwaps(solAddress, swaps),
    tokens[solAddress]?.decimals || 6
  );

  for (const swap of swaps.slice(0, 5)) {
    const isBuy = swap.token_in === tokenSwap;
    const date = getDateTimeByBlockTime(swap.block_time);
    const icon = isBuy ? '🟢 ' : '🔴 ';
    const tokenIn = tokens[swap.token_in] || { symbol: swap.token_in, decimals: 6 };
    const tokenOut = tokens[swap.token_out] || { symbol: swap.token_out, decimals: 6 };
    const amountIn = applyDecimalsBigInt(swap.amount_in, tokenIn.decimals);
    const amountOut = applyDecimalsBigInt(swap.amount_out, tokenOut.decimals);
    const txUrl = getSolscanTxUrl(swap.signature);

    if (swapType) {
      swapType = (isBuy ? 'buy' : 'sell');
    }

    message += icon + `<a href="${ txUrl }">${ date }</a> ${ amountOut } <b>${ tokenOut.symbol }</b> for ${ amountIn } <b>${ tokenIn.symbol }</b>` + NW;
  }

  const fee = swapType === 'sell' ? 100 : 10;
  const jupUrl = getJupSwapUrl(tokenSwap, fee);
  const raydiumUrl = getRaydiumSwapUrl(tokenSwap);

  message += `<a href="${ tokenAccountUrl }">All swaps</a>` + NW;
  message += `---` + NW + NW;
  message += `Balance: ${ balanceTokenSwap } ${ tokens[tokenSwap]?.symbol || tokenSwap }` + NW;
  message += `Profit: ${ solProfit } Sol` + NW;

  message += NW;

  message += `<a href="${ jupUrl }">Jupiter</a>` + NW;
  message += `<a href="${ dexscreenerUrl }">Dexscreener</a>` + NW;
  // message += `<a href="${ raydiumUrl }">Raydium</a>` + NW;

  return message;
}
