/*
* @adonisjs/env
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { readFileSync } from 'fs'
import { isAbsolute, join } from 'path'
import { Exception } from '@poppinss/utils'

/**
 * Loads file from the disk and optionally ignores the missing
 * file errors
 */
function loadFile (filePath: string, optional: boolean = false): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }

    if (!optional) {
      throw new Exception(`The ${filePath} file is missing`, 500, 'E_MISSING_ENV_FILE')
    }
  }

  return ''
}

/**
 * Reads `.env` file contents
 */
export function envLoader (appRoot: string): { envContents: string, testEnvContent: string } {
  const envPath = process.env.ENV_PATH || '.env'
  const absPath = isAbsolute(envPath) ? envPath : join(appRoot, envPath)

  const envContents = loadFile(absPath, process.env.ENV_SILENT === 'true')

  /**
   * Optionally load an alternate environment 
   * .env.testing or .env.development (or any other) for example,
   * if specified by NODE_ENV
   */
  let testEnvContent = ''
  let envFile = ''
  if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== '') {
    envFile = '.env.' + process.env.NODE_ENV
    testEnvContent = loadFile(join(appRoot, envFile), true)
  }

  return { testEnvContent, envContents }
}
