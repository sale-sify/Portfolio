<script setup lang="ts">
// Un élément survolable du plan : il s'éclaire quand on le survole (ou sa ligne
// de légende), et les autres s'estompent.
defineProps<{ id: string; active: string | null; i: number }>()
const emit = defineEmits<{ hover: [id: string | null] }>()
</script>

<template>
  <g
    class="spot"
    :class="{ active: active === id, dim: active && active !== id }"
    :style="{ '--i': i }"
    @mouseenter="emit('hover', id)"
    @mouseleave="emit('hover', null)"
    @click="emit('hover', id)"
  >
    <slot />
  </g>
</template>

<style scoped>
.spot {
  cursor: pointer;
  transition: opacity 0.25s ease;
  /* chaque élément "pousse" à son tour quand le plan apparaît */
  transform-box: fill-box;
  transform-origin: center bottom;
  animation: grow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  animation-delay: calc(var(--i) * 70ms);
}

.spot.dim {
  opacity: 0.3;
}

@keyframes grow {
  from {
    opacity: 0;
    transform: scale(0.6) translateY(20px);
  }
}
</style>
