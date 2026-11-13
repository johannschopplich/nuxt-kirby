<script setup lang="ts">
import { useKirbyData, useRoute, useTestResult } from '#imports'

const { path, language } = useRoute().query as { path: string, language?: string }

const { data, status, error } = await useKirbyData(path, {
  language,
  query: { select: 'title' },
})

useTestResult({
  data: data.value,
  status: status.value,
  statusCode: error.value?.statusCode,
})
</script>
