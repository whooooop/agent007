import { Logger } from "../utils/logger";
import { SolanaClient } from "../clients/solana.client";
import { getAnotherTokenFromSwap, getTokenAccountAddress, solAddress } from "../helpers/token";
import { SolanaRepository } from "../repositories/solana.repository";
import chalk from "chalk";
import { GetProgramAccountsResponse, ParsedTransactionWithMeta } from "@solana/web3.js";
import { absBigInt } from "../helpers/bigint";
import { SolanaSwapInfo } from "../types/solanaSwapInfo";
import { SolanaTokenMetadataEntity } from "../entities/solanaTokenMetadata.entity";
import { SolanaAccountTokenSwapEntity } from "../entities/solanaAccountTokenSwap.entity";
import { AppEvents } from "../core/event";
import { EventsRegistry } from "../config/events.config";
import { SolanaAccountWatchEntity } from "../entities/solanaAccountWatch.entity";
import { SolanaNotificationEntity, SolanaNotificationEvent } from "../entities/solanaNotification.entity";

export class SolanaServce {
  private readonly logger = new Logger('SolanaServce');

  private readonly appEvents: AppEvents;
  private readonly solanaClient: SolanaClient;
  private readonly solanaRepository: SolanaRepository;

  constructor(
    appEvents: AppEvents,
    solanaRepository: SolanaRepository,
    solanaClient: SolanaClient
  ) {
    this.appEvents = appEvents;
    this.solanaRepository = solanaRepository;
    this.solanaClient = solanaClient;

    this.logger.info('service created');
  }

  async getAccountsToWatch(): Promise<SolanaAccountWatchEntity[]> {
    return this.solanaRepository.getAccountsToWatch();
  }

  async addAccountToWatch(account: string, notification_chat_id: string): Promise<SolanaAccountWatchEntity> {
    const accountInfo = await this.solanaRepository.getAccountWatchInfo(account);
    if (accountInfo) {
      return accountInfo;
    }

    const signatures = await this.solanaClient.getSignaturesForAddress(account, { limit: 1 });
    const lastSignature = signatures[0]?.signature;
    return this.solanaRepository.addAccountToWatch(account, lastSignature);
  }

  async addNotification(account: string, chat_id: string, event: SolanaNotificationEvent): Promise<void> {
    const accountInfo = await this.solanaRepository.getAccountWatchInfo(account);
    if (!accountInfo) {
      this.logger.error('account is not tracked', account);
    }

    await this.solanaRepository.addNotification(accountInfo.account, chat_id, event);
  }

  getNotifications(account: string, event: SolanaNotificationEvent): Promise<SolanaNotificationEntity[]>{
    return this.solanaRepository.getNotificationsByAccount(account, event);
  }

  async indexAccountToken(accountAddress: string, mintAddress: string) {
    const accountTokenAddress = await getTokenAccountAddress(accountAddress, mintAddress);
    const txs = await this.solanaClient.getSignaturesForAddress(accountTokenAddress, { limit: 500 });
    const signatures: string[] = txs.map(({ signature }) => signature);
    const indexedSignatures = await this.solanaRepository.getAccountTokenSwapsBySignatures(signatures);
    const indexedSignaturesMap = new Set(indexedSignatures.map(({signature}) => signature));

    for (const signature of signatures) {
      if (!indexedSignaturesMap.has(signature)) {
        await this.indexTx(signature);
      }
    }
  }

  async indexTx(signature: string): Promise<{ signature: string, swapInfo: SolanaSwapInfo | null }> {
    const transaction = await this.solanaClient.getParsedTransaction(signature);
    const signer = this.getTxSigner(transaction);
    const swapInfo = this.getSwapInfo(transaction);

    if (swapInfo) {
      this.logger.info(
        'add swap:',
        `${chalk.green(`+${swapInfo.tokenIn.amount} ${ this.returnSymbolIfSol(swapInfo.tokenIn.mint) }`)}`,
        `${chalk.red(`-${swapInfo.tokenOut.amount} ${ this.returnSymbolIfSol(swapInfo.tokenOut.mint) }`)}`
      );

      await this.solanaRepository.setAccountTokenSwap(signature, {
        account: signer,
        token_out: swapInfo.tokenOut.mint,
        token_in: swapInfo.tokenIn.mint,
        amount_out: swapInfo.tokenOut.amount,
        amount_in: swapInfo.tokenIn.amount,
        block_time: transaction.blockTime
      });
    }

    return { signature, swapInfo }
  }

