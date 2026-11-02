import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { Accessory } from '../data/projects'

// ---------------------------------------------------------------------------
// Le potager de Sale-Sify Develops : un bac en bois rempli de terre, où sont
// plantés les Salesify, de petites racines qui ont chacune un problème.
// Tout est fait avec des formes de base de Three.js : aucun modèle 3D à charger.
//
// Le look "dessin animé" vient de deux astuces :
//   1. MeshToonMaterial + une texture de dégradé à 3 tons -> ombrage en aplats
//   2. un contour noir "inverted hull" : une copie un peu plus grosse du mesh,
//      peinte en noir et vue de l'intérieur (BackSide)
// ---------------------------------------------------------------------------

export type SalesifyInput = {
  id: string
  color: string
  accessory: Accessory
  scale: number
}

type Callbacks = {
  onHover: (id: string | null, clientX: number, clientY: number) => void
  onSelect: (id: string) => void
}

const INK = 0x141414
const CREAM = 0xfff4e0
const SOIL = 0x5b3a29
const WOOD = 0xd99a5b
const LEAF = 0x3fae5a
const LEAF_DARK = 0x2a8a45
const OUTLINE = 0.035

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// --- Matériaux partagés -----------------------------------------------------

function makeToonGradient() {
  // 3 niveaux de gris -> 3 tons d'ombre. NearestFilter = pas de fondu entre eux.
  const texture = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  return texture
}

const gradientMap = makeToonGradient()
const outlineMaterial = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })
const inkMaterial = new THREE.MeshBasicMaterial({ color: INK })
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

function toon(color: THREE.ColorRepresentation) {
  return new THREE.MeshToonMaterial({ color, gradientMap })
}

// Ajoute le contour noir à un mesh. On calcule l'échelle axe par axe pour que
// l'épaisseur du trait soit la même partout, même sur une boîte très large.
function withOutline<T extends THREE.Mesh>(mesh: T, thickness = OUTLINE): T {
  mesh.geometry.computeBoundingBox()
  const box = mesh.geometry.boundingBox!
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const outline = new THREE.Mesh(mesh.geometry, outlineMaterial)
  outline.scale.set(
    (size.x + thickness * 2) / size.x,
    (size.y + thickness * 2) / size.y,
    (size.z + thickness * 2) / size.z,
  )
  // si la géométrie n'est pas centrée sur son origine, on recentre le contour
  outline.position.copy(center).multiply(new THREE.Vector3(1, 1, 1).sub(outline.scale))
  outline.raycast = () => {} // le contour ne doit pas capter les clics
  mesh.add(outline)
  return mesh
}

// Un cylindre tendu entre deux points (tiges, antennes, micro…)
function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 10), material)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
  return mesh
}

// --- Le corps : une racine de salsifis -------------------------------------

const ROOT_H = 2.3
const ROOT_R = 0.62
const BURIED = 0.36 // part de la racine cachée sous la terre

// Rayon de la racine à une hauteur t (0 = pointe en bas, 1 = sommet de la tête) :
// fine en bas, large aux "épaules", puis une tête bien ronde.
function rootRadius(t: number) {
  return ROOT_R * Math.pow(t, 0.55) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 7)))
}

// LatheGeometry = on dessine un profil 2D, Three.js le fait tourner autour de l'axe Y.
function makeRootGeometry() {
  const points: THREE.Vector2[] = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    points.push(new THREE.Vector2(rootRadius(t), t * ROOT_H))
  }
  const geometry = new THREE.LatheGeometry(points, 48)
  geometry.translate(0, -ROOT_H / 2, 0) // origine au centre, pour un contour régulier
  return geometry
}

// Position à la surface avant de la racine (centre de la racine en 0, 0, 0)
function onSurface(x: number, t: number, inset = 0) {
  const r = rootRadius(t)
  return new THREE.Vector3(x, t * ROOT_H - ROOT_H / 2, Math.sqrt(Math.max(0, r * r - x * x)) - inset)
}

const rootGeometry = makeRootGeometry()
const HEAD_TOP = ROOT_H / 2

