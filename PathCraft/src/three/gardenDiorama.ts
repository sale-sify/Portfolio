import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { layouts, type Cell, type GardenLayout, type Placement } from '../data/gardenLayout'
import type { GardenMode } from '../data/infra'

// ---------------------------------------------------------------------------
// Le plan du jardin en 3D isométrique : une île d'hexagones avec les modèles du
// KayKit Medieval Hexagon Pack (CC0, Kay Lousberg). Tout le plan est décrit dans
// src/data/gardenLayout.ts ; ici on ne fait que le construire et l'animer.
// ---------------------------------------------------------------------------

const MODELS_URL = '/models/kaykit/'
const INK = 0x141414
const SQRT3 = Math.sqrt(3)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export type GardenLabel = { spot: string; text: string; x: number; y: number }

type Callbacks = {
  onHover: (spot: string | null) => void
  onLabels: (labels: GardenLabel[]) => void
}

// --- La grille d'hexagones ---------------------------------------------------
// Hexagones "pointe en haut", 2 unités de large. Les 6 bords sont numérotés dans
// le sens inverse des aiguilles d'une montre : 0 = E, 1 = NE, 2 = NO, 3 = O, 4 = SO, 5 = SE.

function cellToWorld([col, row]: Cell) {
  return new THREE.Vector3(2 * col + (row & 1 ? 1 : 0), 0, row * SQRT3)
}

const NEIGHBORS = {
  even: [[1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1]],
  odd: [[1, 0], [1, -1], [0, -1], [-1, 0], [0, 1], [1, 1]],
}

function neighbor([col, row]: Cell, edge: number): Cell {
  const [dc, dr] = (row & 1 ? NEIGHBORS.odd : NEIGHBORS.even)[edge]!
  return [col + dc!, row + dr!]
}

function edgeBetween(a: Cell, b: Cell) {
  for (let edge = 0; edge < 6; edge++) {
    const [c, r] = neighbor(a, edge)
    if (c === b[0] && r === b[1]) return edge
  }
  throw new Error(`Cases non voisines : ${a} et ${b}`)
}

const key = ([c, r]: Cell) => `${c},${r}`

// --- Choix automatique des tuiles de canal et de route ------------------------
// Chaque tuile du pack relie certains bords (dans sa position d'origine). En la
// tournant par pas de 60°, on retrouve toutes les combinaisons dont on a besoin.

const TILE_EDGES: Record<string, number[]> = {
  A: [3, 0], // tout droit
  B: [3, 1], // courbe large
  C: [3, 2], // virage serré
  D: [3, 1, 5], // fourche en Y
  E: [3, 0, 1], // embranchement
  F: [3, 0, 5], // embranchement (dans l'autre sens)
  M: [3], // cul-de-sac (routes seulement)
}

function pickTile(prefix: 'hex_river' | 'hex_road', edges: Set<number>) {
  const wanted = [...edges].sort().join()
  for (const [letter, base] of Object.entries(TILE_EDGES)) {
    if (letter === 'M' && prefix === 'hex_river') continue
    for (let turn = 0; turn < 6; turn++) {
      if (base.map((e) => (e + turn) % 6).sort().join() === wanted) {
        return { model: `${prefix}_${letter}`, rot: turn * 60 }
      }
    }
  }
  console.warn(`Pas de tuile ${prefix} pour les bords ${wanted}`)
  return { model: `${prefix}_A`, rot: 0 }
}

// --- Chargement des modèles et habillage "dessin animé" ----------------------

function makeToonGradient() {
  const texture = new THREE.DataTexture(new Uint8Array([150, 210, 255]), 3, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

const gradientMap = makeToonGradient()
const toonCache = new Map<string, THREE.Material>()
const edgesCache = new Map<string, THREE.EdgesGeometry>()
const inkLines = new THREE.LineBasicMaterial({ color: INK })
const softLines = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.22 })

// Remplace le matériau d'origine par un matériau toon (mêmes couleurs, ombrage en aplats)
// et ajoute un trait noir sur les arêtes vives, comme un dessin.
function dressUp(root: THREE.Object3D, isTile: boolean) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const source = object.material as THREE.MeshStandardMaterial
    if (!toonCache.has(source.uuid)) {
      toonCache.set(source.uuid, new THREE.MeshToonMaterial({ map: source.map, color: source.color, gradientMap }))
    }
    object.material = toonCache.get(source.uuid)!
    object.castShadow = !isTile
    object.receiveShadow = true
    if (!edgesCache.has(object.geometry.uuid)) {
      edgesCache.set(object.geometry.uuid, new THREE.EdgesGeometry(object.geometry, 40))
    }
    const lines = new THREE.LineSegments(edgesCache.get(object.geometry.uuid)!, isTile ? softLines : inkLines)
    lines.raycast = () => {}
    object.add(lines)
  })
}

