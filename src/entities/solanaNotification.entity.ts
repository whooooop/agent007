import { EntitySchema } from 'typeorm';

export enum SolanaNotificationEvent {
  SWAP = 'SWAP',
  STAT = 'STAT'
}

export interface SolanaNotificationEntity {
  id: string;
  account: string;
  chat_id: string;
  event: SolanaNotificationEvent;
}

export const SolanaNotificationEntity = new EntitySchema<SolanaNotificationEntity>({
  name: 'SolanaNotification',
  tableName: 'solana_notification',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true,
    },
    account: {
      type: 'varchar',
      length: 50,
    },
    chat_id: {
      type: 'varchar',
      length: 20,
    },
    event: {
      type: 'enum',
      enum: SolanaNotificationEvent
    },
  },
  uniques: [
    {
      name: 'UQ_ACCOUNT_CHAT_ID_EVENT',
      columns: ['account', 'chat_id', 'event']
    },
  ],
  indices: [
    {
      name: 'idx_account_event',
      columns: ['account', 'event']
    }
  ]
});
