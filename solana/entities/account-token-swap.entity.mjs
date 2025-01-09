import { EntitySchema } from 'typeorm'

export const SolanaAccountTokenSwapEntity = new EntitySchema({
  name: 'SolanaAccountTokenSwap',
  tableName: 'solana_account_token_swap',
  columns: {
    signature: {
      type: 'text',
      primary: true,
      length: 100
    },
    account: {
      length: 50,
      type: 'text'
    },
    token_in: {
      description: 'The address of the token that was purchased.',
      type: 'text',
      length: 50
    },
    token_out: {
      description: 'The address of the token that was sold.',
      length: 50,
      type: 'text'
    },
    amount_in: {
      type: 'text',
      length: 30
    },
    amount_out: {
      type: 'text',
      length: 30
    },
    block_time: {
      type: 'int'
    }
  },
  indices: [
    {
      name: 'idx_account',
      columns: ['account']
    },
    {
      name: 'idx_account_token_in',
      columns: ['account', 'token_in']
    },
    {
      name: 'idx_account_token_out',
      columns: ['account', 'token_out']
    }
  ]
})
