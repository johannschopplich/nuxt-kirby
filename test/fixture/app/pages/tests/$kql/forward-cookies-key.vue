<script setup lang="ts">
import { $kql, useTestResult } from '#imports'

const forwarded = await $kql<{ result: { forwardCookies?: boolean } }>({ query: '__echo__' }, { forwardCookies: true })
const withheld = await $kql<{ result: { forwardCookies?: boolean } }>({ query: '__echo__' })

useTestResult({
  forwarded: forwarded.result.forwardCookies ?? false,
  withheld: withheld.result.forwardCookies ?? false,
})
</script>
