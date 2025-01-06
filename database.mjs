import { DataSource } from 'typeorm'
import { SolanaTokenMetadataEntity } from './solana/entities/token-metadata.entity.mjs'
import { SolanaAccountTokenSwapEntity } from './solana/entities/account-token-swap.entity.mjs'
import { SolanaAccountSwapInfoEntity } from './solana/entities/account-swap-info.entity.mjs'

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: './data.db',
    synchronize: true,
    logging: false,
    entities: [
        SolanaAccountTokenSwapEntity,
        SolanaTokenMetadataEntity,
        SolanaAccountSwapInfoEntity
    ]
});
