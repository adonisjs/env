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
    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env'),
        contents: '',
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<{ path: string; contents: string }[]>()
  })

  test('get contents of the .env file from the app root', async ({ assert, expectTypeOf }) => {
    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')

    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env'),
        contents: 'PORT=3000',
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<{ path: string; contents: string }[]>()
  })

  test('use base path (as string) to load .env file', async ({ assert, expectTypeOf }) => {
    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')

    const envFiles = await new EnvLoader(BASE_PATH).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env'),
        contents: 'PORT=3000',
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<{ path: string; contents: string }[]>()
  })

  test('load env.[NODE_ENV] files', async ({ assert, expectTypeOf, cleanup }) => {
    process.env.NODE_ENV = 'production'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')
    await fsExtra.outputFile(join(BASE_PATH, '.env.production'), 'PORT=4000')

    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, '.env.production.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env.production'),
        contents: 'PORT=4000',
      },
      {
        path: join(BASE_PATH, '.env'),
        contents: 'PORT=3000',
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<{ path: string; contents: string }[]>()
  })

  test('do not load .env.local in testing env', async ({ assert, expectTypeOf, cleanup }) => {
    process.env.NODE_ENV = 'testing'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fsExtra.outputFile(join(BASE_PATH, '.env'), 'PORT=3000')
    await fsExtra.outputFile(join(BASE_PATH, '.env.testing'), 'PORT=4000')

    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, '.env.testing.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, '.env.testing'),
        contents: 'PORT=4000',
      },
      {
        path: join(BASE_PATH, '.env'),
        contents: 'PORT=3000',
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<{ path: string; contents: string }[]>()
  })

  test('use custom ENV_PATH', async ({ assert, cleanup }) => {
    process.env.ENV_PATH = 'foo/bar'
    cleanup(() => {
      delete process.env.ENV_PATH
    })

    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, 'foo/bar', '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, 'foo/bar', '.env'),
        contents: '',
      },
    ])
  })

  test('use custom absolute ENV_PATH', async ({ assert, cleanup }) => {
    process.env.ENV_PATH = join(BASE_PATH, 'foo/bar')
    cleanup(() => {
      delete process.env.ENV_PATH
    })

    const envFiles = await new EnvLoader(BASE_URL).load()
    assert.deepEqual(envFiles, [
      {
        path: join(BASE_PATH, 'foo/bar', '.env.local'),
        contents: '',
      },
      {
        path: join(BASE_PATH, 'foo/bar', '.env'),
        contents: '',
      },
    ])
  })
})
