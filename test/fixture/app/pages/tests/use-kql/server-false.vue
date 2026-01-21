<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data } = await useKql(
  {
    query: 'site',
    select: ['title'],
  },
  { server: false },
)

// On SSR, data should be undefined when server: false
useTestResult({ data: data.value })
</script>