// La touffe de feuilles, longues et fines comme celles du salsifis
function buildLeaves() {
  const tuft = new THREE.Group()
  const blades = [
    { angle: 0, tilt: 0.08, length: 0.75, color: LEAF },
    { angle: 0.9, tilt: 0.5, length: 0.6, color: LEAF_DARK },
    { angle: 2.3, tilt: 0.45, length: 0.55, color: LEAF },
    { angle: 3.6, tilt: 0.55, length: 0.62, color: LEAF_DARK },
    { angle: 5.0, tilt: 0.42, length: 0.58, color: LEAF },
  ]
  for (const blade of blades) {
    const pivot = new THREE.Group() // on tourne autour du pied de la feuille
    // On "cuit" l'échelle dans la géométrie (et pas mesh.scale) pour garder un contour bien épais
    const geometry = new THREE.SphereGeometry(1, 16, 10).scale(0.06, blade.length / 2, 0.13)
    const leaf = withOutline(new THREE.Mesh(geometry, toon(blade.color)), 0.022)
    leaf.position.y = blade.length / 2
    pivot.add(leaf)
    pivot.rotation.set(0, blade.angle, blade.tilt, 'YXZ')
    tuft.add(pivot)
  }
  tuft.position.y = HEAD_TOP - 0.06
  return tuft
}

// --- Accessoires ------------------------------------------------------------

type Animated = (t: number) => void

function buildAccessory(kind: Accessory): { group: THREE.Group; animate: Animated } {
  const group = new THREE.Group()
  let animate: Animated = () => {}

  if (kind === 'headset') {
    // Un casque de téléconseiller : Prospère passe sa vie au téléphone
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.045, 10, 40, Math.PI), inkMaterial)
    arc.position.y = 0.6
    group.add(arc)
    for (const side of [-1, 1]) {
      const cup = withOutline(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 24), toon(0x3a3a3a)))
      cup.rotation.z = Math.PI / 2
      cup.position.set(side * 0.55, 0.56, 0)
      group.add(cup)
    }
    const bend = new THREE.Vector3(-0.58, 0.34, 0.36)
    const end = new THREE.Vector3(-0.26, 0.3, 0.6)
    group.add(rod(new THREE.Vector3(-0.56, 0.52, 0.06), bend, 0.028, inkMaterial))
    group.add(rod(bend, end, 0.028, inkMaterial))
    const mic = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), toon(0x3a3a3a)), 0.025)
    mic.position.copy(end)
    group.add(mic)
  }

  if (kind === 'bubble') {
    // Une bulle de messagerie avec les "…" qui tapent : Franchie cherche à qui parler
    const bubble = new THREE.Group()
    bubble.add(withOutline(new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.44, 0.2, 4, 0.1), toon(CREAM))))
    const tail = withOutline(new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 12), toon(CREAM)))
    tail.position.set(-0.2, -0.27, 0)
    tail.rotation.z = Math.PI + 0.5
    bubble.add(tail)
    const dots = [-0.19, 0, 0.19].map((x) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), inkMaterial)
      dot.position.set(x, 0, 0.11)
      bubble.add(dot)
      return dot
    })
    group.add(bubble)
    animate = (t) => {
      bubble.position.set(0.72, HEAD_TOP + 0.25 + Math.sin(t * 2) * 0.05, 0.1)
      dots.forEach((dot, i) => (dot.position.y = Math.max(0, Math.sin(t * 6 - i * 0.9)) * 0.07))
    }
  }

  if (kind === 'magnifier') {
    // Une loupe : Pagerank scrute Google en permanence
    const loupe = new THREE.Group()
    loupe.add(withOutline(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 12, 32), toon(0x3a3a3a)), 0.02))
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 32),
      new THREE.MeshBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0.55 }),
    )
    loupe.add(glass)
    loupe.add(rod(new THREE.Vector3(0.14, -0.14, 0), new THREE.Vector3(0.38, -0.42, 0), 0.045, toon(0x8a5a3c)))
    group.add(loupe)
    animate = (t) => {
      loupe.position.set(0.55 + Math.sin(t * 1.1) * 0.08, 0.35 + Math.cos(t * 1.4) * 0.06, 0.45)
      loupe.rotation.set(0, -0.4, Math.sin(t * 0.9) * 0.2)
    }
  }

  if (kind === 'antenna') {
    // Une antenne qui clignote : Plume capte l'actu et la fait passer à l'IA
    const tip = new THREE.Vector3(0.3, HEAD_TOP + 0.55, -0.05)
    group.add(rod(new THREE.Vector3(0.1, HEAD_TOP - 0.1, 0), tip, 0.028, inkMaterial))
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffd23f })
    const bulb = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), bulbMaterial))
    bulb.position.copy(tip)
    group.add(bulb)
    const on = new THREE.Color(0xfff27a)
    const off = new THREE.Color(0xff8c42)
    animate = (t) => {
      bulbMaterial.color.copy(Math.sin(t * 5) > 0 ? on : off)
    }
  }

  if (kind === 'heart') {
    // Un cœur qui flotte : Alti rêve d'un match
    const shape = new THREE.Shape()
    shape.moveTo(5, 5)
    shape.bezierCurveTo(5, 5, 4, 0, 0, 0)
    shape.bezierCurveTo(-6, 0, -6, 7, -6, 7)
    shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19)
    shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7)
    shape.bezierCurveTo(16, 7, 16, 0, 10, 0)
    shape.bezierCurveTo(7, 0, 5, 5, 5, 5)
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 4,
      bevelEnabled: true,
      bevelThickness: 1.5,
      bevelSize: 1.2,
      bevelSegments: 4,
    })
    geometry.center()
    geometry.scale(0.02, 0.02, 0.02)
    const heart = withOutline(new THREE.Mesh(geometry, toon(0xff3b5c)))
    heart.rotation.z = Math.PI // la forme est dessinée la pointe en haut
    group.add(heart)
    animate = (t) => {
      heart.position.set(0.55, HEAD_TOP + 0.35 + Math.sin(t * 2.4) * 0.08, 0)
      heart.rotation.y = Math.sin(t * 1.5) * 0.6
      heart.scale.setScalar(1 + Math.max(0, Math.sin(t * 4.8)) * 0.12) // ça bat
    }
  }

  return { group, animate }
}

