<script setup lang="ts">
import { $kql, useTestResult } from '#imports'

const first = await $kql<{ result: { headers: Record<string, string> } }>({ query: '__echo__' }, { headers: { 'X-Variant': 'first' } })
const second = await $kql<{ result: { headers: Record<string, string> } }>({ query: '__echo__' }, { headers: { 'X-Variant': 'second' } })

useTestResult({
  first: first.result.headers['x-variant'],
  second: second.result.headers['x-variant'],
})
</script>
