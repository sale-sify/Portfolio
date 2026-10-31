<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { garden, type GardenMode } from '../data/infra'
import GardenMap from './garden/GardenMap.vue'
import GardenDiorama from './garden/GardenDiorama.vue'

const mode = ref<GardenMode>('today')
// `active` met en avant un élément pendant le survol ; `shown` garde le dernier
// survolé dans la fiche, pour qu'elle ne clignote pas d'une ligne à l'autre.
const active = ref<string | null>(null)
const shown = ref<string | null>(null)

watch(active, (id) => {
  if (id) shown.value = id
})
watch(mode, () => {
  active.value = null
  shown.value = null
})

// Sans WebGL, on se rabat sur le plan dessiné en SVG
const useFallback = ref(false)

const spots = computed(() => garden[mode.value].spots)
const shownIndex = computed(() => spots.value.findIndex((s) => s.id === shown.value))

const tabs: { id: GardenMode; label: string; sub: string }[] = [
  { id: 'today', label: 'Aujourd’hui', sub: 'le jardin partagé' },
  { id: 'tomorrow', label: 'Demain', sub: 'le domaine' },
]
</script>

<template>
  <section id="infra" class="infra" aria-labelledby="infra-title">
    <header class="head">
      <h2 id="infra-title" class="title extrude">Le système d’irrigation</h2>
      <p class="intro">
        Un potager ne pousse pas tout seul : il faut amener l’eau, la répartir, et surveiller la météo. Côté code, c’est
        pareil, et je m’occupe <strong>seul de toute la chaîne</strong>, du dépôt Git jusqu’à la prod.
      </p>
    </header>

    <div class="tabs" role="tablist" aria-label="Époque du plan">
      <button
        v-for="tab in tabs"
        :id="`tab-${tab.id}`"
        :key="tab.id"
        role="tab"
        class="tab"
        :aria-selected="mode === tab.id"
        aria-controls="garden-panel"
        @click="mode = tab.id"
      >
        <strong>{{ tab.label }}</strong> · {{ tab.sub }}
      </button>
      <span v-if="mode === 'tomorrow'" class="moving">Déménagement en préparation</span>
    </div>

    <div id="garden-panel" class="board" :class="{ wide: !useFallback }" role="tabpanel" :aria-labelledby="`tab-${mode}`">
      <figure class="paper">
        <figcaption class="caption">{{ garden[mode].caption }}</figcaption>
        <svg class="compass" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="17" />
          <path d="M20 5l5 15-5 15-5-15z" />
          <text x="20" y="4">N</text>
        </svg>
        <GardenDiorama
          v-if="!useFallback"
          :mode="mode"
          :active="active"
          @hover="active = $event"
          @fallback="useFallback = true"
        />
        <div v-else class="scroller">
          <Transition name="swap" mode="out-in">
            <GardenMap :key="mode" :mode="mode" :active="active" @hover="active = $event" />
          </Transition>
        </div>
      </figure>

      <div class="side">
        <!-- La fiche de l'élément survolé : seulement avec le plan dessiné (en 3D, c'est une bulle sur le plan) -->
        <div v-if="useFallback" class="detail" aria-live="polite">
          <template v-if="shownIndex >= 0">
            <p class="detail-head">
              <span class="num">{{ shownIndex + 1 }}</span>
              <span class="name">{{ spots[shownIndex]!.name }}</span>
            </p>
            <p class="tech">{{ spots[shownIndex]!.tech }}</p>
            <p class="text">{{ spots[shownIndex]!.text }}</p>
          </template>
          <p v-else class="hint">Survole ou touche un élément du plan (ou de la liste) pour savoir à quoi il sert.</p>
        </div>
        <p v-else class="hint inline">
          Survole le plan ou une étiquette ci-dessous pour savoir à quoi sert chaque élément.
        </p>

        <ol class="legend">
          <li v-for="(spot, i) in spots" :key="`${mode}-${spot.id}`">
            <button
              class="entry"
              :class="{ active: active === spot.id || (!active && shown === spot.id) }"
              :aria-pressed="shown === spot.id"
              @mouseenter="active = spot.id"
              @mouseleave="active = null"
              @focus="active = spot.id"
              @blur="active = null"
            >
              <span class="num">{{ i + 1 }}</span>
              <span class="name">{{ spot.name }}</span>
              <span class="tech">{{ spot.tech }}</span>
            </button>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.infra {
  padding: clamp(72px, 10vw, 130px) var(--gutter);
  background: #8fd694;
  border-top: var(--border);
}

