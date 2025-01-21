import { Workflow } from "../core/workflow";
import { AgentAPI } from "../core/agentAPI";
import { Logger } from "../utils/logger";
import { AppTelegramClient } from "../components/telegram/telegram.client";
import { TelegramEvent } from "../components/telegram/types/telegram.events";
import { TelegramService } from "../components/telegram/telegram.service";

interface telegramNewMessageWatcherProgramConfig {
  username: string,
  chatId: string,
  notificationChatId: string
}

interface telegramNewMessageWatcherProgramParams {

}

export class TelegramNewMessageWatcherProgram {
  constructor(api: AgentAPI) {}
  public start(params: telegramNewMessageWatcherProgramParams) {}

  private triggerNewMessage({ message, chat_id }: TelegramEvent.Message.Payload) {}
}

export function telegramNewMessageWatcherProgram (
  agentApi: AgentAPI,
  config: telegramNewMessageWatcherProgramConfig
) {
  this.agentApi.getTelegramService().watchUsernameMessages(
    this.config.username,
    this.config.chatId,
    async (data: TelegramEvent.Message.Payload) => {
      if (data.message.replyToMsgId) {
        await this.telegramClient.forwardMessage(this.config.notificationChatId, data.chat_id, data.message.replyToMsgId);
      }
      await this.telegramClient.forwardMessage(this.config.notificationChatId, data.chat_id, data.message.id);
    }
  );
}

export class WatchAccountTgMessagesWorkflowTemplate extends Workflow {
  declare agentApi: AgentAPI;

  private readonly logger = new Logger(WatchAccountTgMessagesWorkflowTemplate.name);
  private telegramClient: AppTelegramClient;
  private telegramService: TelegramService;
  private readonly config: WatchAccountTgMessagesWorkflowConfig;

  constructor(agentApi: AgentAPI, config: WatchAccountTgMessagesWorkflowConfig) {
    super(agentApi);
    this.config = config;
  }

  run() {
    console.log('run WatchAccountTgMessagesWorkflowTemplate')
    this.telegramClient = this.agentApi.getTelegramClient();
    this.telegramService = this.agentApi.getTelegramService();
  }

  async triggerNewMessage({ message, chat_id }: TelegramEvent.Message.Payload) {
    this.logger.info('new message');
    if (message.replyToMsgId) {
      await this.telegramClient.forwardMessage(this.config.notificationChatId, chat_id, message.replyToMsgId);
    }
    await this.telegramClient.forwardMessage(this.config.notificationChatId, chat_id, message.id);
  }
}
