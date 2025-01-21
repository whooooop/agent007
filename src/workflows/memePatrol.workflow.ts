/**
 *  Solana meme patrol
 *  https://t.me/solanamemepatrol
 */

import { Workflow } from "../core/workflow";
import { Logger } from "../utils/logger";
import { WatchSolanaAccountWorkflowTemplate } from "./templates/watchSolanaAccount.workflow";

export class MemePatrolWorkflow extends Workflow {
  static ENABLED = true;

  private readonly logger = new Logger(MemePatrolWorkflow.name);

  run() {
    this.logger.info('run');

    const notificationChatId = '-1002285086512';
    const addresses = new Set([
      ['D71bveoC24A3ka3bwpTQwr3JXRGr4aemfPJtqKy5ibpg', ''],
      ['7vfqFxUqqch7998xkCRp6ASvg7vvTsAxtDFWFngMpoYp', ''],
      ['2KstmkBTYnQZC66rUhLTVyPwGdgCg1RYX3rW3LpgLnDc', '⭐'],
      ['BjT63eJ1aVXqgAcA4wYqV8hebx4QGfmv173cgeF8KecQ', ''],
      ['9UzitKojaJ7U6s5cLQgm2THQVxjNp7RPMGsYKeeBnJJQ', ''],
      ['DgeEbab7XXWLnS23JBiY5dNkamtjY5wAixyx6V2su8tf', '⭐'],
      ['CY7aMSidzhCJC3qh1DC3f4MT9szPtKNSmxTW5kJeVvcA', '⭐'],
      ['9NKQ8Et4SKKemi24zB91gcB2ijXv1X4sGTJYzgwFBSTu', ''],
      ['8G2Wv7g4pyW77sXUMxwQc1PezwYSK47YyAzbXdj37iKV', ''],
      ['23H6NLtDx5YgYiT9eEp46Xfd8QCCbcnEWuTxztggfvFe', ''],
      ['3mBC4w9AdE9RmJMuD96hYfcxW1jGiaZjPVcLqZANT73q', ''],
      ['3Lv6Z8g7pdZSV4cjnJshp2HQUMAFnE3dBPZXi5L9fFUv', ''],
      ['HNHtW63MfU9FhUcL1nywET6PYZyE9k3rHzkVRVY69TF5', ''],
      ['HF7hpjyVKZyVqRDogv2cGkTRjni4p1mYy26DuuubByNc', ''],
      ['66oZU6Yh7WtQp2HQ76VmYakmYanasjLpyKv3TK3Sg9Vj', ''],
      ['HnEtjAzKNKkfYFwaoFMyzvWuEhAWtnNzFG1YT9GsKSRz', ''],
      ['J67hWH8nF5wp9rM1pW8AaYm3vamgpLXeBneYT46dyDBL', ''],
      ['AvQ1vgGfeJRU896QjvVM3vp3tQJK7dkP6hERe6taeQxR', ''],
      ['2tSCzYcz1aV4s6SxgEaDQTFt7ELSDLzbn3VLEG3ospJX', ''],
      ['Ceod9MpGUYHBFv8HhDXzrhAh7w6M37jYXixeiRm8WCzR', ''],
      ['CeoGoucJbwjno6KC1BiX4efKGqQyBjRzqgyhLYwJfgfr', ''],
      ['8WiUx5AhwaSmDtjQHzTLo8G3m5PnNDFQSjWC7558zng9', ''],
      ['MarsfR4ScvDwu4XMybf3kJ3hMHjAcg8iPxWqerq3bAY', ''],
      ['CeoexdLDkYm7YnSSNUBbr9jdW2rwk583UgLzb8ScWAzP', ''],
    ]);

    for (const [accountAddress, stars] of addresses) {
      new WatchSolanaAccountWorkflowTemplate(this.agentApi, {
        accountAddress,
        name: stars,
        notificationChatId,
        templateShowTraders: true,
        notificationGemScoreOver: 1
      }).run();
    }
  }
}
