import { AppDataSource } from './database.mjs'
import { Solana } from './solana/index.mjs'
import { Telegram } from './telegram/index.mjs'

export class App {
    instances = new Map();

    async initialize () {
        this.datasource = await AppDataSource.initialize();
        this.telegram = await this.inject(Telegram);
        this.solana = await this.inject(Solana);
    }

    async inject (instanceClass) {
        if (!this.instances.has(instanceClass)) {
            const instance = new instanceClass(this);
            this.instances.set(instanceClass, instance);
            if (typeof instance.initialize === 'function') {
                await instance.initialize(this);
            }
        }
        return this.instances.get(instanceClass);
    }

    async start () {
        // this.solana.addAccountToWatch('GEaqTiqvU5xwbVjVmrG7BEzztCAkHRr8bWeZo9tZWQ2Z', '-1002376488914')
        this.solana.watch();
        this.telegram.watch();
    }

    async test () {
        this.solana.test();
    }

    async install(){
        await this.telegram.install();
    }
}
