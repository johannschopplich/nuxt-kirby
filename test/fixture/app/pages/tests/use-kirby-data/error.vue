<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, error, status } = await useKirbyData('api/__missing__')

useTestResult({
  status: status.value,
  data: data.value,
  statusCode: error.value?.statusCode,
})
</script>
