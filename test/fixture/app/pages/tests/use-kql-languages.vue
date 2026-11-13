<script setup lang="ts">
import { useKql, useTestResult } from '#imports'

// One call site for both languages, so only the language tells their keys apart.
function useSite(language: string) {
  return useKql({ query: 'site' }, { language })
}

const english = await useSite('en')
const german = await useSite('de')

useTestResult({
  languages: [english.data.value?.result.language, german.data.value?.result.language],
})
</script>
