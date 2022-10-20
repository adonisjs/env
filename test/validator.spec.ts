/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { schema } from '@poppinss/validator-lite'
import { EnvValidator } from '../src/validator.js'

test.group('Env Validator', () => {
  test('validate values against pre-defined schema', async ({ assert, expectTypeOf }) => {
    const validator = new EnvValidator({
      PORT: schema.number(),
    })

    const output = validator.validate({ PORT: '3333' })
    expectTypeOf(output).toEqualTypeOf<{ PORT: number }>()
    assert.deepEqual(output, { PORT: 3333 })
  })

  test('raise exception when validation fails', async ({ assert }) => {
    const validator = new EnvValidator({
      PORT: schema.number(),
    })

    assert.throws(
      () => validator.validate({}),
      'Validation failed for one or more environment variables'
    )
  })

  test('return all validation errors under help text', async ({ assert }) => {
    assert.plan(1)

    const validator = new EnvValidator({
      PORT: schema.number(),
      HOST: schema.string(),
    })

    try {
      validator.validate({})
    } catch (error) {
      assert.deepEqual(error.help.split('\n'), [
        '- E_MISSING_ENV_VALUE: Missing environment variable "PORT"',
        '- E_MISSING_ENV_VALUE: Missing environment variable "HOST"',
      ])
    }
  })

  test('point error stack to correct file', async ({ assert }) => {
    assert.plan(1)

    const validator = new EnvValidator({
      PORT: schema.number(),
      HOST: schema.string(),
    })

    try {
      validator.validate({})
    } catch (error) {
      const source = error.stack.split('\n')[2]
      assert.match(source, new RegExp(`${import.meta.url}:57`))
    }
  })

  test('return additional values as it is', async ({ assert, expectTypeOf }) => {
    const validator = new EnvValidator({
      PORT: schema.number(),
    })

    const values = { PORT: '3333', HOST: 'localhost' }
    const output = validator.validate(values)
    expectTypeOf(output).toEqualTypeOf<{ PORT: number }>()
    assert.deepEqual(output, { PORT: 3333, HOST: 'localhost' })
    assert.deepEqual(values, { PORT: '3333', HOST: 'localhost' })
  })
})