// --- Un Salesify ------------------------------------------------------------

class Salesify {
  id: string
  root = new THREE.Group() // position dans le bac
  body = new THREE.Group() // ce qui sort de terre, se balance et s'étire
  hitMesh: THREE.Mesh
  hovered = false
  selected = false
  private eyes: THREE.Object3D[] = []
  private pupils: THREE.Mesh[] = []
  private brows: THREE.Mesh[] = []
  private worriedMouth: THREE.Mesh
  private happyMouth: THREE.Mesh
  private leaves: THREE.Group
  private accessory: Animated
  private phase = Math.random() * Math.PI * 2
  private pullStart = -10
  private nextPeek = 3 + Math.random() * 6
  private peekStart = -10
  private nextBlink = 1 + Math.random() * 4
  private blinkUntil = 0
  private hoverAmount = 0
  private mood = 0 // 0 = inquiet, 1 = soulagé

  constructor(input: SalesifyInput) {
    this.id = input.id
    const color = new THREE.Color(input.color)

    this.hitMesh = withOutline(new THREE.Mesh(rootGeometry, toon(color)))
    this.hitMesh.userData.id = input.id
    this.body.add(this.hitMesh)

    // Les yeux : un blanc + une pupille qui suivra la souris, et un sourcil
    for (const side of [-1, 1]) {
      const eye = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16), whiteMaterial), 0.03)
      eye.position.copy(onSurface(side * 0.18, 0.8, 0.05))
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), inkMaterial)
      pupil.position.z = 0.09
      eye.add(pupil)
      this.pupils.push(pupil)
      this.eyes.push(eye)
      this.body.add(eye)

      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.13, 4, 8), inkMaterial)
      brow.position.copy(onSurface(side * 0.19, 0.875, -0.02))
      brow.userData.side = side
      this.brows.push(brow)
      this.body.add(brow)
    }

    // Deux bouches : un petit "∩" inquiet, et un grand sourire pour quand le problème est réglé
    const mouthPosition = onSurface(0, 0.69, -0.012)
    this.worriedMouth = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 8, 20, Math.PI), inkMaterial)
    this.worriedMouth.position.copy(mouthPosition).add(new THREE.Vector3(0, -0.04, 0))
    this.happyMouth = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24, Math.PI, Math.PI), inkMaterial)
    this.happyMouth.position.copy(mouthPosition)
    this.happyMouth.lookAt(mouthPosition.clone().add(new THREE.Vector3(0, 0.15, 1)))
    const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xff5c8a }))
    tongue.position.set(0, -0.098, 0.002)
    this.happyMouth.add(tongue)
    this.body.add(this.worriedMouth, this.happyMouth)

    // Les joues
    const cheekMaterial = new THREE.MeshBasicMaterial({ color: 0xff7aa2, transparent: true, opacity: 0.75 })
    for (const x of [-0.33, 0.33]) {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 10), cheekMaterial)
      cheek.scale.set(1, 0.55, 0.4)
      cheek.position.copy(onSurface(x, 0.71, 0.01))
      cheek.lookAt(cheek.position.clone().multiplyScalar(2))
      this.body.add(cheek)
    }

    this.leaves = buildLeaves()
    this.body.add(this.leaves)

    const accessory = buildAccessory(input.accessory)
    this.body.add(accessory.group)
    this.accessory = accessory.animate

    // Une petite motte de terre au pied, pour cacher la jonction avec le sol
    const mound = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 12).scale(1, 0.22, 1), toon(SOIL)), 0.03)
    this.root.add(this.body, mound)
    this.root.scale.setScalar(input.scale)
  }

  // On l'arrache de la terre !
  pull() {
    this.pullStart = performance.now() / 1000
  }

  update(t: number, lookTarget: THREE.Vector3) {
    // Petit coup d'œil hors de la terre de temps en temps
    if (!reducedMotion && t > this.nextPeek) {
      this.peekStart = t
      this.nextPeek = t + 6 + Math.random() * 8
    }
    const peekP = (t - this.peekStart) / 1.2
    const peek = peekP >= 0 && peekP < 1 ? Math.sin(Math.PI * peekP) * 0.22 : 0

    // Arraché : il monte d'un coup, gigote, puis se replante doucement
    const pullP = (t - this.pullStart) / 1.6
    let pull = 0
    let wiggle = 0
    if (pullP >= 0 && pullP < 1) {
      pull = pullP < 0.25 ? Math.sin((pullP / 0.25) * (Math.PI / 2)) : 1 - Math.pow((pullP - 0.25) / 0.75, 2)
      wiggle = Math.sin(pullP * 30) * 0.12 * (1 - pullP)
    }

    this.hoverAmount += ((this.hovered || this.selected ? 1 : 0) - this.hoverAmount) * 0.15
    this.mood += ((this.selected ? 1 : 0) - this.mood) * 0.12

    const sway = reducedMotion ? 0 : Math.sin(t * 1.3 + this.phase) * 0.05
    const breath = reducedMotion ? 0 : Math.sin(t * 2.2 + this.phase) * 0.02
    const lift = pull * 1.05 + peek + this.hoverAmount * 0.15

    this.body.position.y = ROOT_H / 2 - BURIED * ROOT_H + lift
    this.body.rotation.z = sway + wiggle
    this.body.scale.set(1 - breath, 1 + breath + pull * 0.06, 1 - breath)
    this.leaves.rotation.z = Math.sin(t * 2.6 + this.phase) * 0.12 - wiggle * 2

    // Le corps se tourne doucement vers la souris
    const worldPos = this.root.getWorldPosition(new THREE.Vector3())
    const angle = Math.atan2(lookTarget.x - worldPos.x, lookTarget.z - worldPos.z)
    this.root.rotation.y += (THREE.MathUtils.clamp(angle, -0.6, 0.6) - this.root.rotation.y) * 0.08

    // Les pupilles visent la souris, dans le repère local de chaque œil
    for (const pupil of this.pupils) {
      const dir = pupil.parent!.worldToLocal(lookTarget.clone()).normalize()
      dir.z = Math.max(dir.z, 0.55)
      pupil.position.copy(dir.normalize().multiplyScalar(0.085))
    }

    // Clignement des yeux
    if (t > this.nextBlink) {
      this.blinkUntil = t + 0.12
      this.nextBlink = t + 2.5 + Math.random() * 4
    }
    const eyeScale = t < this.blinkUntil ? 0.1 : 1
    this.eyes.forEach((eye) => (eye.scale.y = eyeScale))

    // L'humeur : sourcils en "/ \" quand il est inquiet, relevés quand il est soulagé
    for (const brow of this.brows) {
      const side = brow.userData.side as number
      brow.rotation.z = Math.PI / 2 + side * THREE.MathUtils.lerp(-0.35, 0, this.mood)
      brow.position.y = onSurface(0, 0.875).y + this.mood * 0.04
    }
    this.worriedMouth.visible = this.mood < 0.5
    this.happyMouth.visible = this.mood >= 0.5

    this.accessory(t + this.phase)
  }
}

