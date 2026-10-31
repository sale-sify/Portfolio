<script setup lang="ts">
import { ref } from 'vue'
import { projects, type Project } from '../data/projects'
import { seedBurst } from '../utils/seedBurst'
import SeedPacketFace from './SeedPacketFace.vue'
import PacketModal from './PacketModal.vue'

const remedies = projects.filter((p) => p.salesify)
const seedlings = projects.filter((p) => p.kind === 'weekend' || p.kind === 'perso')

const cards: Record<string, HTMLElement> = {}
const hoveredId = ref<string | null>(null)
const tornId = ref<string | null>(null)
const opened = ref<{ project: Project; number: number } | null>(null)

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Ouvrir un sachet : on arrache la bande du haut, les graines jaillissent,
// puis la notice prend le relais (voir PacketModal).
function open(project: Project, number: number) {
  if (opened.value) return
  tornId.value = project.id
  const strip = cards[project.id]?.querySelector('.strip')?.getBoundingClientRect()
  if (strip) seedBurst(strip.left + strip.width / 2, strip.bottom)
  setTimeout(() => (opened.value = { project, number }), reducedMotion ? 0 : 320)
}

function onClosed() {
  opened.value = null
  tornId.value = null // la bande se recolle
}
</script>

<template>
  <section id="projets" class="projects" aria-labelledby="projets-title">
    <header class="head">
      <h2 id="projets-title" class="title extrude">Le catalogue de graines</h2>
      <p class="intro">
        Chaque sachet contient un remède, testé sur un vrai Salesify. Certains sont en libre-service, d’autres poussent
        en <strong>serre privée</strong> : l’outil tourne en prod chez Framboise, mais le code reste à l’abri.
        <strong>Ouvre un sachet</strong> pour lire sa notice.
      </p>
    </header>

    <ul class="grid">
      <li v-for="(project, i) in remedies" :key="project.id">
        <div
          :ref="(el) => (cards[project.id] = el as HTMLElement)"
          class="card"
          :class="{ away: opened?.project.id === project.id }"
          @mouseenter="hoveredId = project.id"
          @mouseleave="hoveredId = null"
        >
          <SeedPacketFace
            :project="project"
            :number="i + 1"
            :torn="tornId === project.id"
            :happy="hoveredId === project.id || tornId === project.id"
          />
          <!-- Le bouton couvre toute la carte : clic, Entrée et Espace ouvrent le sachet -->
          <button
            class="hit"
            :aria-label="`Ouvrir le sachet ${project.name}`"
            @click="open(project, i + 1)"
            @focus="hoveredId = project.id"
            @blur="hoveredId = null"
          />
        </div>
      </li>
    </ul>

    <div class="seedlings">
      <header class="seedlings-head">
        <h3>Semis du weekend</h3>
        <p>Des petits projets plantés un samedi, juste pour le plaisir de voir ce qui pousse.</p>
      </header>
      <ul class="labels">
        <li v-for="project in seedlings" :key="project.id" class="label">
          <svg class="sprout" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 22V11M12 11C11 6 7 3 3 3c1 5 4 8 9 8zm0 0c1-5 5-8 9-8-1 5-4 8-9 8z" />
          </svg>
          <h4>{{ project.name }}</h4>
          <p class="label-tagline">{{ project.tagline }}</p>
          <p class="label-description">{{ project.description }}</p>
          <p class="label-stack">{{ project.stack.join(' · ') }}</p>
          <a v-if="project.link" class="label-link" :href="project.link.url" target="_blank" rel="noopener noreferrer">
            {{ project.link.label }} <span aria-hidden="true">↗</span>
          </a>
        </li>
        <!-- Un coin de terre libre, en attendant les prochains projets perso -->
        <li class="label empty">
          <span class="hole" aria-hidden="true" />
          <h4>Terre libre</h4>
          <p class="label-description">Ce coin attend sa prochaine graine. Un projet perso est en train de germer.</p>
        </li>
      </ul>
    </div>

    <PacketModal
      v-if="opened"
      :project="opened.project"
      :number="opened.number"
      :origin="() => cards[opened!.project.id]?.getBoundingClientRect()"
      @closed="onClosed"
    />
  </section>
</template>

<style scoped>
.projects {
  padding: clamp(72px, 10vw, 130px) var(--gutter);
  background: var(--cream);
}

.head,
.grid,
.seedlings {
  max-width: 1200px;
  margin-inline: auto;
}

.title {
  max-width: 10ch;
  font-size: clamp(3.2rem, 10vw, 7.5rem);
  color: var(--pink);
}

.intro {
  max-width: 58ch;
  margin-top: 24px;
  font-size: clamp(1.05rem, 1.8vw, 1.25rem);
  line-height: 1.5;
}

.grid {
  /* flex plutôt que grid : la dernière rangée incomplète reste centrée */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 44px 32px;
  margin-top: clamp(40px, 6vw, 72px);
  padding: 0;
  list-style: none;
}

.grid li {
  display: grid;
  flex: 1 1 300px;
  max-width: 360px;
}

/* --- Un sachet dans le présentoir --- */
.card {
  position: relative;
  /* l'ombre est un filtre : le masque en dents de scie couperait un box-shadow */
  filter: drop-shadow(6px 6px 0 var(--ink));
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* posés un peu de travers, comme sur un présentoir */
.grid li:nth-child(odd) .card {
  transform: rotate(-1.2deg);
}

.grid li:nth-child(even) .card {
  transform: rotate(1.2deg);
}

.grid li .card:hover,
.grid li .card:focus-within {
  transform: translateY(-8px) rotate(0deg);
}

/* la bande du haut frémit, comme pour dire "tire ici" */
.card:hover :deep(.strip:not(.torn)) {
  transform: rotate(-2deg) translateY(-3px);
  transform-origin: left bottom;
}

/* pendant que la notice est ouverte, le sachet a quitté le présentoir */
.card.away {
  visibility: hidden;
}

.hit {
  position: absolute;
  inset: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.hit:focus-visible {
  outline-offset: 6px;
}

/* --- Semis du weekend : des étiquettes de semis --- */
.seedlings {
  margin-top: clamp(72px, 9vw, 110px);
}

.seedlings-head h3 {
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
}

.seedlings-head p {
  margin-top: 8px;
  max-width: 50ch;
}

.labels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 24px;
  margin-top: 28px;
  padding: 0;
  list-style: none;
}

.label {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 18px;
  border: var(--border);
  border-radius: 6px 6px 40px 40px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--ink);
  transition: transform 0.2s ease;
}

.label:hover {
  transform: rotate(-1.5deg);
}

.sprout {
  width: 30px;
  height: 30px;
  fill: var(--leaf);
  stroke: var(--ink);
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.label h4 {
  margin-top: 8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: 1.6rem;
  line-height: 1;
}

.label-tagline {
  margin-top: 4px;
  font-weight: 900;
}

.label-description {
  margin-top: 6px;
  font-size: 0.92rem;
  line-height: 1.45;
}

.label-stack {
  margin-top: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgb(20 20 20 / 0.6);
}

.label-link {
  align-self: flex-start;
  margin-top: auto;
  padding-top: 14px;
  font-weight: 900;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.label.empty {
  border-style: dashed;
  background: transparent;
  box-shadow: none;
}

.hole {
  width: 30px;
  height: 14px;
  margin-top: 16px;
  border-radius: 50%;
  background: var(--soil);
}
</style>
