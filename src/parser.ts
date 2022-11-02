/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import dotenv, { DotenvParseOutput } from 'dotenv'

/**
 * Env parser parses the environment variables from a string formatted
 * as a key-value pair seperated using an `=`. For example:
 *
 * ```dotenv
 * PORT=3333
 * HOST=127.0.0.1
 * ```
 *
 * The variables can reference other environment variables as well using `$`.
 * For example:
 *
 * ```dotenv
 * PORT=3333
 * REDIS_PORT=$PORT
 * ```
 *
 * The variables using characters other than letters can wrap variable
 * named inside a curly brace.
 *
 * ```dotenv
 * APP-PORT=3333
 * REDIS_PORT=${APP-PORT}
 * ```
 *
 * You can escape the `$` sign with a backtick.
 *
 * ```dotenv
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
  #envContents: string
  #preferProcessEnv: boolean = true

  constructor(envContents: string, options?: { ignoreProcessEnv: boolean }) {
    if (options?.ignoreProcessEnv) {
      this.#preferProcessEnv = false
    }

    this.#envContents = envContents
  }

  /**
   * Returns the value from the parsed object
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
   */
  #interpolateMustache(token: string, parsed: DotenvParseOutput) {
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
   */
  #interpolateVariable(token: string, parsed: any) {
    return token.replace(/[a-zA-Z0-9_]+/, (key) => {
      return this.#getValue(key, parsed)
    })
  }

  /**
   * Interpolates the referenced values
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
   */
  parse(): DotenvParseOutput {
    const envCollection = dotenv.parse(this.#envContents.trim())

    return Object.keys(envCollection).reduce((result, key) => {
      result[key] = this.#getValue(key, envCollection)
      return result
    }, {})
  }
}
