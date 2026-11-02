<script setup lang="ts">
import { kindLabels, type Project } from '../data/projects'
import SalesifyIcon from './SalesifyIcon.vue'

// Le recto d'un sachet de graines : une bande à déchirer, l'illustration, l'étiquette.
// Utilisé par la carte du catalogue et par le recto de la modale qui se retourne.
withDefaults(defineProps<{ project: Project; number: number; torn?: boolean; happy?: boolean }>(), {
  torn: false,
  happy: false,
})
</script>

<template>
  <div class="face" :style="{ '--accent': project.salesify?.color ?? 'var(--yellow)' }">
    <div class="strip zigzag-top" :class="{ torn }">
      <span>Sale-Sify · Semences</span>
      <span class="cut">✂ Ouvrir ici</span>
    </div>

    <div class="art">
      <span v-if="project.confidential" class="greenhouse">Serre privée</span>
      <SalesifyIcon
        v-if="project.salesify"
        class="icon"
        :class="{ up: happy }"
        :color="project.salesify.color"
        :accessory="project.salesify.accessory"
        :happy="happy"
      />
      <div class="soil" />
    </div>

    <div class="label">
      <p class="meta">N°&nbsp;{{ String(number).padStart(2, '0') }} · {{ kindLabels[project.kind] }}</p>
      <h3 class="name">{{ project.name }}</h3>
      <p class="tagline">{{ project.tagline }}</p>
      <p class="weight">Poids net : 1 remède</p>
    </div>
  </div>
</template>

<style scoped>
.face {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* --- La bande du haut, qui s'arrache à l'ouverture --- */
.strip {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 46px;
  padding: 0 14px 7px;
  background: color-mix(in srgb, var(--accent), #000 14%);
  border-inline: var(--border);
  border-bottom: 2px dashed var(--ink);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    transform 0.5s cubic-bezier(0.3, 0.7, 0.4, 1),
    opacity 0.5s ease;
}

.strip.torn {
  transform: translate(40px, -70px) rotate(14deg);
  opacity: 0;
}

/* --- L'illustration --- */
.art {
  position: relative;
  flex: 1;
  min-height: 230px;
  overflow: hidden;
  background:
    repeating-conic-gradient(from 0deg at 50% 115%, rgb(20 20 20 / 0.07) 0 7deg, transparent 7deg 14deg),
    var(--accent);
  border-inline: var(--border);
}

.greenhouse {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  padding: 2px 9px;
  background: var(--ink);
  color: var(--cream);
  font-weight: 900;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: rotate(4deg);
}

.icon {
  position: absolute;
  left: 50%;
  bottom: -40px;
  width: 150px;
  transform: translateX(-50%);
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon.up {
  transform: translateX(-50%) translateY(-34px) rotate(-4deg);
}

.soil {
  position: absolute;
  inset: auto 0 0;
  height: 34px;
  background:
    radial-gradient(circle at 20% 60%, #8c6a55 3px, transparent 4px),
    radial-gradient(circle at 70% 40%, #8c6a55 2.5px, transparent 3.5px),
    radial-gradient(circle at 45% 75%, #8c6a55 2px, transparent 3px),
    var(--soil);
  background-size: 90px 34px;
  border-top: var(--border);
}

/* --- L'étiquette, façon sachet vintage --- */
.label {
  padding: 16px 18px 14px;
  background: var(--cream);
  border: var(--border);
}

.meta {
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(20 20 20 / 0.6);
}

.name {
  margin-top: 4px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 2.2rem;
  line-height: 0.95;
}

.tagline {
  margin-top: 6px;
  font-weight: 700;
  line-height: 1.3;
}

.weight {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 2px solid var(--ink);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
