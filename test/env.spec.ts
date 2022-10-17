/*
 * @poppinss/config
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Env } from '../src/Env'
import { schema } from '@poppinss/validator-lite'

test.group('Env', (group) => {
  group.each.setup(() => {
    delete process.env.ENV_PORT
    delete process.env.ENV_HOST
  })

  test('process parsed environment variables', ({ assert }) => {
    const env = new Env([
      {
        values: {
          ENV_PORT: '3333',
          ENV_HOST: '0.0.0.0',
        },
        overwriteExisting: false,
      },
    ])

    env.process()

    assert.deepEqual(process.env.ENV_PORT, '3333')
    assert.deepEqual(process.env.ENV_HOST, '0.0.0.0')
  })

  test('do not overwrite existing env values', ({ assert }) => {
    process.env.ENV_PORT = '4000'

    const env = new Env([
      {
        values: {
          ENV_PORT: '3333',
          ENV_HOST: '0.0.0.0',
        },
        overwriteExisting: false,
      },
    ])

    env.process()

    assert.deepEqual(process.env.ENV_PORT, '4000')
    assert.deepEqual(process.env.ENV_HOST, '0.0.0.0')
  })

  test('env.get should pull values from cache (if exists)', ({ assert }) => {
    process.env.ENV_PORT = '4000'

    const env = new Env([])
    env.process()

    /**
     * No cache
     */
    assert.equal(env.get('ENV_PORT'), '4000')

    /**
     * Mutated value will be ignored and cache is used
     */
    process.env.ENV_PORT = '5000'
    assert.equal(env.get('ENV_PORT'), '4000')
  })

  test('validate values against the defined rules', ({ assert }) => {
    const env = new Env([
      {
        values: { ENV_PORT: 'foo' },
        overwriteExisting: false,
      },
    ])
    env.rules({ ENV_PORT: schema.number() })
    const fn = () => env.process()

    assert.throws(
      fn,
      'E_INVALID_ENV_VALUE: Value for environment variable "ENV_PORT" must be numeric'
    )
  })

  test('validate pre-existing values against the defined rules', ({ assert }) => {
    process.env.ENV_PORT = 'foo'
    const env = new Env([
      {
        values: { ENV_PORT: '3333' },
        overwriteExisting: false,
      },
    ])

    env.rules({ ENV_PORT: schema.number() })
    const fn = () => env.process()

    assert.throws(
      fn,
      'E_INVALID_ENV_VALUE: Value for environment variable "ENV_PORT" must be numeric'
    )
  })

  test('overwrite existing process.env value when "overwriteExisting = true"', ({ assert }) => {
    process.env.ENV_PORT = 'foo'
    const env = new Env([
      {
        values: { ENV_PORT: '3333' },
        overwriteExisting: true,
      },
    ])

    env.rules({ ENV_PORT: schema.number() })
    env.process()

    assert.deepEqual(env.get('ENV_PORT'), 3333)
  })

  test('validate pre-existing value when parsed value is missing', ({ assert }) => {
    process.env.ENV_PORT = 'foo'
    const env = new Env([])
    env.rules({ ENV_PORT: schema.number() })
    const fn = () => env.process()

    assert.throws(
      fn,
      'E_INVALID_ENV_VALUE: Value for environment variable "ENV_PORT" must be numeric'
    )
  })

  test('validate for non-existing value', ({ assert }) => {
    const env = new Env([])
    env.rules({ ENV_PORT: schema.number() })
    const fn = () => env.process()

    assert.throws(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "ENV_PORT"')
  })

  test('return mutated value when validation succeeds', ({ assert }) => {
    const env = new Env([
      {
        values: { ENV_PORT: '3333' },
        overwriteExisting: false,
      },
    ])
    env.rules({ ENV_PORT: schema.number() })
    env.process()

    assert.deepEqual(env.get('ENV_PORT'), 3333)
  })

  test('return mutated value when validation succeeds for pre-existing value', ({ assert }) => {
    process.env.ENV_PORT = '3333'
    const env = new Env([
      {
        values: { ENV_PORT: 'foo' },
        overwriteExisting: false,
      },
    ])
    env.rules({ ENV_PORT: schema.number() })
    env.process()

    assert.deepEqual(env.get('ENV_PORT'), 3333)
  })

  test('validate value when mutating using "env.set"', ({ assert }) => {
    process.env.ENV_PORT = '3333'
    const env = new Env([
      {
        values: { ENV_PORT: 'foo' },
        overwriteExisting: false,
      },
    ])

    env.rules({ ENV_PORT: schema.number() })
    env.process()

    assert.deepEqual(env.get('ENV_PORT'), 3333)

    const fn = () => env.set('ENV_PORT', 'foo')
    assert.throws(
      fn,
      'E_INVALID_ENV_VALUE: Value for environment variable "ENV_PORT" must be numeric'
    )
  })
})
