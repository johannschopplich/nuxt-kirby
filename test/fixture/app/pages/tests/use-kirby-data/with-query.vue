<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData<{ result: { query: Record<string, string> } }>('api/__echo__', {
  query: { select: 'title' },
})

useTestResult({
  data: data.value,
  status: status.value,
  receivedQuery: data.value?.result?.query,
})
</script>
