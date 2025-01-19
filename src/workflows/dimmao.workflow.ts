import { Workflow } from "../core/workflow";
import { Logger } from "../utils/logger";
import { WatchSolanaAccountWorkflowTemplate } from "./templates/watchSolanaAccount.workflow";
import { WatchAccountTgMessagesWorkflowTemplate } from "./templates/watchAccountTgMessages.workflow";

export class DimmaoWorkflow extends Workflow {
  static ENABLED = true;
  private readonly logger = new Logger(DimmaoWorkflow.name);

  run() {
    this.logger.info('run');

    new WatchSolanaAccountWorkflowTemplate(this.agentApi, {
      accountAddress: 'GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z',
      notificationChatId: '-1002376488914'
    }).run();

    new WatchAccountTgMessagesWorkflowTemplate(this.agentApi, {
      username: 'dimmao',
      chatId: '-1001369370434',
      notificationChatId: '-1002376488914'
    }).run();
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
