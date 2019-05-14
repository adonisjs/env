/*
* @poppinss/config
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="./src/contracts.ts" />
export { EnvContract } from '@poppinss/env/contracts'
import { Env } from './src/Env'

/**
 * Returns a singleton of `env` as named `Env` export.
 */
export const env = new Env()
