import { getAccountUrl } from '../helpers/url'
import { GetProgramAccountsResponse } from "@solana/web3.js";

const NW = `\r\n`

export async function statTemplate(
  accountAddress: string,
  totalSolAmountIn: string,
  totalSolAmountOut: string,
  profit: string,
  tokens: GetProgramAccountsResponse
) {
  const accountUrl = await getAccountUrl(accountAddress);
  let message = '';

  message += `All-time stats: <b><a href="${ accountUrl }">${ accountAddress }</a></b>` + NW + NW;
  message += `💸 Spent: ${totalSolAmountOut} SOL` + NW;
  message += `🚀 Profit: ${profit} SOL` + NW;
  message += `💎 Tokens: ${tokens.length}`;

  return message;
}
