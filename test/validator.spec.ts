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
      'E_MISSING_ENV_VALUE: Missing environment variable "PORT"'
    )
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
