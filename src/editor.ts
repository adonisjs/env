/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import splitLines from 'split-lines'
import lodash from '@poppinss/utils/lodash'
import { writeFile } from 'node:fs/promises'

import { EnvLoader } from './loader.js'

export class EnvEditor {
  #appRoot: URL
  #loader: EnvLoader
  #files: { contents: string[]; path: string }[] = []

  /**
   * Creates an instance of env editor and loads .env files
   * contents.
   */
  static async create(appRoot: URL) {
    const editor = new EnvEditor(appRoot)
    await editor.load()

    return editor
  }

  constructor(appRoot: URL) {
    this.#appRoot = appRoot
    this.#loader = new EnvLoader(this.#appRoot, true)
  }

  /**
   * Loads .env files for editing. Only ".env" and ".env.example"
   * files are picked for editing.
   */
  async load() {
    const envFiles = await this.#loader.load()

    this.#files = envFiles
      .filter(
        (envFile) =>
          envFile.fileExists &&
          (envFile.path.endsWith('.env') || envFile.path.endsWith('.env.example'))
      )
      .map((envFile) => {
        return {
          contents: splitLines(envFile.contents.trim()),
          path: envFile.path,
        }
      })
  }

  /**
   * Add key-value pair to the dot-env files.
   * If `withEmptyExampleValue` is true then the key will be added with an empty value
   * to the `.env.example` file.
   */
  add(key: string, value: string | number | boolean, withEmptyExampleValue = false) {
    this.#files.forEach((file) => {
      let entryIndex = file.contents.findIndex((line) => line.startsWith(`${key}=`))

      entryIndex = entryIndex === -1 ? file.contents.length : entryIndex

      if (withEmptyExampleValue && file.path.endsWith('.env.example')) {
        lodash.set(file.contents, entryIndex, `${key}=`)
      } else {
        lodash.set(file.contents, entryIndex, `${key}=${value}`)
      }
    })
  }

  toJSON() {
    return this.#files
  }

  /**
   * Save changes to the disk
   */
  async save() {
    await Promise.all(
      this.#files.map((file) => {
        return writeFile(file.path, file.contents.join('\n'))
      })
    )
  }
}
