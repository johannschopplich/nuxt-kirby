<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData('api/__template__/__site__', {
  lazy: true,
})

useTestResult({ data: data.value, status: status.value })
</script>
