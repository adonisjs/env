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
	 * Registers the binding to the AdonisJs container
	 */
	public register() {
		this.container.singleton('Adonis/Core/Env', () => {
			const { Env } = require('../src/Env')
			const { envLoader } = require('../src/loader')

			const env = new Env()
			const app = this.container.use('Adonis/Core/Application')
			const { envContents, testEnvContent } = envLoader(app.appRoot)

			env.process(envContents, false)
			env.process(testEnvContent, true)

			return env
		})
	}
}
