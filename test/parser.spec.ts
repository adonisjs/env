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
      'REDIS_URL=$REDIS_HOST://${REDIS-USER}@$REDIS_PASSWORD',
    ].join('\n')

    const parser = new EnvParser(envString)
    const parsed = parser.parse()
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
      'REDIS-USER': 'virk',
      'REDIS_PASSWORD': 'pa$$word',
      'REDIS_URL': '127.0.0.1://virk@pa$$word',
    })
  })

  test('give preference to the parsed values when interpolating values', async ({
    assert,
    expectTypeOf,
  }) => {
    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString)

    const parsed = parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'ENV_USER': 'romain',
      'REDIS-USER': 'romain',
    })
  })
})
