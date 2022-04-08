/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { envLoader } from '../src/loader'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Env loader', (group) => {
  group.each.teardown(async () => {
    await fs.cleanup()
  })

  test('do not raise exception when .env file is missing', async ({ assert }) => {
    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, '')
    assert.equal(testEnvContent, '')
  })

  test('load and return contents of .env file', async ({ assert }) => {
    await fs.add('.env', 'PORT=3000')
    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')
  })

  test('load .env.testing file when it exists and NODE_ENV = testing', async ({ assert }) => {
    process.env.NODE_ENV = 'testing'

    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.testing', 'PORT=4000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, 'PORT=4000')

    delete process.env.NODE_ENV
  })

  test('do not load .env.testing file when it exists and NODE_ENV != testing', async ({
    assert,
  }) => {
    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.testing', 'PORT=4000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')
  })

  test('load .env.test file when it exists and NODE_ENV = test', async ({ assert }) => {
    process.env.NODE_ENV = 'test'

    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.test', 'PORT=4000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, 'PORT=4000')

    delete process.env.NODE_ENV
  })
})
