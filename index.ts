/*
* @poppinss/config
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Env } from './src/Env'
export { EnvContract } from './src/contracts'

/**
 * Returns a singleton of `env` as named `Env` export.
 */
export const env = new Env()
