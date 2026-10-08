<script setup lang="ts">
import type { KirbyBlock, KirbyQueryRequest } from 'kirby-types'
import { computed, ref, useKql } from '#imports'

const query = ref<KirbyQueryRequest>({
  query: 'page("notes/across-the-ocean")',
  select: {
    id: true,
    title: true,
    text: 'page.text.toBlocks',
  },
})

const { data } = await useKql(query)
const blocks = computed<KirbyBlock<string>[]>(() => data.value?.result?.text ?? [])
</script>

<template>
  <div>
    <h1>Parse Kirby Blocks</h1>
    <hr>
    <h2>{{ data?.result?.title }}</h2>
    <div class="prose">
      <template
        v-for="(block, index) in blocks"
        :key="index"
      >
        <component
          :is="block.content.level"
          v-if="block.type === 'heading'"
        >
          {{ (block as KirbyBlock<'heading'>).content.text }}
        </component>
        <div
          v-else
          v-html="block.content?.text"
        />
      </template>
    </div>
    <hr>
    <h2>Query</h2>
    <pre>{{ JSON.stringify(query, undefined, 2) }}</pre>
    <h2>Response</h2>
    <pre>{{ JSON.stringify(data?.result, undefined, 2) }}</pre>
  </div>
</template>
