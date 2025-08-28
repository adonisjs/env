/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { type DotenvParseOutput } from 'dotenv'
import { EnvParser } from '../src/parser.ts'
import { readFile } from 'node:fs/promises'

test.group('Env Parser', () => {
  test('parse env string and interpolate values', async ({ assert, fs, expectTypeOf }) => {
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

    const parser = new EnvParser(envString, fs.baseUrl)
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

  test('define identifier', async ({ assert, fs, cleanup, expectTypeOf }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('uid')
    })

    EnvParser.defineIdentifier('uid', (_value: string) => {
      return '100'
    })

    const envString = ['ENV_USER=uid:romain'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: '100',
    })
  })

  test('throw exception when identifier is already defined', async ({ cleanup }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('uid')
    })

    EnvParser.defineIdentifier('uid', (_value: string) => {
      return '3000'
    })
    EnvParser.defineIdentifier('uid', (_value: string) => {
      return '3000'
    })
  }).throws('The identifier "uid" is already defined')

  test('silently ignore when adding the same identifier with IfMissing variant', async ({
    fs,
    assert,
    cleanup,
    expectTypeOf,
  }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('uid')
    })

    EnvParser.defineIdentifierIfMissing('uid', (_value: string) => {
      return '100'
    })

    EnvParser.defineIdentifierIfMissing('uid', (_value: string) => {
      return '200'
    })

    const envString = ['ENV_USER=uid:romain'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: '100',
    })
  })

  test('identifier is used only when complete value is matched', async ({
    fs,
    assert,
    cleanup,
    expectTypeOf,
  }) => {
    cleanup(() => {
      EnvParser.removeIdentifier('uid')
    })

    EnvParser.defineIdentifier('uid', (_value: string) => {
      return '3000'
    })

    const envString = ['ENV_USER=uid_v4:romain'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: 'uid_v4:romain',
    })
  })

  test('escape identifier', async ({ assert, fs, expectTypeOf }) => {
    const envString = ['ENV_USER=file\\:///root/app/user.js'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      ENV_USER: 'file:///root/app/user.js',
    })
  })

  test('give preference to the parsed values when interpolating values', async ({
    fs,
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl, { ignoreProcessEnv: true })

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'ENV_USER': 'romain',
      'REDIS-USER': 'romain',
    })
  })

  test('give preference to the existing process.env values when interpolating values', async ({
    fs,
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['ENV_USER=romain', 'REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'ENV_USER': 'virk',
      'REDIS-USER': 'virk',
    })
  })

  test('use process.env values during interpolation even when process.env is not preferred', async ({
    fs,
    assert,
    expectTypeOf,
    cleanup,
  }) => {
    process.env.ENV_USER = 'virk'
    cleanup(() => {
      delete process.env.ENV_USER
    })

    const envString = ['REDIS-USER=$ENV_USER'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)

    const parsed = await parser.parse()
    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      'REDIS-USER': 'virk',
    })
  })

  test('read file contents using the file identifier', async ({ assert, expectTypeOf }) => {
    const envString = ['PACKAGE_FILE=file:./package.json'].join('\n')
    const appRoot = new URL('../', import.meta.url)
    const parser = new EnvParser(envString, appRoot)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
    assert.deepEqual(parsed, {
      PACKAGE_FILE: await readFile(new URL('./package.json', appRoot), 'utf-8'),
    })
  })

  test('throw error when file is missing', async ({ fs, expectTypeOf }) => {
    const envString = ['PACKAGE_FILE=file:./package.json'].join('\n')
    const parser = new EnvParser(envString, fs.baseUrl)
    const parsed = await parser.parse()

    expectTypeOf(parsed).toEqualTypeOf<DotenvParseOutput>()
  }).throws(/Cannot process "PACKAGE_FILE" env variable./)
})
