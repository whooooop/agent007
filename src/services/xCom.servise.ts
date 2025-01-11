import { Logger } from "../utils/logger";

export class XComServise {
  private readonly logger = new Logger('XComServise');

  constructor() {
    this.logger.info('created');
  }
}
