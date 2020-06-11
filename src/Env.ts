/*
* @adonisjs/env
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../adonis-typings/env.ts" />

import dotenv from 'dotenv'
import { Exception } from '@poppinss/utils'
import { EnvContract } from '@ioc:Adonis/Core/Env'

/**
 * The ENV module enables the use of environment variables by parsing dotfiles syntax
 * and updates the `process.env` object in Node.js.
 *
 * AdonisJs automatically reads and passes the contents of `.env` file to this class.
 */
export class Env implements EnvContract {
  constructor (private cache: boolean = false) {
  }

  /**
   *  Cached value of any environement variables to avoid
   *  multiple call to `process.env`.
   */
  private cachedValue = new Map<string, any>()

  /**
   * Casts the string value to their native data type
   * counter parts. Only done for `booleans` and
   * `nulls`.
   */
  private castValue (value: string): string | boolean | null | undefined {
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
  private getValue (key: string, parsed: any): string {
    const systemValue = process.env[key]

    if (systemValue) {
      return systemValue
    }

    if (parsed[key]) {
      return this.interpolate(parsed[key], parsed)
    }

    return ''
  }

  /**
   * Interpolating the token wrapped inside the mustache
   * braces.
   */
  private interpolateMustache (token: string, parsed: any) {
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
    return `${this.getValue(varReference, parsed)}${token.slice(closingBrace + 1)}`
  }

  /**
   * Interpolating the escaped sequence.
   */
  private interpolateEscapedSequence (value: string) {
    return `$${value}`
  }

  /**
   * Interpolating the variable reference starting with a
   * `$`. We only capture numbers,letter and underscore.
   * For other characters, one can use the mustache
   * braces.
   */
  private interpolateVariable (token: string, parsed: any) {
    return token.replace(/[a-zA-Z0-9_]+/, (key) => {
      return this.getValue(key, parsed)
    })
  }

  /**
   * Interpolates the referenced values
   */
  private interpolate (value: string, parsed: any): string {
    const tokens = value.split('$')

    let newValue = ''
    let isFirstToken = true

    while (tokens.length) {
      let token = tokens.shift()!

      if (token.indexOf('\\') === 0) {
        newValue += this.interpolateEscapedSequence(tokens.shift()!)
      } else if (isFirstToken) {
        newValue += token.replace(/\\/, '$')
      } else if (token.startsWith('{')) {
        newValue += this.interpolateMustache(token, parsed)
      } else {
        newValue += this.interpolateVariable(token, parsed)
      }

      isFirstToken = false
    }

    return newValue
  }

  /**
   * Parser environment variables by parsing a string
   * in `dotfile` syntax.
   *
   * @example
   * ```ts
   * Env.parse(`
   *  PORT=3000
   *  HOST=127.0.0.1
   * `)
   *
   * // Output
   * { PORT: '3000', HOST: '127.0.0.1' }
   * ```
   *
   */
  public parse (envString: string) {
    const envCollection = dotenv.parse(envString.trim())

    return Object.keys(envCollection).reduce((result, key) => {
      result[key] = this.interpolate(envCollection[key], envCollection)
      return result
    }, {})
  }

  /**
   * Processes environment variables by parsing a string
   * in `dotfile` syntax.
   *
   * @example
   * ```ts
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
        const interpolatedValue = this.interpolate(envCollection[key], envCollection)
        process.env[key] = interpolatedValue
        this.cache && this.cachedValue.set(key, this.castValue(interpolatedValue))
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
   *
   * @example
   * ```ts
   * Env.get('PORT', 3333)
   * ```
   */
  public get (key: string, defaultValue?: any): string | boolean | null | undefined {
    if (this.cache && this.cachedValue.has(key)) {
      return this.cachedValue.get(key) as string | boolean | null | undefined
    }

    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    const castedValue = this.castValue(value)
    this.cachedValue.set(key, castedValue)
    return castedValue
  }

  /**
   * The method is similar to it's counter part [[get]] method. However, it will
   * raise exception when the original value is non-existing.
   *
   * `undefined`, `null` and `empty strings` are considered as non-exisitng values.
   *
   * We recommended using this method for **environment variables** that are strongly
   * required to run the application stably.
   *
   * @example
   * ```ts
   * Env.getOrFail('PORT')
   * ```
   */
  public getOrFail (key: string): string | boolean {
    const value = this.get(key)

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
   * Update or set value for a given property
   * inside `process.env`.
   *
   * @example
   * ```ts
   * Env.set('PORT', 3333)
   * ```
   */
  public set (key: string, value: string): void {
    const interpolatedValue = this.interpolate(value, {})
    this.cache && this.cachedValue.set(key, this.castValue(interpolatedValue))
    process.env[key] = interpolatedValue
  }
}
