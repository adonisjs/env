[@poppinss/env](../README.md) > [@poppinss/env](../modules/_poppinss_env.md) > [Env](../classes/_poppinss_env.env.md)

# Class: Env

The ENV module enables the use of environment variables by parsing dotfiles syntax and updates the `process.env` object in Node.js.

AdonisJs automatically reads and passes the contents of `.env` file to this class.

## Hierarchy

**Env**

## Implements

* [EnvContract](../interfaces/_contracts_.envcontract.md)

## Index

### Methods

* [get](_poppinss_env.env.md#get)
* [getOrFail](_poppinss_env.env.md#getorfail)
* [process](_poppinss_env.env.md#process)
* [set](_poppinss_env.env.md#set)

---

## Methods

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

*__example__*:
 ```ts
Env.get('PORT', 3333)
```

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

*__example__*:
 ```ts
Env.getOrFail('PORT', 3333)
```

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
 ```ts
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

Update or set value for a given property inside `process.env`.

*__example__*:
 ```ts
Env.set('PORT', 3333)
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| value | `string` |

**Returns:** `void`

___

