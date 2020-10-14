/*
 * @adonisjs/env
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { schema } from '../src/Schema'

test.group('schema | number', () => {
	test('raise error when value is missing', (assert) => {
		const fn = () => schema.number()('PORT')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "PORT"')
	})

	test('raise error when value is not a valid number', (assert) => {
		const fn = () => schema.number()('PORT', 'foo')
		assert.throw(fn, 'E_INVALID_ENV_VALUE: Value for environment variable "PORT" must be numeric')
	})

	test('raise error when value is an empty string', (assert) => {
		const fn = () => schema.number()('PORT', '')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "PORT"')
	})

	test('cast string representation of number to a number', (assert) => {
		assert.deepEqual(schema.number()('PORT', '22'), 22)
	})

	test('cast float representation of number to a number', (assert) => {
		assert.deepEqual(schema.number()('PORT', '22.198'), 22.198)
	})

	test('cast unsigned representation of number to a number', (assert) => {
		assert.deepEqual(schema.number()('PORT', '-22.198'), -22.198)
	})
})

test.group('schema | number.optional', () => {
	test('return undefined when value is missing', (assert) => {
		assert.deepEqual(schema.number.optional()('PORT'), undefined)
	})

	test('raise error when value is not a valid number', (assert) => {
		const fn = () => schema.number.optional()('PORT', 'foo')
		assert.throw(fn, 'E_INVALID_ENV_VALUE: Value for environment variable "PORT" must be numeric')
	})

	test('return undefined when value is an empty string', (assert) => {
		assert.deepEqual(schema.number.optional()('PORT', ''), undefined)
	})

	test('cast string representation of number to a number', (assert) => {
		assert.deepEqual(schema.number.optional()('PORT', '22'), 22)
	})

	test('cast float representation of number to a number', (assert) => {
		assert.deepEqual(schema.number.optional()('PORT', '22.198'), 22.198)
	})

	test('cast unsigned representation of number to a number', (assert) => {
		assert.deepEqual(schema.number.optional()('PORT', '-22.198'), -22.198)
	})
})

test.group('schema | string', () => {
	test('raise error when value is missing', (assert) => {
		const fn = () => schema.string()('PORT')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "PORT"')
	})

	test('return string value as it is', (assert) => {
		assert.deepEqual(schema.string()('PORT', '-22.198'), '-22.198')
	})
})

test.group('schema | string.optional', () => {
	test('return undefined when value is missing', (assert) => {
		assert.deepEqual(schema.string.optional()('PORT'), undefined)
	})

	test('return string value as it is', (assert) => {
		assert.deepEqual(schema.string.optional()('PORT', '-22.198'), '-22.198')
	})

	test('validate value as an email', (assert) => {
		const fn = () => schema.string({ format: 'email' })('FROM_EMAIL', 'foo')
		assert.throw(fn, 'Value for environment variable "FROM_EMAIL" must be a valid email')
		assert.equal(schema.string({ format: 'email' })('FROM_EMAIL', 'foo@bar.com'), 'foo@bar.com')
	})

	test('validate value as an host', (assert) => {
		const fn = () => schema.string({ format: 'host' })('HOST', 'foo:bar')
		assert.throw(fn, 'Value for environment variable "HOST" must be a valid (domain or ip)')
		assert.equal(schema.string({ format: 'host' })('HOST', 'localhost'), 'localhost')
		assert.equal(schema.string({ format: 'host' })('HOST', '127.0.0.1'), '127.0.0.1')
		assert.equal(schema.string({ format: 'host' })('HOST', 'adonisjs.dev'), 'adonisjs.dev')
	})

	test('validate value as a url', (assert) => {
		const fn = () => schema.string({ format: 'url' })('MAILGUN_URL', 'foo')
		assert.throw(fn, 'Value for environment variable "MAILGUN_URL" must be a valid URL')
		assert.equal(
			schema.string({ format: 'url' })('MAILGUN_URL', 'https://api.mailgun.net/v1'),
			'https://api.mailgun.net/v1'
		)
	})
})

test.group('schema | boolean', () => {
	test('raise error when value is missing', (assert) => {
		const fn = () => schema.boolean()('CACHE_VIEWS')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "CACHE_VIEWS"')
	})

	test('raise error when value is not a valid boolean', (assert) => {
		const fn = () => schema.boolean()('CACHE_VIEWS', 'foo')
		assert.throw(
			fn,
			'E_INVALID_ENV_VALUE: Value for environment variable "CACHE_VIEWS" must be a boolean'
		)
	})

	test('raise error when value is an empty string', (assert) => {
		const fn = () => schema.boolean()('CACHE_VIEWS', '')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "CACHE_VIEWS"')
	})

	test('cast "true" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean()('PORT', 'true'), true)
	})

	test('cast "false" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean()('PORT', 'false'), false)
	})

	test('cast "1" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean()('PORT', '1'), true)
	})

	test('cast "0" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean()('PORT', '0'), false)
	})
})

test.group('schema | boolean.optional', () => {
	test('return undefined when value is missing', (assert) => {
		assert.deepEqual(schema.boolean.optional()('CACHE_VIEWS'), undefined)
	})

	test('raise error when value is not a valid boolean', (assert) => {
		const fn = () => schema.boolean.optional()('CACHE_VIEWS', 'foo')
		assert.throw(
			fn,
			'E_INVALID_ENV_VALUE: Value for environment variable "CACHE_VIEWS" must be a boolean'
		)
	})

	test('return undefined when value is an empty string', (assert) => {
		assert.deepEqual(schema.boolean.optional()('CACHE_VIEWS', ''), undefined)
	})

	test('cast "true" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean.optional()('PORT', 'true'), true)
	})

	test('cast "false" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean.optional()('PORT', 'false'), false)
	})

	test('cast "1" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean.optional()('PORT', '1'), true)
	})

	test('cast "0" to a boolean', (assert) => {
		assert.deepEqual(schema.boolean.optional()('PORT', '0'), false)
	})
})

test.group('schema | enum', () => {
	test('raise error when value is missing', (assert) => {
		const fn = () => schema.enum(['api', 'web'])('AUTH_GUARD')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "AUTH_GUARD"')
	})

	test('raise error when value is not one of the defined options', (assert) => {
		const fn = () => schema.enum(['api', 'web'])('AUTH_GUARD', 'foo')
		assert.throw(fn, 'Value for environment variable "AUTH_GUARD" must be one of "api,web"')
	})

	test('raise error when value is an empty string', (assert) => {
		const fn = () => schema.enum(['api', 'web'])('AUTH_GUARD')
		assert.throw(fn, 'E_MISSING_ENV_VALUE: Missing environment variable "AUTH_GUARD"')
	})

	test('return value when it is in one of the defined choices', (assert) => {
		assert.deepEqual(schema.enum(['api', 'web'] as const)('AUTH_GUARD', 'web'), 'web')
	})

	test('cast string representation of boolean', (assert) => {
		assert.deepEqual(schema.enum([true, false] as const)('AUTH_GUARD', 'true'), true)
	})

	test('cast string representation of number', (assert) => {
		assert.deepEqual(schema.enum([10, 40, 60] as const)('AUTH_GUARD', '40'), 40)
	})

	test('cast string representation of float', (assert) => {
		assert.deepEqual(schema.enum([10, 40.22, 60.01] as const)('AUTH_GUARD', '60.010'), 60.01)
	})
})
