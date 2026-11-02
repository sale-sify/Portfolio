<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { kindLabels, type Project } from '../data/projects'
import SeedPacketFace from './SeedPacketFace.vue'
import SalesifyIcon from './SalesifyIcon.vue'

// La notice de culture : le sachet quitte sa place dans le catalogue, vole jusqu'au
// centre de l'écran en grandissant, et se retourne pour montrer son dos.
// `origin` renvoie la position actuelle de la carte, pour l'aller comme pour le retour.
const props = defineProps<{ project: Project; number: number; origin: () => DOMRect | undefined }>()
const emit = defineEmits<{ closed: [] }>()

const dialog = ref<HTMLDialogElement>()
const flipper = ref<HTMLElement>()
const closing = ref(false)
const box = ref(targetRect())

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const PERSPECTIVE = 'perspective(1800px)'

function targetRect() {
  const width = Math.min(880, window.innerWidth - 24)
  const height = Math.min(700, window.innerHeight - 24)
  return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height }
}

function px(rect: { left: number; top: number; width: number; height: number }) {
  return { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` }
}

// La notice prend la hauteur de son contenu, sans dépasser l'écran
function fitToContent() {
  const max = targetRect()
  const part = (selector: string) => flipper.value!.querySelector<HTMLElement>(selector)!
  // scrollHeight pour le contenu (sa hauteur complète), offsetHeight pour le reste
  const needed = part('.head').offsetHeight + part('.content').scrollHeight + part('.small-print').offsetHeight + 3
  const height = Math.min(needed, max.height)
  box.value = { ...max, height, top: (window.innerHeight - height) / 2 }
}

async function onResize() {
  box.value = targetRect()
  await nextTick()
  fitToContent()
}

onMounted(() => {
  dialog.value!.showModal()
  document.documentElement.style.overflow = 'hidden'
  window.addEventListener('resize', onResize)
  fitToContent()

  const from = props.origin()
  if (reducedMotion || !from) return
  const middle = {
    left: (from.left + box.value.left) / 2,
    top: (from.top + box.value.top) / 2 - 30,
    width: (from.width + box.value.width) / 2,
    height: (from.height + box.value.height) / 2,
  }
  // Aller, en deux temps : le sachet s'envole en montrant son recto, puis se retourne en grandissant
  flipper.value!.animate(
    [
      { ...px(from), transform: `${PERSPECTIVE} rotateY(0deg) rotate(-1deg)`, easing: 'cubic-bezier(0.5, 0, 0.7, 0.4)' },
      { ...px(middle), transform: `${PERSPECTIVE} rotateY(90deg) rotate(3deg)`, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
      { ...px(box.value), transform: `${PERSPECTIVE} rotateY(180deg) rotate(0deg)` },
    ],
    { duration: 850 },
  )
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  window.removeEventListener('resize', onResize)
})

async function close() {
  if (closing.value) return
  closing.value = true
  const to = props.origin()
  if (!reducedMotion && to) {
    // Retour : il se retourne et rentre à sa place dans le catalogue
    const middle = {
      left: (to.left + box.value.left) / 2,
      top: (to.top + box.value.top) / 2 - 30,
      width: (to.width + box.value.width) / 2,
      height: (to.height + box.value.height) / 2,
    }
    await flipper.value!.animate(
      [
        { ...px(box.value), transform: `${PERSPECTIVE} rotateY(180deg)`, easing: 'cubic-bezier(0.5, 0, 0.7, 0.4)' },
        { ...px(middle), transform: `${PERSPECTIVE} rotateY(90deg) rotate(-3deg)`, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
        { ...px(to), transform: `${PERSPECTIVE} rotateY(0deg) rotate(-1deg)` },
      ],
      { duration: 700, fill: 'forwards' },
    ).finished
  }
  dialog.value!.close()
  emit('closed')
}

// Un clic à côté de la notice (sur le fond) la referme
function onDialogClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="dialog"
    :class="{ closing }"
    aria-labelledby="notice-title"
    @cancel.prevent="close"
    @click="onDialogClick"
  >
    <div
      ref="flipper"
      class="flipper"
      :style="{ ...px(box), transform: `${PERSPECTIVE} rotateY(180deg)`, '--accent': project.salesify?.color ?? 'var(--yellow)' }"
    >
      <div class="side front" aria-hidden="true">
        <SeedPacketFace :project="project" :number="number" torn happy />
      </div>

      <article class="side back zigzag-top">
        <header class="head">
          <div class="head-text">
            <p class="meta">Notice de culture · N°&nbsp;{{ String(number).padStart(2, '0') }}</p>
            <h2 id="notice-title" class="name">{{ project.name }}</h2>
            <p class="tagline">{{ project.tagline }}</p>
          </div>
          <SalesifyIcon
            v-if="project.salesify"
            class="head-icon"
            :color="project.salesify.color"
            :accessory="project.salesify.accessory"
            happy
          />
          <button class="round-btn close" aria-label="Fermer la notice" @click="close">✕</button>
        </header>

        <div class="content">
          <div class="col">
            <section v-if="project.salesify" class="block">
              <h3>Symptômes</h3>
              <blockquote class="quote">«&nbsp;{{ project.salesify.problem }}&nbsp;»</blockquote>
              <p class="signature">— {{ project.salesify.name }}, {{ project.salesify.epithet }}</p>
            </section>
            <section class="block">
              <h3>Le remède</h3>
              <p>{{ project.description }}</p>
            </section>
          </div>

          <section class="block sheet">
            <h3>Fiche de culture</h3>
            <dl>
              <div>
                <dt>Variété</dt>
                <dd>
                  <ul class="stack">
                    <li v-for="tech in project.stack" :key="tech">{{ tech }}</li>
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Planté en</dt>
                <dd>{{ project.year }}</dd>
              </div>
              <div>
                <dt>Exposition</dt>
                <dd>{{ kindLabels[project.kind] }}</dd>
              </div>
              <div>
                <dt>Serre</dt>
                <dd>{{ project.confidential ? 'Privée' : 'Libre-service' }}</dd>
              </div>
              <div v-if="project.status">
                <dt>Statut</dt>
                <dd>{{ project.status }}</dd>
              </div>
            </dl>
            <div class="harvest">
              <a v-if="project.link" class="pill" :href="project.link.url" target="_blank" rel="noopener noreferrer">
                Récolter sur {{ project.link.label }} <span aria-hidden="true">↗</span>
              </a>
              <p v-else-if="project.confidential" class="private">
                Culture en serre privée : ça tourne en prod, mais le code reste à l’abri.
              </p>
            </div>
          </section>
        </div>

        <footer class="small-print">Semences Sale-Sify Develops · Garanties sans bug* <span>*ou presque</span></footer>
      </article>
    </div>
  </dialog>
</template>

<style scoped>
.dialog {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
}

.dialog::backdrop {
  background: rgb(20 20 20 / 0.6);
  animation: fade-in 0.45s ease both;
}

.dialog.closing::backdrop {
  animation: fade-out 0.6s ease both;
}

/* Le sachet : deux faces dos à dos, qui tournent ensemble */
.flipper {
  position: fixed;
  transform-style: preserve-3d;
}

.side {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.back {
  display: flex;
  flex-direction: column;
  transform: rotateY(180deg);
  background: var(--cream);
  border: var(--border);
  border-top: 0;
  overflow: hidden;
}

/* --- En-tête du verso --- */
.head {
  position: relative;
  flex-shrink: 0;
  display: flex;
  padding: 30px 28px 22px;
  background:
    repeating-conic-gradient(from 0deg at 85% 140%, rgb(20 20 20 / 0.07) 0 6deg, transparent 6deg 12deg),
    var(--accent);
  border-bottom: var(--border);
  overflow: hidden;
}

.head-text {
  max-width: calc(100% - 150px);
}

.meta {
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.name {
  margin-top: 6px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  line-height: 0.9;
}

.tagline {
  margin-top: 8px;
  font-weight: 900;
  font-size: 1.1rem;
}

.head-icon {
  position: absolute;
  right: 70px;
  bottom: -44px;
  width: 120px;
  transform: rotate(-6deg);
}

.close {
  position: absolute;
  top: 22px;
  right: 18px;
}

/* --- Corps de la notice --- */
.content {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
  padding: 24px 28px;
  overflow-y: auto;
}

.col {
  display: grid;
  gap: 18px;
  align-content: start;
}

.block h3 {
  display: inline-block;
  margin-bottom: 8px;
  padding: 2px 10px;
  background: var(--ink);
  color: var(--cream);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.block p {
  line-height: 1.55;
}

.quote {
  margin: 0;
  padding: 12px 16px;
  border: 2px solid var(--ink);
  border-radius: 18px 18px 18px 4px;
  background: #fff;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
  line-height: 1.3;
}

.signature {
  margin-top: 6px;
  font-size: 0.9rem;
  font-weight: 700;
}

.sheet {
  align-self: start;
  padding: 18px;
  border: 2px solid var(--ink);
  background: #fff;
}

dl {
  display: grid;
  gap: 10px;
}

dl div {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1.5px dashed rgb(20 20 20 / 0.3);
}

dt {
  padding-top: 2px;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

dd {
  margin: 0;
  font-weight: 700;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 0;
  list-style: none;
}

.stack li {
  padding: 1px 9px;
  border: 2px solid var(--ink);
  border-radius: 99px;
  background: var(--accent);
  font-size: 0.8rem;
}

.harvest {
  margin-top: 16px;
}

.private {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.4;
}

.small-print {
  flex-shrink: 0;
  margin-top: auto;
  padding: 10px 28px;
  border-top: 2px solid var(--ink);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.small-print span {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes fade-out {
  to {
    opacity: 0;
  }
}

@media (max-width: 700px) {
  .head {
    padding: 28px 18px 18px;
  }
  .head-text {
    max-width: calc(100% - 50px);
  }
  .head-icon {
    display: none;
  }
  .content {
    grid-template-columns: 1fr;
    padding: 18px;
  }
  .small-print {
    padding: 10px 18px;
  }
}
</style>
