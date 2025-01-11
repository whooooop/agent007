import { EntitySchema } from 'typeorm';

export interface SolanaTokenMetadataEntity {
  address: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  decimals: number;
}

export const SolanaTokenMetadataEntity = new EntitySchema<SolanaTokenMetadataEntity>({
  name: 'SolanaTokenMetadata',
  tableName: 'solana_token_metadata',
  columns: {
    address: {
      type: 'varchar',
      length: 50,
      primary: true,
    },
    name: {
      type: 'varchar',
      length: 10,
    },
    symbol: {
      type: 'varchar',
      length: 10,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    image: {
      type: 'varchar',
      length: 200,
      nullable: true,
    },
    decimals: {
      type: 'tinyint',
    },
  },
});
