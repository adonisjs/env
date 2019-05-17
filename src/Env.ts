/**
 * @module @poppinss/env
 */

/*
* @poppinss/env
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="./contracts.ts" />

import * as dotenv from 'dotenv'
import { Exception } from '@poppinss/utils'
import { EnvContract } from '@poppinss/env/contracts'

/**
 * The ENV module enables the use of environment variables by parsing dotfiles syntax
 * and updates the `process.env` object in Node.js.
 *
 * AdonisJs automatically reads and passes the contents of `.env` file to this class.
 */
export class Env implements EnvContract {
  /**
   * Casts the string value to their native data type
   * counter parts. Only done for `booleans` and
   * `nulls`.
   */
  private _castValue (value: string): string | boolean | null | undefined {
    switch (value) {
      case 'null':
        return null
      case 'true':
      case '1':
        return true
      case 'false':
      case '0':
        return false
      default:
        return value
    }
  }

  /**
   * Returns value for a given key from the environment variables. Also
   * the current parsed object is used to pull the reference.
   */
  private _getValue (key: string, parsed: any): string {
    if (process.env[key]) {
      return process.env[key]!
    }

    if (parsed[key]) {
      return this._interpolate(parsed[key], parsed)
    }

    return ''
  }

  /**
   * Interpolating the token wrapped inside the mustache
   * braces.
   */
  private _interpolateMustache (token: string, parsed: any) {
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
    return `${this._getValue(varReference, parsed)}${token.slice(closingBrace + 1)}`
  }

  /**
   * Interpolating the escaped sequence.
   */
  private _interpolateEscapedSequence (value: string) {
    return `$${value}`
  }

  /**
   * Interpolating the variable reference starting with a
   * `$`. We only capture numbers,letter and underscore.
   * For other characters, one can use the mustache
   * braces.
   */
  private _interpolateVariable (token: string, parsed: any) {
    return token.replace(/[a-zA-Z0-9_]+/, (key) => {
      return this._getValue(key, parsed)
    })
  }

  /**
   * Interpolates the referenced values
   */
  private _interpolate (value: string, parsed: any): string {
    const tokens = value.split('$')

    let newValue = ''
    let isFirstToken = true

    while (tokens.length) {
      let token = tokens.shift()!

      if (token.indexOf('\\') === 0) {
        newValue += this._interpolateEscapedSequence(tokens.shift()!)
      } else if (isFirstToken) {
        newValue += token.replace(/\\/, '$')
      } else if (token.startsWith('{')) {
        newValue += this._interpolateMustache(token, parsed)
      } else {
        newValue += this._interpolateVariable(token, parsed)
      }

      isFirstToken = false
    }

    return newValue
  }

  /**
   * Processes environment variables by parsing a string
   * in `dotfile` syntax.
   *
   * @example
   * ```
   * Env.process(`
   *  PORT=3000
   *  HOST=127.0.0.1
   * `)
   * ```
   *
   * and then access it as follows
   *
   * ```ts
   * Env.get('PORT')
   *
   * // or
   * process.env.PORT
   * ```
   */
  public process (envString: string, overwrite: boolean = false) {
    const envCollection = dotenv.parse(envString.trim())

    /**
     * Define/overwrite the process.env variables by looping
     * over the collection
     */
    Object.keys(envCollection).forEach((key) => {
      if (process.env[key] === undefined || overwrite) {
        process.env[key] = this._interpolate(envCollection[key], envCollection)
      }
    })
  }

  /**
   * Get value for a key from the process.env. Since `process.env` object stores all
   * values as strings, this method will cast them to their counterpart datatypes.
   *
   * | Value | Casted value |
   * |------|---------------|
   * | 'true' | true |
   * | '1' | true |
   * | 'false' | false |
   * | '0' | false |
   * | 'null' | null |
   *
   * Everything else is returned as a string.
   *
   * A default value can also be defined which is returned when original value
   * is undefined.
   */
  public get (key: string, defaultValue?: any): string | boolean | null | undefined {
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    return this._castValue(value)
  }

  /**
   * The method is similar to it's counter part [[get]] method. However, it will
   * raise exception when the original value is non-existing.
   *
   * `undefined`, `null` and `empty strings` are considered as non-exisitng values.
   *
   * We recommended using this method for **environment variables** that are strongly
   * required to run the application stably.
   */
  public getOrFail (key: string, defaultValue?: any): string | boolean {
    const value = this.get(key, defaultValue)

    if (!value && value !== false) {
      throw new Exception(
        `Make sure to define environment variable ${key}`,
        500,
        'E_MISSING_ENV_KEY',
      )
    }

    return value
  }

  /**
   * Update/Set value for a key inside the process.env file.
   */
  public set (key: string, value: string): void {
    process.env[key] = this._interpolate(value, {})
  }
}
