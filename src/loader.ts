/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'

import debug from './debug.js'

/**
 * Read the contents of one or more dot-env files. Following is how the files
 * are read.
 *
 * - Load file from the "ENV_PATH" environment file.
 *    (Raise error if file is missing)
 *
 * - If "ENV_PATH" is not defined, then find ".env" file in the app root.
 *    (Ignore if file is missing)
 *
 * - Find ".env.[NODE_ENV]" file in the app root.
 *    (Ignore if file is missing)
 *
 * ```ts
 * const loader = new EnvLoader(new URL('./', import.meta.url))
 *
 * const { envContents, currentEnvContents } = await loader.load()
 *
 * // envContents: Contents of .env or file specified via ENV_PATH
 * // currentEnvContents: Contents of .env.[NODE_ENV] file
 * ```
 */
export class EnvLoader {
  #appRoot: string
  #loadExampleFile: boolean

  constructor(appRoot: string | URL, loadExampleFile: boolean = false) {
    this.#appRoot = typeof appRoot === 'string' ? appRoot : fileURLToPath(appRoot)
    this.#loadExampleFile = loadExampleFile
  }

  /**
   * Optionally read a file from the disk
   */
  async #loadFile(filePath: string | URL): Promise<{ fileExists: boolean; contents: string }> {
    try {
      const contents = await readFile(filePath, 'utf-8')
      return { contents, fileExists: true }
    } catch (error) {
      /* c8 ignore next 3 */
      if (error.code !== 'ENOENT') {
        throw error
      }

      return { contents: '', fileExists: false }
    }
  }

  /**
   * Load contents of the main dot-env file and the current
   * environment dot-env file
   */
  async load(): Promise<{ contents: string; path: string; fileExists: boolean }[]> {
    const ENV_PATH = process.env.ENV_PATH
    const NODE_ENV = process.env.NODE_ENV
    const envFiles: { path: string; contents: string; fileExists: boolean }[] = []

    if (debug.enabled) {
      debug('ENV_PATH variable is %s', ENV_PATH ? 'set' : 'not set')
      debug('NODE_ENV variable is %s', NODE_ENV ? 'set' : 'not set')
    }

    /**
     * Base path to load .env files from
     */
    const baseEnvPath = ENV_PATH
      ? isAbsolute(ENV_PATH)
        ? ENV_PATH
        : join(this.#appRoot, ENV_PATH)
      : this.#appRoot

    if (debug.enabled) {
      debug('dot-env files base path "%s"', baseEnvPath)
    }

    /**
     * 1st
     * The top most priority is given to the ".env.[NODE_ENV].local" file
     */
    if (NODE_ENV) {
      const nodeEnvLocalFile = join(baseEnvPath, `.env.${NODE_ENV}.local`)
      envFiles.push({
        path: nodeEnvLocalFile,
        ...(await this.#loadFile(nodeEnvLocalFile)),
      })
    }

    /**
     * 2nd
     * Next, we give priority to the ".env.local" file
     */
    if (!NODE_ENV || !['test', 'testing'].includes(NODE_ENV)) {
      const envLocalFile = join(baseEnvPath, '.env.local')
      envFiles.push({
        path: envLocalFile,
        ...(await this.#loadFile(envLocalFile)),
      })
    }

    /**
     * 3rd
     * Next, we give priority to the ".env.[NODE_ENV]" file
     */
    if (NODE_ENV) {
      const nodeEnvFile = join(baseEnvPath, `.env.${NODE_ENV}`)
      envFiles.push({
        path: nodeEnvFile,
        ...(await this.#loadFile(nodeEnvFile)),
      })
    }

    /**
     * Finally, we push the contents of the ".env" file.
     */
    const envFile = join(baseEnvPath, '.env')
    envFiles.push({
      path: envFile,
      ...(await this.#loadFile(envFile)),
    })

    /**
     * Load example file
     */
    if (this.#loadExampleFile) {
      const envExampleFile = join(baseEnvPath, '.env.example')
      envFiles.push({
        path: envExampleFile,
        ...(await this.#loadFile(envExampleFile)),
      })
    }

    return envFiles
  }
}
