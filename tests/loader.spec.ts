/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join, relative } from 'node:path'
import { test } from '@japa/runner'
import { EnvLoader } from '../src/loader.ts'

test.group('Env loader', () => {
  test('return empty string when .env files are missing', async ({ assert, expectTypeOf, fs }) => {
    const loader = new EnvLoader(fs.baseUrl)
    const paths = [join(fs.basePath, '.env.local'), join(fs.basePath, '.env')]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
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
    expectTypeOf(loader.getPaths()).toEqualTypeOf<string[]>()
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

    const envFiles = await new EnvLoader(relative(process.cwd(), fs.basePath)).load()
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
    process.env.NODE_ENV = 'development'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    await fs.create('.env', 'PORT=3000')
    await fs.create('.env.development', 'PORT=4000')

    const loader = new EnvLoader(fs.baseUrl)
    const paths = [
      join(fs.basePath, '.env.development.local'),
      join(fs.basePath, '.env.local'),
      join(fs.basePath, '.env.development'),
      join(fs.basePath, '.env'),
    ]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
    assert.deepEqual(envFiles, [
      {
        path: join(fs.basePath, '.env.development.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env.local'),
        contents: '',
        fileExists: false,
      },
      {
        path: join(fs.basePath, '.env.development'),
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

    const loader = new EnvLoader(fs.baseUrl)
    const paths = [
      join(fs.basePath, '.env.testing.local'),
      join(fs.basePath, '.env.testing'),
      join(fs.basePath, '.env'),
    ]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
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

    const loader = new EnvLoader(fs.baseUrl)
    const paths = [join(fs.basePath, 'foo/bar', '.env.local'), join(fs.basePath, 'foo/bar', '.env')]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
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

    const loader = new EnvLoader(fs.baseUrl)
    const paths = [join(fs.basePath, 'foo/bar', '.env.local'), join(fs.basePath, 'foo/bar', '.env')]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
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

  test('do not include .env.local in test env', async ({ assert, cleanup, fs }) => {
    process.env.NODE_ENV = 'test'
    cleanup(() => {
      delete process.env.NODE_ENV
    })

    const loader = new EnvLoader(fs.baseUrl)
    const paths = [
      join(fs.basePath, '.env.test.local'),
      join(fs.basePath, '.env.test'),
      join(fs.basePath, '.env'),
    ]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
  })

  test('include .env.example when enabled', async ({ assert, fs }) => {
    const loader = new EnvLoader(fs.baseUrl, true)
    const paths = [
      join(fs.basePath, '.env.local'),
      join(fs.basePath, '.env'),
      join(fs.basePath, '.env.example'),
    ]

    assert.deepEqual(loader.getPaths(), paths)

    const envFiles = await loader.load()
    assert.deepEqual(
      envFiles.map(({ path }) => path),
      paths
    )
  })
})