.head,
.tabs,
.board {
  max-width: 1240px;
  margin-inline: auto;
}

.title {
  max-width: 11ch;
  font-size: clamp(3.2rem, 10vw, 7.5rem);
}

.intro {
  max-width: 58ch;
  margin-top: 24px;
  font-size: clamp(1.05rem, 1.8vw, 1.25rem);
  line-height: 1.5;
}

/* --- Onglets "étiquettes" --- */
.tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 36px;
}

.tab {
  padding: 10px 18px;
  border: var(--border);
  border-radius: 999px;
  background: var(--cream);
  font-size: 0.95rem;
  transition: transform 0.15s ease, background 0.15s ease;
}

.tab:hover {
  transform: rotate(-2deg);
}

.tab[aria-selected='true'] {
  background: var(--ink);
  color: var(--yellow);
}

.moving {
  padding: 4px 10px;
  background: var(--yellow);
  border: 2px solid var(--ink);
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transform: rotate(-3deg);
}

/* --- Le plan sur papier quadrillé + la légende --- */
/* En 3D, le plan prend toute la largeur et la légende passe dessous, en étiquettes */
.board.wide {
  grid-template-columns: minmax(0, 1fr);
}

.board.wide .side {
  gap: 10px;
}

.board.wide .legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.board.wide .entry {
  width: auto;
  flex-wrap: nowrap;
}

.board.wide .entry.active {
  transform: translateY(-2px) rotate(-1.5deg);
}

.hint.inline {
  font-size: 0.95rem;
}

.board {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: start;
  margin-top: 20px;
}

.paper {
  position: relative;
  margin: 0;
  padding: 48px 14px 14px;
  border: var(--border);
  border-radius: 10px;
  background:
    linear-gradient(rgb(20 20 20 / 0.05) 1px, transparent 1px) 0 0 / 28px 28px,
    linear-gradient(90deg, rgb(20 20 20 / 0.05) 1px, transparent 1px) 0 0 / 28px 28px,
    var(--cream);
  box-shadow: 8px 8px 0 var(--ink);
}

.caption {
  position: absolute;
  top: 12px;
  left: 16px;
  padding: 3px 12px;
  border: 2px solid var(--ink);
  background: #fff;
  font-weight: 900;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.compass {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 38px;
  height: 38px;
}

.compass circle {
  fill: #fff;
  stroke: var(--ink);
  stroke-width: 2;
}

.compass path {
  fill: var(--pink);
  stroke: var(--ink);
  stroke-width: 1.5;
}

.compass text {
  font: 900 7px var(--font-body);
  text-anchor: middle;
  fill: var(--ink);
}

/* Sur petit écran, le plan garde une taille lisible et défile à l'horizontale */
.scroller {
  overflow-x: auto;
}

.scroller :deep(.map) {
  min-width: 680px;
}

.side {
  display: grid;
  gap: 14px;
}

.detail {
  min-height: 150px;
  padding: 16px 18px;
  border: var(--border);
  border-radius: 14px 14px 14px 4px;
  background: #fff;
  box-shadow: 5px 5px 0 var(--ink);
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail .name {
  font-size: 1.6rem;
}

.detail .tech {
  margin-top: 4px;
  font-size: 0.85rem;
}

.detail .text {
  margin-top: 8px;
  font-size: 0.95rem;
  line-height: 1.45;
}

.hint {
  font-weight: 700;
  line-height: 1.4;
}

.legend {
  display: grid;
  gap: 6px;
  padding: 0;
  list-style: none;
}

.entry {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  column-gap: 10px;
  width: 100%;
  padding: 7px 12px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  background: var(--cream);
  text-align: left;
  transition: transform 0.15s ease, background 0.15s ease;
}

.entry.active {
  background: var(--yellow);
  transform: translateX(-4px) rotate(-0.8deg);
}

.entry .num {
  align-self: center;
}

.num {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--yellow);
  font-size: 0.8rem;
  font-weight: 900;
}

.name {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.2rem;
  line-height: 1.1;
}

.tech {
  font-size: 0.78rem;
  font-weight: 900;
  color: var(--pink-deep);
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.2s ease;
}

.swap-enter-from,
.swap-leave-to {
  opacity: 0;
}

@media (max-width: 960px) {
  .board {
    /* minmax(0, …) : sinon la colonne s'élargit à la taille mini du plan et tout déborde */
    grid-template-columns: minmax(0, 1fr);
  }
  .legend {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr));
  }
  .detail {
    min-height: 0;
  }
}
</style>
