/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

export class MissingEnvPathFileException extends Exception {
  static status = 500
  static code = 'E_MISSING_ENV_PATH_FILE'
}
