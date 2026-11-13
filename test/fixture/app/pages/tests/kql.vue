<script setup lang="ts">
import { $kql, useAsyncData, useRoute, useTestResult } from '#imports'

const { language } = useRoute().query as { language?: string }

const { data } = await useAsyncData('kql', () => $kql({ query: 'site' }, { language }))

useTestResult(data.value)
</script>
