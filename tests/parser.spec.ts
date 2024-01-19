/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { DotenvParseOutput } from 'dotenv'
import { EnvParser } from '../src/parser.js'

test.group('Env Parser', () => {
  test('parse env string and interpolate values', async ({ assert, expectTypeOf }) => {
    const envString = [
      'PORT=3333',
      'HOST=127.0.0.1',
      'URL=http://$HOST:$PORT',
      'PASSWORD=pa\\$\\$word', // back to back escape sequence
      'SINGLE_ESCAPE=java\\$cript', // single escape sequence in between
      'PRICE=\\$2.99', // escape sequence at beginning
      'NEW_PRICE=2.99\\$', // escape sequence at the end
      'REDIS_HOST=$HOST',
      'REDIS-USER=virk',
      'REDIS_PASSWORD=$PASSWORD',
      'EMPTY_VALUE=',
      'INVALID_VAR_REF=${FOO',
      `KEY="--BEGIN CERTIFICATE--
      --END CERTIFICATE--"`,
      'REDIS_URL=$REDIS_HOST://${REDIS-USER}@$REDIS_PASSWORD',
    ].join('\n')

    const parser = new EnvParser(envString)
    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'PORT': '3333',
      'HOST': '127.0.0.1',
      'URL': 'http://127.0.0.1:3333',
      'PASSWORD': 'pa$$word',
      'SINGLE_ESCAPE': 'java$cript',
      'PRICE': '$2.99',
      'NEW_PRICE': '2.99$',
      'REDIS_HOST': '127.0.0.1',
      'EMPTY_VALUE': '',
      'REDIS-USER': 'virk',
      'REDIS_PASSWORD': 'pa$$word',
      'INVALID_VAR_REF': '{FOO',
      'KEY': `--BEGIN CERTIFICATE--
      --END CERTIFICATE--`,
      'REDIS_URL': '127.0.0.1://virk@pa$$word',
    })
  })

  test('define identifier', async ({ assert, cleanup, expectTypeOf }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('file')
    })

    EnvParser.identifier('file', (_value: string) => {
      return '3000'
    })

    const envString = ['ENV_USER=file:romain'].join('\n')
    const parser = new EnvParser(envString)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: '3000',
    })
  })

  test('identifier is used only when complete value is matched', async ({
    assert,
    cleanup,
    expectTypeOf,
  }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('file')
    })

    EnvParser.identifier('file', (_value: string) => {
      return '3000'
    })

    const envString = ['ENV_USER=file_romain:romain'].join('\n')
    const parser = new EnvParser(envString)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: 'file_romain:romain',
    })
  })

  test('throw when identifier is already defined', async ({ assert, cleanup }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('file')
    })

    EnvParser.identifier('file', (_value: string) => 'test')

    assert.throws(
      () => EnvParser.identifier('file', (_value: string) => 'test'),
      'The identifier "file" is already defined'
    )
  })

  test('give preference to the parsed values when interpolating values', async ({
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString, { ignoreProcessEnv: true })

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'ENV_USER': 'romain',
      'REDIS-USER': 'romain',
    })
  })

  test('give preference to the existing process.env values when interpolating values', async ({
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString)

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'ENV_USER': 'virk',
      'REDIS-USER': 'virk',
    })
  })

  test('use process.env values during interpolation even when process.env is not preferred', async ({
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString)

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'REDIS-USER': 'virk',
    })
  })
})
