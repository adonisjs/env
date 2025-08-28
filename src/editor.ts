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

import { EnvLoader } from './loader.ts'

/**
 * Environment editor for managing and modifying .env files.
 * Provides functionality to load, edit, and save environment configuration files.
 */
export class EnvEditor {
  /**
   * The application root directory URL
   */
  #appRoot: URL

  /**
   * Environment file loader instance
   */
  #loader: EnvLoader

  /**
   * Array of loaded environment files with their contents and paths
   */
  #files: { contents: string[]; path: string }[] = []

  /**
   * Creates an instance of env editor and loads .env files
   * contents.
   *
   * @param appRoot - The application root directory URL
   * @returns Promise resolving to an EnvEditor instance
   */
  static async create(appRoot: URL): Promise<EnvEditor> {
    const editor = new EnvEditor(appRoot)
    await editor.load()

    return editor
  }

  /**
   * Constructs a new EnvEditor instance
   *
   * @param appRoot - The application root directory URL
   */
  constructor(appRoot: URL) {
    this.#appRoot = appRoot
    this.#loader = new EnvLoader(this.#appRoot, true)
  }

  /**
   * Loads .env files for editing. Only ".env" and ".env.example"
   * files are picked for editing.
   *
   * @returns Promise that resolves when files are loaded
   */
  async load(): Promise<void> {
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
   *
   * @param key - The environment variable key
   * @param value - The environment variable value
   * @param withEmptyExampleValue - Whether to add empty value to .env.example file
   */
  add(key: string, value: string | number | boolean, withEmptyExampleValue = false): void {
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

  /**
   * Returns the loaded files as JSON
   *
   * @returns Array of file objects with contents and paths
   */
  toJSON(): { contents: string[]; path: string }[] {
    return this.#files
  }

  /**
   * Save changes to the disk
   *
   * @returns Promise that resolves when files are saved
   */
  async save(): Promise<void> {
    await Promise.all(
      this.#files.map((file) => {
        return writeFile(file.path, file.contents.join('\n'))
      })
    )
  }
}
