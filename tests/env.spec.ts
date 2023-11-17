/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Env } from '../src/env.js'

test.group('Env', (group) => {
  group.each.teardown(() => {
    delete process.env.ENV_PORT
    delete process.env.ENV_HOST
  })

  test('define identifier', async ({ assert, cleanup, fs }) => {
    assert.plan(1)

    cleanup(() => {
      Env.removeIdentifier('file')
    })

    Env.identifier('file', (_value: string) => {
      assert.isTrue(true)

      return '3000'
    })

    await fs.create('.env', 'PORT=file:romain')
    await Env.create(fs.baseUrl, {
      PORT: Env.schema.number(),
    })
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
