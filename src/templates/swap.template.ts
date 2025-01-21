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

interface swapTemplateParams {
  signer: string
  name?: string
  mint: string
  swaps: SolanaAccountTokenSwapEntity[]
  tokens: Record<string, SolanaTokenMetadataEntity>
  traders: { total: number, today: number } | null
}

export async function swapTemplate({ signer, name, mint, swaps, tokens, traders } : swapTemplateParams) {
  const token = tokens[mint];
  const tokenAccountUrl = getTokenAccountUrl(signer, mint);
  const dexscreenerUrl = getDexscreenerUrl(mint, signer);
  const solscanTokenUrl = getSolscanTokenUrl(mint);
  const solscanAccountUrl = getAccountUrl(signer);

  let message = '';
  let swapType: 'buy' | 'sell';

  const balanceTokenSwap = applyDecimalsBigInt(
    getBalanceBySwaps(mint, swaps),
    tokens[mint].decimals || 6
  );
  const solProfit = applyDecimalsBigInt(
    getBalanceBySwaps(solAddress, swaps),
    tokens[solAddress]?.decimals || 6
  );

  if (swaps.length === 1) {
    message += `🆕 `;
  }

  if (token) {
    message += `<b><a href="${ dexscreenerUrl }">${ token.symbol } (${ token.name })</a></b>` + NW;
    message += `<a href="${ solscanTokenUrl }">${ mint }</a>` + NW;
  } else {
    message += `<b><a href="${ dexscreenerUrl }">${ mint }</a></b>` + NW;
  }

  if (traders) {
    message += `${ getColoredSquares(traders.total) } (${ traders.today }/${traders.total}) Gem Score` + NW;
    // message += `Today traders: ${ traders.today }` + NW;
    // message += `Total traders: ${ traders.total }` + NW;
  }
  message += NW;

  for (const swap of swaps.slice(0, 5)) {
    const isBuy = swap.token_in === mint;
    const date = getDateTimeByBlockTime(swap.block_time);
    const icon = isBuy ? '🟢 ' : '🔴 ';
    const tokenIn = tokens[swap.token_in] || { symbol: swap.token_in, decimals: 6 };
    const tokenOut = tokens[swap.token_out] || { symbol: swap.token_out, decimals: 6 };
    const amountIn = applyDecimalsBigInt(swap.amount_in, tokenIn.decimals);
    const amountOut = applyDecimalsBigInt(swap.amount_out, tokenOut.decimals);
    const txUrl = getSolscanTxUrl(swap.signature);

    if (!swapType) {
      swapType = (isBuy ? 'buy' : 'sell');
    }

    message += icon + `<a href="${ txUrl }">${ date }</a> ${ amountOut } <b>${ tokenOut.symbol }</b> for ${ amountIn } <b>${ tokenIn.symbol }</b>` + NW;
  }

  const fee = swapType === 'sell' ? 100 : 10;
  const jupUrl = getJupSwapUrl(mint, fee);
  const raydiumUrl = getRaydiumSwapUrl(mint);

  if (swaps.length > 5) {
    message += `<a href="${ tokenAccountUrl }">All swaps</a>` + NW;
  }
  message += NW;

  message += `👤${ name ? ' ' + name : '' } <a href="${ solscanAccountUrl }">${ signer }</a>` + NW;
  message += `Balance: ${ balanceTokenSwap } ${ tokens[mint]?.symbol || mint }` + NW;
  message += `Profit: ${ solProfit } Sol` + NW;

  message += NW;

  message += `<a href="${ jupUrl }">Jupiter</a> | <a href="${ dexscreenerUrl }">Dexscreener</a>` + NW;
  // message += `<a href="${ raydiumUrl }">Raydium</a>` + NW;

  return message;
}


// ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
// 🟥⬜⬜⬜⬜⬜⬜⬜⬜⬜
// 🟨🟨⬜⬜⬜⬜⬜⬜⬜⬜
// 🟨🟨🟨⬜⬜⬜⬜⬜⬜⬜
// 🟨🟨🟨🟨⬜⬜⬜⬜⬜⬜
// 🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜
// 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜
// 🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
function getColoredSquares(n: number): string {
  let colorSquare: string;
  if (n === 1) {
    colorSquare = '🟥';
  } else if (n <= 4) {
    colorSquare = '🟨';
  } else {
    colorSquare = '🟩';
  }
  const filledCount = Math.min(n, 10);
  const unfilledCount = 10 - filledCount;
  const filled = colorSquare.repeat(filledCount);
  const unfilled = '⬜'.repeat(unfilledCount);
  return filled + unfilled;
}


