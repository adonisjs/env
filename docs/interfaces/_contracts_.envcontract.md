[@poppinss/env](../README.md) > ["contracts"](../modules/_contracts_.md) > [EnvContract](../interfaces/_contracts_.envcontract.md)

# Interface: EnvContract

## Hierarchy

**EnvContract**

## Implemented by

* [Env](../classes/_poppinss_env.env.md)

## Index

### Methods

* [get](_contracts_.envcontract.md#get)
* [getOrFail](_contracts_.envcontract.md#getorfail)
* [process](_contracts_.envcontract.md#process)
* [set](_contracts_.envcontract.md#set)

---

## Methods

<a id="get"></a>

###  get

▸ **get**(key: *`string`*, defaultValue?: *`any`*): `string` \| `boolean` \| `null` \| `undefined`

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

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| `Optional` defaultValue | `any` |

**Returns:** `string` \| `boolean`

___
<a id="process"></a>

###  process

▸ **process**(envString: *`string`*, overwrite?: *`undefined` \| `false` \| `true`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| envString | `string` |
| `Optional` overwrite | `undefined` \| `false` \| `true` |

**Returns:** `void`

___
<a id="set"></a>

###  set

▸ **set**(key: *`string`*, value: *`string`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| value | `string` |

**Returns:** `void`

___

