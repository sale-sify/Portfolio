<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createSalesifyScene } from '../three/salesifyScene'
import { projects, salesifyProjects } from '../data/projects'
import { loading } from '../stores/loading'
import SalesifyPanel from '../components/SalesifyPanel.vue'
import MarqueeBand from '../components/MarqueeBand.vue'

const hero = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const selectedId = ref<string | null>(null)
const hover = ref<{ id: string; x: number; y: number } | null>(null)

const selected = computed(() => projects.find((p) => p.id === selectedId.value))
const hovered = computed(() => projects.find((p) => p.id === hover.value?.id))

let scene: ReturnType<typeof createSalesifyScene> | undefined
let observer: IntersectionObserver | undefined

// Vue -> 3D : le Salesify sélectionné sort de terre et retrouve le sourire
watch(selectedId, (id) => scene?.select(id))

onMounted(() => {
  scene = createSalesifyScene(
    canvas.value!,
    salesifyProjects.map((p) => ({ id: p.id, ...p.salesify! })),
    {
      onHover: (id, x, y) => (hover.value = id ? { id, x, y } : null),
      onSelect: (id) => (selectedId.value = id),
    },
  )

  // La scène ne tourne que quand l'accueil est à l'écran
  observer = new IntersectionObserver(([entry]) => scene?.setActive(entry?.isIntersecting ?? true))
  observer.observe(hero.value!)

  // On ouvre le rideau quand les polices sont là et que la 3D a dessiné une image
  requestAnimationFrame(() => document.fonts.ready.then(() => (loading.ready = true)))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  scene?.dispose()
})
</script>

<template>
  <section ref="hero" class="hero" :class="{ 'has-selection': selected }" aria-labelledby="hero-title">
    <div class="intro">
      <p class="kicker">Romain Sales · développeur full stack, de la base de données à la prod</p>
      <h1 id="hero-title" class="title">
        <span class="extrude">Sale-Sify</span>
        <span class="develops">Develops</span>
      </h1>
    </div>

    <canvas ref="canvas" class="scene" aria-hidden="true" />

    <div class="ui">
      <aside class="lore" aria-label="Le potager">
        <h2>Le potager</h2>
        <p>
          Ici poussent les <strong>Salesify</strong>, de petites racines têtues. Chacune a un problème, et chaque projet
          est né pour en régler un.
        </p>
        <p class="hint">Clique sur un Salesify pour l’écouter.</p>
        <ul class="chips">
          <li v-for="p in salesifyProjects" :key="p.id">
            <button
              :style="{ '--c': p.salesify!.color }"
              :aria-pressed="selectedId === p.id"
              @click="selectedId = p.id"
              @mouseenter="scene?.wave(p.id)"
            >
              {{ p.salesify!.name }}
            </button>
          </li>
        </ul>
      </aside>

      <Transition name="pop" mode="out-in">
        <SalesifyPanel v-if="selected" :key="selected.id" class="panel" :project="selected" @close="selectedId = null" />
      </Transition>
    </div>

    <p
      v-if="hover && hovered?.salesify"
      class="tooltip"
      :style="{ left: `${hover.x}px`, top: `${hover.y}px`, '--c': hovered.salesify.color }"
      aria-hidden="true"
    >
      <strong>{{ hovered.salesify.name }}</strong>
      <span>{{ hovered.salesify.epithet }}</span>
    </p>
  </section>

  <MarqueeBand :words="['Planté en prod', 'Arrosé chaque jour', 'Récolté à la main', 'Zéro pesticide, 100 % TypeScript']" />
</template>

<style scoped>
.hero {
  position: relative;
  height: 100svh;
  min-height: 640px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 115%, rgb(255 210 63 / 0.45), transparent 55%),
    var(--pink);
}

.intro {
  position: absolute;
  inset: 0 0 auto;
  z-index: 1; /* derrière le canvas : les Salesify passent devant le titre */
  padding-top: clamp(84px, 12vh, 120px);
  text-align: center;
  transition: opacity 0.4s ease;
}

.has-selection .intro {
  opacity: 0.25;
}

.kicker {
  font-weight: 700;
  font-size: clamp(0.85rem, 1.6vw, 1rem);
}

.title {
  position: relative;
  display: inline-block;
  margin-top: 0.1em;
  font-size: clamp(4.5rem, 17vw, 14rem);
  font-weight: 800;
}

.develops {
  position: absolute;
  right: -0.25em;
  top: -0.12em;
  padding: 0.25em 0.7em 0.25em 1.1em;
  background: var(--cream);
  border: var(--border);
  font-family: var(--font-body);
  font-weight: 900;
  font-size: max(0.13em, 0.95rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  clip-path: polygon(0.7em 0, 100% 0, 100% 100%, 0.7em 100%, 0 50%);
  transform: rotate(8deg);
}

.scene {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.ui {
  position: absolute;
  inset: auto 0 0;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 0 var(--gutter) var(--gutter);
  pointer-events: none; /* laisse passer la souris vers le canvas… */
}

.ui > * {
  pointer-events: auto; /* …sauf sur les cartes elles-mêmes */
}

/* Une note de carnet de jardin, scotchée */
.lore {
  position: relative;
  width: min(330px, 100%);
  padding: 22px 20px 18px;
  background: var(--cream);
  border: var(--border);
  transform: rotate(-1.5deg);
}

.lore::before {
  content: '';
  position: absolute;
  top: -14px;
  left: 50%;
  width: 96px;
  height: 26px;
  background: rgb(255 210 63 / 0.8);
  border-inline: 2px dashed rgb(20 20 20 / 0.25);
  transform: translateX(-50%) rotate(3deg);
}

.lore h2 {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.6rem;
  line-height: 1;
}

.lore p {
  margin-top: 6px;
  font-size: 0.95rem;
  line-height: 1.45;
}

.lore .hint {
  font-weight: 900;
  color: var(--pink-deep);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding: 0;
  list-style: none;
}

.chips button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 6px;
  border: 2px solid var(--ink);
  border-radius: 99px;
  background: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  transition: transform 0.15s ease, background 0.15s ease;
}

.chips button::before {
  content: '';
  width: 14px;
  height: 14px;
  border: 2px solid var(--ink);
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  background: var(--c);
}

.chips button:hover,
.chips button[aria-pressed='true'] {
  background: var(--c);
  transform: rotate(-3deg);
}

.tooltip {
  position: fixed;
  z-index: 30;
  display: grid;
  padding: 6px 14px 7px;
  border: 2px solid var(--ink);
  border-radius: 14px 14px 14px 4px;
  background: var(--c);
  white-space: nowrap;
  pointer-events: none;
  transform: translate(18px, -120%) rotate(-2deg);
}

.tooltip strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.25rem;
  line-height: 1;
}

.tooltip span {
  font-size: 0.8rem;
  font-weight: 700;
}

.pop-enter-active {
  transition: opacity 0.25s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(30px) rotate(3deg);
}

@media (max-width: 760px) {
  .ui {
    display: block;
  }

  .lore {
    width: 100%;
    padding: 16px 16px 14px;
  }

  /* Sur mobile on garde l'essentiel : le titre, l'appel à cliquer et les noms */
  .lore p:not(.hint) {
    display: none;
  }

  /* Sur mobile, le panneau passe par-dessus la note */
  .panel {
    position: absolute;
    inset: auto var(--gutter) var(--gutter);
    width: auto;
  }

  .tooltip {
    display: none;
  }
}
</style>
