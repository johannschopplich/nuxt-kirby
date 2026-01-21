<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, execute, status } = await useKirbyData('api/__template__/__site__', {
  immediate: false,
})

const beforeExecute = { data: data.value, status: status.value }
await execute()
const afterExecute = { data: data.value, status: status.value }

useTestResult({ beforeExecute, afterExecute })
</script>
