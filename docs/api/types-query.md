# Query Types

<!--@include: ./parts/_kirby-types-note.md-->

## `KirbyQuery`

Represents any valid Kirby Query Language (KQL) string.

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
/**
 * Helper type for dot notation queries (e.g., `model.property.method`).
 * @internal
 */
type DotNotationQuery<M extends string = never>
  = `${KirbyQueryModel<M>}.${string}`

/**
 * Helper type for function notation queries (e.g., `model(params)` or `model(params).chain`).
 * @internal
 */
type FunctionNotationQuery<M extends string = never>
  = | `${KirbyQueryModel<M>}(${string})`
    | `${KirbyQueryModel<M>}(${string})${string}`

/**
 * Represents query chains that extend beyond a simple model name.
 *
 * This type covers all valid query patterns that start with a model and include
 * additional property access or method calls:
 *
 * - **Dot notation**: `model.property.method()`
 * - **Function calls**: `model(params)`
 * - **Mixed chains**: `model(params).property.method()`
 *
 * @example
 * ```ts
 * // Dot notation queries
 * const dotQuery: KirbyQueryChain = "page.children.listed";
 * const methodQuery: KirbyQueryChain = "page.children.filterBy('featured', true)";
 *
 * // Function notation queries
 * const funcQuery: KirbyQueryChain = 'site("home")';
 * const mixedQuery: KirbyQueryChain = 'page("blog").children.sortBy("date")';
 *
 * // With custom models
 * type CustomModels = "product" | "category";
 * const customQuery: KirbyQueryChain<CustomModels> = "product.price";
 * ```
 *
 * @template M - Optional custom model names to include in validation
 */
export type KirbyQueryChain<M extends string = never>
  = | DotNotationQuery<M>
    | FunctionNotationQuery<M>

/**
 * Represents any valid Kirby Query Language (KQL) string.
 *
 * This is the main type for validating KQL queries. It accepts:
 * - Simple model names (e.g., `"site"`, `"page"`)
 * - Property chains (e.g., `"page.children.listed"`)
 * - Method calls (e.g., `'site("home")'`, `'page.filterBy("status", "published")'`)
 * - Complex mixed queries (e.g., `'page("blog").children.filterBy("featured", true).sortBy("date")'`)
 *
 * Invalid queries (unknown models, malformed syntax) will be rejected at the type level.
 *
 * @example
 * ```ts
 * // Valid queries
 * const simpleQuery: KirbyQuery = "site";
 * const propertyQuery: KirbyQuery = "page.children.listed";
 * const methodQuery: KirbyQuery = 'page.filterBy("featured", true)';
 * const complexQuery: KirbyQuery = 'site("home").children.sortBy("date", "desc").limit(10)';
 *
 * // Custom models
 * type MyModels = "product" | "category";
 * const customQuery: KirbyQuery<MyModels> = "product.price";
 *
 * // Invalid queries (these will cause TypeScript errors)
 * // const invalid: KirbyQuery = "unknownModel"; // ❌ Unknown model
 * // const invalid: KirbyQuery<MyModels> = "user"; // ❌ Not in custom models
 * ```
 *
 * @template CustomModel - Optional custom model names to include alongside built-in models
 */
export type KirbyQuery<CustomModel extends string = never>
  = | KirbyQueryModel<CustomModel>
    | (string extends KirbyQueryChain<CustomModel>
      ? never
      : KirbyQueryChain<CustomModel>)
```

## `KirbyQueryModel`

Represents all supported model names in Kirby Query Language.

```ts
/**
 * Represents all supported model names in Kirby Query Language.
 *
 * This type includes all built-in Kirby models that can be used as the starting point
 * for queries, plus any custom models you define.
 *
 * Built-in models include:
 * - `site` - The site object
 * - `page` - A page object
 * - `user` - A user object
 * - `file` - A file object
 * - `collection` - A collection object
 * - `kirby` - The Kirby instance
 * - `content` - Content field data
 * - `item` - Generic item in collections
 * - `arrayItem` - An item in an array
 * - `structureItem` - An item in a structure field
 * - `block` - A block in the blocks field
 *
 * @example
 * ```ts
 * // Using built-in models
 * const siteModel: KirbyQueryModel = "site";
 * const pageModel: KirbyQueryModel = "page";
 *
 * // Using with custom models
 * type CustomModels = "product" | "category";
 * const customModel: KirbyQueryModel<CustomModels> = "product";
 * ```
 *
 * @template CustomModel - Additional custom model names to include
 */
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
