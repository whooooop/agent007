import { EntitySchema } from 'typeorm';

export interface SolanaAccountTokenSwapEntity {
  signature: string;
  account: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  block_time: number;
}

export const SolanaAccountTokenSwapEntity = new EntitySchema<SolanaAccountTokenSwapEntity>({
  name: 'SolanaAccountTokenSwap',
  tableName: 'solana_account_token_swap',
  columns: {
    signature: {
      type: 'text',
      primary: true,
      length: 100,
    },
    account: {
      type: 'text',
      length: 50,
    },
    token_in: {
      type: 'text',
      length: 50,
    },
    token_out: {
      type: 'text',
      length: 50,
    },
    amount_in: {
      type: 'text',
      length: 30,
    },
    amount_out: {
      type: 'text',
      length: 30,
    },
    block_time: {
      type: 'int',
    },
  },
  indices: [
    {
      name: 'idx_account',
      columns: ['account'],
    },
    {
      name: 'idx_account_token_in',
      columns: ['account', 'token_in'],
    },
    {
      name: 'idx_account_token_out',
      columns: ['account', 'token_out'],
    },
  ],
});
