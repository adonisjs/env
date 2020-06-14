/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import test from 'japa'
import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { envLoader } from '../src/loader'

const fs = new Filesystem(join(__dirname, '__app'))

test.group('Env loader', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('raise exception when .env file is missing', async (assert) => {
    const fn = () => envLoader(fs.basePath)
    assert.throw(fn, `E_MISSING_ENV_FILE: The ${join(fs.basePath, '.env')} file is missing`)
  })

  test('load and return contents of .env file', async (assert) => {
    await fs.add('.env', 'PORT=3000')
    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')
  })

  test('load .env.testing file when it exists and NODE_ENV = testing', async (assert) => {
    process.env.NODE_ENV = 'testing'

    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.testing', 'PORT=4000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, 'PORT=4000')

    delete process.env.NODE_ENV
  })

  test('do not load .env.testing file when it exists and NODE_ENV != testing', async (assert) => {
    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.testing', 'PORT=4000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')
  })

  test('load alternate .env.development when exists and NODE_ENV = development', async (assert) => {
    process.env.NODE_ENV = 'development'

    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.development', 'PORT=5000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, 'PORT=5000')

    delete process.env.NODE_ENV
  })

  test('do not load .env.development when exists and NODE_ENV != development', async (assert) => {
    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.development', 'PORT=5000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')

    delete process.env.NODE_ENV
  })

  test('do not load alternate .env.development when NODE_ENV = undefined', async (assert) => {
    process.env.NODE_ENV = undefined
    await fs.add('.env', 'PORT=3000')
    await fs.add('.env.development', 'PORT=5000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')

    delete process.env.NODE_ENV
  })

  test('load .env when exists and .env.development does not and NODE_ENV=development', async (assert) => {
    process.env.NODE_ENV = 'development'
    await fs.add('.env', 'PORT=3000')

    const { envContents, testEnvContent } = envLoader(fs.basePath)
    assert.equal(envContents, 'PORT=3000')
    assert.equal(testEnvContent, '')

    delete process.env.NODE_ENV
  })
})
