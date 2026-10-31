<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Transparent en haut de page, puis un fond crème dès qu'on fait défiler
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 40)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const links = [
  { label: 'Projets', href: '#projets' },
  { label: 'Infra', href: '#infra' },
  { label: 'Parcours', href: '#parcours' },
]
</script>

<template>
  <header class="header" :class="{ scrolled }">
    <a href="/" class="logo" aria-label="Sale-Sify Develops, accueil">
      <svg viewBox="0 0 32 40" aria-hidden="true">
        <path class="leaf" d="M16 14C14 8 9 4 6 4c1 4 4 8 10 10zm0 0c2-7 6-11 10-12-1 5-4 9-10 12zm0 0c0-5 0-9 1-13" />
        <path class="root" d="M16 13c5 0 8 3 8 8 0 6-4 13-8 18-4-5-8-12-8-18 0-5 3-8 8-8z" />
      </svg>
      <span>Sale-Sify</span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
      <a href="#contact" class="tag">Me contacter</a>
    </nav>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px var(--gutter);
  pointer-events: none;
  border-bottom: 2.5px solid transparent;
  transition: background 0.25s ease, border-color 0.25s ease, padding 0.25s ease;
}

.header.scrolled {
  padding-block: 10px;
  background: var(--cream);
  border-bottom-color: var(--ink);
  pointer-events: auto;
}

.header > * {
  pointer-events: auto;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.6rem;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.logo svg {
  width: 26px;
  height: 32px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo:hover svg {
  transform: translateY(-4px) rotate(-10deg);
}

.leaf {
  fill: var(--leaf);
  stroke: var(--ink);
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.root {
  fill: var(--yellow);
  stroke: var(--ink);
  stroke-width: 2;
  stroke-linejoin: round;
}

.nav {
  display: flex;
  align-items: center;
  gap: clamp(0.9rem, 2.2vw, 2rem);
  font-weight: 900;
}

.nav a:not(.tag) {
  text-decoration: none;
  background: linear-gradient(var(--ink), var(--ink)) left bottom / 0 3px no-repeat;
  transition: background-size 0.2s ease;
}

.nav a:not(.tag):hover {
  background-size: 100% 3px;
}

@media (max-width: 640px) {
  .nav a:not(.tag) {
    display: none;
  }
  .tag {
    font-size: 0.9rem;
  }
}
</style>
