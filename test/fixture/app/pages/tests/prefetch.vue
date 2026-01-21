<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, status } = await useKql({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: ['id', 'title', 'isListed'],
    },
  },
})

useTestResult({ data: data.value, status: status.value })
</script>
