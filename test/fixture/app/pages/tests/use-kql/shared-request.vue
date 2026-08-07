<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data: first } = await useKql<any>({ query: '__hits__' })
const { data: second } = await useKql<any>({ query: '__hits__' })

useTestResult({
  firstHits: first.value?.result?.hits,
  secondHits: second.value?.result?.hits,
})
</script>
