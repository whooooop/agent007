import { AgentAPI } from "./core/agentAPI";

const agentAPI = new AgentAPI({
  logLevels: ['info', 'warn', 'error', 'debug']
});

agentAPI.run()
