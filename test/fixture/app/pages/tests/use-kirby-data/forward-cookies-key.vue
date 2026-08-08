<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data: forwarded } = await useKirbyData<{ result: { forwardCookies?: boolean } }>('api/__echo__', { forwardCookies: true })
const { data: withheld } = await useKirbyData<{ result: { forwardCookies?: boolean } }>('api/__echo__')

useTestResult({
  forwarded: forwarded.value?.result.forwardCookies ?? false,
  withheld: withheld.value?.result.forwardCookies ?? false,
})
</script>