  async indexToken(mintAddress: string): Promise<SolanaTokenMetadataEntity | null> {
    const tokenMetadata = await this.solanaClient.getTokensMetadata(mintAddress);
    if (tokenMetadata) {
      await this.solanaRepository.setTokenMetadata(mintAddress, tokenMetadata);
      return tokenMetadata;
    } else {
      return null;
    }
  }

  async getAccountTokens(accountAddress: string): Promise<GetProgramAccountsResponse> {
    return this.solanaClient.getTokenAccountsByOwner(accountAddress);
  }

  async findAccountNewTxs(accountAddress: string) {
    const { last_signature } = await this.solanaRepository.getAccountWatchInfo(accountAddress);
    const signatures = await this.solanaClient.getSignaturesForAddress(accountAddress, { limit: 1000, until: last_signature });

    for (const {signature} of signatures.reverse()) {
      const txInfo = await this.indexTx(signature);
      await this.solanaRepository.updateLastSignatureForAccountToWatch(accountAddress, signature);

      await this.appEvents.emit(EventsRegistry.SolanaAccountNewTxEvent, { signature });

      if (txInfo.swapInfo) {
        const mintSwap = getAnotherTokenFromSwap(txInfo.swapInfo);
        await this.indexAccountToken(accountAddress, mintSwap);

        await this.appEvents.emit(EventsRegistry.SolanaAccountNewSwapEvent, {
          signature,
          account: accountAddress,
          mint: mintSwap
        });
      }
    }
  }

  /**
   * Sends a statistical summary of token swaps for a given account to a specified chat.
   * @param accountAddress - The Solana wallet address to generate statistics for.
   * @returns A Promise that resolves when the message is sent.
   */
  async getAccountSolSwaps(accountAddress: string): Promise<{ txsIn: SolanaAccountTokenSwapEntity[], txsOut: SolanaAccountTokenSwapEntity[] }> {
    // Fetch incoming and outgoing SOL swaps for the given account
    const txsIn = await this.solanaRepository.getAllSwapsToken(accountAddress, solAddress, 'in');
    const txsOut = await this.solanaRepository.getAllSwapsToken(accountAddress, solAddress, 'out');
    return { txsIn, txsOut }
  }

  /**
   * Fetches token swap details and associated token metadata for a given wallet and token address.
   * @param walletAddress - The wallet address to query swaps for.
   * @param tokenAddress - The token address to filter swaps by.
   * @returns An object containing swaps and token metadata.
   */
  async getIndexedAccountTokenSwaps(walletAddress: string, tokenAddress: string): Promise<{ swaps: SolanaAccountTokenSwapEntity[]; tokens: Record<string, SolanaTokenMetadataEntity> }> {
    // Fetch token swap details from the repository
    const swaps = await this.solanaRepository.getAccountTokenSwaps(walletAddress, tokenAddress);

    // Extract unique token addresses from the swaps
    const tokensAddress = Array.from(new Set(swaps.flatMap(swap => [swap.token_in, swap.token_out])));

    // Fetch token metadata for the extracted token addresses
    const tokens = await this.getTokensMetadata(tokensAddress);

    return { swaps, tokens };
  }

  /**
   * Fetches token metadata from the repository or from the Solana network if not already cached.
   * @param addresses - Array of token mint addresses to fetch metadata for.
   * @returns A map of token metadata indexed by token address.
   */
  async getTokensMetadata(addresses: string[]): Promise<Record<string, SolanaTokenMetadataEntity>> {
    // Retrieve cached token metadata from the repository
    const tokensMetadata = await this.solanaRepository.getTokensMetadata(addresses);
    const tokens: Record<string, SolanaTokenMetadataEntity> = tokensMetadata.reduce((result, item) => {
      result[item.address] = item;
      return result;
    }, {});

    // Identify tokens that need to be fetched from the Solana network
    const fetchedTokenAddresses = new Set(Object.keys(tokens));
    const tokensForFetch = addresses.filter((tokenAddress) => !fetchedTokenAddresses.has(tokenAddress));

    // Fetch metadata for tokens that are not already cached
    for (const tokenAddress of tokensForFetch) {
      const tokenMetadata = await this.indexToken(tokenAddress);
      if (tokenMetadata) {
        tokens[tokenAddress] = tokenMetadata;
      }
    }

    return tokens;
  }

