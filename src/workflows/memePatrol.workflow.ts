import { Workflow } from "../core/workflow";
import { Logger } from "../utils/logger";
import { WatchSolanaAccountWorkflowTemplate } from "./templates/watchSolanaAccount.workflow";

export class MemePatrolWorkflow extends Workflow {
  static ENABLED = true;

  private readonly logger = new Logger(MemePatrolWorkflow.name);

  run() {
    this.logger.info('run');

    const notificationChatId = '-1002285086512';

    new WatchSolanaAccountWorkflowTemplate(this.agentApi, {
      accountAddress: 'D71bveoC24A3ka3bwpTQwr3JXRGr4aemfPJtqKy5ibpg',
      notificationChatId
    }).run();

    new WatchSolanaAccountWorkflowTemplate(this.agentApi, {
      accountAddress: '7vfqFxUqqch7998xkCRp6ASvg7vvTsAxtDFWFngMpoYp',
      notificationChatId
    }).run();
  }
}
