<script setup lang="ts">
import { $kirby, useTestResult } from '#imports'

const first = await $kirby<{ result: { headers: Record<string, string> } }>('api/__echo__', { headers: { 'X-Variant': 'first' } })
const second = await $kirby<{ result: { headers: Record<string, string> } }>('api/__echo__', { headers: { 'X-Variant': 'second' } })

useTestResult({
  first: first.result.headers['x-variant'],
  second: second.result.headers['x-variant'],
})
</script>
