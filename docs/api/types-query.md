# Query Types

<!--@include: ./parts/_kirby-types-note.md-->

## `KirbyQuery`

Represents any valid Kirby Query Language (KQL) string. The union only admits strings that open with a known model, so a typo in the model name fails to compile – everything after the first `.` or `(` is unchecked. Pass `CustomModel` to add model names of your own.

**Examples:**

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
type DotNotationQuery<M extends string = never>
  = `${KirbyQueryModel<M>}.${string}`

type FunctionNotationQuery<M extends string = never>
  = | `${KirbyQueryModel<M>}(${string})`
    | `${KirbyQueryModel<M>}(${string})${string}`

export type KirbyQueryChain<M extends string = never>
  = | DotNotationQuery<M>
    | FunctionNotationQuery<M>

export type KirbyQuery<CustomModel extends string = never>
  = | KirbyQueryModel<CustomModel>
    | (string extends KirbyQueryChain<CustomModel>
      ? never
      : KirbyQueryChain<CustomModel>)
```

## `KirbyQueryModel`

Represents all supported model names in Kirby Query Language.

```ts
export type KirbyQueryModel<CustomModel extends string = never>
  = | 'collection'
    | 'kirby'
    | 'site'
    | 'page'
    | 'user'
    | 'file'
    | 'content'
    | 'item'
    | 'arrayItem'
    | 'structureItem'
    | 'block'
    | CustomModel
```
