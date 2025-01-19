import { Logger, LogLevel } from '../utils/logger';
import { Database } from "./database";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";
import { SolanaAccountWatchEntity } from "../entities/solanaAccountWatch.entity";
import { SolanaTokenMetadataEntity } from "../entities/solanaTokenMetadata.entity";
import { AppTelegramClient } from "../components/telegram/telegram.client";
import { SolanaClient, SolanaClientConfig } from "../components/solana/solana.client";
import { SolanaServce } from "../components/solana/solana.servce";
import { XComServise } from "../components/x_com/xCom.servise";
import { PumpfunService } from "../components/pumpfun/pumpfun.service";
import { SolanaRepository } from "../repositories/solana.repository";
import { TelegramAccountWatchEntity } from "../entities/telegramAccountWatch.entity";
import { TelegramRepository } from "../repositories/telegram.repository";
import { TelegramService } from "../components/telegram/telegram.service";
import { AppTelegramClientConfig } from "../components/telegram/types/telegramClientConfig.types";
import { SolanaWallet, SolanaWalletConfig } from "../components/solana/solana.wallet";

interface LoggerConfig {
  levels?: LogLevel[];
  excludeContexts?: []
}
interface AppWalletsConfig {
  solana: SolanaWalletConfig
}

export interface AgentAPIConfig {
  logger?: LoggerConfig
  telegram: AppTelegramClientConfig
  wallets?: AppWalletsConfig
  solanaClient: SolanaClientConfig
}
export class AgentAPI {
  private readonly logger = new Logger('AgentAPI');

  private readonly database: Database;

  private readonly solanaClient: SolanaClient;
  private readonly telegramClient: AppTelegramClient;

  readonly solanaWallet: SolanaWallet;

  private readonly solanaRepository: SolanaRepository;
  private readonly telegramRepository: TelegramRepository;

  private readonly solanaServce: SolanaServce;
  private readonly telegramService: TelegramService;
  private readonly pumpfunService: PumpfunService;
  private readonly xComServise: XComServise;

  constructor(config: AgentAPIConfig) {
    if (config.logger) {
      config.logger.levels && (Logger.levels = config.logger.levels);
      config.logger.excludeContexts && (Logger.excludeContexts = config.logger.excludeContexts);
    }

    /**
     * Bootstrap Core
     */
    this.database = new Database({
      database: './data.db',
      logging: false,
      entities: [
        SolanaAccountTokenSwapEntity,
        SolanaAccountWatchEntity,
        SolanaTokenMetadataEntity,
        TelegramAccountWatchEntity
      ]
    });

    /**
     * Bootstrap Clients
     */
    this.solanaClient = new SolanaClient(config.solanaClient);
    this.telegramClient = new AppTelegramClient(config.telegram);

    if (config.wallets?.solana) {
      this.solanaWallet = new SolanaWallet(config.wallets.solana);
    }

    /**
     * Bootstrap Repositories
     */
    this.solanaRepository = new SolanaRepository(
      this.database
    );
    this.telegramRepository = new TelegramRepository(
      this.database
    );

    /**
     * Bootstrap Services
     */
    this.solanaServce = new SolanaServce(
      this.solanaRepository,
      this.solanaClient
    );
    this.telegramService = new TelegramService(
      this.telegramRepository,
      this.telegramClient
    );
    this.xComServise = new XComServise();
    this.pumpfunService = new PumpfunService();

    // for (const WorkflowInstance of config.workflows) {
    //   if (WorkflowInstance.ENABLED) {
    //     this.logger.info(`workflow ${WorkflowInstance.name} ENABLED`);
    //     this.workflows.push(
    //       new WorkflowInstance(this)
    //     );
    //   } else {
    //     this.logger.info(`workflow ${WorkflowInstance.name} DISABLED`);
    //   }
    // }
  }

  static async bootstrap (config: AgentAPIConfig) {
    const agentAPI = new AgentAPI(config);
    await agentAPI.initialize();

    return agentAPI;
  }

  async initialize() {
    await this.database.initialize();

    this.logger.info('initialized');
  }

  getSolanaServce () {
    return this.solanaServce
  }

  getTelegramService() {
    return this.telegramService;
  }

  getTelegramClient() {
    return this.telegramClient;
  }
}
