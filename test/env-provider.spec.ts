/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { join } from 'path'
import { Registrar, Ioc } from '@adonisjs/fold'
import { Application } from '@adonisjs/application/build/standalone'

import { Env } from '../src/Env'

test.group('Env Provider', () => {
	test('register env provider', async (assert) => {
		const ioc = new Ioc()

		ioc.singleton('Adonis/Core/Application', () => {
			return new Application(join(__dirname, 'app'), ioc, {}, {})
		})

		const registrar = new Registrar(ioc, join(__dirname, '..'))
		await registrar.useProviders(['./providers/EnvProvider']).registerAndBoot()

		assert.instanceOf(ioc.use('Adonis/Core/Env'), Env)
		assert.deepEqual(ioc.use('Adonis/Core/Env'), ioc.use('Adonis/Core/Env'))

		ioc.use('Adonis/Core/Env').process()
		assert.equal(ioc.use('Adonis/Core/Env').get('ENV_APP_NAME'), 'adonisjs')
	})

	test('raise error when .env file is missing', async (assert) => {
		const ioc = new Ioc()

		ioc.singleton('Adonis/Core/Application', () => {
			return new Application(__dirname, ioc, {}, {})
		})

		const registrar = new Registrar(ioc, join(__dirname, '..'))
		await registrar.useProviders(['./providers/EnvProvider']).registerAndBoot()

		const fn = () => ioc.use('Adonis/Core/Env')
		assert.throw(fn, `E_MISSING_ENV_FILE: The "${join(__dirname, '.env')}" file is missing`)
	})
})
