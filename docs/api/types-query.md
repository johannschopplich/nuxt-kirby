# Query Types

<!--@include: ./parts/_kirby-types-note.md-->

## `KirbyQuery`

A Kirby Query Language (KQL) string. The union only admits strings that open with a known root, alone or followed by `.`, `?.`, `[`, `(` or a spaced operator such as `??` or `&&`, so a typo in the root name fails to compile – the rest of the chain is unchecked. Pass `CustomModel` to add roots of your own. In kirby-types 1, a query admits neither `[` nor the operators beyond `??`, `?:` and `?`, and has no `this` root.

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
  = Exclude<KirbyQueryRoot, FunctionOnlyQueryModel> | M

type CallableQueryModel<M extends string = never>
  = | Exclude<KirbyQueryRoot, 'model' | 'item' | 'arrayItem' | 'structureItem' | 'block' | 'this'>
    | M

type DotNotationQuery<M extends string = never>
  = | `${AccessibleQueryModel<M>}.${string}`
    | `${AccessibleQueryModel<M>}?.${string}`
    | `${AccessibleQueryModel<M>}[${string}`

type FunctionNotationQuery<M extends string = never>
  = | `${CallableQueryModel<M>}(${string})`
    | `${CallableQueryModel<M>}(${string})${string}`

type QueryOperator
  = | '??' | '?:' | '?'
    | '||' | 'OR' | '&&' | 'AND'
    | '==' | '===' | '!=' | '!==' | '<' | '<=' | '>' | '>='
    | '+' | '-' | '*' | '/' | '%'

type OperatorQuery<M extends string = never>
  = `${AccessibleQueryModel<M>} ${QueryOperator} ${string}`

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

## `KirbyQueryRoot`

The roots a query may open with. `this` is the whole data context, for keys that are not valid identifiers, as in `this["my-key"]`.

```ts
export type KirbyQueryRoot<CustomModel extends string = never>
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
    | 'this'
    | CustomModel
```
