<script setup lang="ts">
import { $kql, useKql, useTestResult } from '#imports'

await useKql<any>({ query: '__hits__' }, { transform: () => ({ transformed: true }) })
const raw = await $kql<any>({ query: '__hits__' })

useTestResult({
  rawHits: raw.result?.hits,
})
</script>
