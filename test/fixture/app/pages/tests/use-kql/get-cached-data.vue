<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, status } = await useKql<any>(
  { query: 'site', select: { title: true } },
  { getCachedData: () => ({ code: 200, status: 'OK', result: { title: 'from getCachedData' } }) },
)

useTestResult({ status: status.value, title: data.value?.result?.title })
</script>
