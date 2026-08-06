<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, status } = await useKql<any>(
  { query: '__echo__' },
  { language: 'en' },
)

useTestResult({
  status: status.value,
  receivedLanguage: data.value?.result?.headers?.['x-language'],
})
</script>
