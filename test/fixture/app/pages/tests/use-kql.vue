<script setup lang="ts">
import { ref, useKql, useRoute, useTestResult } from '#imports'

const { query = 'site' } = useRoute().query as { query?: string }
const language = ref<string>()

// Reaches Kirby in client mode alone, since the server proxy forwards no such header.
const { data, status, error } = await useKql({ query }, {
  language,
  headers: { 'x-composable': '1' },
})

useTestResult({
  data: data.value,
  status: status.value,
  statusCode: error.value?.statusCode,
})
</script>

<template>
  <button data-testid="switch-language" @click="language = 'de'">
    Switch language
  </button>
  <output data-testid="language">{{ data?.result.language }}</output>
  <output data-testid="request-number">{{ data?.result.requestNumber }}</output>
</template>
