import { EntitySchema } from 'typeorm';

export const SolanaAccountWatchEntity = new EntitySchema({
    name: 'SolanaAccountWatch',
    tableName: 'solana_account_watch',
    columns: {
        account: {
            primary: true,
            length: 50,
            type: 'varchar'
        },
        last_signature: {
            type: 'varchar',
            length: 100
        },
        active: {
            type: 'boolean'
        },
        chat_id: {
            type: 'varchar',
            length: 50,
            nullable: true
        }
    }
})
