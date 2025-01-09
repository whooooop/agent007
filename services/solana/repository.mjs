import { SolanaTokenMetadataEntity } from './entities/token-metadata.entity.mjs'
import { SolanaAccountTokenSwapEntity } from './entities/account-token-swap.entity.mjs'
import { SolanaAccountWatchEntity } from './entities/account-watch.entity.mjs'
import { Logger } from '../../utils/logger.mjs'
import { Database } from '../../database.mjs'

const logger = new Logger('solana/repository')

export class SolanaRepository {
  async initialize(app) {
    const database = await app.inject(Database)

    this.tokenMetadataRepository = database.datasource.getRepository(SolanaTokenMetadataEntity.options.name)
    this.accountTokenSwapRepository = database.datasource.getRepository(SolanaAccountTokenSwapEntity.options.name)
    this.accountWatchRepository = database.datasource.getRepository(SolanaAccountWatchEntity.options.name)
  }

  async addAccountToWatch(accountAddress, lastSignature, chatId = null) {
    logger.log('add account to watch', accountAddress, lastSignature)
    return this.accountWatchRepository.save({
      account: accountAddress,
      active: true,
      last_signature: lastSignature,
      chat_id: chatId
    })
  }

  async updateLastSignatureForAccountToWatch(accountAddress, lastSignature) {
    return this.accountWatchRepository.save({
      account: accountAddress,
      last_signature: lastSignature
    })
  }

  async getAccountsToWatch() {
    return this.accountWatchRepository.find()
  }

  async getAccountTokenSwaps(walletAddress, tokenAddress) {
    return this.accountTokenSwapRepository
      .createQueryBuilder('swap')
      .select([
        'swap.signature',
        'swap.account',
        'swap.token_in',
        'swap.token_out',
        'swap.amount_in',
        'swap.amount_out',
        'swap.block_time'
      ])
      .where('swap.account = :account', {account: walletAddress})
      .andWhere('(swap.token_in = :token OR swap.token_out = :token)', {token: tokenAddress})
      .orderBy('swap.block_time', 'DESC').getMany()
  }

  async setAccountTokenSwap(signature, data) {
    return this.accountTokenSwapRepository.save({
      signature,
      ...data
    })
  }

  async getAccountTokenSwapsBySignatures(signatures) {
    return this.accountTokenSwapRepository
      .createQueryBuilder('swap')
      .select('swap.*')
      .where('swap.signature IN (:...signatures)', {signatures})
      .getRawMany()
  }

  async getTokensMetadata(tokens) {
    return this.tokenMetadataRepository
      .createQueryBuilder('token')
      .select('token.*')
      .where('token.address IN (:...tokens)', {tokens})
      .getRawMany()
  }

  async setTokenMetadata(address, data) {
    return this.tokenMetadataRepository.save({
      address,
      ...data
    })
  }
}