// --- Le bac potager ---------------------------------------------------------

const BED_H = 0.8

function buildGardenBed(width: number, depth: number) {
  const bed = new THREE.Group()

  // Le bac en bois, avec des lattes en façade
  const crate = withOutline(new THREE.Mesh(new RoundedBoxGeometry(width, BED_H, depth, 4, 0.12), toon(WOOD)), 0.05)
  crate.position.y = -BED_H / 2
  bed.add(crate)
  const plankMaterial = new THREE.MeshBasicMaterial({ color: 0x9c6436 })
  for (const y of [-0.27, -0.53]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.035, 0.02), plankMaterial)
    line.position.set(0, y, depth / 2 + 0.005)
    bed.add(line)
  }
  for (const x of [-width / 2 + 0.35, width / 2 - 0.35]) {
    const post = withOutline(new THREE.Mesh(new RoundedBoxGeometry(0.32, BED_H + 0.12, 0.12, 2, 0.05), toon(0xc0834a)), 0.03)
    post.position.set(x, -BED_H / 2 + 0.06, depth / 2 + 0.03)
    bed.add(post)
  }

  // La terre, posée sur le bac, avec quelques cailloux
  const soil = withOutline(new THREE.Mesh(new RoundedBoxGeometry(width - 0.25, 0.14, depth - 0.25, 3, 0.06), toon(SOIL)), 0.03)
  soil.position.y = 0.04
  bed.add(soil)
  const pebbleMaterial = toon(0x8c6a55)
  for (let i = 0; i < 22; i++) {
    const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 8, 6), pebbleMaterial)
    pebble.scale.y = 0.5
    pebble.position.set((Math.random() - 0.5) * (width - 0.6), 0.11, (Math.random() - 0.5) * (depth - 0.6))
    bed.add(pebble)
  }

  // Une petite étiquette de plante plantée dans le coin
  const stake = new THREE.Group()
  stake.add(rod(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.7, 0), 0.035, toon(0xc0834a)))
  const sign = withOutline(new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.36, 0.05, 2, 0.04), toon(CREAM)), 0.025)
  sign.position.y = 0.8
  stake.add(sign)
  for (const [y, w] of [[0.86, 0.4], [0.76, 0.28]] as const) {
    const scribble = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, 0.01), inkMaterial)
    scribble.position.set(-0.05 + (0.4 - w) / -2, y, 0.035)
    stake.add(scribble)
  }
  stake.position.set(width / 2 - 0.45, 0.05, depth / 2 - 0.4)
  stake.rotation.set(0.12, -0.3, -0.12)
  bed.add(stake)

  return bed
}

