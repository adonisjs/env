/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { outputFile, remove } from 'fs-extra'
import { EnvProcessor } from '../src/processor.js'

const BASE_URL = new URL('./app/', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

test.group('Env processor', (group) => {
  group.each.setup(() => {
    return () => remove(BASE_PATH)
  })

  test('process .env file', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    await outputFile(
      join(BASE_PATH, '.env'),
      `
    HOST=localhost
    PORT=3000
    `
    )

    const app = new EnvProcessor(BASE_URL)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '3000' })
  })

  test('process .env.local and .env files', async ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
    })

    await outputFile(
      join(BASE_PATH, '.env'),
      `
    HOST=localhost
    PORT=3000
    `
    )

    await outputFile(
      join(BASE_PATH, '.env.local'),
      `
      HOST=localhost
      PORT=4000
      `
    )

    const app = new EnvProcessor(BASE_URL)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '4000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '4000' })
  })

  test('process .env.local and .env.NODE_ENV.local files', async ({ assert, cleanup }) => {
    process.env.NODE_ENV = 'development'

    cleanup(() => {
      delete process.env.PORT
      delete process.env.HOST
      delete process.env.NODE_ENV
    })

    await outputFile(
      join(BASE_PATH, '.env.development.local'),
      `
    HOST=localhost
    PORT=3000
    `
    )

    await outputFile(
      join(BASE_PATH, '.env.local'),
      `
      HOST=localhost
      PORT=4000
      `
    )

    const app = new EnvProcessor(BASE_URL)

    const values = await app.process()
    assert.equal(process.env.HOST, 'localhost')
    assert.equal(process.env.PORT, '3000')
    assert.deepEqual(values, { HOST: 'localhost', PORT: '3000' })
  })
})
