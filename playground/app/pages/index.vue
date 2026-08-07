<script setup lang="ts">
import type { KirbyQueryRequest, KirbyQueryResponse } from '#nuxt-kirby'
import { ref, useKql } from '#imports'

interface KirbySite {
  title: string
  children: {
    id: string
    title: string
    isListed: boolean
  }[]
}

const query = ref<KirbyQueryRequest>({
  query: 'site',
  select: {
    title: true,
    children: {
      query: 'site.children',
      select: {
        id: true,
        title: true,
        isListed: true,
      },
    },
  },
})

const { data } = await useKql<KirbyQueryResponse<KirbySite>>(query)

function updateQuery() {
  query.value = {
    query: 'site',
    select: {
      title: true,
      children: {
        query: 'site.children',
        select: {
          id: true,
          title: 'page.title.upper',
          isListed: true,
        },
      },
    },
  }
}
</script>

<template>
  <div>
    <h1>Send KQL Queries</h1>
    <p>KQL Data is being proxied by a Nuxt server route and passed back to the client.</p>
    <hr>
    <h2>Query</h2>
    <pre>{{ JSON.stringify(query, undefined, 2) }}</pre>
    <h2>Response</h2>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
    <button @click="updateQuery()">
      Change query and refresh
    </button>
  </div>
</template>
