/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFile } from 'node:fs/promises'
import dotenv, { type DotenvParseOutput } from 'dotenv'
import { RuntimeException } from '@poppinss/utils/exception'

import { type EnvIdentifierCallback } from './types.ts'
import { E_IDENTIFIER_ALREADY_DEFINED } from './errors.ts'

/**
 * Env parser parses the environment variables from a string formatted
 * as a key-value pair seperated using an `=`. For example:
 *
 * ```
 * PORT=3333
 * HOST=127.0.0.1
 * ```
 *
 * The variables can reference other environment variables as well using `$`.
 * For example:
 *
 * ```
 * PORT=3333
 * REDIS_PORT=$PORT
 * ```
 *
 * The variables using characters other than letters can wrap variable
 * named inside a curly brace.
 *
 * ```
 * APP-PORT=3333
 * REDIS_PORT=${APP-PORT}
 * ```
 *
 * You can escape the `$` sign with a backtick.
 *
 * ```
 * REDIS_PASSWORD=foo\$123
 * ```
 *
 * ## Usage
 *
 * ```ts
 * const parser = new EnvParser(envContents)
 * const output = parser.parse()
 *
 * // The output is a key-value pair
 * ```
 */
export class EnvParser {
  /**
   * Raw environment file contents
   */
  #envContents: string

  /**
   * Application root directory URL
   */
  #appRoot: URL

  /**
   * Whether to prefer process.env values over parsed values
   */
  #preferProcessEnv: boolean = true

