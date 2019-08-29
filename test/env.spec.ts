/*
* @poppinss/config
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../src/contracts.ts" />

import test from 'japa'
import { Env } from '../src/Env'

test.group('Env', (group) => {
  group.afterEach(async () => {
    delete process.env.ENV_SILENT
    delete process.env.loadDb
    delete process.env.ENV_PATH
    delete process.env.APP_USERNAME
  })

  test('parse env string', async (assert) => {
    const env = new Env()
    env.process(`
      APP_USERNAME = 'virk'
    `)

    assert.equal(env.get('APP_USERNAME'), 'virk')
  })

  test('do not overwrite existing process.env values', async (assert) => {
    process.env.APP_USERNAME = 'virk'

    const env = new Env()
    env.process(`
      APP_USERNAME = 'nikk'
    `)

    assert.equal(env.get('APP_USERNAME'), 'virk')
  })

  test('cast string true to boolean true', async (assert) => {
    const env = new Env()
    env.process(`loadDb=true`)
    assert.isTrue(env.get('loadDb'))
  })

  test('cast null string to null', async (assert) => {
    const env = new Env()
    env.process(`loadDb=null`)
    assert.isNull(env.get('loadDb'))
  })

  test('return undefined when value is missing', async (assert) => {
    const env = new Env()
    assert.isUndefined(env.get('loadDb'))
  })

  test('raise error when using getOrFail and value is undefined', async (assert) => {
    const env = new Env()
    const fn = () => env.getOrFail('loadDb')
    assert.throw(fn, 'E_MISSING_ENV_KEY: Make sure to define environment variable loadDb')
  })

  test('raise error when using getOrFail and value is not existy', async (assert) => {
    const env = new Env()
    env.process(`loadDb=null`)

    const fn = () => env.getOrFail('loadDb')
    assert.throw(fn, 'E_MISSING_ENV_KEY: Make sure to define environment variable loadDb')
  })

  test('do not raise error when using getOrFail and value is false', async (assert) => {
    const env = new Env()
    env.process(`loadDb=false`)
    assert.isFalse(env.getOrFail('loadDb'))
  })

  test('overwrite exsting env values', async (assert) => {
    const env = new Env()
    env.process(`APP_USERNAME=nikk`)
    env.process(`APP_USERNAME=virk`, true)
    assert.equal(env.get('APP_USERNAME'), 'virk')
  })

  test('update value inside process.env', async (assert) => {
    const env = new Env()
    env.set('loadDb', 'false')
    assert.isFalse(env.get('loadDb'))
  })

  test('interpolate values properly', async (assert) => {
    const env = new Env()
    process.env.USER = 'virk'

    env.process([
      'PORT=3333',
      'HOST=127.0.0.1',
      'URL=http://$HOST:$PORT',
      'PASSWORD=pa\\$\\$word',
      'PRICE=\\$2.99',
      'NEW_PRICE=2.99\\$',
      'REDIS_HOST=$HOST',
      'REDIS-USER=$USER',
      'REDIS_PASSWORD=$PASSWORD',
      'REDIS_URL=$REDIS_HOST://${REDIS-USER}@$REDIS_PASSWORD',
    ].join('\n'))

    assert.equal(env.get('PORT'), '3333')
    assert.equal(env.get('HOST'), '127.0.0.1')
    assert.equal(env.get('URL'), 'http://127.0.0.1:3333')
    assert.equal(env.get('PASSWORD'), 'pa\$\$word')
    assert.equal(env.get('PRICE'), '$2.99')
    assert.equal(env.get('NEW_PRICE'), '2.99$')
    assert.equal(env.get('REDIS_HOST'), '127.0.0.1')
    assert.equal(env.get('REDIS-USER'), 'virk')
    assert.equal(env.get('REDIS_PASSWORD'), 'pa\$\$word')
    assert.equal(env.get('REDIS_URL'), '127.0.0.1://virk@pa\$\$word')

    delete process.env['USER']
    delete process.env['PORT']
    delete process.env['HOST']
    delete process.env['URL']
    delete process.env['PASSWORD']
    delete process.env['PRICE']
    delete process.env['NEW_PRICE']
    delete process.env['REDIS_HOST']
    delete process.env['REDIS-USER']
    delete process.env['REDIS_PASSWORD']
    delete process.env['REDIS_URL']
  })

  test('interpolate when calling env.set', async (assert) => {
    const env = new Env()

    env.process([
      'PORT=3333',
      'HOST=127.0.0.1',
    ].join('\n'))

    assert.equal(env.get('PORT'), '3333')
    assert.equal(env.get('HOST'), '127.0.0.1')

    env.set('URL', 'http://$HOST:$PORT')
    assert.equal(env.get('URL'), 'http://127.0.0.1:3333')

    delete process.env['PORT']
    delete process.env['HOST']
    delete process.env['URL']
  })
})
