/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Env } from '../src/env.ts'

test.group('Env', (group) => {
  group.each.teardown(() => {
    delete process.env.ENV_PORT
    delete process.env.ENV_HOST
  })

  test('define identifier', async ({ assert, cleanup, fs }) => {
    cleanup(() => {
      delete process.env.ENV_USER
      Env.removeIdentifier('uid')
    })
    Env.defineIdentifier('uid', () => {
      return '100'
    })

    await fs.create('.env', 'ENV_USER=uid:romain')
    const env = await Env.create(fs.baseUrl, {
      ENV_USER: Env.schema.number(),
    })
    assert.equal(env.get('ENV_USER'), 100)
  })

  test('throw exception when identifier is already defined', async ({ cleanup }) => {
    cleanup(() => {
      Env.removeIdentifier('uid')
      delete process.env.ENV_USER
    })

    Env.defineIdentifier('uid', () => {
      return '3000'
    })
    Env.defineIdentifier('uid', () => {
      return '3000'
    })
  }).throws('The identifier "uid" is already defined')

  test('silently ignore when adding the same identifier with IfMissing variant', async ({
    assert,
    cleanup,
    fs,
  }) => {
    cleanup(() => {
      Env.removeIdentifier('uid')
      delete process.env.ENV_USER
    })
    Env.defineIdentifier('uid', (_value: string) => {
      return '100'
    })
    Env.defineIdentifierIfMissing('uid', (_value: string) => {
      return '200'
    })

    await fs.create('.env', 'ENV_USER=uid:romain')
    const env = await Env.create(fs.baseUrl, {
      ENV_USER: Env.schema.number(),
    })

    assert.strictEqual(process.env.ENV_USER, '100')
    assert.equal(env.get('ENV_USER'), 100)
  })

  test('read values from process.env', ({ assert, expectTypeOf, cleanup }) => {
    process.env.PORT = '4000'
    cleanup(() => {
      delete process.env.PORT
    })

    const env = new Env({})
    const port = env.get('PORT')

    expectTypeOf(port).toEqualTypeOf<string | undefined>()
    assert.equal(port, '4000')
  })

  test('return default value when the actual value is missing', ({ assert, expectTypeOf }) => {
    const env = new Env({})
    const port = env.get('PORT', '3000')

    expectTypeOf(port).toEqualTypeOf<string>()
    assert.equal(port, '3000')
  })

  test('return value from pre-defined values', ({ assert, expectTypeOf }) => {
    const env = new Env({
      PORT: 3000,
    })
    const port = env.get('PORT')

    expectTypeOf(port).toEqualTypeOf<number>()
    assert.equal(port, 3000)
  })

  test('return default value when pre-defined value is missing', ({ assert, expectTypeOf }) => {
    const env = new Env<{ PORT?: number }>({})
    const port = env.get('PORT', 3000)

    expectTypeOf(port).toEqualTypeOf<number>()
    assert.equal(port, 3000)
  })

  test('update env value', ({ assert, cleanup }) => {
    cleanup(() => {
      delete process.env.PORT
    })

    const env = new Env({ PORT: 4000 })
    assert.isUndefined(process.env.PORT)

    env.set('PORT', 3000)
    assert.equal(env.get('PORT'), 3000)
    assert.equal(process.env.PORT, '3000')
  })

  test('create validation function', async ({ assert, expectTypeOf }) => {
    const validator = Env.rules({
      PORT: Env.schema.number(),
    })

    const output = validator.validate({ PORT: '3333' })
    expectTypeOf(output).toEqualTypeOf<{ PORT: number }>()
    assert.deepEqual(output, { PORT: 3333 })
  })

  test('validate and process environment variables', async ({
    assert,
    expectTypeOf,
    cleanup,
    fs,
  }) => {
    cleanup(() => {
      delete process.env.PORT
    })

    await fs.create('.env', 'PORT=3000')
    const env = await Env.create(fs.baseUrl, {
      PORT: Env.schema.number(),
    })

    assert.equal(env.get('PORT'), 3000)
    expectTypeOf(env.get('PORT')).toEqualTypeOf<number>()
  })
})
