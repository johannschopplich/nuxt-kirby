<script setup lang="ts">
import { useKirbyData, useTestResult } from '#imports'

const { data, status } = await useKirbyData<{ result: { title: string } }>('api/__template__/__site__')

useTestResult({ data: data.value, status: status.value })
</script>
