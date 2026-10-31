<script setup lang="ts">
import { computed } from 'vue'
import { garden, type GardenMode } from '../../data/infra'
import MapSign from './MapSign.vue'
import MapSpot from './MapSpot.vue'

// Le plan du jardin, dessiné en SVG. Deux versions : aujourd'hui et demain.
// Les numéros des panneaux correspondent à la légende (src/data/infra.ts).
const props = defineProps<{ mode: GardenMode; active: string | null }>()
const emit = defineEmits<{ hover: [id: string | null] }>()

const hover = (id: string | null) => emit('hover', id)
const n = (id: string) => garden[props.mode].spots.findIndex((s) => s.id === id) + 1

const height = computed(() => (props.mode === 'today' ? 600 : 660))

// Les canaux d'irrigation (= le trafic), dessinés dans le sens du courant
const canals = computed(() =>
  props.mode === 'today'
    ? ['M150 76 V256', 'M590 76 V140', 'M590 280 V370', 'M770 76 V172', 'M620 470 H692', 'M900 300 V430']
    : [
        'M150 76 V256',
        'M610 76 V340',
        'M610 340 H500',
        'M610 340 H845',
        'M500 340 V372',
        'M730 340 V372',
        'M845 340 V372',
        'M560 450 V528',
      ],
)

const beds = [
  { x: 500, name: 'CRM', color: '#ffd23f' },
  { x: 615, name: 'DUPLIK', color: '#8c52ff' },
  { x: 730, name: 'Actus-auto', color: '#4d9de0' },
  { x: 845, name: 'CMF', color: '#3ddc97' },
]
const tagX = (center: number, text: string) => center - (text.length * 7.6 + 20) / 2

// Un puits (= une base de données)
function well(cx: number, cy: number) {
  return { cx, cy }
}
const wells = computed(() => (props.mode === 'today' ? [well(730, 470), well(900, 470)] : [well(560, 545)]))
</script>

