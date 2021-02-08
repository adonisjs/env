/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Env' {
  /**
   * An interface meant to be extended in the user land that holds
   * types for environment variables extracted using env.validate
   * method.
   */
  export interface EnvTypes {}

  /**
   * The shape of the validate fn
   */
  export type ValidateFn<T extends unknown> = (key: string, value?: string) => T

  /**
   * A standard set of options accepted by the schema validation
   * functions
   */
  export type SchemaFnOptions = {
    message?: string
  }

  export type StringFnUrlOptions = SchemaFnOptions & {
    format: 'url'
    /**
     * Whether the URL must have a valid TLD in their domain.
     * Defaults to `true`.
     */
    tld?: boolean
    /**
     * Whether the URL must start with a valid protocol.
     * Defaults to `true`.
     */
    protocol?: boolean
  }

  /**
   * Options accepted by the string schema function
   */
  export type StringFnOptions =
    | (SchemaFnOptions & {
        format?: 'host' | 'email'
      })
    | StringFnUrlOptions

  /**
   * Shape of the number validator
   */
  export interface NumberType {
    (options?: SchemaFnOptions): ValidateFn<number>
    optional: (options?: SchemaFnOptions) => ValidateFn<number | undefined>
  }

  /**
   * Shape of the string validator
   */
  export interface StringType {
    (options?: StringFnOptions): ValidateFn<string>
    optional: (options?: StringFnOptions) => ValidateFn<string | undefined>
  }

  /**
   * Shape of the boolean validator
   */
  export interface BooleanType {
    (options?: SchemaFnOptions): ValidateFn<boolean>
    optional: (options?: SchemaFnOptions) => ValidateFn<boolean | undefined>
  }

  /**
   * Shape of the enum validator
   */
  export interface EnumType {
    <K extends any>(choices: readonly K[], options?: SchemaFnOptions): ValidateFn<K>
    optional: <K extends any>(
      choices: readonly K[],
      options?: SchemaFnOptions
    ) => ValidateFn<K | undefined>
  }

  /**
   * Available schema functions. The end user can also define their
   * own
   */
  export interface EnvSchema {
    /**
     * Number function to enforce value to be a strict number
     */
    number: NumberType

    /**
     * String function to enforce value to be a string. Optionally
     * the format can also be defined
     */
    string: StringType

    /**
     * Boolean function to enforce value to be a boolean value.
     */
    boolean: BooleanType

    /**
     * Boolean function to enforce value to be one of the defined values.
     */
    enum: EnumType
  }

  /**
   * Env contract
   */
  export interface EnvContract {
    /**
     * Get value for a given environment variable
     */
    get<K extends keyof EnvTypes>(key: K): EnvTypes[K]
    get<K extends keyof EnvTypes>(
      key: K,
      defaultValue: Exclude<EnvTypes[K], undefined>
    ): Exclude<EnvTypes[K], undefined>
    get(key: string, defaultValue?: any): any

    /**
     * Update/set value for a given environment variable. Ideally one should
     * avoid updating values during runtime
     */
    set<K extends keyof EnvTypes>(key: K, value: EnvTypes[K]): void
    set(key: string, value: any): void

    /**
     * Validate environment variables
     */
    rules<T extends { [key: string]: ValidateFn<unknown> }>(
      values: T
    ): {
      [K in keyof T]: ReturnType<T[K]>
    }

    /**
     * Processes environment variables and performs the registered
     * validations
     */
    process(): void

    /**
     * Reference to the schema object for defining validation
     * rules
     */
    schema: EnvSchema
  }

  const Env: EnvContract
  export default Env
}
