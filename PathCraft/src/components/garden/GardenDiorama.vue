<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { garden, type GardenMode } from '../../data/infra'
import type { GardenLabel } from '../../three/gardenDiorama'

// Le plan en 3D isométrique. La scène (et ses ~4 Mo de modèles) n'est chargée
// que lorsque la section approche de l'écran. Sans WebGL, on émet "fallback"
// et la section affiche le plan dessiné en SVG à la place.
const props = defineProps<{ mode: GardenMode; active: string | null }>()
const emit = defineEmits<{ hover: [id: string | null]; fallback: [] }>()

const wrapper = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const labels = ref<GardenLabel[]>([])
const ready = ref(false)

const spots = computed(() => garden[props.mode].spots)
const numbers = computed(() => Object.fromEntries(spots.value.map((s, i) => [s.id, i + 1])))
const width = ref(0)

// La bulle d'explication s'accroche à la première pastille de l'élément actif.
// On la garde dans le cadre, et on la passe sous la pastille si elle est trop haut.
const bubble = computed(() => {
  const spot = spots.value.find((s) => s.id === props.active)
  const pin = labels.value.find((l) => l.spot === props.active)
  if (!spot || !pin) return null
  const half = Math.min(150, width.value / 2 - 8)
  return {
    spot,
    n: numbers.value[spot.id],
    left: Math.min(Math.max(pin.x, half + 8), width.value - half - 8),
    top: pin.y,
    below: pin.y < 190,
  }
})

let scene: Awaited<ReturnType<typeof import('../../three/gardenDiorama').createGardenDiorama>> | undefined
let observer: IntersectionObserver | undefined
let disposed = false

async function start() {
  try {
    // import dynamique : Three.js et le chargeur glTF ne sont téléchargés qu'ici
    const { createGardenDiorama } = await import('../../three/gardenDiorama')
    const created = await createGardenDiorama(canvas.value!, props.mode, {
      onHover: (id) => emit('hover', id),
      onLabels: (list) => {
        labels.value = list
        width.value = wrapper.value?.clientWidth ?? 0
      },
    })
    if (disposed) return created.dispose()
    scene = created
    scene.setActive(props.active)
    ready.value = true
    // Ensuite, on ne fait tourner la scène que lorsqu'elle est visible
    observer?.disconnect()
    observer = new IntersectionObserver(([entry]) => scene?.setRunning(entry?.isIntersecting ?? true))
    observer.observe(wrapper.value!)
  } catch (error) {
    console.warn('Plan 3D indisponible, retour au plan dessiné', error)
    emit('fallback')
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && !scene) {
        observer?.disconnect()
        start()
      }
    },
    { rootMargin: '600px' },
  )
  observer.observe(wrapper.value!)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  scene?.dispose()
})

watch(
  () => props.mode,
  (mode) => scene?.setMode(mode),
)
watch(
  () => props.active,
  (id) => scene?.setActive(id),
)
</script>

<template>
  <div ref="wrapper" class="diorama">
    <canvas ref="canvas" class="canvas" aria-hidden="true" />
    <p v-if="!ready" class="loading">On défriche le terrain…</p>
    <!-- Des pastilles numérotées plantées au-dessus de chaque élément -->
    <div class="pins" aria-hidden="true">
      <button
        v-for="label in labels"
        :key="`${mode}-${label.spot}-${label.text}`"
        class="pin"
        :class="{ active: active === label.spot }"
        :style="{ left: `${label.x}px`, top: `${label.y}px` }"
        tabindex="-1"
        @mouseenter="emit('hover', label.spot)"
        @mouseleave="emit('hover', null)"
        @click="emit('hover', label.spot)"
      >
        <span>{{ numbers[label.spot] }}</span>
      </button>
    </div>

    <!-- La bulle qui explique l'élément survolé (son texte est aussi lu via la légende) -->
    <Transition name="bubble">
      <div
        v-if="bubble"
        :key="bubble.spot.id"
        class="bubble"
        :class="{ below: bubble.below }"
        :style="{ left: `${bubble.left}px`, top: `${bubble.top}px` }"
        aria-hidden="true"
      >
        <p class="bubble-head"><span class="num">{{ bubble.n }}</span>{{ bubble.spot.name }}</p>
        <p class="bubble-tech">{{ bubble.spot.tech }}</p>
        <p class="bubble-text">{{ bubble.spot.text }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.diorama {
  position: relative;
  aspect-ratio: 16 / 9;
}

.canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.4rem;
}

.pins {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.pin {
  position: absolute;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid var(--ink);
  border-radius: 50% 50% 50% 4px;
  background: var(--cream);
  font: 900 0.78rem var(--font-body);
  pointer-events: auto;
  transform: translate(-50%, -100%) rotate(-45deg);
  transition: transform 0.15s ease, background 0.15s ease;
}

.pin.active {
  background: var(--yellow);
  transform: translate(-50%, -100%) rotate(-45deg) scale(1.2);
  z-index: 1;
}

/* le chiffre reste droit dans la pastille penchée */
.pin span {
  transform: rotate(45deg);
}

.bubble {
  position: absolute;
  z-index: 2;
  width: min(300px, calc(100% - 16px));
  padding: 12px 14px 13px;
  border: var(--border);
  border-radius: 14px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--ink);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 34px));
}

.bubble.below {
  transform: translate(-50%, 14px);
}

.bubble-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.35rem;
  line-height: 1.05;
}

.bubble-tech {
  margin-top: 3px;
  font-size: 0.8rem;
  font-weight: 900;
  color: var(--pink-deep);
}

.bubble-text {
  margin-top: 5px;
  font-size: 0.88rem;
  line-height: 1.4;
}

.num {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--yellow);
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 900;
}

.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.15s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
}

@media (max-width: 700px) {
  /* plus carré sur mobile : l'île reste lisible sans déborder de l'écran */
  .diorama {
    aspect-ratio: 1 / 1;
  }
  .pin {
    width: 22px;
    height: 22px;
    font-size: 0.7rem;
  }
}
</style>
