/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class InvalidEnvVariablesException extends Exception {
  static status = 500
  static code = 'E_INVALID_ENV_VARIABLES'
  static message = 'Validation failed for one or more environment variables'
}
