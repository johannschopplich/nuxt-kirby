<script setup lang="ts">
import { $kirby, useTestResult } from '#imports'

const data = await $kirby<{ result: { title: string } }>('api/__template__/__site__')

useTestResult(data)
</script>