<template>
  <svg :viewBox="`0 0 1000 ${height}`" class="map" role="img" :aria-label="garden[mode].caption">
    <defs>
      <!-- Une pousse, posée sur sa base (0, 0) -->
      <g id="g-sprout">
        <path d="M0 0V-12" class="stem" />
        <path d="M0-12C-1-19-6-23-12-24c1 7 6 11 12 12zm0 0c1-7 6-11 12-12-1 7-6 11-12 12z" class="leaf" />
      </g>
      <!-- Une abeille (= un visiteur) -->
      <g id="g-bee">
        <ellipse cx="-4" cy="-9" rx="6" ry="4" class="wing" />
        <ellipse cx="4" cy="-9" rx="6" ry="4" class="wing" />
        <ellipse cx="0" cy="0" rx="10" ry="7" class="bee-body" />
        <path d="M-3-6.5v13M3-6.5v13" class="bee-stripe" />
      </g>
    </defs>

    <!-- Le pré du domaine (demain), sous les canaux -->
    <rect v-if="mode === 'tomorrow'" x="372" y="118" width="600" height="524" rx="28" class="meadow" />

    <!-- Canaux : contour noir, eau, puis le courant qui file -->
    <g class="canals">
      <path v-for="d in canals" :key="`ink${d}`" :d="d" class="canal-ink" />
      <path v-for="d in canals" :key="`water${d}`" :d="d" class="canal-water" />
      <path v-for="d in canals" :key="`flow${d}`" :d="d" class="canal-flow" />
    </g>

    <!-- 1. La rivière -->
    <MapSpot id="river" :active="active" :i="0" @hover="hover">
      <path d="M-20 50 C160 22 320 80 500 50 S840 22 1020 50" class="river-ink" />
      <path d="M-20 50 C160 22 320 80 500 50 S840 22 1020 50" class="river-water" />
      <path d="M-20 50 C160 22 320 80 500 50 S840 22 1020 50" class="river-flow" />
      <g class="bees">
        <use href="#g-bee" :x="mode === 'today' ? 680 : 560" y="104" class="bee" />
        <use href="#g-bee" :x="mode === 'today' ? 720 : 680" y="92" class="bee b2" />
        <use href="#g-bee" :x="mode === 'today' ? 650 : 520" y="88" class="bee b3" />
      </g>
      <MapSign :x="250" :y="84" text="Rivière · Internet" :n="n('river')" />
    </MapSpot>

    <!-- 2. La grange (Git) -->
    <MapSpot id="grange" :active="active" :i="1" @hover="hover">
      <rect x="45" y="470" width="100" height="65" class="barn" />
      <polygon points="35,472 95,428 155,472" class="barn-roof" />
      <rect x="80" y="495" width="30" height="40" class="barn-door" />
      <path d="M80 495l30 40M110 495l-30 40" class="thin-ink" />
      <MapSign :x="36" :y="546" text="Grange · Git" :n="n('grange')" />
    </MapSpot>

    <!-- 3. Le moulin à eau (CI/CD) et ses chemins de terre (déploiements) -->
    <MapSpot id="mill" :active="active" :i="2" @hover="hover">
      <path d="M140 470C190 440 215 400 222 345" class="trail" />
      <template v-if="mode === 'today'">
        <path d="M274 290C330 290 350 215 400 215" class="trail" />
        <path d="M274 320C330 330 350 450 400 450" class="trail" />
        <path d="M240 250C300 105 640 112 700 190" class="trail" />
      </template>
      <path v-else d="M274 300C340 300 380 380 432 380" class="trail" />
      <rect x="178" y="250" width="96" height="90" class="house" />
      <polygon points="168,252 226,210 284,252" class="mill-roof" />
      <rect x="212" y="275" width="26" height="24" class="window" />
      <g class="wheel">
        <circle cx="150" cy="300" r="44" class="wheel-rim" />
        <circle cx="150" cy="300" r="33" class="wheel-inner" />
        <path
          d="M150 256V344M106 300H194M119 269L181 331M181 269L119 331"
          class="wheel-spokes"
        />
        <circle cx="150" cy="300" r="9" class="wheel-hub" />
      </g>
      <MapSign :x="176" :y="352" text="Moulin · CI/CD" :n="n('mill')" />
    </MapSpot>

    <!-- ===================== AUJOURD'HUI ===================== -->
    <template v-if="mode === 'today'">
      <!-- 4. Le carré Vercel -->
      <MapSpot id="vercel" :active="active" :i="3" @hover="hover">
        <rect x="400" y="140" width="220" height="140" rx="16" class="plot-frame" />
        <rect x="408" y="148" width="204" height="124" rx="10" class="plot-soil" />
        <use v-for="x in [432, 462, 492, 534, 564, 594]" :key="x" href="#g-sprout" :x="x" y="212" />
        <MapSign :x="418" :y="226" text="DUPLIK" />
        <MapSign :x="510" :y="226" text="Actus-auto" />
        <MapSign :x="405" :y="290" text="Vercel · fronts" :n="n('vercel')" />
      </MapSpot>

      <!-- 5. Le carré Render -->
      <MapSpot id="render" :active="active" :i="4" @hover="hover">
        <rect x="400" y="370" width="220" height="150" rx="16" class="plot-frame" />
        <rect x="408" y="378" width="204" height="134" rx="10" class="plot-soil" />
        <use v-for="x in [430, 460, 560, 590]" :key="x" href="#g-sprout" :x="x" y="452" />
        <MapSign :x="410" :y="466" text="Actus-auto" />
        <MapSign :x="535" :y="466" text="DUPLIK" />
        <MapSign :x="405" :y="530" text="Render · API" :n="n('render')" />
      </MapSpot>

      <!-- 6. La rigole Actus-auto → DUPLIK -->
      <MapSpot id="feed" :active="active" :i="5" @hover="hover">
        <path d="M470 418H552" class="rigole-ink" />
        <path d="M470 418H552" class="rigole-water" />
        <path d="M470 418H552" class="rigole-flow" />
        <MapSign :x="458" :y="384" text="Rigole" :n="n('feed')" />
      </MapSpot>

      <!-- 7. La serre Azure -->
      <MapSpot id="azure" :active="active" :i="6" @hover="hover">
        <rect x="690" y="195" width="270" height="105" class="glass" />
        <polygon points="690,197 825,142 960,197" class="glass-roof" />
        <path d="M735 197V300M780 197V300M825 197V300M870 197V300M915 197V300" class="mullions" />
        <rect v-for="x in [722, 787, 852]" :key="x" :x="x" y="250" width="54" height="42" class="crate" />
        <path v-for="x in [722, 787, 852]" :key="`s${x}`" :d="`M${x} 271h54`" class="thin-ink" />
        <MapSign :x="778" :y="214" text="CRM" />
        <!-- la girouette Prometheus -->
        <path d="M825 142V108" class="ink-line" />
        <polygon points="825,108 852,116 825,124" class="flag" />
        <MapSign :x="700" :y="312" text="Serre · Azure" :n="n('azure')" />
      </MapSpot>
    </template>

    <!-- ===================== DEMAIN ===================== -->
    <template v-else>
      <!-- 4. La grille (pfSense), avec la clôture du domaine -->
      <MapSpot id="gate" :active="active" :i="3" @hover="hover">
        <rect x="372" y="118" width="600" height="524" rx="28" class="fence-ink" />
        <rect x="372" y="118" width="600" height="524" rx="28" class="fence-wood" />
        <rect x="583" y="98" width="13" height="42" class="post" />
        <rect x="624" y="98" width="13" height="42" class="post" />
        <path d="M596 104H624M600 104V136M606 104V136M612 104V136M618 104V136" class="grille" />
        <MapSign :x="646" :y="128" text="Grille · pfSense" :n="n('gate')" />
      </MapSpot>

      <!-- 5. L'écluse (nginx) -->
      <MapSpot id="nginx" :active="active" :i="4" @hover="hover">
        <rect x="588" y="186" width="44" height="26" class="post" />
        <rect x="595" y="166" width="30" height="26" class="sluice" />
        <circle cx="610" cy="158" r="10" class="sluice-wheel" />
        <path d="M600 158H620M610 148V168" class="thin-ink" />
        <MapSign :x="646" :y="182" text="Écluse · nginx" :n="n('nginx')" />
      </MapSpot>

      <!-- 6. La grande serre (Proxmox) et ses plates-bandes (LXC) -->
      <MapSpot id="proxmox" :active="active" :i="5" @hover="hover">
        <rect x="430" y="300" width="480" height="150" rx="6" class="glass" />
        <polygon points="430,302 670,250 910,302" class="glass-roof" />
        <path d="M490 302V450M550 302V450M670 302V450M790 302V450M850 302V450" class="mullions" />
        <g v-for="bed in beds" :key="bed.name">
          <rect :x="bed.x - 45" y="370" width="90" height="60" rx="8" class="plot-soil bed" />
          <use v-for="dx in [-22, 0, 22]" :key="dx" href="#g-sprout" :x="bed.x + dx" y="408" />
          <circle :cx="bed.x" cy="420" r="5" :style="{ fill: bed.color }" class="bed-dot" />
          <MapSign :x="tagX(bed.x, bed.name)" :y="438" :text="bed.name" />
        </g>
        <MapSign :x="700" :y="222" text="Serre · Proxmox" :n="n('proxmox')" />
      </MapSpot>

      <!-- 8. La station météo (Prometheus + Grafana) -->
      <MapSpot id="monitoring" :active="active" :i="7" @hover="hover">
        <path d="M880 610V500" class="ink-line thick" />
        <g class="anemometer">
          <path d="M880 500l-22-8M880 500l22-8M880 500v-22" class="ink-line" />
          <circle cx="858" cy="492" r="6" class="cup" />
          <circle cx="902" cy="492" r="6" class="cup" />
          <circle cx="880" cy="478" r="6" class="cup" />
        </g>
        <rect x="790" y="528" width="76" height="50" rx="5" class="screen" />
        <polyline points="798,566 812,556 826,562 840,544 856,548" class="chart" />
        <MapSign :x="760" :y="606" text="Météo · Grafana" :n="n('monitoring')" />
      </MapSpot>

      <!-- 9. Le tunnel de la taupe (VPN) -->
      <MapSpot id="vpn" :active="active" :i="8" @hover="hover">
        <path d="M322 615C360 655 420 655 452 618" class="tunnel" />
        <rect x="250" y="575" width="72" height="52" class="cabin" />
        <polygon points="240,577 286,543 332,577" class="barn-roof" />
        <rect x="276" y="597" width="20" height="30" class="barn-door" />
        <g class="mole">
          <ellipse cx="458" cy="622" rx="26" ry="10" class="mound" />
          <circle cx="458" cy="606" r="14" class="mole-head" />
          <circle cx="452" cy="602" r="2.5" class="eye-dot" />
          <circle cx="464" cy="602" r="2.5" class="eye-dot" />
          <circle cx="458" cy="610" r="4" class="mole-nose" />
        </g>
        <MapSign :x="226" :y="510" text="Tunnel · VPN" :n="n('vpn')" />
      </MapSpot>
    </template>

    <!-- Les puits (bases de données), dessinés en dernier pour passer devant leurs tuyaux -->
    <MapSpot :id="mode === 'today' ? 'wells' : 'db'" :active="active" :i="mode === 'today' ? 7 : 6" @hover="hover">
      <g v-for="w in wells" :key="w.cx">
        <rect :x="w.cx - 34" :y="w.cy - 5" width="68" height="50" rx="6" class="stone" />
        <path :d="`M${w.cx - 34} ${w.cy + 12}h68M${w.cx - 34} ${w.cy + 28}h68M${w.cx - 10} ${w.cy - 5}v17M${w.cx + 14} ${w.cy + 12}v16`" class="thin-ink" />
        <ellipse :cx="w.cx" :cy="w.cy - 5" rx="34" ry="10" class="well-water" />
        <path :d="`M${w.cx - 28} ${w.cy - 8}V${w.cy - 52}M${w.cx + 28} ${w.cy - 8}V${w.cy - 52}`" class="ink-line thick" />
        <polygon :points="`${w.cx - 42},${w.cy - 48} ${w.cx},${w.cy - 76} ${w.cx + 42},${w.cy - 48}`" class="well-roof" />
        <path :d="`M${w.cx} ${w.cy - 48}V${w.cy - 26}`" class="thin-ink" />
        <rect :x="w.cx - 8" :y="w.cy - 26" width="16" height="14" rx="2" class="bucket" />
      </g>
      <template v-if="mode === 'today'">
        <MapSign :x="682" :y="528" text="PostgreSQL" :n="n('wells')" />
        <MapSign :x="846" :y="528" text="MongoDB Atlas" />
      </template>
      <MapSign v-else :x="500" :y="604" text="Puits · PostgreSQL" :n="n('db')" />
    </MapSpot>
  </svg>
