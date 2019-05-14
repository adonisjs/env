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
import { Exception } from '@adonisjs/utils'
import { EnvContract } from '@poppinss/env/contracts'

/**
 * The ENV module enables the use of environment variables by loading different `.env` files.
 * In development and production, the module will look for `.env` file inside the project
 * root and during testing, it will merging the values from `.env.testing` file (if exists).
 *
 * If `.env` file is missing, an hard exception will be raised and to turn off exceptions, you
 * must define `ENV_SILENT` environment variable.
 *
 * ```bash
 * ENV_SILENT=true node server.js
 * ```
 *
 * To load `.env` file from a different location, you must define `ENV_PATH` environment variable.
 *
 * **Note: There is no way to override the `.env.testing` file path.**
 *
 * ```bash
 * ENV_PATH=/var/secrets/.env node server.js
 * ```
 */
export class Env implements EnvContract {
  /**
   * Processes environment variables by parsing a string
   * in `dotfile` syntax.
   *
   * @example
   * ```
   * Env.process(`
   * PORT=3000
   * HOST=127.0.0.1
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
        process.env[key] = envCollection[key]
      }
    })
  }

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
    process.env[key] = value
  }
}
