import { Logger } from "../utils/logger";
import { SolanaServce } from "../services/solana.servce";
import { EventsRegistry } from "../config/events.config";
import { AppEvents } from "../core/event";
import { SolanaAccountNewSwapPayload } from "../types/appEvents";
import { Loop } from "../utils/loop";
import { NotificationService } from "../services/notification.service";
import { swapTemplate } from "../templates/swap.template";
import { applyDecimalsBigInt } from "../helpers/bigint";
import { statTemplate } from "../templates/stat.template";
import { SolanaNotificationEvent } from "../entities/solanaNotification.entity";

export class SolanaManager {
  private readonly logger = new Logger('SolanaManager');

  private readonly appEvents: AppEvents;
  private readonly solanaService: SolanaServce;
  private readonly notificationService: NotificationService;

  private readonly watchAccountsLoop: Loop;

  constructor(
    appEvents: AppEvents,
    solanaService: SolanaServce,
    notificationService: NotificationService
  ) {
    this.appEvents = appEvents;
    this.solanaService = solanaService;
    this.notificationService = notificationService;

    this.appEvents.on(EventsRegistry.SolanaAccountNewSwapEvent, (payload) => this.onAccountNewSwap(payload));

    this.watchAccountsLoop = new Loop(40000, () => this.watchAccountsHandler())

    this.logger.info('manager created');
  }

  watchAccounts() {
    this.watchAccountsLoop.run();
  }

  private async watchAccountsHandler() {
    const accounts = await this.solanaService.getAccountsToWatch();
    for (const { account } of accounts) {
      try {
        await this.solanaService.findAccountNewTxs(account);
      } catch (e) {
        this.logger.error('Fail findAccountNewTxs', account);
      }
    }
  }

  private async accountSwapsStat(accountAddress: string) {
    // Fetch token accounts owned by the account
    const tokens = await this.solanaService.getAccountTokens(accountAddress);
    const { txsIn, txsOut } = await this.solanaService.getAccountSolSwaps(accountAddress);

    // Calculate total incoming and outgoing SOL amounts
    const totalSolAmountIn = txsIn.reduce((total, tx) => total + BigInt(tx.amount_in), BigInt(0));
    const totalSolAmountOut = txsOut.reduce((total, tx) => total + BigInt(tx.amount_out), BigInt(0));
    const profit = applyDecimalsBigInt(totalSolAmountIn - totalSolAmountOut, 9);
    const message = await statTemplate(
      accountAddress,
      applyDecimalsBigInt(totalSolAmountIn.toString(), 9),
      applyDecimalsBigInt(totalSolAmountOut.toString(), 9),
      profit,
      tokens
    );
    const notifications = await this.solanaService.getNotifications(accountAddress, SolanaNotificationEvent.STAT);

    for (const { chat_id } of notifications) {
      await this.notificationService.sendMessage(chat_id, message);
    }
  }

  private async onAccountNewSwap({ account, mint }: SolanaAccountNewSwapPayload) {
    this.logger.info('new swap from', account);

    const { swaps, tokens} = await this.solanaService.getIndexedAccountTokenSwaps(account, mint);
    const message = await swapTemplate(account, mint, swaps, tokens);
    const notifications = await this.solanaService.getNotifications(account, SolanaNotificationEvent.SWAP);

    for (const { chat_id } of notifications) {
      await this.notificationService.sendMessage(chat_id, message);
    }
  }
}
