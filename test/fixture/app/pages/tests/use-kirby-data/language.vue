<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData<{ result: { headers: Record<string, string> } }>('api/__echo__', {
  language: 'en',
})

useTestResult({
  data: data.value,
  status: status.value,
  receivedLanguage: data.value?.result?.headers?.['x-language'],
})
</script>
