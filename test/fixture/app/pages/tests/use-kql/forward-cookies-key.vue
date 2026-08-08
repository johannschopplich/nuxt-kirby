<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

const { data: forwarded } = await useKql<{ result: { forwardCookies?: boolean } }>({ query: '__echo__' }, { forwardCookies: true })
const { data: withheld } = await useKql<{ result: { forwardCookies?: boolean } }>({ query: '__echo__' })

useTestResult({
  forwarded: forwarded.value?.result.forwardCookies ?? false,
  withheld: withheld.value?.result.forwardCookies ?? false,
})
</script>
