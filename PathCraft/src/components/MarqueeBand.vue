<script setup lang="ts">
defineProps<{ words: string[] }>()
</script>

<template>
  <div class="band" aria-hidden="true">
    <!-- Deux copies identiques : quand la première sort, la seconde a pris sa place -->
    <div v-for="copy in 2" :key="copy" class="track">
      <template v-for="word in words" :key="word">
        <span class="word">{{ word }}</span>
        <svg class="sprout" viewBox="0 0 24 24">
          <path d="M12 22V11M12 11C11 6 7 3 3 3c1 5 4 8 9 8zm0 0c1-5 5-8 9-8-1 5-4 8-9 8z" />
        </svg>
      </template>
    </div>
  </div>
</template>

<style scoped>
.band {
  display: flex;
  overflow: hidden;
  border-block: var(--border);
  background: var(--soil);
  color: var(--cream);
}

.track {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 26px;
  padding: 14px 13px;
  animation: slide 26s linear infinite;
}

.word {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: clamp(1.3rem, 3vw, 1.9rem);
  white-space: nowrap;
}

.sprout {
  width: 26px;
  height: 26px;
  fill: var(--leaf);
  stroke: var(--cream);
  stroke-width: 1.6;
  stroke-linejoin: round;
}

@keyframes slide {
  to {
    transform: translateX(-100%);
  }
}
</style>
