<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data, error, status } = await useKql({ query: '' })

useTestResult({
  status: status.value,
  data: data.value,
  statusCode: error.value?.statusCode,
})
</script>
