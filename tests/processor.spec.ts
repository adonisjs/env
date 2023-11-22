/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { EnvProcessor } from '../src/processor.js'

test.group('Env processor', () => {
  test('process .env file', async ({ assert, cleanup, fs }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    await fs.create(
      '.env',
      `
    HOST=localhost
    PORT=3000
    `
    )

    const app = new EnvProcessor(fs.baseUrl)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '3000' })
  })

  test('process .env.local and .env files', async ({ assert, cleanup, fs }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    await fs.create(
      '.env',
      `
    HOST=localhost
    PORT=3000
    `
    )

    await fs.create(
      '.env.local',
      `
      HOST=localhost
      PORT=4000
      `
    )

    const app = new EnvProcessor(fs.baseUrl)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '4000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '4000' })
  })

  test('process .env.local and .env.NODE_ENV.local files', async ({ assert, cleanup, fs }) => {
    process.env.NODE_ENV = 'development'

    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
      delete process.env.NODE_ENV
    })

    await fs.create(
      '.env.development.local',
      `
    HOST=localhost
    PORT=3000
    `
    )

    await fs.create(
      '.env.local',
      `
      HOST=localhost
      PORT=4000
      `
    )

    const app = new EnvProcessor(fs.baseUrl)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '3000' })
  })
})
