/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

/**
 * Exception raised when one or more env variables
 * are invalid
 */
export const E_INVALID_ENV_VARIABLES = class EnvValidationException extends Exception {
  static message = 'Validation failed for one or more environment variables'
  static code = 'E_INVALID_ENV_VARIABLES'
  help: string = ''
}
