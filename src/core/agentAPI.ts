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

export interface AgentAPIConfig {
  logLevels?: LogLevel[];
}

export class AgentAPI {
  private readonly database: Database;
  private readonly events: AppEvents;

  private readonly solanaClient: SolanaClient;
  private readonly telegramClient: AppTelegramClient;

  private readonly solanaServce: SolanaServce;
  private readonly notificationService: NotificationService;
  private readonly pumpfunService: PumpfunService;
  private readonly xComServise: XComServise;


  constructor(config: AgentAPIConfig) {
    if (config.logLevels) {
      Logger.levels = config.logLevels;
    }

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

    this.solanaClient = new SolanaClient();
    this.telegramClient = new AppTelegramClient({
      apiId: 0,
      apiHash: '',
      session: '',
      logChatId: ''
    });

    this.notificationService = new NotificationService();
    this.solanaServce = new SolanaServce();
    this.xComServise = new XComServise();
    this.pumpfunService = new PumpfunService();
  }

  run () {}
}
