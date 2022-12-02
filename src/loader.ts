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

  constructor(appRoot: string | URL) {
    this.#appRoot = typeof appRoot === 'string' ? appRoot : fileURLToPath(appRoot)
  }

  /**
   * Optionally read a file from the disk
   */
  async #loadFile(filePath: string | URL): Promise<string> {
    try {
      return await readFile(filePath, 'utf-8')
    } catch (error) {
      /* c8 ignore next 3 */
      if (error.code !== 'ENOENT') {
        throw error
      }

      return ''
    }
  }

  /**
   * Load contents of the main dot-env file and the current
   * environment dot-env file
   */
  async load() {
    const ENV_PATH = process.env.ENV_PATH
    const NODE_ENV = process.env.NODE_ENV
    const envFiles: { path: string; contents: string }[] = []

    /**
     * Base path to load .env files from
     */
    const baseEnvPath = ENV_PATH
      ? isAbsolute(ENV_PATH)
        ? ENV_PATH
        : join(this.#appRoot, ENV_PATH)
      : this.#appRoot

    /**
     * 1st
     * The top most priority is given to the ".env.[NODE_ENV].local" file
     */
    if (NODE_ENV) {
      const nodeEnvLocalFile = join(baseEnvPath, `.env.${process.env.NODE_ENV}.local`)
      envFiles.push({
        path: nodeEnvLocalFile,
        contents: await this.#loadFile(nodeEnvLocalFile),
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
        contents: await this.#loadFile(envLocalFile),
      })
    }

    /**
     * 3rd
     * Next, we give priority to the ".env.[NODE_ENV]" file
     */
    if (NODE_ENV) {
      const nodeEnvFile = join(baseEnvPath, `.env.${process.env.NODE_ENV}`)
      envFiles.push({
        path: nodeEnvFile,
        contents: await this.#loadFile(nodeEnvFile),
      })
    }

    /**
     * Finally, we push the contents of the ".env" file.
     */
    const envFile = join(baseEnvPath, '.env')
    envFiles.push({
      path: envFile,
      contents: await this.#loadFile(envFile),
    })

    return envFiles
  }
}
