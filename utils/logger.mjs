import chalk from 'chalk'

export class Logger {
    constructor(context) {
        this.context = context;
    }

    log () {
        const currentDate = new Date();
        const formattedTime = currentDate.toLocaleTimeString();
        const args = [chalk.gray(formattedTime), chalk.blue('[LOG]'), chalk.yellow(this.context), ...arguments]
        console.log.apply(console, args)
    }

    error () {
        const currentDate = new Date();
        const formattedTime = currentDate.toLocaleTimeString();
        const args = [chalk.gray(formattedTime), chalk.red('[ERROR]'), chalk.yellow(this.context), ...arguments]
        console.error.apply(console, args)
    }
}
