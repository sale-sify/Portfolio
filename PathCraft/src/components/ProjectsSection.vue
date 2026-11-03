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

// La terre des jardinières : un dessus bosselé, étiré sur toute la largeur du bac
const SOIL_PATH =
  'M0 24V13C4 7 10 5 17 9 23 3 33 2 40 8 47 5 52 6 57 9 64 1 76 2 82 8 88 4 95 5 100 10V24Z'

const reducedMotion =window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      <!-- Chaque projet est une étiquette de semis piquée dans sa butte de terre.
           Les buttes d'une même rangée se touchent et forment un sillon. -->
      <ul class="plots">
        <li v-for="project in seedlings" :key="project.id" class="plot">
          <div class="marker">
            <article class="label">
              <!-- doublon du lien texte : retiré du clavier et des lecteurs d'écran -->
              <a
                v-if="project.thumbnail"
                class="thumb"
                :href="project.link?.url"
                target="_blank"
                rel="noopener noreferrer"
                tabindex="-1"
                aria-hidden="true"
              >
                <img :src="project.thumbnail" alt="" width="640" height="480" loading="lazy" decoding="async" />
              </a>
              <h4>{{ project.name }}</h4>
              <p class="label-tagline">{{ project.tagline }}</p>
              <p class="label-description">{{ project.description }}</p>
              <p class="label-stack">{{ project.stack.join(' · ') }}</p>
              <a v-if="project.link" class="label-link" :href="project.link.url" target="_blank" rel="noopener noreferrer">
                {{ project.link.label }} <span aria-hidden="true">↗</span>
              </a>
            </article>
            <span class="stake" aria-hidden="true" />
          </div>
          <span class="bed" aria-hidden="true">
            <span class="soil">
              <svg viewBox="0 0 100 24" preserveAspectRatio="none">
                <path :d="SOIL_PATH" />
              </svg>
            </span>
            <span class="crate" />
            <!-- une jeune pousse, qui grandit et fleurit au survol de l'étiquette -->
            <svg class="sprout" viewBox="0 0 48 64">
              <path class="stem" d="M24 64V16" />
              <path class="leaf low left" d="M24 44C22 35 14 30 4 31c2 9 10 14 20 13z" />
              <path class="leaf low right" d="M24 44c2-9 10-14 20-13-2 9-10 14-20 13z" />
              <path class="leaf top left" d="M24 23c-2-6-7-9-14-8 1 6 6 9 14 8z" />
              <path class="leaf top right" d="M24 23c2-6 7-9 14-8-1 6-6 9-14 8z" />
              <circle class="bud" cx="24" cy="13" r="4.5" />
            </svg>
          </span>
        </li>
        <!-- Un coin de terre libre, en attendant les prochains projets perso -->
        <li class="plot empty">
          <div class="marker">
            <div class="label">
              <h4>Terre libre</h4>
              <p class="label-description">Ce coin attend sa prochaine graine. Un projet perso est en train de germer.</p>
            </div>
            <span class="stake" aria-hidden="true" />
          </div>
          <span class="bed" aria-hidden="true">
            <span class="soil">
              <svg viewBox="0 0 100 24" preserveAspectRatio="none">
                <path :d="SOIL_PATH" />
              </svg>
              <span class="hole" />
            </span>
            <span class="crate" />
          </span>
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

.plots {
  --gap: 28px;
  --wood: #e9b872;
  --stake: 64px;
  --buried: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
  gap: 44px var(--gap);
  margin-top: 36px;
  padding: 0;
  list-style: none;
}

.plot {
  display: flex;
  flex-direction: column;
}

/* l'étiquette et son piquet pivotent depuis la pointe enfoncée dans la terre */
.marker {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  rotate: -1deg;
  transform-origin: 50% 100%;
}

.plot:nth-child(even) .marker {
  rotate: 1.2deg;
}

.plot:hover .marker,
.plot:focus-within .marker {
  animation: sway 0.9s ease-in-out;
}

/* un coup de vent dans le potager */
@keyframes sway {
  30% {
    transform: rotate(-3deg);
  }
  60% {
    transform: rotate(2deg);
  }
  85% {
    transform: rotate(-0.8deg);
  }
}

.label {
  position: relative;
  z-index: 1;
  flex: 1;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: 14px 14px 18px;
  border: var(--border);
  border-radius: 10px;
  background: #fff;
  box-shadow: 4px 4px 0 var(--ink);
}

