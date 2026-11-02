<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { kindLabels, type Project } from '../data/projects'

// Le Salesify raconte son problème dans une bulle, et le projet arrive
// comme remède, présenté en sachet de graines.
defineProps<{ project: Project }>()
const emit = defineEmits<{ close: [] }>()

const closeButton = ref<HTMLButtonElement>()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  closeButton.value?.focus({ preventScroll: true })
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="panel" :style="{ '--accent': project.salesify?.color ?? 'var(--yellow)' }" aria-live="polite">
    <blockquote v-if="project.salesify" class="bubble">
      <p class="who">
        <strong>{{ project.salesify.name }}</strong>, {{ project.salesify.epithet }}
      </p>
      <p class="problem">«&nbsp;{{ project.salesify.problem }}&nbsp;»</p>
    </blockquote>

    <article class="packet zigzag-top">
      <button ref="closeButton" class="round-btn close" aria-label="Fermer" @click="emit('close')">✕</button>
      <p class="remedy">Le remède</p>
      <h2 class="name">{{ project.name }}</h2>
      <p class="tagline">{{ project.tagline }}</p>
      <p class="description">{{ project.description }}</p>
      <dl class="facts">
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
          <dd>{{ project.year }} · {{ kindLabels[project.kind] }}</dd>
        </div>
      </dl>
      <footer class="bottom">
        <span v-if="project.status" class="status">{{ project.status }}</span>
        <a v-if="project.link" class="pill" :href="project.link.url" target="_blank" rel="noopener noreferrer">
          {{ project.link.label }} <span aria-hidden="true">↗</span>
        </a>
        <span v-else-if="project.confidential" class="private">Culture en serre privée : le code reste à l’abri, mais ça tourne en prod.</span>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.panel {
  display: grid;
  gap: 18px;
  width: min(420px, 100%);
}

/* --- La bulle de BD --- */
.bubble {
  position: relative;
  margin: 0;
  padding: 16px 20px;
  border: var(--border);
  border-radius: 24px 24px 24px 6px;
  background: #fff;
  transform: rotate(1deg);
}

.bubble::after {
  content: '';
  position: absolute;
  left: -2px;
  bottom: -16px;
  width: 26px;
  height: 18px;
  background: #fff;
  border-left: var(--border);
  border-bottom: var(--border);
  transform: skewX(-35deg);
  transform-origin: top left;
}

.who {
  font-size: 0.85rem;
}

.who strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.05rem;
}

.problem {
  margin-top: 4px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.12rem;
  line-height: 1.3;
}

/* --- Le sachet de graines --- */
.packet {
  position: relative;
  padding: 26px 22px 20px;
  background: var(--accent);
  border: var(--border);
  border-top: 0;
  max-height: min(70svh, 560px);
  overflow-y: auto;
}

.packet::before {
  content: '';
  position: absolute;
  inset: 12px 10px auto;
  border-top: 2px dashed rgb(20 20 20 / 0.5);
}

.close {
  position: absolute;
  top: 22px;
  right: 16px;
  width: 36px;
  height: 36px;
  font-size: 0.85rem;
}

.remedy {
  display: inline-block;
  margin-top: 8px;
  padding: 2px 10px;
  background: var(--ink);
  color: var(--accent);
  font-weight: 900;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.name {
  margin-top: 8px;
  padding-right: 40px;
  font-family: var(--font-display);
  font-weight: 800;
  font-variation-settings: 'wdth' 75;
  font-size: clamp(2rem, 4.5vw, 2.6rem);
  line-height: 0.95;
}

.tagline {
  margin-top: 6px;
  font-weight: 900;
  line-height: 1.25;
}

.description {
  margin-top: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.facts {
  display: grid;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 2px solid var(--ink);
}

.facts div {
  display: grid;
  grid-template-columns: 76px 1fr;
  align-items: start;
  gap: 8px;
}

dt {
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-top: 3px;
}

dd {
  margin: 0;
  font-size: 0.9rem;
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
  background: var(--cream);
  font-size: 0.78rem;
}

.bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.status {
  padding: 3px 10px;
  background: var(--cream);
  border: 2px solid var(--ink);
  font-size: 0.8rem;
  font-weight: 900;
  transform: rotate(-3deg);
}

.private {
  font-weight: 700;
  font-size: 0.88rem;
}

@media (max-width: 760px) {
  .panel {
    gap: 12px;
  }
  .bubble {
    padding: 12px 16px;
  }
  .problem {
    font-size: 0.95rem;
  }
  .packet {
    max-height: 36svh;
  }
}
</style>
