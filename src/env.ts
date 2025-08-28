/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { schema as envSchema } from '@poppinss/validator-lite'
import type { ValidateFn } from '@poppinss/validator-lite/types'

import { EnvParser } from './parser.ts'
import { EnvValidator } from './validator.ts'
import { EnvProcessor } from './processor.ts'

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

  /**
   * Creates a new Env instance
   *
   * @param values - Validated environment values
   */
  constructor(values: EnvValues) {
    this.#values = values
  }

  /**
   * Create an instance of the env class by validating the
   * environment variables. Also, the `.env` files are
   * loaded from the appRoot
   *
   * @param appRoot - The application root directory URL
   * @param schema - Validation schema for environment variables
   * @returns Promise resolving to an Env instance with validated values
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
   * Define an identifier for any environment value. The callback is invoked
   * when the value match the identifier to modify its interpolation.
   *
   * @deprecated use `Env.defineIdentifier` instead
   * @param name - The identifier name
   * @param callback - Callback function to process the identifier value
   */
  static identifier(name: string, callback: (value: string) => Promise<string> | string): void {
    return EnvParser.defineIdentifier(name, callback)
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
    EnvParser.defineIdentifier(name, callback)
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
    EnvParser.defineIdentifierIfMissing(name, callback)
  }

  /**
   * Remove an identifier
   *
   * @param name - The identifier name to remove
   */
  static removeIdentifier(name: string): void {
    EnvParser.removeIdentifier(name)
  }

  /**
   * The schema builder for defining validation rules
   */
  static schema: typeof envSchema = envSchema

  /**
   * Define the validation rules for validating environment
   * variables. The return value is an instance of the
   * env validator
   *
   * @param schema - Validation schema object
   * @returns EnvValidator instance
   */
  static rules<T extends { [key: string]: ValidateFn<unknown> }>(schema: T): EnvValidator<T> {
    const validator = new EnvValidator<T>(schema)
    return validator
  }

  /**
   * Get the value of an environment variable by key. The values are
   * looked up inside the validated environment and "process.env"
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
   *
   * @param key - The environment variable key
   * @param defaultValue - Default value if key is not found
   * @returns The environment variable value or default
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
   *
   * @param key - The environment variable key
   * @param value - The value to set
   */
  set<K extends keyof EnvValues>(key: K, value: EnvValues[K]): void
  set(key: string, value: string): void
  set(key: string | keyof EnvValues, value: any): void {
    this.#values[key] = value
    process.env[key as string] = value
  }
}