function modelsUsed(layout: GardenLayout) {
  const names = new Set(['hex_grass', 'waterlily_B', 'wheelbarrow', 'cloud_small', 'cloud_big'])
  layout.objects.forEach((o) => names.add(o.model))
  if (layout.fence) ['fence_stone_straight', 'fence_stone_straight_gate'].forEach((n) => names.add(n))
  Object.keys(TILE_EDGES).forEach((l) => {
    names.add(`hex_road_${l}`)
    if (l !== 'M') names.add(`hex_river_${l}`)
  })
  return names
}

// --- Construction d'un plan ----------------------------------------------------

type Built = {
  group: THREE.Group
  pieces: { object: THREE.Object3D; baseY: number; delay: number; spot?: string; lift: number }[]
  spinners: { object: THREE.Object3D; axis: 'x' | 'z'; speed: number }[]
  floaters: {
    object: THREE.Object3D
    points: THREE.Vector3[]
    speed: number
    offset: number
    pingPong: boolean
    previous?: THREE.Vector3
  }[]
  center: THREE.Vector3
  fitPoints: THREE.Vector3[] // les points qui doivent rester dans le cadre
  labels: GardenLayout['labels']
}

function buildGarden(layout: GardenLayout, models: Map<string, THREE.Group>): Built {
  const group = new THREE.Group()
  const built: Built = { group, pieces: [], spinners: [], floaters: [], center: new THREE.Vector3(), fitPoints: [], labels: layout.labels }

  const inBounds = ([c, r]: Cell) => c >= 0 && r >= 0 && c < layout.cols && r < layout.rows
  const occupied = new Set(
    layout.objects.filter((o) => o.model.startsWith('building_') && !o.model.includes('bridge')).map((o) => key(o.cell)),
  )

  // Chaque bout de canal ou de route donne aux deux cases qu'il relie un bord "ouvert"
  const collect = (paths: { spot: string; path: Cell[] }[]) => {
    const edges = new Map<string, { cell: Cell; edges: Set<number>; spot: string }>()
    for (const { spot, path } of paths) {
      for (let i = 0; i < path.length - 1; i++) {
        const [a, b] = [path[i]!, path[i + 1]!]
        const edge = edgeBetween(a, b)
        for (const [cell, e] of [[a, edge], [b, (edge + 3) % 6]] as const) {
          if (!inBounds(cell) || occupied.has(key(cell))) continue
          const entry = edges.get(key(cell)) ?? { cell, edges: new Set<number>(), spot }
          entry.edges.add(e)
          edges.set(key(cell), entry)
        }
      }
    }
    return edges
  }
  const water = collect(layout.water)
  const roads = collect(layout.roads)

  const place = (name: string, p: { cell: Cell; rot?: number; offset?: [number, number]; scale?: number }, spot?: string, isTile = false, y = 0) => {
    const template = models.get(name)
    if (!template) return console.warn(`Modèle manquant : ${name}`)
    const object = template.clone(true)
    const position = cellToWorld(p.cell)
    object.position.set(position.x + (p.offset?.[0] ?? 0), y, position.z + (p.offset?.[1] ?? 0))
    object.rotation.y = THREE.MathUtils.degToRad(p.rot ?? 0)
    object.scale.setScalar(p.scale ?? 1)
    object.traverse((o) => {
      o.userData.spot = spot
      // La roue du moulin est un disque dans le plan XY : elle tourne autour de Z. Sens négatif :
      // le bas de la roue avance avec le courant, qui arrive du canal (côté +X du modèle).
      if (o.name.includes('watermill_wheel')) built.spinners.push({ object: o, axis: 'z', speed: -1.2 })
      // La lame de la scierie est un disque dans le plan YZ : elle tourne autour de X
      if (o.name.includes('lumbermill_saw')) built.spinners.push({ object: o, axis: 'x', speed: 5 })
    })
    group.add(object)
    // Les éléments "poussent" en cascade quand le plan apparaît, de la rivière vers le bas
    built.pieces.push({ object, baseY: y, delay: (p.cell[1] * 0.6 + p.cell[0] * 0.25) * 0.06, spot, lift: isTile ? 0 : 0.35 })
    return object
  }

  // 1. Le sol : rivière, route ou herbe sur chaque case
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const cell: Cell = [col, row]
      const w = water.get(key(cell))
      const r = roads.get(key(cell))
      if (w) {
        const tile = pickTile('hex_river', w.edges)
        place(tile.model, { cell, rot: tile.rot }, w.spot, true)
      } else if (r) {
        const tile = pickTile('hex_road', r.edges)
        place(tile.model, { cell, rot: tile.rot }, r.spot, true)
      } else {
        place('hex_grass', { cell }, undefined, true)
      }
    }
  }

  // 2. Les bâtiments et accessoires
  layout.objects.forEach((o: Placement) => place(o.model, o, o.spot))

  // 3. La clôture du domaine, sur chaque bord qui donne vers l'extérieur
  if (layout.fence) {
    const { from, to, gate, spot } = layout.fence
    const inside = ([c, r]: Cell) => c >= from[0] && c <= to[0] && r >= from[1] && r <= to[1]
    for (let row = from[1]; row <= to[1]; row++) {
      for (let col = from[0]; col <= to[0]; col++) {
        for (let edge = 0; edge < 6; edge++) {
          const out = neighbor([col, row], edge)
          if (inside(out)) continue
          const isGate = key(out) === key(gate[0]) && key([col, row]) === key(gate[1])
          // le modèle de clôture est dessiné sur le bord O (3) : on le tourne vers le bon bord
          place(isGate ? 'fence_stone_straight_gate' : 'fence_stone_straight', { cell: [col, row], rot: (edge - 3) * 60 }, spot)
        }
      }
    }
  }

  // 4. La grande serre : une boîte de verre posée sur plusieurs cases
  if (layout.greenhouse) {
    const a = cellToWorld(layout.greenhouse.from)
    const b = cellToWorld(layout.greenhouse.to)
    const width = Math.abs(b.x - a.x) + 2.2
    const depth = Math.abs(b.z - a.z) + 2.2
    const center = new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2)
    const greenhouse = new THREE.Group()
    const glass = new THREE.MeshBasicMaterial({ color: 0xcdeeff, transparent: true, opacity: 0.22, depthWrite: false })
    const walls = new THREE.BoxGeometry(width, 1.1, depth)
    const box = new THREE.Mesh(walls, glass)
    box.position.y = 0.55
    box.add(new THREE.LineSegments(new THREE.EdgesGeometry(walls), inkLines))
    const roofShape = new THREE.Shape([new THREE.Vector2(-depth / 2, 0), new THREE.Vector2(depth / 2, 0), new THREE.Vector2(0, 0.9)])
    const roofGeometry = new THREE.ExtrudeGeometry(roofShape, { depth: width, bevelEnabled: false })
    roofGeometry.translate(0, 0, -width / 2)
    const roof = new THREE.Mesh(roofGeometry, glass)
    roof.rotation.y = Math.PI / 2
    roof.position.y = 1.1
    roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(roofGeometry), inkLines))
    greenhouse.add(box, roof)
    greenhouse.position.copy(center)
    greenhouse.traverse((o) => (o.userData.spot = layout.greenhouse!.spot))
    group.add(greenhouse)
    built.pieces.push({ object: greenhouse, baseY: 0, delay: 0.35, spot: layout.greenhouse.spot, lift: 0.2 })
  }

  // 5. Le tunnel de la mine : une ligne de mottes de terre sous la clôture
  if (layout.tunnel) {
    const a = cellToWorld(layout.tunnel.from)
    const b = cellToWorld(layout.tunnel.to)
    const steps = Math.floor(a.distanceTo(b) / 0.4)
    const moundGeometry = new THREE.SphereGeometry(0.11, 10, 6).scale(1, 0.4, 1)
    const moundMaterial = new THREE.MeshToonMaterial({ color: 0x5b3a29, gradientMap })
    for (let i = 2; i < steps - 1; i++) {
      const mound = new THREE.Mesh(moundGeometry, moundMaterial)
      mound.position.lerpVectors(a, b, i / steps)
      mound.userData.spot = layout.tunnel.spot
      group.add(mound)
    }
  }

  // 6. Ce qui bouge : des nénuphars (les visiteurs) suivent les canaux,
  //    une brouette (un déploiement) fait l'aller-retour sur les chemins
  for (const { path, floaters = 0 } of layout.water) {
    const points = path.map((c) => cellToWorld(c).setY(-0.12))
    for (let i = 0; i < floaters; i++) {
      const lily = models.get('waterlily_B')!.clone(true)
      lily.scale.setScalar(2.4)
      group.add(lily)
      built.floaters.push({ object: lily, points, speed: 0.6 / path.length, offset: i / floaters, pingPong: false })
    }
  }
  for (const { path, barrow } of layout.roads) {
    if (!barrow) continue
    const cart = models.get('wheelbarrow')!.clone(true)
    cart.scale.setScalar(2.4)
    group.add(cart)
    built.floaters.push({
      object: cart,
      points: path.map((c) => cellToWorld(c)),
      speed: 0.9 / path.length,
      offset: Math.random(),
      pingPong: true,
      previous: new THREE.Vector3(),
    })
  }

  // Deux nuages qui passent au-dessus, sur les bords de l'île
  for (const [name, cell, y] of [['cloud_big', [0, 1], 3.6], ['cloud_small', [-1, 5], 2.6]] as const) {
    const cloud = models.get(name)!.clone(true)
    cloud.position.copy(cellToWorld(cell as Cell)).setY(y)
    cloud.userData.drift = Math.random() * 10
    cloud.traverse((o) => (o.castShadow = false)) // pas de tache sombre sur l'île
    group.add(cloud)
    built.floaters.push({ object: cloud, points: [], speed: 0, offset: 0, pingPong: false })
  }

  // Pour cadrer la caméra au plus juste : les 6 coins de chaque hexagone (dessus et
  // dessous de l'île), plus un point en hauteur au-dessus de chaque bâtiment
  const corners = [0, 1, 2, 3, 4, 5].map((i) => {
    const angle = Math.PI / 6 + (i * Math.PI) / 3
    return new THREE.Vector3(Math.cos(angle) * 1.1547, 0, Math.sin(angle) * 1.1547)
  })
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const center = cellToWorld([col, row])
      for (const corner of corners) {
        built.fitPoints.push(center.clone().add(corner), center.clone().add(corner).setY(-1))
      }
    }
  }
  layout.objects.forEach((o) => built.fitPoints.push(cellToWorld(o.cell).setY(o.model.includes('tower') ? 2.4 : 1.4)))
  const box = new THREE.Box3().setFromPoints(built.fitPoints)
  box.getCenter(built.center).setY(0)
  built.fitPoints.forEach((p) => p.sub(built.center))
  return built
}

