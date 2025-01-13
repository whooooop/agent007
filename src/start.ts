import { AgentAPI } from "./core/agentAPI";
import 'dotenv/config'
import { SolanaNotificationEvent } from "./entities/solanaNotification.entity";

(async () => {
  const args = process.argv.slice(2);
  const agentAPI = await AgentAPI.bootstrap({
    logger: {
      levels: ['info', 'warn', 'error', 'debug'],
    },
    telegram: {
      apiId: +process.env.TELEGRAM_CLIENT_API_ID,
      apiHash: process.env.TELEGRAM_CLIENT_API_HASH,
      session: process.env.TELEGRAM_CLIENT_SESSION,
      logChatId: process.env.TELEGRAM_CLIENT_LOG_CHAT_ID,
    },
    // x: {
    //   apiKey: process.env.X_API_KEY,
    //   apiSecretKey: process.env.X_API_SECRET_KEY,
    //   bearerToken: process.env.X_BEARER_TOKEN,
    //   accessToken: process.env.X_ACCESS_TOKEN,
    //   accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
    // }
  });


  agentAPI.watch();
})()
