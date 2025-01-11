export const absBigInt = (value: bigint): bigint => value < 0n ? -value : value;

export function applyDecimalsBigInt(rawAmount: string | number | bigint, decimals: number, format: boolean = true): string | number {
  const amount = BigInt(rawAmount);
  const val = Number(amount) / Math.pow(10, decimals);
  return format ? formatNumber(val) : val;
}

export function formatNumber(num: number): string {
  let [integerPart, decimalPart] = num.toString().split('.');

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}
