<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData<{ result: { method: string, body: unknown } }>('api/__echo__', {
  method: 'POST',
  body: { test: 'data' },
})

useTestResult({
  data: data.value,
  status: status.value,
  receivedMethod: data.value?.result?.method,
  receivedBody: data.value?.result?.body,
})
</script>
