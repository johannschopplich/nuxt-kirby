<script setup lang="ts">
import { $kql, useTestResult } from '#imports'

// A line break makes `Headers` throw.
const errorName = await $kql({ query: 'site' }, {
  headers: { 'X-Invalid': 'a\nb' },
}).catch((error: Error) => error.name)

useTestResult({ errorName })
</script>
