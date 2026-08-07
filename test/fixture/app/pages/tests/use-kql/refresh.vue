<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, refresh } = await useKql<any>(
  { query: 'site', select: { title: true } },
  { transform: response => ({ ...response, transformCount: (response.transformCount ?? 0) + 1 }) },
)

const initialCount = data.value?.transformCount

await refresh()

useTestResult({
  initialCount,
  refreshedCount: data.value?.transformCount,
})
</script>
