# @adonisjs/env
> Environment variables parser and validator used by the AdonisJS.

[![gh-workflow-image]][gh-workflow-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

> **Note:** This package is framework agnostic and can also be used outside of AdonisJS.

The `@adonisjs/env` package encapsulates the workflow around loading, parsing, and validating environment variables.

## Setup
Install the package from the npm packages registry as follows.

```sh
npm i @adonisjs/env
```

## EnvLoader
The `EnvLoader` class is responsible for loading the environment variable files from the disk and returning their contents as a string.

```ts
import { EnvLoader } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)

const envFiles = await loader.load()
```

The return value is an array of objects with following properties.

- `path`: The path to the loaded dot-env file.
- `contents`: The contents of the file.

Following is the list of loaded files. The array is ordered by the priority of the files. The first file has the highest priority and must override the variables from the last file.

| Priority | File name | Environment | Should I `.gitignore` it | Notes |
|----------|-----------|-------------|--------------------------|-------|
| 1st | `.env.[NODE_ENV].local` | Current environment | Yes | Loaded when `NODE_ENV` is set |
| 2nd | `.env.local` | All | Yes | Loaded in all the environments except `test` or `testing` environments |
| 3rd | `.env.[NODE_ENV]` | Current environment | No | Loaded when `NODE_ENV` is set |
| 4th | `.env` | All | Depends | Loaded in all the environments. You should `.gitignore` it when storing secrets in this file |

## EnvParser
The `EnvParser` class is responsible for parsing the contents of the `.env` file(s) and converting them into an object.

```ts
import { EnvParser } from '@adonisjs/env'
const envParser = new EnvParser(`
  PORT=3000
  HOST=localhost
`)

console.log(await envParser.parse()) // { PORT: '3000', HOST: 'localhost' }
```

The return value of `parser.parse` is an object with key-value pair. The parser also has support for interpolation.

By default, the parser prefers existing `process.env` values when they exist. However, you can instruct the parser to ignore existing `process.env` files as follows.

```ts
new EnvParser(envContents, { ignoreProcessEnv: true })
```

### Identifier

You can define an "identifier" to be used for interpolation. The identifier is a string that prefix the environment variable value and let you customize the value resolution.

```ts
import { readFile } from 'node:fs/promises'
import { EnvParser } from '@adonisjs/env'

EnvParser.identifier('file', (value) => {
  return readFile(value, 'utf-8')
})

const envParser = new EnvParser(`
  DB_PASSWORD=file:/run/secret/db_password
`)

console.log(await envParser.parse()) // { DB_PASSWORD: 'Value from file /run/secret/db_password' }
```

This can be useful when you are using secrets manager like `Docker Secret`, `HashiCorp Vault`, `Google Secrets Manager` and others to manage your secrets.

## Validating environment variables
Once you have the parsed objects, you can optionally validate them against a pre-defined schema. We recommend validation for the following reasons.

- Fail early if one or more environment variables are missing.
- Cast values to specific data types. 
- Have type safety alongside runtime safety.

```ts
import { Env } from '@adonisjs/env'

const validator = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' })
})
```

The `Env.schema` is a reference to the [@poppinss/validator-lite](https://github.com/poppinss/validator-lite) `schema` object. Make sure to go through the package README to view all the available methods and options.

The `Env.rules` method returns an instance of the validator to validate the environment variables. The return value is the validated object with type information inferred from the schema.

```ts
validator.validate(process.env)
```

## Complete example

Following is a complete example of loading dot-env files and validating them in one go.

> **Note**: Existing `process.env` variables have the top most priority over the variables defined in any of the files.

```ts
import { Env } from '@adonisjs/env'

const env = await Env.create(new URL('./', import.meta.url), {
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' })
})

env.get('PORT') // is a number
env.get('HOST') // is a string
env.get('NODE_ENV') // is unknown, hence a string or undefined
```

## Env editor
The Env editor can be used to edit dot-env files and persist changes on disk. Only the `.env` and `.env.example` files are updated (if exists).

```ts
import { EnvEditor } from '@adonisjs/env/editor'

const editor = await EnvEditor.create(new URL('./', import.meta.url))
editor.add('PORT', 3000)
editor.add('HOST', 'localhost')

// Write changes on disk
await editor.save()
```

You can also insert an empty value for the `.env.example` file by setting the last argument to `true`.

```ts
editor.add('SECRET_VARIABLE', 'secret-value', true)
```

This will add the following line to the `.env.example` file.

```env
SECRET_VARIABLE=
```

## Known Exceptions

### E_INVALID_ENV_VARIABLES
The exception is raised during environment variables validation exception. The exception is raised with `Validation failed for one or more environment variables` message.

You can access the detailed error messages using the `error.cause` property.

```ts
try {
  validate(envValues)
} catch (error) {
  console.log(error.cause)
}
```

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/adonisjs/env/checks.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/env/actions/workflows/checks.yml "Github action"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/env.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/env "npm"

[license-image]: https://img.shields.io/npm/l/@adonisjs/env?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
