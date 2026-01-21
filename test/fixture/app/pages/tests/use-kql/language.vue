<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, status } = await useKql(
  {
    query: 'site',
    select: ['title'],
  },
  { language: 'en' },
)

useTestResult({ data: data.value, status: status.value })
</script>
