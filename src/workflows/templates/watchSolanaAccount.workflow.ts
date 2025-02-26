import { Workflow } from "../../core/workflow";
import { AgentAPI } from "../../core/agentAPI";
import { Logger } from "../../utils/logger";
import { SolanaServce } from "../../components/solana/solana.servce";
import { AppTelegramClient } from "../../components/telegram/telegram.client";
import { SolanaEvent, SolanaTxPayload } from "../../components/solana/types/solana.events";
import { getAnotherTokenFromSwap } from "../../helpers/token";
import { swapTemplate } from "../../templates/swap.template";

interface WatchSolanaAccountWorkflowConfig {
  accountAddress: string
  name?: string
  notificationChatId: string
  templateShowTraders: boolean
  notificationGemScoreOver?: number
}

export class WatchSolanaAccountWorkflowTemplate extends Workflow {
  declare agentApi: AgentAPI;

  private readonly logger = new Logger(WatchSolanaAccountWorkflowTemplate.name);
  private solanaService: SolanaServce;
  private telegramClient: AppTelegramClient;

  private readonly config: WatchSolanaAccountWorkflowConfig;

  constructor(agentApi: AgentAPI, config: WatchSolanaAccountWorkflowConfig) {
    super(agentApi);
    this.config = config;
  }

  run() {
    this.solanaService = this.agentApi.getSolanaServce();
    this.telegramClient = this.agentApi.getTelegramClient();

    this.solanaService.watchAccountTx(
      this.config.accountAddress,
      (data: SolanaTxPayload) => this.triggerTx(data)
    );
  }

  async triggerTx({ signer, parsed }: SolanaTxPayload){
    if (!parsed.swap) return;
    this.logger.info('new swap');

    try {
      const mint = getAnotherTokenFromSwap(parsed.swap);
      const { swaps, tokens} = await this.solanaService.getIndexedAccountTokenSwaps(signer, mint);
      const traders = this.config.templateShowTraders ? await this.solanaService.getTradersByToken(mint) : null;
      const name = this.config.name;
      const message = await swapTemplate({ signer, mint, swaps, tokens, traders, name });
      const gemScore = traders?.total;

      if (!this.config.notificationGemScoreOver || this.config.notificationGemScoreOver < gemScore) {
        const m = await this.telegramClient.sendMessage(this.config.notificationChatId, {
          message,
          parseMode: 'html'
        });
        // try {
        //   await this.telegramClient.sendMessage(this.config.notificationChatId, {
        //     message: mint,
        //     commentTo: m.id
        //   });
        // } catch (e) {}
      }
    } catch (e) {
      this.logger.error('trigger tx', e);
    }
  }
}