  private getTxSigner(transaction: ParsedTransactionWithMeta): string {
    return transaction.transaction.message.accountKeys.find(({signer}) => signer).pubkey.toString();
  }

  private getSwapInfo(transaction: ParsedTransactionWithMeta): SolanaSwapInfo | null {
    const signer = this.getTxSigner(transaction);

    if (!signer) return null;

    const preBalances = transaction.meta?.preTokenBalances || [];
    const postBalances = transaction.meta?.postTokenBalances || [];

    const balancesMap: Record<number, any> = {};
    const signerBalances: any[] = [];
    const otherSideBalances: any[] = [];
    let tokenIn: { mint: string; amount: string } = { mint: '', amount: '0' };
    let tokenOut: { mint: string; amount: string } = { mint: '', amount: '0' };

    // Create balance map from pre and post token balances
    for (const balance of preBalances) {
      balancesMap[balance.accountIndex] = {
        mint: balance.mint,
        owner: balance.owner,
        preAmount: BigInt(balance.uiTokenAmount.amount || '0'),
        postAmount: BigInt(0),
      };
    }

    for (const balance of postBalances) {
      if (balancesMap[balance.accountIndex]) {
        balancesMap[balance.accountIndex].postAmount = BigInt(balance.uiTokenAmount.amount || '0');
      } else {
        balancesMap[balance.accountIndex] = {
          mint: balance.mint,
          owner: balance.owner,
          preAmount: BigInt(0),
          postAmount: BigInt(balance.uiTokenAmount.amount || '0'),
        };
      }
    }

    // Calculate balance changes
    for (const accountIndex in balancesMap) {
      const balance = balancesMap[accountIndex];
      balance.change = balance.postAmount - balance.preAmount;
      balance.signer = balance.owner === signer;

      if (balance.signer) {
        signerBalances.push(balance);
      } else {
        otherSideBalances.push(balance);
      }
    }

    // Calculate token changes
    const signerChangesByToken = signerBalances.reduce((result: Record<string, bigint>, balance) => {
      result[balance.mint] = (result[balance.mint] || 0n) + balance.change;
      return result;
    }, {});

    const otherSideChangesByToken = otherSideBalances.reduce((result: Record<string, bigint>, balance) => {
      result[balance.mint] = (result[balance.mint] || 0n) + balance.change;
      return result;
    }, {});

    this.logger.debug('signerChangesByToken', signerChangesByToken);
    this.logger.debug('otherSideChangesByToken', otherSideChangesByToken);

    const signerSwapTokens = Object.keys(signerChangesByToken);
    const otherSideSwapTokens = Object.keys(otherSideChangesByToken).filter((mint) => otherSideChangesByToken[mint] !== 0n);

    if (signerSwapTokens.length === 1 && otherSideSwapTokens.length === 2) {
      const swapTokenMint = signerSwapTokens[0];
      const signerSwapToken = {
        mint: swapTokenMint,
        amount: signerChangesByToken[swapTokenMint].toString(),
      };

      const otherSideSwapTokenMint = otherSideSwapTokens.find((mint) => mint !== swapTokenMint);
      if (!otherSideSwapTokenMint) return null;

      const otherSideSwapToken = {
        mint: otherSideSwapTokenMint,
        amount: otherSideChangesByToken[otherSideSwapTokenMint].toString(),
      };

      if (signerChangesByToken[swapTokenMint] > 0n) {
        tokenIn = signerSwapToken;
        tokenOut = otherSideSwapToken;
      } else {
        tokenIn = otherSideSwapToken;
        tokenOut = signerSwapToken;
      }

      return {
        tokenIn: {
          mint: tokenIn.mint,
          amount: absBigInt(BigInt(tokenIn.amount)).toString(),
        },
        tokenOut: {
          mint: tokenOut.mint,
          amount: absBigInt(BigInt(tokenOut.amount)).toString(),
        },
      };
    }

    return null;
  }

  private returnSymbolIfSol(mintAddress: string) {
    return mintAddress === solAddress ? 'SOL' : mintAddress;
  }
}
