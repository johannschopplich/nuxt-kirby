<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const first = await useKql({ query: 'site' })
const second = await useKql({ query: 'site' })

useTestResult({
  requestNumbers: [first.data.value?.result.requestNumber, second.data.value?.result.requestNumber],
})
</script>
