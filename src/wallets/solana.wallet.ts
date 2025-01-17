import { Logger } from "../utils/logger";
import { Cluster, Connection, Keypair, PublicKey, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { createJupiterApiClient, DefaultApi, QuoteResponse, SwapMode } from '@jup-ag/api';
import { Result } from "../utils/result";
import bs58 from 'bs58';
import { solAddress } from "../helpers/token";
const privateKeys = new Map<string, string>();

export interface SolanaWalletConfig {
  endpointUrl: string // https://api.mainnet-beta.solana.com
  cluster: Cluster
  privateKey: string
}

export class SolanaWallet {
  private readonly logger = new Logger(SolanaWallet.name);
  private readonly id: string;
  private readonly endpointUrl: string;
  private readonly cluster: Cluster;
  private connection: Connection;
  private jupiterApi: DefaultApi;

  constructor(config: SolanaWalletConfig) {
    this.id =  Math.random().toString(36).substr(2, 9);
    this.endpointUrl = config.endpointUrl;
    this.cluster = config.cluster;
    privateKeys.set(this.id, config.privateKey);
    this.logger.info('solana wallet created');
  }

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      this.connection = new Connection(this.endpointUrl, 'confirmed');
    }

    return this.connection;
  }

  private async getJupiterApiClient(): Promise<DefaultApi>{
    if (!this.jupiterApi) {
      this.jupiterApi = createJupiterApiClient();
    }
    return this.jupiterApi;
  }

  public solAmount(amount: number) {
    return amount * 10 ** 9;
  }

  private async quoteGet(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5%
  ): Promise<Result<QuoteResponse, Error>> {
    try {
      const jupiterApi = await this.getJupiterApiClient();
      this.logger.verbose('quoteGet', { inputMint, outputMint, amount });

      const quote = await jupiterApi.quoteGet({
        inputMint,
        outputMint,
        amount,
        // slippageBps,
        asLegacyTransaction: false,
        maxAccounts: 64,
        // minimizeSlippage: true,
        // swapMode: SwapMode.ExactIn,
        onlyDirectRoutes: true
      });
      return Result.success(quote);
    } catch (e) {
      this.logger.error(e.response.statusText);
      return Result.failure(e);
    }
  }

  public swapBySol(outputMint: string, amountSol: number, slippage?: number) {
    return this.swap(
      solAddress,
      outputMint,
      this.solAmount(amountSol),
      slippage
    );
  }

  public async swap(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippage: number = 100 // 1%
  ): Promise<Result<TransactionSignature, Error>> {
    const privateKey = privateKeys.get(this.id);
    const secretKey = bs58.decode(privateKey);
    const keypair = Keypair.fromSecretKey(secretKey);
    const jupiterApi = await this.getJupiterApiClient();
    const quoteResult = await this.quoteGet(inputMint, outputMint, amount, slippage);

    if (quoteResult.isFailure()) {
      return quoteResult;
    }
    const quoteResponse = quoteResult.getValue();
    this.logger.debug('quote', quoteResult);

    const response = await jupiterApi.swapPost({
      swapRequest: {
        userPublicKey: keypair.publicKey.toBase58(),
        quoteResponse,
        wrapAndUnwrapSol: true
      },
    });

    const swapTransactionBuf = Buffer.from(response.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([keypair]);

    const connection = await this.getConnection();
    const txid = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: false,
      maxRetries: 10
    });

    return Result.success(txid);
  }
}
