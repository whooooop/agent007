export const absBigInt = (value) => value < 0n ? -value : value

export function applyDecimalsBigInt(rawAmount, decimals, format = true) {
  const amount = BigInt(rawAmount)
  const val = Number(amount) / Math.pow(10, decimals)
  if (format) {
    return formatNumber(val)
  } else {
    return val
  }
}

export function formatNumber(num) {
  let [integerPart, decimalPart] = num.toString().split('.')

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

  return decimalPart ? `${ integerPart }.${ decimalPart }` : integerPart
}
