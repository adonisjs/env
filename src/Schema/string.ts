/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { StringFnOptions, StringFnUrlOptions } from '@ioc:Adonis/Core/Env'
import { ensureValue } from './helpers'

/**
 * Formats against which a string can be optionally validated. We
 * lazy load the dependencies required for validating formats
 */
const formats: {
	[format in Exclude<StringFnOptions['format'], undefined>]: (
		key: string,
		value: string,
		options: StringFnOptions
	) => void
} = {
	email: (key: string, value: string, options: StringFnOptions) => {
		if (!require('validator/lib/isEmail')(value)) {
			throw new Exception(
				options.message ||
					`Value for environment variable "${key}" must be a valid email, instead received "${value}"`,
				500,
				'E_INVALID_ENV_VALUE'
			)
		}
	},
	host: (key: string, value: string, options: StringFnOptions) => {
		if (
			!require('validator/lib/isFQDN')(value, { require_tld: false }) &&
			!require('validator/lib/isIP')(value)
		) {
			throw new Exception(
				options.message ||
					`Value for environment variable "${key}" must be a valid (domain or ip), instead received "${value}"`,
				500,
				'E_INVALID_ENV_VALUE'
			)
		}
	},
	url: (key: string, value: string, options: StringFnUrlOptions) => {
		const { tld = true, protocol = true } = options
		if (!require('validator/lib/isURL')(value, { require_tld: tld, require_protocol: protocol })) {
			throw new Exception(
				options.message ||
					`Value for environment variable "${key}" must be a valid URL, instead received "${value}"`,
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
			formats[options.format](key, value, options)
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
			formats[options.format](key, value, options)
		}

		return value
	}
}
