/*
 * @adonisjs/application
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import debug from './debug.js'
import { EnvParser } from './parser.js'
import { EnvLoader } from './loader.js'

/**
 * Env processors loads, parses and process environment variables.
 */
export class EnvProcessor {
  /**
   * App root is needed to load files
   */
  #appRoot: URL

  constructor(appRoot: URL) {
    this.#appRoot = appRoot
  }

  /**
   * Parse env variables from raw contents
   */
  #processContents(envContents: string, store: Record<string, any>) {
    /**
     * Collected env variables
     */
    if (!envContents.trim()) {
      return store
    }

    const values = new EnvParser(envContents).parse()
    Object.keys(values).forEach((key) => {
      let value = process.env[key]

      if (!value) {
        value = values[key]
        process.env[key] = values[key]
      }

      if (!store[key]) {
        store[key] = value
      }
    })

    return store
  }

  /**
   * Parse env variables by loading dot files.
   */
  async #loadAndProcessDotFiles() {
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
    envFiles.forEach(({ contents }) => this.#processContents(contents, envValues))
    return envValues
  }

  /**
   * Process env variables
   */
  async process() {
    return this.#loadAndProcessDotFiles()
  }
}
