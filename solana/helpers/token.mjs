export const solAddress = 'So11111111111111111111111111111111111111112';

export function getAnotherTokenFromSwap(swap) {
    if (swap.tokenOut.mint === solAddress) {
        return swap.tokenIn.mint;
    } else {
        return swap.tokenOut.mint;
    }
}

export function getTokensFromSwaps(swaps) {
    return Array.from(
        new Set(
            swaps.reduce((tokens, swap) => {
                tokens.push(swap.token_in)
                tokens.push(swap.token_out)
                return tokens
            }, [])
        )
    );
}
