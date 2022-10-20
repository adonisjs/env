/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fsExtra from 'fs-extra'
import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { EnvLoader } from '../src/loader.js'

const BASE_URL = new URL('./app', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Env loader', (group) => {
  group.each.teardown(async () => {
    await fsExtra.remove(BASE_PATH)
  })

  test('return empty string when .env files are missing', async ({ assert, expectTypeOf }) => {
    const { envContents, currentEnvContents } = await new EnvLoader(BASE_URL).load()
    expectTypeOf(envContents).toEqualTypeOf<string>()
    expectTypeOf(currentEnvContents).toEqualTypeOf<string>()
    assert.equal(envContents, '')
    assert.equal(currentEnvContents, '')
  })

  test('get contents of the .env file from the app root', async ({ assert, expectTypeOf }) => {
    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')

    const { envContents, currentEnvContents } = await new EnvLoader(BASE_URL).load()
    expectTypeOf(envContents).toEqualTypeOf<string>()
    expectTypeOf(currentEnvContents).toEqualTypeOf<string>()
    assert.equal(envContents, 'PORT=3000')
    assert.equal(currentEnvContents, '')
  })

  test('load env.[NODE_ENV] file', async ({ assert, expectTypeOf, cleanup }) => {
    process.env.NODE_ENV = 'testing'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')
    await fsExtra.outputFile(join(BASE_PATH, '.env.testing'), 'PORT=4000')

    const { envContents, currentEnvContents } = await new EnvLoader(BASE_PATH).load()
    expectTypeOf(envContents).toEqualTypeOf<string>()
    expectTypeOf(currentEnvContents).toEqualTypeOf<string>()
    assert.equal(envContents, 'PORT=3000')
    assert.equal(currentEnvContents, 'PORT=4000')
  })

  test('raise error when ENV_PATH file is missing', async ({ assert, cleanup }) => {
    process.env.ENV_PATH = '.env'
    cleanup(() => {
      delete process.env.ENV_PATH
    })

    await assert.rejects(
      () => new EnvLoader(BASE_URL).load(),
      'Cannot find env file from "ENV_PATH"'
    )
  })
})
