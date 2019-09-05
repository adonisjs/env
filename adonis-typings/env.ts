/**
 * @module @adonisjs/env
 */

 /*
* @adonisjs/env
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

declare module '@ioc:Adonis/Core/Env' {
  export interface EnvContract {
    process (envString: string, overwrite?: boolean): void
    get (key: string, defaultValue?: any): string | boolean | null | undefined
    getOrFail (key: string, defaultValue?: any): string | boolean
    set (key: string, value: string): void
  }

  const Env: EnvContract
  export default Env
}
