import { EntitySchema } from 'typeorm';

export const SolanaAccountSwapInfoEntity = new EntitySchema({
    name: 'SolanaAccountSwapInfoTx',
    tableName: 'solana_account_swap_info',
    columns: {
        account: {
            primary: true,
            length: 50,
            type: 'text'
        },
        signature_from: {
            type: 'text',
            length: 100,
            nullable: true
        },
        signature_to: {
            type: 'text',
            length: 100,
            nullable: true
        },
        signature_first: {
            type: 'text',
            length: 100,
            nullable: true
        }
    }
})
