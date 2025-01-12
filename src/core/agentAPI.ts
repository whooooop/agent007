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
import { TelegramAccountWatchEntity } from "../entities/telegramAccountWatch.entity";
import { TelegramRepository } from "../repositories/telegram.repository";
import { TelegramNotificationEntity } from "../entities/telegramNotification.entity";
import { TelegramService } from "../services/telegram.service";
import { TelegramManager } from "../managers/telegram.manager";
import { SolanaNotificationEntity } from "../entities/solanaNotification.entity";

export interface AgentAPIConfig {
  logLevels?: LogLevel[];
}

export class AgentAPI {
  private readonly database: Database;
  private readonly events: AppEvents;

  private readonly solanaClient: SolanaClient;
  private readonly telegramClient: AppTelegramClient;

  private readonly solanaRepository: SolanaRepository;
  private readonly telegramRepository: TelegramRepository;

  private readonly solanaServce: SolanaServce;
  private readonly telegramService: TelegramService;
  private readonly notificationService: NotificationService;
  private readonly pumpfunService: PumpfunService;
  private readonly xComServise: XComServise;

  private readonly solanaManager: SolanaManager;
  private readonly telegramManager: TelegramManager;

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
        SolanaTokenMetadataEntity,
        SolanaNotificationEntity,
        TelegramAccountWatchEntity,
        TelegramNotificationEntity,
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
    this.telegramRepository = new TelegramRepository(
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
    this.telegramService = new TelegramService(
      this.events,
      this.telegramRepository,
      this.telegramClient
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
    this.telegramManager = new TelegramManager(
      this.events,
      this.telegramService,
      this.notificationService
    );
  }

  static async bootstrap (config: AgentAPIConfig) {
    const agentAPI = new AgentAPI(config);
    await agentAPI.initialize();

    return agentAPI;
  }

  async initialize() {
    await this.database.initialize();
  }

  watch() {
    this.solanaManager.watchAccounts();
    this.telegramManager.watchAccounts();
  }
}
