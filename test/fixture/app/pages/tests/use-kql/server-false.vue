<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data } = await useKql(
  {
    query: 'site',
    select: ['title'],
  },
  { server: false },
)

useTestResult({ data: data.value })
</script>
