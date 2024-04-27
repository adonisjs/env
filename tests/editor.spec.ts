/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { test } from '@japa/runner'

import { EnvEditor } from '../src/editor.js'

test.group('Env editor | files to modify', () => {
  test('add key-value pair to dot-env files', async ({ assert, fs }) => {
    await fs.create('.env', '')
    await fs.create('.env.example', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['', 'PORT=3000'],
      },
      {
        path: join(fs.basePath, '.env.example'),
        contents: ['', 'PORT=3000'],
      },
    ])
  })

  test('do not modify non-existing file', async ({ assert, fs }) => {
    await fs.create('.env', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['', 'PORT=3000'],
      },
    ])
  })

  test('do not modify files other than .env and .env.example', async ({ assert, fs }) => {
    await fs.create('.env', '')
    await fs.create('.env.local', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['', 'PORT=3000'],
      },
    ])
  })
})

test.group('Env editor | modify', () => {
  test('update existing key value pair', async ({ assert, fs }) => {
    await fs.create('.env', 'PORT=3333')
    await fs.create('.env.example', 'PORT=4000')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['PORT=3000'],
      },
      {
        path: join(fs.basePath, '.env.example'),
        contents: ['PORT=3000'],
      },
    ])
  })

  test('update in one file and add in another file', async ({ assert, fs }) => {
    await fs.create('.env', ['PORT=3333', '', 'HOST=localhost'].join('\n'))
    await fs.create('.env.example', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['PORT=3000', '', 'HOST=localhost'],
      },
      {
        path: join(fs.basePath, '.env.example'),
        contents: ['', 'PORT=3000'],
      },
    ])
  })

  test('persist changes on disk', async ({ assert, fs }) => {
    await fs.create('.env', ['PORT=3333', '', 'HOST=localhost'].join('\n'))
    await fs.create('.env.example', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000)
    await editor.save()

    await assert.fileEquals('.env', ['PORT=3000', '', 'HOST=localhost'].join('\n'))
    await assert.fileEquals('.env.example', ['', 'PORT=3000'].join('\n'))
  })

  test('multiple times persist changes on disk', async ({ assert, fs }) => {
    await fs.create('.env', ['PORT=3333', '', 'HOST=localhost'].join('\n'))
    await fs.create('.env.example', '')

    const editor = await EnvEditor.create(fs.baseUrl)

    editor.add('PORT', 3000)
    await editor.save()
    await assert.fileEquals('.env', ['PORT=3000', '', 'HOST=localhost'].join('\n'))
    await assert.fileEquals('.env.example', ['', 'PORT=3000'].join('\n'))

    editor.add('HOST', '127.0.0.1')
    await editor.save()
    await assert.fileEquals('.env', ['PORT=3000', '', 'HOST=127.0.0.1'].join('\n'))
    await assert.fileEquals('.env.example', ['', 'PORT=3000', 'HOST=127.0.0.1'].join('\n'))
  })

  test('add key with empty example value', async ({ assert, fs }) => {
    await fs.create('.env', '')
    await fs.create('.env.example', '')

    const editor = await EnvEditor.create(fs.baseUrl)
    editor.add('PORT', 3000, true)

    assert.deepEqual(editor.toJSON(), [
      {
        path: join(fs.basePath, '.env'),
        contents: ['', 'PORT=3000'],
      },
      {
        path: join(fs.basePath, '.env.example'),
        contents: ['', 'PORT='],
      },
    ])
  })
})