// --- Le pollen qui s'envole du potager --------------------------------------

function buildPollen(colors: string[]) {
  const group = new THREE.Group()
  const specks = Array.from({ length: 12 }, (_, i) => {
    const mesh = withOutline(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), toon(colors[i % colors.length]!)), 0.02)
    group.add(mesh)
    return { mesh, start: Math.random() * 7, x: 0, z: 0 }
  })
  let spread = 4
  const animate = (t: number) => {
    for (const speck of specks) {
      const life = ((t + speck.start) % 7) / 7 // 0 -> 1 en 7 secondes, puis on recommence
      if (life < 0.01 || speck.x === 0) {
        speck.x = (Math.random() - 0.5) * spread * 2
        speck.z = -1.2 - Math.random() * 0.8
      }
      speck.mesh.position.set(speck.x + Math.sin(life * 8 + speck.start) * 0.3, 0.3 + life * 3.4, speck.z)
      speck.mesh.scale.setScalar(Math.sin(Math.PI * life))
    }
  }
  return { group, animate, setSpread: (s: number) => (spread = s) }
}

// --- Disposition selon la taille de l'écran ---------------------------------

type Layout = { bedWidth: number; bedDepth: number; spots: [number, number][]; viewWidth: number; lookY: number }

const wideLayout: Layout = {
  bedWidth: 8.8,
  bedDepth: 3.4,
  spots: [
    [-3.2, 0.35],
    [-1.6, -0.55],
    [0, 0.45],
    [1.6, -0.55],
    [3.2, 0.35],
  ],
  viewWidth: 17,
  lookY: 1.6,
}

const compactLayout: Layout = {
  bedWidth: 5.6,
  bedDepth: 4.4,
  spots: [
    [-1.8, -1],
    [0, -1.25],
    [1.8, -1],
    [-0.9, 0.95],
    [0.9, 0.95],
  ],
  viewWidth: 7.4,
  lookY: 1.2,
}

// --- La scène complète ------------------------------------------------------