.thumb {
  display: block;
  margin-bottom: 14px;
  overflow: hidden;
  border: var(--border);
  border-radius: 6px;
  background: var(--cream);
}

.thumb img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.plot:hover .thumb img {
  transform: scale(1.05);
}

.stake {
  width: 22px;
  height: var(--stake);
  margin-top: -2.5px;
  border: var(--border);
  border-top: 0;
  /* une veine dans le bois */
  background: linear-gradient(90deg, transparent 40%, rgb(91 58 41 / 0.25) 40% 52%, transparent 52%) var(--wood);
}

/* --- La jardinière, dans le style du bac du hero : caisse en bois, lattes, poteaux, terre et cailloux --- */
.bed {
  position: relative;
  z-index: 2;
  display: block;
  margin: calc(var(--buried) * -1) -8px 0;
}

.soil {
  position: relative;
  display: block;
  height: 34px;
  margin-inline: 12px;
}

.soil svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.soil path {
  fill: var(--soil);
  stroke: var(--ink);
  stroke-width: 2.5;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

/* quelques cailloux éparpillés sur la terre */
.soil::after {
  content: '';
  position: absolute;
  inset: 12px 10px 10px;
  background:
    radial-gradient(ellipse 4.5px 3px, #8c6a55 90%, transparent) 4px 1px / 62px 12px,
    radial-gradient(ellipse 3.5px 2.5px, #8c6a55 90%, transparent) 30px 6px / 62px 12px,
    radial-gradient(ellipse 4px 2.5px, #8c6a55 90%, transparent) 48px 0 / 62px 12px;
  background-repeat: repeat-x;
}

.crate {
  position: relative;
  display: block;
  height: 44px;
  margin-top: -10px;
  border: var(--border);
  border-radius: 9px;
  /* deux lattes en façade */
  background:
    linear-gradient(#9c6436, #9c6436) 0 33% / 100% 2.5px no-repeat,
    linear-gradient(#9c6436, #9c6436) 0 68% / 100% 2.5px no-repeat,
    #d99a5b;
  box-shadow: 4px 4px 0 var(--ink);
}

/* les poteaux d'angle */
.crate::before,
.crate::after {
  content: '';
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 20px;
  border: var(--border);
  border-radius: 6px;
  background: #c0834a;
}

.crate::before {
  left: 8px;
}

.crate::after {
  right: 8px;
}

.sprout {
  position: absolute;
  bottom: calc(100% - 16px);
  left: calc(50% + 14px);
  width: 78px;
  height: 104px;
  overflow: visible;
  stroke: var(--ink);
  stroke-width: 1.4;
  stroke-linejoin: round;
}

/* au repos, seul le bas de la tige est tracé */
.stem {
  fill: none;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 26;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.15s;
}

.leaf,
.bud {
  transform-box: fill-box;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.leaf {
  fill: var(--leaf);
}

/* chaque feuille s'ouvre depuis son point d'attache sur la tige */
.leaf.left {
  transform-origin: 100% 90%;
}

.leaf.right {
  transform-origin: 0% 90%;
}

.leaf.top,
.bud {
  transform: scale(0);
}

.bud {
  fill: var(--pink);
  transform-origin: 50% 100%;
}

/* au survol : la tige monte, les feuilles du haut se déplient, puis le bouton éclot */
.plot:hover .stem,
.plot:focus-within .stem {
  stroke-dashoffset: 0;
  transition-delay: 0s;
}

.plot:hover .leaf.low,
.plot:focus-within .leaf.low {
  transform: scale(1.12);
}

.plot:hover .leaf.top,
.plot:focus-within .leaf.top {
  transform: scale(1);
  transition-delay: 0.2s;
}

.plot:hover .bud,
.plot:focus-within .bud {
  transform: scale(1);
  transition-delay: 0.38s;
}

.label h4 {
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

/* --- Terre libre : un emplacement vide, l'étiquette n'est pas encore plantée --- */
.plot.empty .label {
  justify-content: center;
  margin-bottom: calc(var(--stake) - var(--buried));
  border-style: dashed;
  background: transparent;
  box-shadow: none;
}

.plot.empty .stake {
  display: none;
}

.hole {
  position: absolute;
  z-index: 1;
  top: 11px;
  left: 50%;
  width: 34px;
  height: 10px;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.4);
  translate: -50% 0;
}
</style>
