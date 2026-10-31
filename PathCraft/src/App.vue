<script setup lang="ts">
import SiteLoader from './components/SiteLoader.vue'
import SiteHeader from './components/SiteHeader.vue'
</script>

<template>
  <SiteLoader />
  <SiteHeader />
  <main>
    <router-view />
  </main>
</template>
