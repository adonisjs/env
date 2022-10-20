/*
 * @adonisjs/env
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '../src/env.js'

const validator = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string(),
  CACHE_VIEWS: Env.schema.boolean(),
})

const validatedValues = validator(process.env)
const env = new Env(validatedValues)

console.log(env.get('PORT'))
console.log(env.get('HOST'))
console.log(env.get('CACHE_VIEWS'))
