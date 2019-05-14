/*
* @poppinss/config
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../src/contracts.ts" />

import * as test from 'japa'
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
})
