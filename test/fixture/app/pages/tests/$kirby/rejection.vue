<script setup lang="ts">
import { $kirby, useTestResult } from '#imports'

// A line break makes `Headers` throw.
const errorName = await $kirby('api/__template__/__site__', {
  headers: { 'X-Invalid': 'a\nb' },
}).catch((error: Error) => error.name)

useTestResult({ errorName })
</script>
