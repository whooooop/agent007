import { AgentAPI } from "./core/agentAPI";
import 'dotenv/config'
import { DimmaoWorkflow } from "./workflows/dimmao.workflow";
import { WorkflowConstructor } from "./core/workflow";

(async () => {
  const workflow = process.argv.slice(2)[0] || 'all';

  console.log('args', workflow)
  const agentAPI = await AgentAPI.bootstrap({
    solanaClient: {
      endpoint: process.env.SOLANA_CLIENT_ENDPOINT,
      stackTimeout: +process.env.SOLANA_CLIENT_STACK_TIMEOUT
    },
    logger: {
      levels: ['info', 'warn', 'error', 'debug'],
    },
    telegram: {
      apiId: +process.env.TELEGRAM_CLIENT_API_ID,
      apiHash: process.env.TELEGRAM_CLIENT_API_HASH,
      session: process.env.TELEGRAM_CLIENT_SESSION,
      logChatId: process.env.TELEGRAM_CLIENT_LOG_CHAT_ID,
    },

    wallets: {
      solana: {
        endpointUrl: 'https://api.mainnet-beta.solana.com',
        cluster: 'mainnet-beta',
        privateKey: process.env.SOLANA_PRIVATE_KEY
      }
    },

  });

  const workflows: Array<WorkflowConstructor> = [
    DimmaoWorkflow
  ];

  workflows.filter(workflowClass => workflow === 'all' ? workflowClass.ENABLED : workflowClass.name === workflow).forEach((workflowClass) => {
    const instance = new workflowClass(agentAPI);
    instance.run();
  });
})()
