/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { SchemaFnOptions } from '@ioc:Adonis/Core/Env'
import { ensureValue, BOOLEAN_NEGATIVES, BOOLEAN_POSITIVES } from './helpers'

/**
 * Casts a string value to a boolean
 */
function castToBoolean(key: string, value: string, message?: string): boolean {
	if (BOOLEAN_POSITIVES.includes(value)) {
		return true
	}

	if (BOOLEAN_NEGATIVES.includes(value)) {
		return false
	}

	throw new Exception(
		message || `Value for environment variable "${key}" must be a boolean`,
		500,
		'E_INVALID_ENV_VALUE'
	)
}

/**
 * Enforces the value to be of type boolean. Also casts
 * string representation of a boolean to a boolean
 * type
 */
export function boolean(options?: SchemaFnOptions) {
	return function validate(key: string, value?: string) {
		ensureValue(key, value, options?.message)
		return castToBoolean(key, value, options?.message)
	}
}

/**
 * Same as boolean, but allows undefined values as well.
 */
boolean.optional = function optionalBoolean(options?: SchemaFnOptions) {
	return function validate(key: string, value?: string) {
		if (!value) {
			return undefined
		}
		return castToBoolean(key, value, options?.message)
	}
}
