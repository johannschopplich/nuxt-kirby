<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data } = await useKirbyData('api/__template__/__site__', {
  server: false,
})

// On SSR, data should be undefined when server: false
useTestResult({ data: data.value })
</script>
