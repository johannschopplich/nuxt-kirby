<script setup lang="ts">
import { $kql, useState } from '#imports'

const response = await $kql<any>({ query: '__hits__' }, { payloadCache: false })

// Travels in the payload, so it keeps the count the server saw.
const serverHits = useState('server-hits', () => response.result.hits)
</script>

<template>
  <div>
    <output data-testid="server-hits">{{ serverHits }}</output>
    <output data-testid="client-hits">{{ response.result.hits }}</output>
  </div>
</template>
