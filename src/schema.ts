/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Secret } from '@poppinss/utils'
import { type Prettify } from '@poppinss/utils/types'
import { schema as envSchema } from '@poppinss/validator-lite'
import { type SchemaFnOptions } from '@poppinss/validator-lite/types'

function secret(options?: SchemaFnOptions) {
  return function validate(key: string, value?: string): Secret<string> {
    if (!value) {
      throw new Error(options?.message ?? `Missing environment variable "${key}"`)
    }
    return new Secret(value)
  }
}

/**
 * Same as the Secret rule, but allows non-existing values too
 */
secret.optional = function optionalString() {
  return function validate(_: string, value?: string): Secret<string> | undefined {
    if (!value) {
      return undefined
    }
    return new Secret(value)
  }
}

/**
 * Same as the optional rule, but allows a condition to decide when to
 * validate the value
 */
secret.optionalWhen = function optionalWhenString(
  condition: boolean | ((key: string, value?: string) => boolean),
  options?: SchemaFnOptions
) {
  return function validate(key: string, value?: string): Secret<string> | undefined {
    if (typeof condition === 'function' ? condition(key, value) : condition) {
      return secret.optional()(key, value)
    }

    return secret(options)(key, value)
  }
}

export const schema: Prettify<
  typeof envSchema & {
    secret: typeof secret
  }
> = {
  ...envSchema,
  secret,
}
