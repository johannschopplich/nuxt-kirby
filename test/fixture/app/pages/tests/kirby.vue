<script setup lang="ts">
import { $kirby, useAsyncData, useRoute, useTestResult } from '#imports'

const { path } = useRoute().query as { path: string }

const { data } = await useAsyncData('kirby', () => $kirby(path).then(
  response => ({ response }),
  (error: { statusCode?: number }) => ({ statusCode: error.statusCode }),
))

useTestResult(data.value)
</script>
