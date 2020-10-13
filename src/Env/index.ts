/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/env.ts" />

import { DotenvParseOutput } from 'dotenv'
import { EnvContract, ValidateFn } from '@ioc:Adonis/Core/Env'
import { schema as EnvSchema } from '../Schema'

/**
 * The ENV module enables the use of environment variables by parsing dotfiles syntax
 * and updates the `process.env` object in Node.js.
 *
 * AdonisJs automatically reads and passes the contents of `.env` file to this class.
 */
export class Env implements EnvContract {
	/**
	 * A boolean to know if the values have been processed or
	 * not
	 */
	private hasProcessedValues: boolean = false

	/**
	 * A cache of env values
	 */
	private envCache: { [key: string]: any } = {}

	/**
	 * The schema to be used for validating and casting environment
	 * variables
	 */
	private validationSchema: { [key: string]: ValidateFn<unknown> } = {}

	constructor(
		private valuesToProcess: { values: DotenvParseOutput; overwriteExisting: boolean }[]
	) {}

	/**
	 * Reference to the underlying schema
	 */
	public schema = EnvSchema

	/**
	 * Process parsed env variables. The values will be validated
	 * against the validation schema
	 */
	public process() {
		/**
		 * Avoid re-processing the same values over and over
		 * again
		 */
		if (this.hasProcessedValues) {
			return
		}

		this.hasProcessedValues = true

		/**
		 * Loop over the parsed object and set the value
		 * on the process.env and the local cache.
		 *
		 * At this stage we process the values like a regular env parser with
		 * no validation taking place
		 */
		this.valuesToProcess.forEach(({ values, overwriteExisting }) => {
			Object.keys(values).forEach((key) => {
				/**
				 * Use existing value when it already exists in process.env object
				 * and [this.overwriteExisting] is set to false
				 */
				const existingValue = process.env[key]
				if (existingValue && !overwriteExisting) {
					this.envCache[key] = existingValue
					return
				}

				/**
				 * Otherwise set the value on "process.env"
				 */
				this.envCache[key] = values[key]
				process.env[key] = values[key]
			})
		})

		/**
		 * Release parsed values, since we don't need it anymore
		 */
		this.valuesToProcess = []

		/**
		 * Perform validations by reading the environment variables
		 */
		Object.keys(this.validationSchema).forEach((key) => {
			this.envCache[key] = this.validationSchema[key](key, this.get(key))
		})
	}

	/**
	 * Register the validation schema
	 */
	public rules(schema: { [key: string]: ValidateFn<unknown> }): any {
		this.validationSchema = schema
		return {}
	}

	/**
	 * Returns the environment variable value. First the cached
	 * values are preferred. When missing, the value from
	 * "process.env" is used
	 */
	public get(key: string, defaultValue?: any): any {
		/**
		 * Return cached value
		 */
		if (this.envCache[key] !== undefined) {
			return this.envCache[key]
		}

		/**
		 * Get value from process.env and update the cache
		 */
		const envValue = process.env[key]
		if (envValue) {
			this.envCache[key] = envValue
			return envValue
		}

		/**
		 * Return default value when unable to lookup any other value
		 */
		return defaultValue
	}

	/**
	 * Alias for [[this.get]]
	 * @depreciated
	 */
	public getOrFail(key: string, defaultValue?: any): any {
		process.emitWarning(
			'DeprecationWarning',
			'Env.getOrFail() is deprecated. Use Env validations instead'
		)
		return this.get(key, defaultValue)
	}

	/**
	 * Set key-value pair. The value will be validated using
	 * the validation rule if exists.
	 *
	 * The original value is also updated on the `process.env`
	 * object
	 */
	public set(key: string, value: any): void {
		const validationFn = this.validationSchema[key]

		if (validationFn) {
			this.envCache[key] = validationFn(key, value)
		} else {
			this.envCache[key] = value
		}

		process.env[key] = value
	}
}
