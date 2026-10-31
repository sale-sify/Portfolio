<script setup lang="ts">
import type { Accessory } from '../data/projects'

// Un Salesify dessiné en SVG, pour tout ce qui n'est pas la scène 3D.
withDefaults(defineProps<{ color: string; accessory?: Accessory; happy?: boolean }>(), { happy: false })
</script>

<template>
  <svg class="salesify" viewBox="0 0 100 130" aria-hidden="true">
    <g class="leaves">
      <path d="M50 30C46 18 37 9 29 7c2 10 9 19 21 23z" />
      <path d="M50 30c4-13 12-21 21-24-2 11-9 19-21 24z" />
      <path d="M50 30c-1-11 0-19 3-27 3 8 2 18-3 27z" />
    </g>

    <path
      class="body"
      :style="{ fill: color }"
      d="M50 27c17 0 26 12 26 28 0 22-13 48-26 72-13-24-26-50-26-72 0-16 9-28 26-28z"
    />

    <!-- Yeux, sourcils, joues, bouche -->
    <circle class="eye" cx="41" cy="52" r="6.5" />
    <circle class="eye" cx="59" cy="52" r="6.5" />
    <circle cx="42" cy="53" r="3" />
    <circle cx="60" cy="53" r="3" />
    <path v-if="happy" class="brow" d="M35 41l10-1M55 40l10 1" />
    <path v-else class="brow" d="M35 43l10-4M55 39l10 4" />
    <ellipse class="cheek" cx="34" cy="62" rx="4" ry="2.5" />
    <ellipse class="cheek" cx="66" cy="62" rx="4" ry="2.5" />
    <path v-if="happy" class="mouth-happy" d="M43 63q7 10 14 0z" />
    <path v-else class="mouth" d="M45 67q5-5 10 0" />

    <!-- Accessoires -->
    <g v-if="accessory === 'headset'" class="acc">
      <path class="line" d="M25 52C25 24 75 24 75 52" />
      <rect class="dark" x="19" y="45" width="9" height="15" rx="3" />
      <rect class="dark" x="72" y="45" width="9" height="15" rx="3" />
      <path class="line thin" d="M24 59q1 13 15 13" />
      <circle class="dark" cx="40" cy="72" r="3.8" />
    </g>
    <g v-else-if="accessory === 'bubble'" class="acc">
      <path class="paper" d="M70 4h22a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H78l-6 6v-6h-2a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z" />
      <circle cx="74" cy="14" r="2" /><circle cx="81" cy="14" r="2" /><circle cx="88" cy="14" r="2" />
    </g>
    <g v-else-if="accessory === 'magnifier'" class="acc">
      <path class="handle" d="M87 80l9 11" />
      <circle class="glass" cx="80" cy="72" r="9" />
    </g>
    <g v-else-if="accessory === 'antenna'" class="acc">
      <path class="line thin" d="M55 28l12-20" />
      <circle class="bulb" cx="68" cy="7" r="5" />
    </g>
    <g v-else-if="accessory === 'heart'" class="acc">
      <path class="heart" d="M80 24c-7-5-11-9-11-13a5 5 0 0 1 11-2 5 5 0 0 1 11 2c0 4-4 8-11 13z" />
    </g>
  </svg>
</template>

<style scoped>
.salesify {
  overflow: visible;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.leaves path {
  fill: var(--leaf);
  stroke: var(--ink);
  stroke-width: 2.5;
}

.body {
  stroke: var(--ink);
  stroke-width: 3;
}

.eye {
  fill: #fff;
  stroke: var(--ink);
  stroke-width: 2.2;
}

.brow,
.mouth {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2.6;
}

.mouth-happy {
  fill: var(--ink);
  stroke: var(--ink);
  stroke-width: 1.5;
}

.cheek {
  fill: #ff7aa2;
  opacity: 0.75;
}

.line {
  fill: none;
  stroke: var(--ink);
  stroke-width: 3.5;
}

.line.thin {
  stroke-width: 2.4;
}

.dark {
  fill: #3a3a3a;
  stroke: var(--ink);
  stroke-width: 2;
}

.paper {
  fill: var(--cream);
  stroke: var(--ink);
  stroke-width: 2.2;
}

.glass {
  fill: #bfe9ff;
  stroke: #3a3a3a;
  stroke-width: 3.5;
}

.handle {
  stroke: #8a5a3c;
  stroke-width: 5;
}

.bulb {
  fill: var(--yellow);
  stroke: var(--ink);
  stroke-width: 2.2;
}

.heart {
  fill: #ff3b5c;
  stroke: var(--ink);
  stroke-width: 2.2;
}
</style>
