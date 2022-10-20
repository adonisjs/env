# @adonisjs/env
> Environment variables parser and validator used by the AdonisJS.

[![gh-workflow-image]][gh-workflow-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url] [![synk-image]][synk-url]

> **Note:** This package is framework agnostic and can also be used outside of AdonisJS.

The `@adonisjs/env` package encapsulates the workflow around loading, parsing, and validating environment variables.

## Setup
Install the package from the npm packages registry as follows.

```sh
npm i @adonisjs/env

yarn add @adonisjs/env
```

## EnvLoader
The `EnvLoader` class is responsible for loading the environment variable files from the disk and returning their contents as a string.

```ts
import { EnvLoader } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)

const { envContents, currentEnvContents } = loader.load()
```

### `envContents`

- The `envContents` is read from the `.env` file from the root of the `lookupPath`.
- No exceptions are raised if the `.env` file is missing. In brief, it is optional to have a `.env` file.
- If the `ENV_PATH` environment variable is set, the loader will use that instead of the `.env` file. This allows overwriting the location of the dot-env file.


### `currentEnvContents`

- The `currentEnvContents` contents are read from the `.env.[NODE_ENV]` file. 
- If the current `NODE_ENV = 'development'`, then the contents of this variable will be from the `.env.development` file and so on.
- The contents of this file should precede the `.env` file.

## EnvParser
The `EnvParser` class is responsible for parsing the contents of the `.env` file(s) and converting them into an object.

```ts
import { EnvLoader, EnvParser } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)
const { envContents, currentEnvContents } = loader.load()

const envParser = new EnvParser(envContents)
const currentEnvParser = new EnvParser(currentEnvContents)

console.log(envParser.parse()) // { key: value }
console.log(currentEnvParser.parse()) // { key: value }
```

The return value of `parser.parse` is an object with key-value pair. The parser also has support for interpolation.

## Validating environment variables
Once you have the parsed objects, you can optionally validate them against a pre-defined schema. We recommend validation for the following reasons.

- Fail early if one or more environment variables are missing.
- Cast values to specific data types. 
- Have type safety alongside runtime safety.

```ts
import { Env } from '@adonisjs/env'

const validate = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' })
})
```

The `Env.schema` is a reference to the [@poppinss/validator-lite](https://github.com/poppinss/validator-lite) `schema` object. Make sure to go through the package README to view all the available methods and options.

The `Env.rules` method returns a function to validate the environment variables. The return value is the validated object with type information inferred from the schema.

```ts
validate(process.env)
```

Following is a complete example of using the `EnvLoader`, `EnvParser`, and the validator to set up environment variables.

```ts
import { EnvLoader, EnvParser, Env } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)
const { envContents, currentEnvContents } = loader.load()

const envValues = new EnvParser(envContents).parse()
const currentEnvValues = new EnvParser(currentEnvContents).parse()

/**
 * Loop over all the parsed env values and set
 * them on "process.env"
 * 
 * However, if the value already exists on "process.env", then
 * do not overwrite it, instead update the envValues
 * object.
 */
Object.keys(envValues).forEach((key) => {
  if (process.env[key]) {
    envValues[key] = process.env[key]
  } else {
    process.env[key] = envValues[key]
  }
})

/**
 * Loop over all the current env parsed values and make
 * them take precedence over the existing process.env
 * values.
 */
Object.keys(currentEnvValues).forEach((key) => {
  process.env[key] = envValues[key]
})

// Now perform the validation
const validate = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' })
})

const validated = validate({ ...envValues, ...currentEnvValues })
const env = new Env(validated)

env.get('PORT') // is a number
env.get('HOST') // is a string
env.get('NODE_ENV') // is unknown, hence a string or undefined
```

The above code may seem like a lot of work to set up environment variables. However, you have fine-grained control over each step. In the case of AdonisJS, all this boilerplate is hidden inside the framework's application bootstrapping logic.

[gh-workflow-image]: https://img.shields.io/github/workflow/status/adonisjs/env/test?style=for-the-badge
[gh-workflow-url]: https://github.com/adonisjs/env/actions/workflows/test.yml "Github action"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/env.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/env "npm"

[license-image]: https://img.shields.io/npm/l/@adonisjs/env?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[synk-image]: https://img.shields.io/snyk/vulnerabilities/github/adonisjs/env?label=Synk%20Vulnerabilities&style=for-the-badge
[synk-url]: https://snyk.io/test/github/adonisjs/env?targetFile=package.json "synk"
