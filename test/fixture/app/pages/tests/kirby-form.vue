<script setup lang="ts">
import { $kirby, useAsyncData, useRuntimeConfig, useTestResult } from '#imports'

const { kqlPath } = useRuntimeConfig().public.kirby

const { data } = await useAsyncData('kirby-form', () => $kirby(kqlPath, {
  method: 'POST',
  body: new URLSearchParams({ query: 'site' }),
}))

useTestResult(data.value)
</script>
