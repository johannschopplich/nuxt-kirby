<template>
  <div>
    <header>
      <h2>nuxt-kirby</h2>

      <NuxtLink to="/">
        Index
      </NuxtLink>
      /
      <NuxtLink to="/blocks">
        <span>Kirby Blocks</span>
      </NuxtLink>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
