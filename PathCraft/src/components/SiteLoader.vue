<script setup lang="ts">
import { ref, watch } from 'vue'
import { loading } from '../stores/loading'

// Un Salesify sort de terre pendant le chargement, puis le rideau s'ouvre.
const done = ref(false)
const hidden = ref(false)
const start = performance.now()

watch(
  () => loading.ready,
  (ready) => {
    if (!ready) return
    const wait = Math.max(0, 1100 - (performance.now() - start)) // laisse le temps de le voir pousser
    setTimeout(() => {
      done.value = true
      setTimeout(() => (hidden.value = true), 800)
    }, wait)
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="!hidden" class="loader" :class="{ done }" role="status" aria-live="polite">
    <div class="pot">
      <svg class="sprout" viewBox="0 0 80 110" aria-hidden="true">
        <g class="leaves">
          <path d="M40 34C36 20 26 10 18 8c2 10 9 20 22 26z" />
          <path d="M40 34c4-15 13-25 23-28-2 12-9 22-23 28z" />
          <path d="M40 34c-1-12 0-22 3-30 3 9 2 20-3 30z" />
        </g>
        <path class="body" d="M40 32c13 0 20 8 20 20 0 17-10 36-20 52-10-16-20-35-20-52 0-12 7-20 20-20z" />
        <circle cx="33" cy="50" r="4.5" class="eye" />
        <circle cx="47" cy="50" r="4.5" class="eye" />
        <circle cx="34" cy="51" r="2" />
        <circle cx="48" cy="51" r="2" />
      </svg>
      <div class="ground" />
    </div>
    <p class="label">Ça pousse…</p>
  </div>
</template>

<style scoped>
.loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  background: var(--cream);
  clip-path: circle(150% at 50% 50%);
  transition: clip-path 0.8s cubic-bezier(0.7, 0, 0.3, 1);
}

/* Le rideau se referme en cercle sur le Salesify */
.loader.done {
  clip-path: circle(0% at 50% 45%);
}

.pot {
  position: relative;
  width: 120px;
  height: 120px;
  overflow: hidden;
}

.sprout {
  position: absolute;
  left: 20px;
  bottom: -40px;
  width: 80px;
  animation: grow 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.leaves path {
  fill: var(--leaf);
  stroke: var(--ink);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.leaves {
  transform-origin: 40px 34px;
  animation: sway 1.4s ease-in-out infinite alternate;
}

.body {
  fill: var(--pink);
  stroke: var(--ink);
  stroke-width: 3;
}

.eye {
  fill: #fff;
  stroke: var(--ink);
  stroke-width: 2;
}

.ground {
  position: absolute;
  inset: auto 0 0;
  height: 22px;
  border-top: 3px solid var(--ink);
  background: var(--soil);
}

.label {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.6rem;
}

@keyframes grow {
  from {
    transform: translateY(90px);
  }
}

@keyframes sway {
  from {
    transform: rotate(-8deg);
  }
  to {
    transform: rotate(8deg);
  }
}
</style>
