<script setup lang="ts">
import { $kirby, useRoute, useTestResult } from '#imports'

const path = useRoute().query.path as string

const outcome = await $kirby(path, { payloadCache: false }).then(
  () => 'resolved',
  (error: { statusCode?: number }) => error.statusCode,
)

useTestResult({ outcome })
</script>
