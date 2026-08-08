<script setup lang="ts">
import { $kirby, useTestResult } from '#imports'

const forwarded = await $kirby<{ result: { forwardCookies?: boolean } }>('api/__echo__', { forwardCookies: true })
const withheld = await $kirby<{ result: { forwardCookies?: boolean } }>('api/__echo__')

useTestResult({
  forwarded: forwarded.result.forwardCookies ?? false,
  withheld: withheld.result.forwardCookies ?? false,
})
</script>