</template>

<style scoped>
.map {
  display: block;
  width: 100%;
  height: auto;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* --- Eau --- */
.river-ink {
  fill: none;
  stroke: var(--ink);
  stroke-width: 50;
}
.river-water {
  fill: none;
  stroke: #6ec3f5;
  stroke-width: 43;
}
.canal-ink,
.rigole-ink {
  fill: none;
  stroke: var(--ink);
  stroke-width: 18;
}
.canal-water,
.rigole-water {
  fill: none;
  stroke: #6ec3f5;
  stroke-width: 12;
}
.rigole-ink {
  stroke-width: 12;
}
.rigole-water {
  stroke-width: 7;
}
.river-flow,
.canal-flow,
.rigole-flow {
  fill: none;
  stroke: #fff;
  stroke-width: 3;
  stroke-dasharray: 6 22;
  opacity: 0.85;
  animation: flow 1.2s linear infinite;
}
.river-flow {
  stroke-width: 4;
  stroke-dasharray: 14 40;
  animation-duration: 2.2s;
}

/* --- Terre, bois, verre --- */
.meadow {
  fill: #c7ebb0;
}
.plot-frame {
  fill: #d99a5b;
  stroke: var(--ink);
  stroke-width: 3;
}
.plot-soil {
  fill: var(--soil);
}
.bed {
  stroke: var(--ink);
  stroke-width: 2.5;
}
.bed-dot {
  stroke: var(--ink);
  stroke-width: 2;
}
.glass {
  fill: rgb(205 238 255 / 0.65);
  stroke: var(--ink);
  stroke-width: 3;
}
.glass-roof {
  fill: rgb(230 247 255 / 0.9);
  stroke: var(--ink);
  stroke-width: 3;
}
.mullions {
  stroke: var(--ink);
  stroke-width: 1.5;
  opacity: 0.4;
}
.crate {
  fill: var(--blue);
  stroke: var(--ink);
  stroke-width: 2.5;
}
.flag {
  fill: var(--orange);
  stroke: var(--ink);
  stroke-width: 2;
  transform-box: fill-box;
  transform-origin: left center;
  animation: flutter 1.4s ease-in-out infinite alternate;
}

/* --- Bâtiments --- */
.barn {
  fill: var(--pink-deep);
  stroke: var(--ink);
  stroke-width: 3;
}
.barn-roof {
  fill: var(--soil);
  stroke: var(--ink);
  stroke-width: 3;
}
.barn-door,
.window {
  fill: var(--cream);
  stroke: var(--ink);
  stroke-width: 2;
}
.house {
  fill: var(--cream);
  stroke: var(--ink);
  stroke-width: 3;
}
.mill-roof {
  fill: var(--orange);
  stroke: var(--ink);
  stroke-width: 3;
}
.cabin {
  fill: #d99a5b;
  stroke: var(--ink);
  stroke-width: 3;
}

/* --- La roue du moulin, qui tourne --- */
.wheel {
  transform-box: fill-box;
  transform-origin: center;
  animation: spin 7s linear infinite;
}
.wheel-rim {
  fill: #d99a5b;
  stroke: var(--ink);
  stroke-width: 3;
}
.wheel-inner {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2;
}
.wheel-spokes {
  stroke: var(--ink);
  stroke-width: 3;
}
.wheel-hub {
  fill: var(--ink);
}

/* --- Chemin de terre (déploiements) : les graines avancent dessus --- */
.trail {
  fill: none;
  stroke: #8a5a3c;
  stroke-width: 6;
  stroke-dasharray: 1 12;
  animation: flow 1.6s linear infinite;
}

/* --- Domaine --- */
.fence-ink {
  fill: none;
  stroke: var(--ink);
  stroke-width: 12;
}
.fence-wood {
  fill: none;
  stroke: #d99a5b;
  stroke-width: 8;
  stroke-dasharray: 12 5;
  stroke-linecap: butt;
}
.post {
  fill: #d99a5b;
  stroke: var(--ink);
  stroke-width: 2.5;
}
.grille {
  stroke: var(--ink);
  stroke-width: 3;
}
.sluice {
  fill: #8a5a3c;
  stroke: var(--ink);
  stroke-width: 2.5;
}
.sluice-wheel {
  fill: none;
  stroke: var(--ink);
  stroke-width: 3;
}
.screen {
  fill: var(--ink);
}
.chart {
  fill: none;
  stroke: var(--mint);
  stroke-width: 3;
}
.cup {
  fill: var(--yellow);
  stroke: var(--ink);
  stroke-width: 2;
}
.anemometer {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: wobble 2.4s ease-in-out infinite alternate;
}

/* --- Le tunnel et la taupe --- */
.tunnel {
  fill: none;
  stroke: var(--soil);
  stroke-width: 7;
  stroke-dasharray: 2 11;
  animation: flow 1.4s linear infinite;
}
.mound {
  fill: var(--soil);
  stroke: var(--ink);
  stroke-width: 2.5;
}
.mole-head {
  fill: #6b5a50;
  stroke: var(--ink);
  stroke-width: 2.5;
}
.mole-nose {
  fill: #ff7aa2;
  stroke: var(--ink);
  stroke-width: 1.5;
}
.eye-dot {
  fill: var(--ink);
}
.mole {
  animation: peek 3.2s ease-in-out infinite;
}

/* --- Les puits --- */
.stone {
  fill: #cfc6ba;
  stroke: var(--ink);
  stroke-width: 3;
}
.well-water {
  fill: #3a7fc1;
  stroke: var(--ink);
  stroke-width: 3;
}
.well-roof {
  fill: var(--pink-deep);
  stroke: var(--ink);
  stroke-width: 3;
}
.bucket {
  fill: #8a5a3c;
  stroke: var(--ink);
  stroke-width: 2;
}

/* --- Traits génériques, pousses, abeilles --- */
.ink-line {
  fill: none;
  stroke: var(--ink);
  stroke-width: 3;
}
.ink-line.thick {
  stroke-width: 5;
}
.thin-ink {
  fill: none;
  stroke: var(--ink);
  stroke-width: 2;
}
.stem {
  stroke: var(--ink);
  stroke-width: 2;
}
.leaf {
  fill: var(--leaf);
  stroke: var(--ink);
  stroke-width: 1.8;
}
.wing {
  fill: #fff;
  stroke: var(--ink);
  stroke-width: 1.5;
}
.bee-body {
  fill: var(--yellow);
  stroke: var(--ink);
  stroke-width: 2;
}
.bee-stripe {
  stroke: var(--ink);
  stroke-width: 2;
}
.bee {
  animation: buzz 1.8s ease-in-out infinite alternate;
}
.bee.b2 {
  animation-delay: -0.6s;
}
.bee.b3 {
  animation-delay: -1.2s;
}

@keyframes flow {
  to {
    stroke-dashoffset: -28;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes flutter {
  to {
    transform: skewY(-10deg) scaleX(0.85);
  }
}
@keyframes wobble {
  from {
    transform: rotate(-8deg);
  }
  to {
    transform: rotate(8deg);
  }
}
@keyframes peek {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(8px);
  }
}
@keyframes buzz {
  to {
    transform: translate(10px, -8px);
  }
}
</style>
