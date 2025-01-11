import { AgentAPI } from "./core/agentAPI";

(async () => {
  const agentAPI = await AgentAPI.bootstrap({
    logLevels: ['info', 'warn', 'error', 'debug']
  });

  agentAPI.getSolanaManager().watchAccounts()
})()
