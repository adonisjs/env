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
import { MissingEnvPathFileException } from './exceptions/missing_env_path_file.js'

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
  async #loadFile(filePath: string | URL, optional: boolean = false): Promise<string> {
    try {
      return await readFile(filePath, 'utf-8')
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }

      if (optional) {
        return ''
      }

      throw new MissingEnvPathFileException(`Cannot find env file from "ENV_PATH"`, {
        cause: error,
      })
    }
  }

  /**
   * Load contents of the main dot-env file and the current
   * environment dot-env file
   */
  async load() {
    /**
     * Load the primary dot env file.
     */
    const envFile = process.env.ENV_PATH || '.env'
    const envPath = isAbsolute(envFile) ? envFile : join(this.#appRoot, envFile)
    const envContents = await this.#loadFile(envPath, !process.env.ENV_PATH)

    /**
     * Load the secondary dot env file
     */
    const currentEnvPath = join(this.#appRoot, `.env.${process.env.NODE_ENV}`)
    const currentEnvContents = await this.#loadFile(currentEnvPath, true)

    return { envContents, currentEnvContents }
  }
}
