import { SolanaTokenMetadataEntity } from './entities/token-metadata.entity.mjs'
import { SolanaAccountTokenSwapEntity } from './entities/account-token-swap.entity.mjs'
import { SolanaAccountSwapInfoEntity } from './entities/account-swap-info.entity.mjs'

export class SolanaRepository {
    constructor(app) {
        this.tokenMetadataRepository = app.datasource.getRepository(SolanaTokenMetadataEntity.options.name);
        this.accountTokenSwapRepository = app.datasource.getRepository(SolanaAccountTokenSwapEntity.options.name);
        this.accountSwapInfoRepository = app.datasource.getRepository(SolanaAccountSwapInfoEntity.options.name);
    }

    async getAccountTxsInfo(accountAddress) {
        const accountTxsInfo = await this.accountSwapInfoRepository
            .createQueryBuilder('info')
            .select([
                'info.account',
                'info.signature_to',
                'info.signature_from',
                'info.signature_first'
            ])
            .where('info.account = :account', { account: accountAddress })
            .limit(1)
            .getOne()
        if (!accountTxsInfo) {
            return {
                account: accountAddress,
                signature_to: null,
                signature_from: null,
                signature_first: null
            }
        } else {
            return accountTxsInfo;
        }
    }

    async setAccountSwapInfo(accountAddress, data) {
        return this.accountSwapInfoRepository.save({
            account: accountAddress,
            ...data
        })
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
            .where('swap.account = :account', { account: walletAddress })
            .andWhere('(swap.token_in = :token OR swap.token_out = :token)', { token: tokenAddress })
            .orderBy('swap.block_time', 'DESC').getMany();
    }

    async setAccountTokenSwap (signature, data) {
        return this.accountTokenSwapRepository.save({
            signature,
            ...data
        })
    }

    async getTokensMetadata(tokens) {
        return this.tokenMetadataRepository
            .createQueryBuilder('token')
            .select('token.*')
            .where('token.address IN (:...tokens)', { tokens })
            .getRawMany()
    }

    async setTokenMetadata(address, data) {
        return this.tokenMetadataRepository.save({
            address,
            ...data
        });
    }
}