// Position le long d'une ligne brisée, pour t entre 0 et 1
function along(points: THREE.Vector3[], t: number, target: THREE.Vector3) {
  const segments = points.length - 1
  const scaled = Math.min(t * segments, segments - 1e-6)
  const i = Math.floor(scaled)
  return target.lerpVectors(points[i]!, points[i + 1]!, scaled - i)
}

// --- La scène ----------------------------------------------------------------

export async function createGardenDiorama(canvas: HTMLCanvasElement, initialMode: GardenMode, callbacks: Callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8d8a0, 1.6))
  const sun = new THREE.DirectionalLight(0xffffff, 2)
  sun.position.set(-8, 14, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 })
  sun.shadow.bias = -0.0005
  scene.add(sun, sun.target)

  // La caméra isométrique : orthographique, donc pas de perspective, et toutes les
  // cases gardent la même taille à l'écran, devant comme au fond.
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
  const isoDirection = new THREE.Vector3(0.55, 1.25, 1.3).normalize()

  // Chargement de tous les modèles nécessaires aux deux plans
  const loader = new GLTFLoader()
  const names = new Set([...modelsUsed(layouts.today), ...modelsUsed(layouts.tomorrow)])
  const models = new Map<string, THREE.Group>()
  await Promise.all(
    [...names].map(async (name) => {
      const gltf = await loader.loadAsync(`${MODELS_URL}${name}.gltf`)
      dressUp(gltf.scene, name.startsWith('hex_'))
      models.set(name, gltf.scene)
    }),
  )

  const gardens: Record<GardenMode, Built> = {
    today: buildGarden(layouts.today, models),
    tomorrow: buildGarden(layouts.tomorrow, models),
  }
  for (const built of Object.values(gardens)) {
    built.group.position.sub(built.center)
    scene.add(built.group)
  }

  let mode = initialMode
  let modeStart = performance.now() / 1000
  let active: string | null = null
  gardens.today.group.visible = mode === 'today'
  gardens.tomorrow.group.visible = mode === 'tomorrow'

  function frame() {
    const built = gardens[mode]
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.position.copy(isoDirection).multiplyScalar(60)
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
    // On mesure le plan vu depuis la caméra pour le faire tenir tout juste dans le cadre
    const box = new THREE.Box3()
    for (const point of built.fitPoints) box.expandByPoint(point.clone().applyMatrix4(camera.matrixWorldInverse))
    let width = box.max.x - box.min.x
    let height = box.max.y - box.min.y
    const aspect = w / h
    if (width / height > aspect) height = width / aspect
    else width = height * aspect
    const cx = (box.max.x + box.min.x) / 2
    const cy = (box.max.y + box.min.y) / 2
    const margin = 0.98 // < 1 : on rogne un poil les bords pour zoomer sur l'île
    Object.assign(camera, { left: cx - (width / 2) * margin, right: cx + (width / 2) * margin, top: cy + (height / 2) * margin, bottom: cy - (height / 2) * margin })
    camera.updateProjectionMatrix()
    emitLabels()
  }

  function emitLabels() {
    const built = gardens[mode]
    const rect = canvas.getBoundingClientRect()
    callbacks.onLabels(
      built.labels.map(({ spot, cell, text, height = 0.6 }) => {
        const p = cellToWorld(cell).setY(height).sub(built.center).project(camera)
        return { spot, text, x: ((p.x + 1) / 2) * rect.width, y: ((1 - p.y) / 2) * rect.height }
      }),
    )
  }

  // --- Survol -----------------------------------------------------------------
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered: string | null = null

  function onPointerMove(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObject(gardens[mode].group, true).find((h) => h.object.userData.spot)
    const spot = (hit?.object.userData.spot as string | undefined) ?? null
    canvas.style.cursor = spot ? 'pointer' : ''
    if (spot !== hovered) {
      hovered = spot
      callbacks.onHover(spot)
    }
  }
  function onPointerLeave() {
    if (hovered) callbacks.onHover((hovered = null))
  }
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('click', onPointerMove as unknown as EventListener)

  const resizeObserver = new ResizeObserver(frame)
  resizeObserver.observe(canvas)
  frame()

  // --- Animation ----------------------------------------------------------------
  const clock = new THREE.Clock()
  let running = true
  let raf = 0

  function tick() {
    raf = requestAnimationFrame(tick)
    if (!running) return
    const t = clock.getElapsedTime()
    const now = performance.now() / 1000
    const built = gardens[mode]

    for (const piece of built.pieces) {
      // Apparition : chaque pièce monte de sous l'île, avec un petit rebond
      const p = reducedMotion ? 1 : THREE.MathUtils.clamp((now - modeStart - piece.delay) / 0.5, 0, 1)
      const grow = p === 1 ? 1 : 1 - Math.pow(1 - p, 3) * Math.cos(p * Math.PI * 1.5)
      const target = piece.baseY + (active && piece.spot === active ? piece.lift : 0)
      const current = piece.object.position.y
      const rest = p === 1 ? current + (target - current) * 0.2 : piece.baseY - 4 * (1 - grow)
      piece.object.position.y = rest
      piece.object.visible = p > 0
    }

    if (!reducedMotion) {
      built.spinners.forEach((s) => (s.object.rotation[s.axis] = t * s.speed))
      for (const f of built.floaters) {
        if (!f.points.length) {
          f.object.position.x += Math.sin(t * 0.2 + (f.object.userData.drift as number)) * 0.004
          continue
        }
        let u = (t * f.speed + f.offset) % 1
        if (f.pingPong) u = u < 0.5 ? u * 2 : 2 - u * 2
        along(f.points, u, f.object.position)
        if (f.previous) {
          // La brouette regarde là où elle va : sa roue est côté +Z du modèle.
          // On calcule l'angle à partir du vrai déplacement (dans le repère de l'île),
          // et on tourne en douceur, pour un demi-tour propre au bout du chemin.
          const dx = f.object.position.x - f.previous.x
          const dz = f.object.position.z - f.previous.z
          if (dx * dx + dz * dz > 1e-8) {
            const target = Math.atan2(dx, dz)
            const delta = Math.atan2(Math.sin(target - f.object.rotation.y), Math.cos(target - f.object.rotation.y))
            f.object.rotation.y += delta * 0.15
          }
          f.previous.copy(f.object.position)
        }
      }
    }
    renderer.render(scene, camera)
  }
  tick()

  return {
    setMode(next: GardenMode) {
      if (next === mode) return
      mode = next
      modeStart = performance.now() / 1000
      gardens.today.group.visible = mode === 'today'
      gardens.tomorrow.group.visible = mode === 'tomorrow'
      frame()
    },
    setActive(spot: string | null) {
      active = spot
    },
    setRunning(value: boolean) {
      running = value
    },
    relayout: frame,
    dispose() {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose()
      })
      toonCache.forEach((m) => m.dispose())
      toonCache.clear()
      edgesCache.forEach((g) => g.dispose())
      edgesCache.clear()
      renderer.dispose()
    },
  }
}
