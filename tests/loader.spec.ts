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
import { EnvLoader } from '../src/loader.js'

test.group('Env loader', () => {
  test('return empty string when .env files are missing', async ({ assert, expectTypeOf, fs }) => {
    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env'),
        contents: '',
        fileExists: false,
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<
      { path: string; contents: string; fileExists: boolean }[]
    >()
  })

  test('get contents of the .env file from the app root', async ({ assert, expectTypeOf, fs }) => {
    await fs.create('.env', 'PORT=3000')

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env'),
        contents: 'PORT=3000',
        fileExists: true,
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<
      { path: string; contents: string; fileExists: boolean }[]
    >()
  })

  test('use base path (as string) to load .env file', async ({ assert, expectTypeOf, fs }) => {
    await fs.create('.env', 'PORT=3000')

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env'),
        contents: 'PORT=3000',
        fileExists: true,
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<
      { path: string; contents: string; fileExists: boolean }[]
    >()
  })

  test('load env.[NODE_ENV] files', async ({ assert, expectTypeOf, cleanup, fs }) => {
    process.env.NODE_ENV = 'production'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fs.create('.env', 'PORT=3000')
    await fs.create('.env.production', 'PORT=4000')

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.production.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env.production'),
        contents: 'PORT=4000',
        fileExists: true,
      },
      {
        path: join(fs.basePath, '.env'),
        contents: 'PORT=3000',
        fileExists: true,
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<
      { path: string; contents: string; fileExists: boolean }[]
    >()
  })

  test('do not load .env.local in testing env', async ({ assert, expectTypeOf, cleanup, fs }) => {
    process.env.NODE_ENV = 'testing'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fs.create('.env', 'PORT=3000')
    await fs.create('.env.testing', 'PORT=4000')

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.testing.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env.testing'),
        contents: 'PORT=4000',
        fileExists: true,
      },
      {
        path: join(fs.basePath, '.env'),
        contents: 'PORT=3000',
        fileExists: true,
      },
    ])

    expectTypeOf(envFiles).toEqualTypeOf<
      { path: string; contents: string; fileExists: boolean }[]
    >()
  })

  test('use custom ENV_PATH', async ({ assert, cleanup, fs }) => {
    process.env.ENV_PATH = 'foo/bar'
    cleanup(() => {
      delete process.env.ENV_PATH
    })

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, 'foo/bar', '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, 'foo/bar', '.env'),
        contents: '',
        fileExists: false,
      },
    ])
  })

  test('use custom absolute ENV_PATH', async ({ assert, cleanup, fs }) => {
    process.env.ENV_PATH = join(fs.basePath, 'foo/bar')
    cleanup(() => {
      delete process.env.ENV_PATH
    })

    const envFiles = await new EnvLoader(fs.baseUrl).load()
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, 'foo/bar', '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, 'foo/bar', '.env'),
        contents: '',
        fileExists: false,
      },
    ])
  })
})
