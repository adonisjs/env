**[@adonisjs/env](../README.md)**

[Globals](../README.md) › ["src/Env"](../modules/_src_env_.md) › [Env](_src_env_.env.md)

# Class: Env

The ENV module enables the use of environment variables by parsing dotfiles syntax
and updates the `process.env` object in Node.js.

AdonisJs automatically reads and passes the contents of `.env` file to this class.

## Hierarchy

* **Env**

## Implements

* EnvContract

## Index

### Methods

* [get](_src_env_.env.md#get)
* [getOrFail](_src_env_.env.md#getorfail)
* [process](_src_env_.env.md#process)
* [set](_src_env_.env.md#set)

## Methods

###  get

▸ **get**(`key`: string, `defaultValue?`: any): *string | boolean | null | undefined*

Get value for a key from the process.env. Since `process.env` object stores all
values as strings, this method will cast them to their counterpart datatypes.

| Value | Casted value |
|------|---------------|
| 'true' | true |
| '1' | true |
| 'false' | false |
| '0' | false |
| 'null' | null |

Everything else is returned as a string.

A default value can also be defined which is returned when original value
is undefined.

**`example`** 
```ts
Env.get('PORT', 3333)
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *string | boolean | null | undefined*

___

###  getOrFail

▸ **getOrFail**(`key`: string, `defaultValue?`: any): *string | boolean*

The method is similar to it's counter part [get](_src_env_.env.md#get) method. However, it will
raise exception when the original value is non-existing.

`undefined`, `null` and `empty strings` are considered as non-exisitng values.

We recommended using this method for **environment variables** that are strongly
required to run the application stably.

**`example`** 
```ts
Env.getOrFail('PORT', 3333)
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *string | boolean*

___

###  process

▸ **process**(`envString`: string, `overwrite`: boolean): *void*

Processes environment variables by parsing a string
in `dotfile` syntax.

**`example`** 
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

Name | Type | Default |
------ | ------ | ------ |
`envString` | string | - |
`overwrite` | boolean | false |

**Returns:** *void*

___

###  set

▸ **set**(`key`: string, `value`: string): *void*

Update or set value for a given property
inside `process.env`.

**`example`** 
```ts
Env.set('PORT', 3333)
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | string |

**Returns:** *void*