  /**
   * Static collection of registered identifiers with their callbacks
   */
  static #identifiers: Record<string, EnvIdentifierCallback> = {
    async file(value, key, appRoot) {
      const filePath = new URL(value, appRoot)
      try {
        const contents = await readFile(filePath, 'utf-8')
        return contents
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw new RuntimeException(
            `Cannot process "${key}" env variable. Unable to locate file "${filePath}"`,
            {
              cause: error,
            }
          )
        }
        throw error
      }
    },
  }

  /**
   * Creates a new EnvParser instance
   *
   * @param envContents - Raw environment file contents
   * @param appRoot - Application root directory URL
   * @param options - Parser options
   */
  constructor(envContents: string, appRoot: URL, options?: { ignoreProcessEnv: boolean }) {
    if (options?.ignoreProcessEnv) {
      this.#preferProcessEnv = false
    }

    this.#envContents = envContents
    this.#appRoot = appRoot
  }

  /**
   * Define an identifier for any environment value. The callback is invoked
   * when the value match the identifier to modify its interpolation.
   *
   * @deprecated use `EnvParser.defineIdentifier` instead
   */
  /**
   * Define an identifier for any environment value. The callback is invoked
   * when the value match the identifier to modify its interpolation.
   *
   * @deprecated use `EnvParser.defineIdentifier` instead
   * @param name - The identifier name
   * @param callback - Callback function to process the identifier value
   */
  static identifier(name: string, callback: (value: string) => Promise<string> | string): void {
    EnvParser.defineIdentifier(name, callback)
  }

  /**
   * Define an identifier for any environment value. The callback is invoked
   * when the value match the identifier to modify its interpolation.
   *
   * @param name - The identifier name
   * @param callback - Callback function to process the identifier value
   */
  static defineIdentifier(
    name: string,
    callback: (value: string) => Promise<string> | string
  ): void {
    if (this.#identifiers[name]) {
      throw new E_IDENTIFIER_ALREADY_DEFINED([name])
    }

    this.#identifiers[name] = callback
  }

  /**
   * Define an identifier for any environment value, if it's not already defined.
   * The callback is invoked when the value match the identifier to modify its
   * interpolation.
   *
   * @param name - The identifier name
   * @param callback - Callback function to process the identifier value
   */
  static defineIdentifierIfMissing(
    name: string,
    callback: (value: string) => Promise<string> | string
  ): void {
    if (typeof this.#identifiers[name] === 'undefined') {
      this.#identifiers[name] = callback
    }
  }

  /**
   * Remove an identifier
   *
   * @param name - The identifier name to remove
   */
  static removeIdentifier(name: string): void {
    delete this.#identifiers[name]
  }

  /**
   * Returns the value from the parsed object
   *
   * @param key - The environment variable key
   * @param parsed - Parsed environment variables object
   * @returns The resolved environment variable value
   */
  #getValue(key: string, parsed: DotenvParseOutput): string {
    if (this.#preferProcessEnv && process.env[key]) {
      return process.env[key]!
    }

    if (parsed[key]) {
      return this.#interpolate(parsed[key], parsed)
    }

    return process.env[key] || ''
  }

  /**
   * Interpolating the token wrapped inside the mustache braces.
   *
   * @param token - The token to interpolate
   * @param parsed - Parsed environment variables object
   * @returns Interpolated value
   */
  #interpolateMustache(token: string, parsed: DotenvParseOutput): string {
    /**
     * Finding the closing brace. If closing brace is missing, we
     * consider the block as a normal string
     */
    const closingBrace = token.indexOf('}')
    if (closingBrace === -1) {
      return token
    }

    /**
     * Then we pull everything until the closing brace, except
     * the opening brace and trim off all white spaces.
     */
    const varReference = token.slice(1, closingBrace).trim()

    /**
     * Getting the value of the reference inside the braces
     */
    return `${this.#getValue(varReference, parsed)}${token.slice(closingBrace + 1)}`
  }

  /**
   * Interpolating the variable reference starting with a
   * `$`. We only capture numbers,letter and underscore.
   * For other characters, one can use the mustache
   * braces.
   *
   * @param token - The token to interpolate
   * @param parsed - Parsed environment variables object
   * @returns Interpolated value
   */
  #interpolateVariable(token: string, parsed: any): string {
    return token.replace(/[a-zA-Z0-9_]+/, (key) => {
      return this.#getValue(key, parsed)
    })
  }

  /**
   * Interpolates the referenced values
   *
   * @param value - The value to interpolate
   * @param parsed - Parsed environment variables object
   * @returns Interpolated value
   */
  #interpolate(value: string, parsed: DotenvParseOutput): string {
    const tokens = value.split('$')

    let newValue = ''
    let skipNextToken = true

    tokens.forEach((token) => {
      /**
       * If the value is an escaped sequence, then we replace it
       * with a `$` and then skip the next token.
       */
      if (token === '\\') {
        newValue += '$'
        skipNextToken = true
        return
      }

      /**
       * Use the value as it is when "skipNextToken" is set to true.
       */
      if (skipNextToken) {
        /**
         * Replace the ending escape sequence with a $
         */
        newValue += token.replace(/\\$/, '$')
        /**
         *  and then skip the next token if it ends with escape sequence
         */
        if (token.endsWith('\\')) {
          return
        }
      } else {
        /**
         * Handle mustache block
         */
        if (token.startsWith('{')) {
          newValue += this.#interpolateMustache(token, parsed)
          return
        }

        /**
         * Process all words as variable
         */
        newValue += this.#interpolateVariable(token, parsed)
      }

      /**
       * Process next token
       */
      skipNextToken = false
    })

    return newValue
  }

  /**
   * Parse the env string to an object of environment variables.
   *
   * @returns Promise resolving to parsed environment variables
   */
  async parse(): Promise<DotenvParseOutput> {
    const envCollection = dotenv.parse(this.#envContents.trim())
    const identifiers = Object.keys(EnvParser.#identifiers)
    let result: DotenvParseOutput = {}

    $keyLoop: for (const key in envCollection) {
      const value = this.#getValue(key, envCollection)

      if (value.includes(':')) {
        for (const identifier of identifiers) {
          if (value.startsWith(`${identifier}:`)) {
            result[key] = await EnvParser.#identifiers[identifier](
              value.substring(identifier.length + 1),
              key,
              this.#appRoot
            )

            continue $keyLoop
          }

          if (value.startsWith(`${identifier}\\:`)) {
            result[key] = identifier + value.substring(identifier.length + 1)

            continue $keyLoop
          }
        }

        result[key] = value
      } else {
        result[key] = value
      }
    }

    return result
  }
}
