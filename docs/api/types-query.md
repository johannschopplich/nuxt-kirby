# Query Types

<!--@include: ./parts/_kirby-types-note.md-->

## `KirbyQuery`

A Kirby Query Language (KQL) string. The union only admits strings that open with a known model, so a typo in the model name fails to compile – everything after the first `.` or `(` is unchecked. Pass `CustomModel` to add model names of your own.

**Examples**

```ts
// Simple model queries
const site: KirbyQuery = 'site'
const page: KirbyQuery = 'page'

// Property chains
const children: KirbyQuery = 'page.children'
const published: KirbyQuery = 'page.children.published'

// Method calls
const specific: KirbyQuery = 'page("about")'
const filtered: KirbyQuery = 'page.children.filterBy("status", "published")'

// Complex queries
const complex: KirbyQuery = 'site("home").children.sortBy("date", "desc").limit(10)'
```

**Type Declarations**

```ts
type FunctionOnlyQueryModel = 'collection' | 't' | 'qr'

type AccessibleQueryModel<M extends string = never>
  = Exclude<KirbyQueryModel, FunctionOnlyQueryModel> | M

type CallableQueryModel<M extends string = never>
  = | Exclude<KirbyQueryModel, 'model' | 'item' | 'arrayItem' | 'structureItem' | 'block'>
    | M

type DotNotationQuery<M extends string = never>
  = | `${AccessibleQueryModel<M>}.${string}`
    | `${AccessibleQueryModel<M>}?.${string}`

type FunctionNotationQuery<M extends string = never>
  = | `${CallableQueryModel<M>}(${string})`
    | `${CallableQueryModel<M>}(${string})${string}`

type OperatorQuery<M extends string = never>
  = `${AccessibleQueryModel<M>} ${'??' | '?:' | '?'} ${string}`

export type KirbyQueryChain<M extends string = never>
  = | DotNotationQuery<M>
    | FunctionNotationQuery<M>
    | OperatorQuery<M>

export type KirbyQuery<CustomModel extends string = never>
  = | AccessibleQueryModel<CustomModel>
    | (string extends KirbyQueryChain<CustomModel>
      ? never
      : KirbyQueryChain<CustomModel>)
```

## `KirbyQueryModel`

The model names a query may open with.

```ts
export type KirbyQueryModel<CustomModel extends string = never>
  = | 'collection'
    | 'kirby'
    | 'site'
    | 'page'
    | 'user'
    | 'users'
    | 'file'
    | 'model'
    | 't'
    | 'qr'
    | 'item'
    | 'arrayItem'
    | 'structureItem'
    | 'block'
    | CustomModel
```