export function createSalesifyScene(canvas: HTMLCanvasElement, inputs: SalesifyInput[], callbacks: Callbacks) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

  scene.add(new THREE.AmbientLight(0xffffff, 1.4))
  const sun = new THREE.DirectionalLight(0xffffff, 2.2)
  sun.position.set(-4, 8, 6)
  scene.add(sun)

  // Tout ce qui flotte est dans `world`, pour le faire onduler d'un bloc
  const world = new THREE.Group()
  scene.add(world)

  const salesifies = inputs.map((input) => new Salesify(input))
  salesifies.forEach((s) => world.add(s.root))

  const pollen = buildPollen(inputs.map((i) => i.color))
  world.add(pollen.group)

  let bed: THREE.Group | null = null
  let layout: Layout | null = null

  function applyLayout(next: Layout) {
    if (layout === next) return
    layout = next
    if (bed) {
      world.remove(bed)
      disposeTree(bed)
    }
    bed = buildGardenBed(next.bedWidth, next.bedDepth)
    world.add(bed)
    pollen.setSpread(next.bedWidth / 2 - 0.6)
    salesifies.forEach((s, i) => {
      const [x, z] = next.spots[i % next.spots.length]!
      s.root.position.set(x, 0.1, z) // 0.1 = la surface de la terre
    })
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas
    if (w === 0 || h === 0) return
    renderer.setSize(w, h, false)
    const aspect = w / h
    applyLayout(aspect < 0.9 ? compactLayout : wideLayout)
    // Sur tablette, les cartes passent sous la scène : on peut zoomer un peu plus
    const viewWidth = layout === wideLayout && aspect < 1.35 ? layout.viewWidth * 0.78 : layout!.viewWidth
    // On recule la caméra juste assez pour que toute la largeur du bac tienne
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
    const distance = Math.max(10, viewWidth / (2 * Math.tan(halfFov) * aspect))
    camera.aspect = aspect
    camera.position.set(0, distance * 0.3, distance)
    camera.lookAt(0, layout!.lookY, 0)
    camera.updateProjectionMatrix()
  }

  // --- Souris : les yeux suivent, survol et clic ---------------------------

  const pointer = new THREE.Vector2(0, 0.2)
  const raycaster = new THREE.Raycaster()
  const lookPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -4) // un plan invisible devant eux
  const lookTarget = new THREE.Vector3(0, 1, 6)
  const hitMeshes = salesifies.map((s) => s.hitMesh)
  let hoveredId: string | null = null

  function toPointer(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
  }

  function pick(): Salesify | undefined {
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects(hitMeshes, false)[0]
    return hit ? salesifies.find((s) => s.id === hit.object.userData.id) : undefined
  }

  function onWindowPointerMove(event: PointerEvent) {
    toPointer(event)
    const salesify = event.target === canvas ? pick() : undefined
    const id = salesify?.id ?? null
    salesifies.forEach((s) => (s.hovered = s.id === id))
    canvas.style.cursor = id ? 'pointer' : ''
    if (id !== hoveredId || id) callbacks.onHover(id, event.clientX, event.clientY)
    hoveredId = id
  }

  function onClick(event: MouseEvent) {
    toPointer(event)
    const salesify = pick()
    if (salesify) callbacks.onSelect(salesify.id)
  }

  window.addEventListener('pointermove', onWindowPointerMove)
  canvas.addEventListener('click', onClick)
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  // --- Boucle d'animation ---------------------------------------------------

  const clock = new THREE.Clock()
  let active = true
  let frame = 0

  function tick() {
    frame = requestAnimationFrame(tick)
    if (!active) return
    const t = clock.getElapsedTime()

    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(lookPlane, lookTarget)

    if (!reducedMotion) {
      world.position.y = Math.sin(t * 0.9) * 0.06
      world.rotation.y = Math.sin(t * 0.25) * 0.04
      pollen.animate(t)
    }
    salesifies.forEach((s) => s.update(t, lookTarget))
    renderer.render(scene, camera)
  }
  tick()

  return {
    // Mettre en pause quand l'accueil n'est plus visible (économise la batterie)
    setActive(value: boolean) {
      active = value
    },
    // Le Salesify choisi est arraché de terre et retrouve le sourire
    select(id: string | null) {
      salesifies.forEach((s) => {
        if (s.id === id && !s.selected) s.pull()
        s.selected = s.id === id
      })
    },
    // Petit coucou depuis l'extérieur (survol des pastilles)
    wave(id: string) {
      salesifies.find((s) => s.id === id)?.pull()
    },
    dispose() {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onWindowPointerMove)
      canvas.removeEventListener('click', onClick)
      resizeObserver.disconnect()
      disposeTree(scene)
      renderer.dispose()
    },
  }
}

function disposeTree(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((m) => m.dispose())
    }
  })
}
