import Env, { schema } from '@ioc:Adonis/Core/Env'
const values = Env.rules({
	PORT: schema.number(),
	HOST: schema.string(),
	CACHE_VIEWS: schema.boolean(),
	AUTH_GUARD: schema.enum(['name', 'fii', 'sda'] as const),
})

console.log(values)
