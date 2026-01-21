<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData('api/__template__/__site__', {
  language: 'en',
})

useTestResult({ data: data.value, status: status.value })
</script>
