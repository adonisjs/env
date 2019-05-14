[@poppinss/env](../README.md) > [@poppinss/env](../modules/_poppinss_env.md) > [Env](../classes/_poppinss_env.env.md)

# Class: Env

The ENV module enables the use of environment variables by loading different `.env` files. In development and production, the module will look for `.env` file inside the project root and during testing, it will merging the values from `.env.testing` file (if exists).

If `.env` file is missing, an hard exception will be raised and to turn off exceptions, you must define `ENV_SILENT` environment variable.

```bash
ENV_SILENT=true node server.js
```

To load `.env` file from a different location, you must define `ENV_PATH` environment variable.

**Note: There is no way to override the `.env.testing` file path.**

```bash
ENV_PATH=/var/secrets/.env node server.js
```

## Hierarchy

**Env**

## Implements

* `EnvContract`

## Index

### Methods

* [_castValue](_poppinss_env.env.md#_castvalue)
* [get](_poppinss_env.env.md#get)
* [getOrFail](_poppinss_env.env.md#getorfail)
* [process](_poppinss_env.env.md#process)
* [set](_poppinss_env.env.md#set)

---

## Methods

<a id="_castvalue"></a>

### `<Private>` _castValue

▸ **_castValue**(value: *`string`*): `string` \| `boolean` \| `null` \| `undefined`

Casts the string value to their native data type counter parts. Only done for `booleans` and `nulls`.

**Parameters:**

| Name | Type |
| ------ | ------ |
| value | `string` |

**Returns:** `string` \| `boolean` \| `null` \| `undefined`

___
<a id="get"></a>

###  get

▸ **get**(key: *`string`*, defaultValue?: *`any`*): `string` \| `boolean` \| `null` \| `undefined`

Get value for a key from the process.env. Since `process.env` object stores all values as strings, this method will cast them to their counterpart datatypes.

Value

Casted value

'true'

true

'1'

true

'false'

false

'0'

false

'null'

null

Everything else is returned as a string.

A default value can also be defined which is returned when original value is undefined.

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| `Optional` defaultValue | `any` |

**Returns:** `string` \| `boolean` \| `null` \| `undefined`

___
<a id="getorfail"></a>

###  getOrFail

▸ **getOrFail**(key: *`string`*, defaultValue?: *`any`*): `string` \| `boolean`

The method is similar to it's counter part [get](_poppinss_env.env.md#get) method. However, it will raise exception when the original value is non-existing.

`undefined`, `null` and `empty strings` are considered as non-exisitng values.

We recommended using this method for **environment variables** that are strongly required to run the application stably.

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| `Optional` defaultValue | `any` |

**Returns:** `string` \| `boolean`

___
<a id="process"></a>

###  process

▸ **process**(envString: *`string`*, overwrite?: *`boolean`*): `void`

Processes environment variables by parsing a string in `dotfile` syntax.

*__example__*:
 ```
Env.process(`
PORT=3000
HOST=127.0.0.1
`)
```

and then access it as follows

```ts
Env.get('PORT')

// or
process.env.PORT
```

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| envString | `string` | - |
| `Default value` overwrite | `boolean` | false |

**Returns:** `void`

___
<a id="set"></a>

###  set

▸ **set**(key: *`string`*, value: *`string`*): `void`

Update/Set value for a key inside the process.env file.

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| value | `string` |

**Returns:** `void`

___

