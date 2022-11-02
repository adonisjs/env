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
import { EnvLoader, EnvParser } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)
const envFiles = await loader.load()

const envParser = new EnvParser(`
  PORT=3000
  HOST=localhost
`)

console.log(envParser.parse()) // { PORT: '3000', HOST: 'localhost' }
```

The return value of `parser.parse` is an object with key-value pair. The parser also has support for interpolation.

By default, the parser prefers existing `process.env` values when they exist. However, you can instruct the parser to ignore existing `process.env` files as follows.

```ts
new EnvParser(envContents, { ignoreProcessEnv: true })
```

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

> **Note**: Existing `process.env` variables have the top most priority over the variables defined in any of the files.

```ts
import { EnvLoader, EnvParser, Env } from '@adonisjs/env'

const lookupPath = new URL('./', import.meta.url)
const loader = new EnvLoader(lookupPath)
const envFiles = await loader.load()

let envValues = {}

envFiles.forEach(({ contents }) => {
  if (!contents.trim()) {
    return
  }

  const values = new EnvParser(contents).parse()
  Object.keys(values).forEach((key) => {
    let value = process.env[key]

    if (!value) {
      value = values[key]
      process.env[key] = values[key]
    }

    if (!envValues[key]) {
      envValues[key] = value
    }
  })
})

// Now perform the validation
const validate = Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' })
})

const validated = validate(envValues)
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
