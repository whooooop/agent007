import { resolve, dirname } from 'path'
import { writeFile, readFile, mkdir, rm } from 'fs/promises'
import { Logger } from './logger.mjs'

export class Storage {
  rootDir = 'storage'

  constructor(space = 'temp', options = {debug: true}) {
    this.space = space
    this.debug = options.debug
    this.logger = new Logger(`Cache ${ space }`)
  }

  async write(id, data) {
    const name = id + '.json'
    const dir = this._getDir()
    const path = resolve(dir, name)
    await mkdir(dir, {recursive: true})

    this.logger.debug('write', path)
    await writeFile(path, JSON.stringify(data))
  }

  async read(id, defaultValue) {
    try {
      const name = id + '.json'
      const dir = this._getDir()
      const path = resolve(dir, name)
      this.logger.debug('read', path)

      const data = await readFile(path, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      if (defaultValue) {
        return defaultValue
      } else {
        throw new Error(e)
      }
    }
  }

  async remove(id) {
    try {
      const name = id + '.json'
      const dir = this._getDir()
      const path = resolve(dir, name)
      this.logger.debug('remove', path)
      await rm(path)
    } catch (e) {
    }
  }

  _getDir() {
    return resolve(process.cwd(), this.rootDir, this.space)
  }
}
