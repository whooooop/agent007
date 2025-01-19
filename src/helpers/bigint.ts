export const absBigInt = (value: bigint): bigint => value < 0n ? -value : value;

export function applyDecimalsBigInt(rawAmount: string | number | bigint, decimals: number, format: boolean = true): string {
  const amount = BigInt(rawAmount);
  const val = Number(amount) / Math.pow(10, decimals);
  return format ? formatNumber(val) : val.toString();
}

export function formatNumber(num: number, float: number = 2): string {
  let [integerPart, decimalPart] = num.toString().split('.');

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return decimalPart ? `${integerPart}.${decimalPart.slice(0, float)}` : integerPart;
}
