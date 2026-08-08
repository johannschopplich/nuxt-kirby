<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data: first } = await useKql<{ result: { headers: Record<string, string> } }>({ query: '__echo__' }, { headers: { 'X-Variant': 'first' } })
const { data: second } = await useKql<{ result: { headers: Record<string, string> } }>({ query: '__echo__' }, { headers: { 'X-Variant': 'second' } })

useTestResult({
  first: first.value?.result.headers['x-variant'],
  second: second.value?.result.headers['x-variant'],
})
</script>
