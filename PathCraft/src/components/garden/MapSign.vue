<script setup lang="ts">
import { computed } from 'vue'

// Un petit panneau en bois sur le plan, avec le numéro de la légende.
const props = defineProps<{ x: number; y: number; text: string; n?: number }>()
const width = computed(() => props.text.length * 7.6 + 20 + (props.n ? 26 : 0))
</script>

<template>
  <g class="sign" :transform="`translate(${x} ${y})`">
    <rect :width="width" height="26" rx="5" />
    <g v-if="n">
      <circle cx="13" cy="13" r="9" class="badge" />
      <text x="13" y="17.5" class="badge-text">{{ n }}</text>
    </g>
    <text :x="n ? 30 : 11" y="18">{{ text }}</text>
  </g>
</template>

<style scoped>
rect {
  fill: var(--cream);
  stroke: var(--ink);
  stroke-width: 2;
}

text {
  font: 800 14px var(--font-body);
  fill: var(--ink);
}

.badge {
  fill: var(--ink);
}

.badge-text {
  font-size: 12px;
  fill: var(--yellow);
  text-anchor: middle;
}
</style>
