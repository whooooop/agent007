import { Logger } from "../utils/logger";

export class NotificationService {
  private readonly logger = new Logger('NotificationService');

  constructor() {
    this.logger.info('created');
  }
}
