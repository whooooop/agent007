import { getAccountUrl } from '../helpers/url.mjs'
import { applyDecimalsBigInt } from '../helpers/bigint.mjs'

const NW = `\r\n`

export async function statMessageTemplate({accountAddress, totalSolAmountIn, totalSolAmountOut, tokens}) {
  const accountUrl = await getAccountUrl(accountAddress)
  const amountOut = applyDecimalsBigInt(totalSolAmountOut, 9)
  const profit = applyDecimalsBigInt(totalSolAmountIn - totalSolAmountOut, 9)

  let message = ''

  message += `All-time stats: 👤 <b><a href="${ accountUrl }">${ accountAddress }</a></b>` + NW + NW
  message += `💸 Spent: ${amountOut} SOL` + NW
  message += `🚀 Profit: ${profit} SOL` + NW
  message += `💎 Tokens: ${tokens.length}`

  return message
}
