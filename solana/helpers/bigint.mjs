export const absBigInt = (value) => value < 0n ? -value : value;

export function applyDecimalsBigInt(rawAmount, decimals) {
    const amount = BigInt(rawAmount);
    return Number(amount) / Math.pow(10, decimals);
}
