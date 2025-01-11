import { Logger, LogLevel } from '../utils/logger';
import { AppEvents } from "./event";
import { Database } from "./database";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";
import { SolanaAccountWatchEntity } from "../entities/solanaAccountWatch.entity";
import { SolanaTokenMetadataEntity } from "../entities/solanaTokenMetadata.entity";
import { AppTelegramClient } from "../clients/telegram.client";
import { SolanaClient } from "../clients/solana.client";
import { NotificationService } from "../services/notification.service";
import { SolanaServce } from "../services/solana.servce";
import { XComServise } from "../services/xCom.servise";
import { PumpfunService } from "../services/pumpfun.service";
import { SolanaManager } from "../managers/solana.manager";
import { SolanaRepository } from "../repositories/solana.repository";

export interface AgentAPIConfig {
  logLevels?: LogLevel[];
}

export class AgentAPI {
  private readonly database: Database;
  private readonly events: AppEvents;

  private readonly solanaClient: SolanaClient;
  private readonly telegramClient: AppTelegramClient;

  private readonly solanaRepository: SolanaRepository;

  private readonly solanaServce: SolanaServce;
  private readonly notificationService: NotificationService;
  private readonly pumpfunService: PumpfunService;
  private readonly xComServise: XComServise;

  private readonly solanaManager: SolanaManager;

  constructor(config: AgentAPIConfig) {
    if (config.logLevels) {
      Logger.levels = config.logLevels;
    }

    /**
     * Bootstrap Core
     */
    this.events = new AppEvents();
    this.database = new Database({
      database: './data.db',
      logging: false,
      entities: [
        SolanaAccountTokenSwapEntity,
        SolanaAccountWatchEntity,
        SolanaTokenMetadataEntity
      ]
    });

    /**
     * Bootstrap Clients
     */
    this.solanaClient = new SolanaClient();
    this.telegramClient = new AppTelegramClient({
      apiId: 0,
      apiHash: '',
      session: '',
      logChatId: ''
    });

    /**
     * Bootstrap Repositories
     */
    this.solanaRepository = new SolanaRepository(
      this.database
    );

    /**
     * Bootstrap Services
     */
    this.notificationService = new NotificationService(
      this.telegramClient
    );
    this.solanaServce = new SolanaServce(
      this.events,
      this.solanaRepository,
      this.solanaClient
    );
    this.xComServise = new XComServise();
    this.pumpfunService = new PumpfunService();

    /**
     * Bootstrap Managers
     */
    this.solanaManager = new SolanaManager(
      this.events,
      this.solanaServce,
      this.notificationService
    );
  }

  static async bootstrap (config: AgentAPIConfig) {
    const agentAPI = new AgentAPI(config);
    await agentAPI.initialize();

    return agentAPI;
  }

  async initialize () {
    await this.database.initialize();
  }

  getSolanaManager(): SolanaManager {
    return this.solanaManager;
  }
}
