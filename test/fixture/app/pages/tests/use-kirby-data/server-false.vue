<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data } = await useKirbyData('api/__template__/__site__', {
  server: false,
})

useTestResult({ data: data.value })
</script>
