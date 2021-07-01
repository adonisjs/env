/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { EnvParser } from '../src/Parser'

test.group('Env Parser', (group) => {
  group.afterEach(() => {
    delete process.env.ENV_USER
  })

  test('parse env string and interpolate values', async (assert) => {
    const parser = new EnvParser()
    process.env.ENV_USER = 'virk'

    const envString = [
      'PORT=3333',
      'HOST=127.0.0.1',
      'URL=http://$HOST:$PORT',
      'PASSWORD=pa\\$\\$word', // back to back escape sequence
      'SINGLE_ESCAPE=java\\$cript', // single escape sequence in between
      'PRICE=\\$2.99', // escape sequence at beginning
      'NEW_PRICE=2.99\\$', // escape sequence at the end
      'REDIS_HOST=$HOST',
      'REDIS-USER=$ENV_USER',
      'REDIS_PASSWORD=$PASSWORD',
      'REDIS_URL=$REDIS_HOST://${REDIS-USER}@$REDIS_PASSWORD',
    ].join('\n')

    const parsed = parser.parse(envString)
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

  test('give preference to the parsed values when interpolating values', async (assert) => {
    const parser = new EnvParser(false)
    process.env.ENV_USER = 'virk'

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')

    const parsed = parser.parse(envString)
    assert.deepEqual(parsed, {
      'ENV_USER': 'romain',
      'REDIS-USER': 'romain',
    })
  })

  test('give preference to the existing env values when interpolating values', async (assert) => {
    const parser = new EnvParser(true)
    process.env.ENV_USER = 'virk'

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')

    const parsed = parser.parse(envString)
    assert.deepEqual(parsed, {
      'ENV_USER': 'romain',
      'REDIS-USER': 'virk',
    })
  })
})
