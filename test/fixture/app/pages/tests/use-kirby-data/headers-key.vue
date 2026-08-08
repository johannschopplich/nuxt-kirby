<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data: first } = await useKirbyData<{ result: { headers: Record<string, string> } }>('api/__echo__', { headers: { 'X-Variant': 'first' } })
const { data: second } = await useKirbyData<{ result: { headers: Record<string, string> } }>('api/__echo__', { headers: { 'X-Variant': 'second' } })

useTestResult({
  first: first.value?.result.headers['x-variant'],
  second: second.value?.result.headers['x-variant'],
})
</script>
