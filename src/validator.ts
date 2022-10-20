/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ValidateFn } from '@poppinss/validator-lite'

/**
 * Exposes the API to validate environment variables against a
 * pre-defined schema.
 *
 * The class is not exported in the main API and used internally.
 */
export class EnvValidator<Schema extends { [key: string]: ValidateFn<unknown> }> {
  #schema: Schema

  constructor(schema: Schema) {
    this.#schema = schema
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
    return Object.keys(this.#schema).reduce(
      (result, key) => {
        result[key] = this.#schema[key](key, values[key]) as any
        return result
      },
      { ...values }
    ) as { [K in keyof Schema]: ReturnType<Schema[K]> }
  }
}
