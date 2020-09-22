/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract } from '@adonisjs/fold'

/**
 * The AdonisJs provider to register the binding to the container
 */
export default class EnvProvider {
	constructor(protected container: IocContract) {}

	/**
	 * Parses the contents for the `.env` and the `.env.testing` files
	 * and returns an array of values acceptable by the [Env] class.
	 */
	private parseEnvContents(envContents: string, testEnvContent: string) {
		const { EnvParser } = require('../src/Parser')

		/**
		 * Parser for `.env` file prefers existing "process.env" values
		 * for subsitution
		 */
		const env = new EnvParser(true).parse(envContents)

		/**
		 * Parser for `.env.testing` file prefers existing local object values
		 * for subsitution
		 */
		const testsEnv = new EnvParser(false).parse(testEnvContent)
		return [
			{ values: env, overwriteExisting: false },
			{ values: testsEnv, overwriteExisting: true },
		]
	}

	/**
	 * Registers the binding to the AdonisJs container
	 */
	public register() {
		this.container.singleton('Adonis/Core/Env', () => {
			const { Env } = require('../src/Env')
			const { envLoader } = require('../src/loader')

			const app = this.container.use('Adonis/Core/Application')
			const { envContents, testEnvContent } = envLoader(app.appRoot)

			return new Env(this.parseEnvContents(envContents, testEnvContent))
		})
	}
}
