import { EntitySchema } from 'typeorm';

export interface TelegramAccountWatchEntity {
  id: string;
  username: string;
  chat_id?: string;
  last_message_id?: number | null;
}

export const TelegramAccountWatchEntity = new EntitySchema<TelegramAccountWatchEntity>({
  name: 'TelegramAccountWatch',
  tableName: 'telegram_account_watch',
  columns: {
    id: {
      type: 'uuid',
      generated: 'uuid',
      primary: true,
    },
    username: {
      type: 'varchar',
      length: 50,
    },
    chat_id: {
      type: 'varchar',
      length: 20,
    },
    last_message_id: {
      type: 'int',
      nullable: true
    }
  },
  indices: [
    {
      name: 'IDX_USERNAME_CHAT_ID',
      columns: ['username', 'chat_id'],
      unique: true
    },
  ],
});
