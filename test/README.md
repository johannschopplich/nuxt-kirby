# Nuxt Kirby Test Suite

Comprehensive test suite for `nuxt-kirby` module using Nuxt's testing best practices with `@nuxt/test-utils`.

## Test Structure

```
test/
├── e2e.test.ts              # Main E2E test suite
└── fixture/                 # Test application
    ├── nuxt.config.ts       # Nuxt config for testing
    └── app/
        ├── pages/           # Test pages for different scenarios
        │   ├── $kql.vue                    # Tests $kql composable
        │   ├── useKql.vue                  # Tests useKql with various options
        │   ├── useKql-actions.vue          # Tests useKql actions (refresh, clear, etc.)
        │   ├── useKirbyData.vue            # Tests useKirbyData with various options
        │   ├── useKirbyData-actions.vue    # Tests useKirbyData actions
        │   └── prefetch.vue                # Tests prefetch functionality
        └── composables/
            └── test-result.ts  # Helper to extract test results from SSR
```

## Test Approach

### E2E Testing with SSR

All tests use end-to-end testing via `@nuxt/test-utils/e2e`:
- Tests run against a real Nuxt server
- Pages render on the server and return HTML
- Results are embedded in `<script type="text/test-result">` tags
- Tests extract and validate the results

### Test Page Pattern

Each test page uses query parameters to determine which scenario to test:

```vue
<script setup lang="ts">
const route = useRoute()
const testType = route.query.test as string

let result: any

if (testType === 'basic') {
  // Test basic functionality
}
else if (testType === 'with-options') {
  // Test with specific options
}

useTestResult(result)
</script>
```

This allows a single page to test multiple scenarios without duplication.

## Test Coverage

### `useKql` Tests

**Basic Functionality:**
- ✅ Basic query execution
- ✅ Default query without test param

**Options:**
- ✅ `lazy: true` - Lazy loading
- ✅ `server: false` - Client-only fetching
- ✅ `cache: false` - Disable caching
- ✅ `language: 'en'` - Multi-language support
- ✅ `watch: false` - Disable reactivity watching
- ✅ Reactive query refs

**Actions:**
- ✅ `refresh()` - Refresh data
- ✅ `clear()` - Clear cached data
- ✅ `status` - Track request status (idle, pending, success, error)
- ✅ `immediate: false` with `execute()` - Manual execution

### `useKirbyData` Tests

**Basic Functionality:**
- ✅ Basic fetch
- ✅ Default fetch without test param

**Options:**
- ✅ Custom `headers`
- ✅ Query `parameters`
- ✅ `method: 'POST'` with `body`
- ✅ `language: 'en'` - Multi-language support
- ✅ `lazy: true` - Lazy loading
- ✅ `cache: false` - Disable caching
- ✅ Reactive path refs
- ✅ `server: false` - Client-only fetching

**Actions:**
- ✅ `refresh()` - Refresh data
- ✅ `clear()` - Clear cached data
- ✅ `status` - Track request status
- ✅ `immediate: false` with `execute()` - Manual execution

### Additional Tests

- ✅ `$kql` composable
- ✅ Prefetched queries

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Update snapshots
pnpm test -u
```

## Best Practices Implemented

### 1. **Lean & Focused**
- Each test is concise and tests one specific behavior
- No unnecessary setup or teardown
- Clear test names that describe the behavior being tested

### 2. **No Duplication**
- Single test pages handle multiple scenarios via query params
- Reusable `getTestResult()` helper function
- Shared `useTestResult()` composable for embedding results

### 3. **Real-World Testing**
- Tests run against actual Nuxt server with SSR
- Uses real HTTP requests via `$fetch`
- Tests both server-side and client-side scenarios

### 4. **Clear Structure**
- Organized into logical `describe` blocks
- Related tests grouped together
- Consistent naming conventions

### 5. **Minimal Overhead**
- No complex test utilities or abstractions
- Direct assertions on actual behavior
- Fast test execution

### 6. **Type Safety**
- TypeScript throughout
- Proper type imports from `#imports`
- Type-safe test result extraction

## Adding New Tests

To add a new test scenario:

1. **Add test case to page:**
   ```vue
   else if (testType === 'my-new-test') {
     const { data } = await useKql(query, { myOption: true })
     result = { myTest: data.value }
   }
   ```

2. **Add test in e2e.test.ts:**
   ```ts
   it('my new test', async () => {
     const html = await $fetch<string>('/useKql?test=my-new-test')
     const result = getTestResult(html)
     expect(result.myTest).toBeDefined()
   })
   ```

3. **Run and validate:**
   ```bash
   pnpm test
   ```

That's it! No additional setup or configuration needed.
