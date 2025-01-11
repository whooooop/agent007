import { Logger } from "../utils/logger";

export class SolanaServce {
  private readonly logger = new Logger('SolanaServce');

  constructor() {
    this.logger.info('created');
  }
}
