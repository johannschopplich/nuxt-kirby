<script setup lang="ts">
import { $kql, useTestResult } from '#imports'

const first = await $kql<any>({ query: '__hits__' })
const second = await $kql<any>({ query: '__hits__' })
const uncached = await $kql<any>({ query: '__hits__' }, { payloadCache: false })

useTestResult({
  firstHits: first.result.hits,
  secondHits: second.result.hits,
  uncachedHits: uncached.result.hits,
})
</script>
