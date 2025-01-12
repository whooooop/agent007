import { EntitySchema } from 'typeorm';

export interface TelegramNotificationEntity {
  id: string;
  telegram_account_watch_id: string;
  chat_id?: string;
}

export const TelegramNotificationEntity = new EntitySchema<TelegramNotificationEntity>({
  name: 'TelegramNotification',
  tableName: 'telegram_notification',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true,
    },
    telegram_account_watch_id: {
      type: 'uuid',
    },
    chat_id: {
      type: 'varchar',
      length: 20,
    },
  },
  uniques: [
    {
      name: 'UQ_WATCH_ID_CHAT_ID',
      columns: ['telegram_account_watch_id', 'chat_id']
    },
  ],
  indices: [
    {
      name: 'idx_telegram_account_watch_id',
      columns: ['telegram_account_watch_id']
    }
  ]
});
