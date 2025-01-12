import { EntitySchema } from 'typeorm';

export interface SolanaAccountWatchEntity {
  account: string;
  last_signature?: string;
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
      nullable: true
    }
  }
});
