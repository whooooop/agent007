import { getSwapInfo } from './index.mjs'
import transferTokenTxInfo from './mocks/transferToken.json'
import swapRadiumTxInfo from './mocks/swapRadium.json'
import swapRadium2TxInfo from './mocks/swapRadium2.json'
import swapJupiterBuyTxInfo from './mocks/swapJupiterBuy.json'
import swapJupiterSellTxInfo from './mocks/swapJupiterSell.json'
import swapToUSDCInfo from './mocks/swapToUSDC.json'
import swapJupiterAggregatorV6 from './mocks/swapJupiterAggregatorV6.json'
import swapOrca from './mocks/swapOrca.json'
import swapPumpfun from './mocks/swapPumpfun.json'

describe('getSwapInfo', () => {
    test('tx transfer token', () => {
        const data = getSwapInfo(transferTokenTxInfo);
        expect(data).toEqual(null);
    })

    test('swap Radium', () => {
        const data = getSwapInfo(swapRadiumTxInfo);
        expect(data).toEqual({
            tokenIn: {
                "amount": "2773565633162",
                "mint": "7pxL552ER7TxjBvwT86Kemn1Wnky2FewyEjtvLMppump",
            },
            tokenOut: {
                "amount": "260000000",
                "mint": "So11111111111111111111111111111111111111112",
            }
        });
    })

    test('swap Radium 2', () => {
        const data = getSwapInfo(swapRadium2TxInfo);
        expect(data).toEqual({
            tokenIn: {
                "amount": "234037352315",
                "mint": "A3hzGcTxZNSc7744CWB2LR5Tt9VTtEaQYpP6nwripump",
            },
            tokenOut: {
                "amount": "100000000",
                "mint": "So11111111111111111111111111111111111111112",
            }
        });
    })

    test('swap Jupiter buy', () => {
        const data = getSwapInfo(swapJupiterBuyTxInfo);
        expect(data).toEqual({
            tokenIn: {
                "amount": "2490474999523",
                "mint": "FwzpNxnabjZvc8QCnV6qPEBKxqLxSyjobc5Etdgxpump",
            },
            tokenOut: {
                "amount": "44000000000",
                "mint": "So11111111111111111111111111111111111111112",
            }
        });
    })

    test('swap Jupiter sell', () => {
        const data = getSwapInfo(swapJupiterSellTxInfo);
        expect(data).toEqual({
            tokenIn: {
                "amount": "93965850643",
                "mint": "So11111111111111111111111111111111111111112"
            },
            tokenOut: {
                "amount": "1503230657764",
                "mint": "79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY",
            }
        });
    })
    // test('swap Pumpfun', () => {
    //     const data = getSwapInfo(swapPumpfun, { debug: true });
    //     expect(data).toEqual({
    //         tokenIn: {
    //             "amount": "241534234",
    //             "mint": "So11111111111111111111111111111111111111112",
    //         },
    //         tokenOut: {
    //             "amount": "1830000000",
    //             "mint": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
    //         }
    //     });
    // })

    // test('swap Orca', () => {
    //     const data = getSwapInfo(swapOrca, { debug: true });
    //     expect(data).toEqual({
    //         tokenIn: {
    //             "amount": "241534234",
    //             "mint": "So11111111111111111111111111111111111111112",
    //         },
    //         tokenOut: {
    //             "amount": "1830000000",
    //             "mint": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
    //         }
    //     });
    // })
    // test('swap to USDC', () => {
    //     const data = getSwapInfo(swapToUSDCInfo);
    //     expect(data).toEqual({
    //         tokenIn: {
    //         },
    //         tokenOut: {
    //         }
    //     });
    // })
})
