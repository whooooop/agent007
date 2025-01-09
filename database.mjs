import { DataSource } from 'typeorm'
import { SolanaTokenMetadataEntity } from './services/solana/entities/token-metadata.entity.mjs'
import { SolanaAccountTokenSwapEntity } from './services/solana/entities/account-token-swap.entity.mjs'
import { SolanaAccountWatchEntity } from './services/solana/entities/account-watch.entity.mjs'

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './data.db',
  synchronize: true,
  logging: false,
  entities: [
    SolanaAccountTokenSwapEntity,
    SolanaTokenMetadataEntity,
    SolanaAccountWatchEntity
  ]
})

export class Database {
  async initialize() {
    this.datasource = await AppDataSource.initialize()
  }
}
