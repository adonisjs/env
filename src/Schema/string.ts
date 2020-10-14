/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { StringFnOptions } from '@ioc:Adonis/Core/Env'
import { ensureValue } from './helpers'

/**
 * Formats against which a string can be optionally validated. We
 * lazy load the dependencies required for validating formats
 */
const formats: {
	[format in Exclude<StringFnOptions['format'], undefined>]: (
		key: string,
		value: string,
		message?: string
	) => void
} = {
	email: (key: string, value: string, message?: string) => {
		if (!require('validator/lib/isEmail')(value)) {
			throw new Exception(
				message || `Value for environment variable "${key}" must be a valid email`,
				500,
				'E_INVALID_ENV_VALUE'
			)
		}
	},
	host: (key: string, value: string, message?: string) => {
		if (
			!require('validator/lib/isFQDN')(value, { require_tld: false }) &&
			!require('validator/lib/isIP')(value)
		) {
			throw new Exception(
				message || `Value for environment variable "${key}" must be a valid (domain or ip)`,
				500,
				'E_INVALID_ENV_VALUE'
			)
		}
	},
	url: (key: string, value: string, message?: string) => {
		if (!require('validator/lib/isURL')(value)) {
			throw new Exception(
				message || `Value for environment variable "${key}" must be a valid URL`,
				500,
				'E_INVALID_ENV_VALUE'
			)
		}
	},
}

/**
 * Enforces the value to exist and be of type string
 */
export function string(options?: StringFnOptions) {
	return function validate(key: string, value?: string) {
		ensureValue(key, value, options?.message)

		if (options?.format) {
			formats[options.format](key, value, options.message)
		}

		return value
	}
}

/**
 * Same as the string rule, but allows non-existing values too
 */
string.optional = function optionalString(options?: StringFnOptions) {
	return function validate(key: string, value?: string) {
		if (!value) {
			return undefined
		}

		if (options?.format) {
			formats[options.format](key, value, options.message)
		}

		return value
	}
}
