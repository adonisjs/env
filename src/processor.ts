/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from './debug.ts'
import { EnvParser } from './parser.ts'
import { EnvLoader } from './loader.ts'

/**
 * Env processors loads, parses and process environment variables.
 */
export class EnvProcessor {
  /**
   * App root is needed to load files
   */
  #appRoot: URL

  /**
   * Creates a new EnvProcessor instance
   *
   * @param appRoot - The application root directory URL
   */
  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Parse env variables from raw contents
   *
   * @param envContents - Raw environment file contents
   * @param store - Store object to collect parsed variables
   * @returns Updated store with parsed variables
   */
  async #processContents(
    envContents: string,
    store: Record<string, any>
  ): Promise<Record<string, any>> {
    /**
     * Collected env variables
     */
    if (!envContents.trim()) {
      return store
    }

    const parser = new EnvParser(envContents, this.#appRoot)
    const values = await parser.parse()

    Object.keys(values).forEach((key) => {
      let value = process.env[key]

      if (value === undefined) {
        value = values[key]
        process.env[key] = values[key]
      }

      if (key in store === false) {
        store[key] = value
      }
    })

    return store
  }

  /**
   * Parse env variables by loading dot files.
   *
   * @returns Promise resolving to collected environment variables
   */
  async #loadAndProcessDotFiles(): Promise<Record<string, any>> {
    const loader = new EnvLoader(this.#appRoot)
    const envFiles = await loader.load()

    if (debug.enabled) {
      debug(
        'processing .env files (priority from top to bottom) %O',
        envFiles.map((file) => file.path)
      )
    }

    /**
     * Collected env variables
     */
    const envValues: Record<string, any> = {}
    await Promise.all(envFiles.map(({ contents }) => this.#processContents(contents, envValues)))
    return envValues
  }

  /**
   * Process env variables
   *
   * @returns Promise resolving to processed environment variables
   */
  async process(): Promise<Record<string, any>> {
    return this.#loadAndProcessDotFiles()
  }
}
