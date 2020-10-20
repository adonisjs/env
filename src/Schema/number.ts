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

import { ensureValue } from './helpers'

/**
 * Casts the string to a number and ensures it is no NaN
 */
export function castToNumber(key: string, value: string, message?: string): number {
	const castedValue = Number(value)
	if (isNaN(castedValue)) {
		throw new Exception(
			message ||
				`Value for environment variable "${key}" must be numeric, instead received "${value}"`,
			500,
			'E_INVALID_ENV_VALUE'
		)
	}

	return castedValue
}

/**
 * Enforces the value to be of valid number type and the
 * value will also be casted to a number
 */
export function number(options?: SchemaFnOptions) {
	return function validate(key: string, value?: string) {
		ensureValue(key, value, options?.message)
		return castToNumber(key, value, options?.message)
	}
}

/**
 * Similar to the number rule, but also allows optional
 * values
 */
number.optional = function optionalNumber(options?: SchemaFnOptions) {
	return function validate(key: string, value?: string) {
		if (!value) {
			return undefined
		}
		return castToNumber(key, value, options?.message)
	}
}
