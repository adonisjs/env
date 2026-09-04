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
import { join, resolve } from 'node:path'

import debug from './debug.ts'

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
  /**
   * The application root directory path
   */
  #appRoot: string

  /**
   * Whether to load the .env.example file
   */
  #loadExampleFile: boolean

  /**
   * Creates a new EnvLoader instance
   *
   * @param appRoot - The application root directory as string or URL
   * @param loadExampleFile - Whether to load .env.example file
   */
  constructor(appRoot: string | URL, loadExampleFile: boolean = false) {
    this.#appRoot = typeof appRoot === 'string' ? appRoot : fileURLToPath(appRoot)
    this.#loadExampleFile = loadExampleFile
  }

  /**
   * Returns the directory from which dot-env files are loaded
   */
  #getBasePath(): string {
    return resolve(this.#appRoot, process.env.ENV_PATH || '')
  }

  /**
   * Optionally read a file from the disk
   *
   * @param filePath - Path to the file to read
   * @returns Promise resolving to file existence status and contents
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
   * Returns the absolute paths of the dot-env files in loading priority order
   */
  getPaths(): string[] {
    const NODE_ENV = process.env.NODE_ENV
    const baseEnvPath = this.#getBasePath()
    const envFiles: string[] = []

    if (NODE_ENV) {
      envFiles.push(join(baseEnvPath, `.env.${NODE_ENV}.local`))
    }

    if (!NODE_ENV || !['test', 'testing'].includes(NODE_ENV)) {
      envFiles.push(join(baseEnvPath, '.env.local'))
    }

    if (NODE_ENV) {
      envFiles.push(join(baseEnvPath, `.env.${NODE_ENV}`))
    }

    envFiles.push(join(baseEnvPath, '.env'))

    if (this.#loadExampleFile) {
      envFiles.push(join(baseEnvPath, '.env.example'))
    }

    return envFiles
  }

  /**
   * Load contents of the main dot-env file and the current
   * environment dot-env file
   *
   * @returns Promise resolving to array of loaded environment files
   */
  async load(): Promise<{ contents: string; path: string; fileExists: boolean }[]> {
    const ENV_PATH = process.env.ENV_PATH
    const NODE_ENV = process.env.NODE_ENV
    const paths = this.getPaths()
    const envFiles: { path: string; contents: string; fileExists: boolean }[] = []

    if (debug.enabled) {
      debug('ENV_PATH variable is %s', ENV_PATH ? 'set' : 'not set')
      debug('NODE_ENV variable is %s', NODE_ENV ? 'set' : 'not set')
      debug('dot-env files base path "%s"', this.#getBasePath())
    }

    for (const path of paths) {
      envFiles.push({
        path,
        ...(await this.#loadFile(path)),
      })
    }

    return envFiles
  }
}
