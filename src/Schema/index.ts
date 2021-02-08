/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EnvSchema } from '@ioc:Adonis/Core/Env'
import { number } from './number'
import { string } from './string'
import { boolean } from './boolean'
import { oneOf } from './oneOf'

export const schema: EnvSchema = {
  number,
  string,
  boolean,
  enum: oneOf,
}
