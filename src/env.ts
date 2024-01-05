/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { schema as envSchema, type ValidateFn } from '@poppinss/validator-lite'
import { EnvValidator } from './validator.js'
import { EnvProcessor } from './processor.js'

/**
 * A wrapper over "process.env" with types information.
 *
 * ```ts
 * const validate = Env.rules({
 *   PORT: Env.schema.number()
 * })
 *
 * const validatedEnvVars = validate(process.env)
 *
 * const env = new EnvValues(validatedEnvVars)
 * env.get('PORT') // type === number
 * ```
 */
export class Env<EnvValues extends Record<string, any>> {
  /**
   * A cache of env values
   */
  #values: EnvValues

  constructor(values: EnvValues) {
    this.#values = values
  }

  /**
   * Create an instance of the env class by validating the
   * environment variables. Also, the `.env` files are
   * loaded from the appRoot
   */
  static async create<Schema extends { [key: string]: ValidateFn<unknown> }>(
    appRoot: URL,
    schema: Schema
  ): Promise<
    Env<{
      [K in keyof Schema]: ReturnType<Schema[K]>
    }>
  > {
    const values = await new EnvProcessor(appRoot).process()
    const validator = this.rules(schema)
    return new Env(validator.validate(values))
  }

  /**
   * The schema builder for defining validation rules
   */
  static schema = envSchema

  /**
   * Define the validation rules for validating environment
   * variables. The return value is an instance of the
   * env validator
   */
  static rules<T extends { [key: string]: ValidateFn<unknown> }>(schema: T): EnvValidator<T> {
    const validator = new EnvValidator<T>(schema)
    return validator
  }

  /**
   * Get the value of an environment variable by key. The values are
   * lookedup inside the validated environment and "process.env"
   * is used as a fallback.
   *
   * The second param is the default value, which is returned when
   * the environment variable does not exist.
   *
   * ```ts
   * Env.get('PORT')
   *
   * // With default value
   * Env.get('PORT', 3000)
   * ```
   */
  get<K extends keyof EnvValues>(key: K): EnvValues[K]
  get<K extends keyof EnvValues>(
    key: K,
    defaultValue: Exclude<EnvValues[K], undefined>
  ): Exclude<EnvValues[K], undefined>
  get(key: string): string | undefined
  get(key: string, defaultValue: string): string
  get(key: string, defaultValue?: any): any {
    /**
     * Return cached value
     */
    if (this.#values[key] !== undefined) {
      return this.#values[key]
    }

    /**
     * Get value from "process.env" and update the cache
     */
    const envValue = process.env[key]
    if (envValue) {
      return envValue
    }

    /**
     * Return default value when unable to lookup any other value
     */
    return defaultValue
  }

  /**
   * Update/set value of an environment variable.
   *
   * The value is not casted/validated using the validator, so make sure
   * to set the correct data type.
   *
   * ```ts
   * Env.set('PORT', 3000)
   *
   * Env.get('PORT') === 3000 // true
   * process.env.PORT === '3000' // true
   * ```
   */
  set<K extends keyof EnvValues>(key: K, value: EnvValues[K]): void
  set(key: string, value: string): void
  set(key: string | keyof EnvValues, value: any): void {
    this.#values[key] = value
    process.env[key as string] = value
  }
}
