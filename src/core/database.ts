import { DataSource, DataSourceOptions } from 'typeorm';
import { Repository } from "typeorm/repository/Repository";
import { EntityTarget } from "typeorm/common/EntityTarget";
import { ObjectLiteral } from "typeorm/common/ObjectLiteral";
import { Logger } from "../utils/logger";

export interface DatabaseConfig {
  database: string,
  logging: boolean,
  entities: EntityTarget<ObjectLiteral>[]
}

export class Database {
  private readonly logger = new Logger('Database');
  private datasource: DataSource;

  constructor(config: DatabaseConfig) {
    this.datasource = new DataSource({
      type: 'sqlite',
      database: config.database,
      synchronize: true,
      logging: config.logging,
      entities: config.entities,
    } as DataSourceOptions);

    this.logger.info('created');
  }

  async initialize(): Promise<void> {
    this.datasource = await this.datasource.initialize();
  }

  getDataSource(): DataSource {
    return this.datasource;
  }

  getRepository<Entity extends ObjectLiteral>(target: EntityTarget<Entity>): Repository<Entity> {
    if (!this.datasource) {
      throw new Error('Datasource is not initialized.');
    }
    return this.datasource.getRepository<Entity>(target);
  }
}
