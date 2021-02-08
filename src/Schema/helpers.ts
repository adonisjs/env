/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

/**
 * Following values are considered as "true"
 */
export const BOOLEAN_POSITIVES = ['1', 1, 'true', true]

/**
 * Following values are considered as "false"
 */
export const BOOLEAN_NEGATIVES = ['0', 0, 'false', false]

/**
 * Ensures the value to exist
 */
export function ensureValue(
  key: string,
  value?: string,
  message?: string
): asserts value is string {
  if (!value) {
    throw new Exception(
      message || `Missing environment variable "${key}"`,
      500,
      'E_MISSING_ENV_VALUE'
    )
  }
}
