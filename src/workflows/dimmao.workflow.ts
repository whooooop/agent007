import { AgentAPI } from "../core/agentAPI";
import { Workflow } from "../core/workflow";
import { SolanaEvent } from "../components/solana/types/solana.events";
import { Logger } from "../utils/logger";
import { swapTemplate } from "../templates/swap.template";
import { SolanaServce } from "../components/solana/solana.servce";
import { AppTelegramClient } from "../components/telegram/telegram.client";
import { TelegramEvent } from "../components/telegram/types/telegram.events";
import { getAnotherTokenFromSwap } from "../helpers/token";
import { TelegramService } from "../components/telegram/telegram.service";

export class DimmaoWorkflow extends Workflow {
  static ENABLED = true;

  declare agentApi: AgentAPI;

  private readonly logger = new Logger(DimmaoWorkflow.name);
  private solanaService: SolanaServce;
  private telegramClient: AppTelegramClient;
  private telegramService: TelegramService;

  private readonly dimmaoUsername = 'dimmao';
  private readonly narniaChatId = '-1001369370434';
  private readonly dimmaoAddress = 'GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z';
  private readonly notificationChatId = '-1002376488914';

  run() {
    this.solanaService = this.agentApi.getSolanaServce();
    this.telegramClient = this.agentApi.getTelegramClient();
    this.telegramService = this.agentApi.getTelegramService();

    this.solanaService.watchAccountTx(
      this.dimmaoAddress,
      (data: SolanaEvent.Tx.Payload) => this.triggerTx(data)
    );

    this.telegramService.watchUsernameMessages(
      this.dimmaoUsername,
      this.narniaChatId,
      (data: TelegramEvent.Message.Payload) => this.triggerNewMessage(data)
    );
  }

  async triggerTx({ signer, parsed }: SolanaEvent.Tx.Payload){
    if (!parsed.swap) return;
    this.logger.info('new swap');

    try {
      const mint = getAnotherTokenFromSwap(parsed.swap);
      const { swaps, tokens} = await this.solanaService.getIndexedAccountTokenSwaps(signer, mint);
      const message = await swapTemplate(signer, mint, swaps, tokens);

      await this.telegramClient.sendMessage(this.notificationChatId, {
        message,
        parseMode: 'html'
      });
    } catch (e) {
      this.logger.error('trigger tx', e);
    }
  }

  async triggerNewMessage({ message, chat_id }: TelegramEvent.Message.Payload) {
    this.logger.info('new message');
    if (message.replyToMsgId) {
      await this.telegramClient.forwardMessage(this.notificationChatId, chat_id, message.replyToMsgId);
    }
    await this.telegramClient.forwardMessage(this.notificationChatId, this.narniaChatId, message.id);
  }

  // private async accountSwapsStat(accountAddress: string) {
  //   // Fetch token accounts owned by the account
  //   const tokens = await this.solanaService.getAccountTokens(accountAddress);
  //   const { txsIn, txsOut } = await this.solanaService.getAccountSolSwaps(accountAddress);
  //
  //   // Calculate total incoming and outgoing SOL amounts
  //   const totalSolAmountIn = txsIn.reduce((total, tx) => total + BigInt(tx.amount_in), BigInt(0));
  //   const totalSolAmountOut = txsOut.reduce((total, tx) => total + BigInt(tx.amount_out), BigInt(0));
  //   const profit = applyDecimalsBigInt(totalSolAmountIn - totalSolAmountOut, 9);
  //   const message = await statTemplate(
  //     accountAddress,
  //     applyDecimalsBigInt(totalSolAmountIn.toString(), 9),
  //     applyDecimalsBigInt(totalSolAmountOut.toString(), 9),
  //     profit,
  //     tokens
  //   );
  //   const notifications = await this.solanaService.getNotifications(accountAddress, SolanaNotificationEvent.STAT);
  //
  //   for (const { chat_id } of notifications) {
  //     await this.notificationService.sendMessage(chat_id, message);
  //   }
  // }
}
