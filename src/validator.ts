/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ValidateFn } from '@poppinss/validator-lite'
import { InvalidEnvVariablesException } from './exceptions/invalid_env_variables.js'

/**
 * Exposes the API to validate environment variables against a
 * pre-defined schema.
 *
 * The class is not exported in the main API and used internally.
 */
export class EnvValidator<Schema extends { [key: string]: ValidateFn<unknown> }> {
  #schema: Schema
  #error: InvalidEnvVariablesException

  constructor(schema: Schema) {
    this.#schema = schema
    this.#error = new InvalidEnvVariablesException()
  }

  /**
   * Accepts an object of values to validate against the pre-defined
   * schema.
   *
   * The return value is a merged copy of the original object and the
   * values mutated by the schema validator.
   */
  validate(values: { [K: string]: string | undefined }): {
    [K in keyof Schema]: ReturnType<Schema[K]>
  } {
    const help: string[] = []
    const validated = Object.keys(this.#schema).reduce(
      (result, key) => {
        try {
          result[key] = this.#schema[key](key, values[key]) as any
        } catch (error) {
          help.push(`- ${error.message}`)
        }
        return result
      },
      { ...values }
    ) as { [K in keyof Schema]: ReturnType<Schema[K]> }

    if (help.length) {
      this.#error.help = help.join('\n')
      throw this.#error
    }

    return validated
  }
}
