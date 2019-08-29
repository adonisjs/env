**[@poppinss/env](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [EnvContract](_contracts_.envcontract.md)

# Interface: EnvContract

## Hierarchy

* **EnvContract**

## Implemented by

* [Env](../classes/_env_.env.md)

## Index

### Methods

* [get](_contracts_.envcontract.md#get)
* [getOrFail](_contracts_.envcontract.md#getorfail)
* [process](_contracts_.envcontract.md#process)
* [set](_contracts_.envcontract.md#set)

## Methods

###  get

▸ **get**(`key`: string, `defaultValue?`: any): *string | boolean | null | undefined*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *string | boolean | null | undefined*

___

###  getOrFail

▸ **getOrFail**(`key`: string, `defaultValue?`: any): *string | boolean*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *string | boolean*

___

###  process

▸ **process**(`envString`: string, `overwrite?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`envString` | string |
`overwrite?` | undefined \| false \| true |

**Returns:** *void*

___

###  set

▸ **set**(`key`: string, `value`: string): *void*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | string |

**Returns:** *void*