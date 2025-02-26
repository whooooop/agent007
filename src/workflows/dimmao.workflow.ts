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
      notificationChatId: '-1002376488914',
      templateShowTraders: false
    }).run();

    new WatchAccountTgMessagesWorkflowTemplate(this.agentApi, {
      username: 'dimmao',
      chatId: '-1001369370434',
      notificationChatId: '-1002376488914'
    }).run();
  }
}
