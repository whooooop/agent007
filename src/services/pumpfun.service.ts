import { Logger } from "../utils/logger";

export class PumpfunService {
  private readonly logger = new Logger('PumpfunService');

  constructor() {
    this.logger.info('service created');
  }
}
