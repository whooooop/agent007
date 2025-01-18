import { describe, expect, beforeEach, test, xtest } from '@jest/globals';

import * as fs from 'fs';

const transferTokenTxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/transferToken.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapRadiumTxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapRadium.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapRadium2TxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapRadium2.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapJupiterBuyTxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapJupiterBuy.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapJupiterSellTxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapJupiterSell.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapMeteoraTxInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapMeteoraTx.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapToUSDCInfo = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapToUSDC.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapJupiterAggregatorV6 = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapJupiterAggregatorV6.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapOrca = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapOrca.json', 'utf-8')) as ParsedTransactionWithMeta;
const swapPumpfun = JSON.parse(fs.readFileSync(__dirname + '/mocks/swapPumpfun.json', 'utf-8')) as ParsedTransactionWithMeta;

import { SolanaServce } from "../solana.servce";
import { AppEvents } from "../../../core/event";
import { SolanaRepository } from "../../../repositories/solana.repository";
import { SolanaClient } from "../solana.client";
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { Logger } from "../../../utils/logger";

let solanaService: SolanaServce;
let appEvents: AppEvents;
let solanaRepository: SolanaRepository;
let solanaClient: SolanaClient;


describe('getSwapInfo', () => {
  beforeEach(() => {
    Logger.levels = [];
    solanaService = new SolanaServce(
      appEvents,
      solanaRepository,
      solanaClient
    );
  });

  test('tx transfer token', async () => {
    const data = await (solanaService as any).getSwapInfo(transferTokenTxInfo);
    expect(data).toEqual(null);
  })

  test('swap Radium', async () => {
    const data = await (solanaService as any).getSwapInfo(swapRadiumTxInfo)
    expect(data).toEqual({
      tokenIn: {
        'amount': '2773565633162',
        'mint': '7pxL552ER7TxjBvwT86Kemn1Wnky2FewyEjtvLMppump'
      },
      tokenOut: {
        'amount': '260000000',
        'mint': 'So11111111111111111111111111111111111111112'
      }
    })
  })

  test('swap Radium 2', async () => {
    const data = await (solanaService as any).getSwapInfo(swapRadium2TxInfo)
    expect(data).toEqual({
      tokenIn: {
        'amount': '234037352315',
        'mint': 'A3hzGcTxZNSc7744CWB2LR5Tt9VTtEaQYpP6nwripump'
      },
      tokenOut: {
        'amount': '100000000',
        'mint': 'So11111111111111111111111111111111111111112'
      }
    })
  })

  test('swap Jupiter buy', async () => {
    const data = await (solanaService as any).getSwapInfo(swapJupiterBuyTxInfo)
    expect(data).toEqual({
      tokenIn: {
        'amount': '2490474999523',
        'mint': 'FwzpNxnabjZvc8QCnV6qPEBKxqLxSyjobc5Etdgxpump'
      },
      tokenOut: {
        'amount': '44000000000',
        'mint': 'So11111111111111111111111111111111111111112'
      }
    })
  })

  test('swap Jupiter sell', async () => {
    const data = await (solanaService as any).getSwapInfo(swapJupiterSellTxInfo)
    expect(data).toEqual({
      tokenIn: {
        'amount': '93965850643',
        'mint': 'So11111111111111111111111111111111111111112'
      },
      tokenOut: {
        'amount': '1503230657764',
        'mint': '79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY'
      }
    })
  })

  test('swap Orca', async () => {
    const data = await (solanaService as any).getSwapInfo(swapOrca, {debug: true});
    expect(data).toEqual({
      tokenIn: {
        "amount": "1614662373",
        "mint": "BZLbGTNCSFfoth2GYDtwr7e4imWzpR5jqcUuGEwr646K",
      },
      tokenOut: {
        "amount": "300000000",
        "mint": "So11111111111111111111111111111111111111112",
      }
    });
  })

  xtest('swap Pumpfun', async () => {
    const data = await (solanaService as any).getSwapInfo(swapPumpfun, {debug: true});
    expect(data).toEqual({
      tokenIn: {
        "amount": "241534234",
        "mint": "So11111111111111111111111111111111111111112",
      },
      tokenOut: {
        "amount": "1830000000",
        "mint": "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
      }
    });
  })

  xtest('swap to USDC', async () => {
    const data = await (solanaService as any).getSwapInfo(swapToUSDCInfo);
    expect(data).toEqual({
      tokenIn: {},
      tokenOut: {}
    });
  })
})
