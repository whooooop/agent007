// https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,binancecoin,ethereum&vs_currencies=usd
// https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT

export async function getPrice(symbol = 'BTC') {
  const url = `https://api.binance.com/api/v3/ticker/price?symbol=${ symbol.toUpperCase() }USDT`
  const response = await fetch(url)
  const data = await response.json()
  return data.price
}
