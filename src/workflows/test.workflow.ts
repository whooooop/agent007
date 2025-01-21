import { Workflow } from "../core/workflow";
import { Logger } from "../utils/logger";

export class TestWorkflow extends Workflow {
  static ENABLED = false;

  private readonly logger = new Logger(TestWorkflow.name);

  async run() {
    this.logger.info('run');

    // const r = await this.agentApi.solanaWallet.swapBySol('4T54PGF4gAU75NL9j2GHvrVbR6u5zjyJE4zGuJbkpump', 0.001);
    // if (r.isSuccess()) {
    //   console.log(`https://solscan.io/tx/${r.getValue()}`);
    // }
    // const result = await this.agentApi.getSolanaServce().getRawParsedTransaction('');
    // console.log(JSON.stringify(result));

    const explore = [
      {
        mint: '8X7emJy8CV5pK7UjyBKCywdfc4MTKShpUddqrqyepump',
        signature: '3RUrdkV3XXg3ZjnGprHytHRq6iuCaWBHeypokYdtVf4m62JXSQ8HFLvp7KH3mykmQkAMuQ6b2FNfTnbfzduEugxn'
      },
      {
        mint: '8TzfHZa6ZnvvGsQfnFC5wGrCiqbN9nD2KMjyabfrpump',
        signature: '3qAhr6LbkpK2EYvDyuJiUUBrM7M2vQc3dMrSih3AgfAkqmf1q5rnKpzF89oiakeFwp1sdcWxFkeevfUCmeHdSz81'
      },
      {
        mint: '8TzfHZa6ZnvvGsQfnFC5wGrCiqbN9nD2KMjyabfrpump',
        signature: '3qAhr6LbkpK2EYvDyuJiUUBrM7M2vQc3dMrSih3AgfAkqmf1q5rnKpzF89oiakeFwp1sdcWxFkeevfUCmeHdSz81'
      },
      {
        mint: '8X7emJy8CV5pK7UjyBKCywdfc4MTKShpUddqrqyepump',
        signature: '2h6XCY9Pg4cvzfPLNr6Phef8zg5MaaGCyfnpGDnLqpjr5QQiyHh7TxyPaxf65iEB8a664phULL7HeGPawmkn4Fyt'
      },
      {
        mint: '79x6wWmM3xrgvGs3xaRnpxaXekuU7sYz8wVXnv9zpump',
        signature: '3d7JmLXRu68nYnPhyiABsrdyDwir4DGiWFCRGeYyjST19sEZC78nfE7zxFKiWNTuawRxuRGE9GoeJaizn67syFjq'
      },
      {
        mint: 'GnQPgvNa6QThTJZFhVQzznA6MLQCVNJyihW4UMHrP3XB',
        signature: '4HRXRj1DUqEUQBBHxygQGrMwvhmoedybcBLFjhyq4TKE2DxdXqi7YqtNx5bPrpxAfBRmLj7h7nQ8kgkZfPHczEjU'
      },
      {
        mint: '8LRpgKZU7e1ckqo6qFMCVmhHNRUAAwu1Nfkc37StXCRs',
        signature: '3Y5J6AEVasaDBi53PcENK3J1iSQiwwnv1x4EZH7GnSCQjSFCndjnDacKFLeDjQGdT7xbRji2Vigq19MZ9SSheujE'
      },
      {
        mint: '2Hpd5tfRdF71sERDoSKtjGGti9nPiCNEBi7Q2f1ypump',
        signature: '2u24xa9coCxsqtDU4u8cPig3pnD2RzzQsxQTujMbJJBbDfU5NBvyFFbpPTWawTGnJEMc74dH8zaa2o9uy7qfNs4g'
      },
      {
        mint: '4T54PGF4gAU75NL9j2GHvrVbR6u5zjyJE4zGuJbkpump',
        signature: 'JcWGkaa7pDQAw5xL4oVmEfCuPLt2KvJLpVVorKreUxm5CpssH1xWuCgPHYteS4aauBFFVYoyqhBfvsUtv2y6pyS'
      },
    ];
    // const result = [];
    // for (const { mint, signature } of explore) {
    //   const { signers } = await agentAPI.getSolanaServce().getInfoAroundSwap(mint, {
    //     before: signature,
    //     limit: 15
    //   });
    //   for (const { signer, swapInfo, signature } of signers) {
    //     if (!result[signer]) {
    //       result[signer] = {
    //         count: 0,
    //         items: []
    //       };
    //     }
    //     result[signer].count++;
    //     result[signer].items.push({ signer, swapInfo, signature });
    //     console.log(signer, result[signer]);
    //   }
    // }
    // result.sort((a, b) => b.count - a.count);
    // console.dir(result, { depth: Infinity, colors: true });
  }
}
