/*
* @poppinss/config
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../src/contracts.ts" />

declare module '@ioc:Adonis/Src/Env' {
  import { EnvContract as BaseContract } from '@poppinss/env/contracts'
  export interface EnvContract extends BaseContract {}

  const Env: EnvContract
  export default Env
}
