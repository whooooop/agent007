import { EntitySchema } from 'typeorm';

export interface SolanaAccountWatchEntity {
  account: string;
  last_signature: string;
  active: boolean;
  chat_id?: string;
}

export const SolanaAccountWatchEntity = new EntitySchema<SolanaAccountWatchEntity>({
  name: 'SolanaAccountWatch',
  tableName: 'solana_account_watch',
  columns: {
    account: {
      type: 'varchar',
      primary: true,
      length: 50,
    },
    last_signature: {
      type: 'varchar',
      length: 100,
    },
    active: {
      type: 'boolean',
    },
    chat_id: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
  },
});
