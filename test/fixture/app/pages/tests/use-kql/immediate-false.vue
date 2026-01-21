<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, execute, status } = await useKql(
  {
    query: 'site',
    select: ['title'],
  },
  { immediate: false },
)

const beforeExecute = { data: data.value, status: status.value }
await execute()
const afterExecute = { data: data.value, status: status.value }

useTestResult({ beforeExecute, afterExecute })
</script>
