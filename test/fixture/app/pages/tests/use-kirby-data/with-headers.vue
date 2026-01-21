<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData<{ result: { headers: Record<string, string> } }>('api/__echo__', {
  headers: { 'X-Custom-Header': 'test-value' },
})

useTestResult({
  data: data.value,
  status: status.value,
  receivedHeader: data.value?.result?.headers?.['x-custom-header'],
})
</script>
