// Les deux plans du jardin (section Infra), posés sur une grille d'hexagones.
//
// Une case = [colonne, ligne]. Les lignes impaires sont décalées d'une demi-case
// vers la droite. Les modèles 3D viennent du KayKit Medieval Hexagon Pack (CC0).
//
// - water : les canaux (le trafic). Un chemin = une suite de cases voisines ; la
//           bonne tuile de rivière (droite, courbe, fourche) est choisie toute seule.
// - roads : les chemins de terre (les déploiements), même principe.
// - objects : les bâtiments et accessoires posés sur une case.
// - `spot` relie chaque élément à sa ligne de légende (src/data/infra.ts).

import type { GardenMode } from './infra'

export type Cell = [number, number]

export type Placement = {
  model: string
  cell: Cell
  spot?: string
  rot?: number // en degrés
  offset?: [number, number] // décalage dans la case (x, z)
  scale?: number
}

export type GardenLayout = {
  cols: number
  rows: number
  water: { spot: string; path: Cell[]; floaters?: number }[]
  roads: { spot: string; path: Cell[]; barrow?: boolean }[]
  objects: Placement[]
  fence?: { spot: string; from: Cell; to: Cell; gate: [Cell, Cell] }
  greenhouse?: { spot: string; from: Cell; to: Cell }
  tunnel?: { spot: string; from: Cell; to: Cell }
  labels: { spot: string; cell: Cell; text: string; height?: number }[]
}

// La rivière (Internet) traverse tout le haut du plan, d'un bord à l'autre
const river = (cols: number): Cell[] => Array.from({ length: cols + 2 }, (_, i) => [i - 1, 0] as Cell)

// Éléments communs aux deux plans : la grange (Git) et le moulin (CI/CD)
const commonObjects: Placement[] = [
  { model: 'building_home_B_red', cell: [1, 4], spot: 'grange', rot: 30 },
  { model: 'sack', cell: [1, 4], spot: 'grange', offset: [0.55, 0.45], scale: 2 },
  { model: 'sack', cell: [1, 4], spot: 'grange', offset: [0.7, 0.2], scale: 2 },
  { model: 'barrel', cell: [1, 4], spot: 'grange', offset: [-0.6, 0.4], scale: 1.6 },
  // la roue est contre le mur -Z du modèle : tourné à -30°, elle fait face au canal qui arrive par le nord-est
  { model: 'building_watermill_blue', cell: [2, 2], spot: 'mill', rot: -30 },
  { model: 'trees_A_small', cell: [0, 1] },
  { model: 'trees_A_medium', cell: [0, 2] },
  { model: 'tree_single_B', cell: [0, 3] },
  { model: 'trees_B_small', cell: [0, 6] },
  { model: 'rock_single_C', cell: [1, 2], offset: [0.3, 0.3], scale: 2 },
]

const commonWater: GardenLayout['water'] = [{ spot: 'mill', path: [[2, 0], [2, 1], [2, 2]] }]
const commonRoads: GardenLayout['roads'] = [{ spot: 'mill', path: [[1, 4], [1, 3], [2, 2]] }]

export const layouts: Record<GardenMode, GardenLayout> = {
  // --- Aujourd'hui : le jardin partagé entre plusieurs hébergeurs ------------
  today: {
    cols: 11,
    rows: 7,
    water: [
      { spot: 'river', path: river(11), floaters: 3 },
      ...commonWater,
      { spot: 'river', path: [[6, 0], [6, 1], [6, 2]], floaters: 1 },
      { spot: 'render', path: [[6, 2], [6, 3], [6, 4]], floaters: 1 },
      { spot: 'feed', path: [[5, 4], [6, 4], [7, 4]], floaters: 1 },
      { spot: 'river', path: [[9, 0], [9, 1], [9, 2]], floaters: 1 },
      { spot: 'wells', path: [[5, 4], [5, 5], [5, 6]] },
      { spot: 'wells', path: [[9, 2], [9, 3], [9, 4]] },
    ],
    roads: [
      ...commonRoads,
      { spot: 'mill', path: [[2, 2], [3, 2], [4, 2], [5, 2], [6, 2]], barrow: true },
      { spot: 'mill', path: [[3, 2], [3, 3], [4, 4], [5, 4]] },
      { spot: 'mill', path: [[6, 2], [7, 2], [8, 2], [9, 2]], barrow: true },
    ],
    objects: [
      ...commonObjects,
      // Le marché Vercel : les vitrines de DUPLIK (rouge) et d'Actus-auto (bleu)
      { model: 'building_market_red', cell: [6, 2], spot: 'vercel', rot: 0 },
      { model: 'flag_red', cell: [6, 2], spot: 'vercel', offset: [-0.75, 0.55], scale: 2.2 },
      { model: 'flag_blue', cell: [6, 2], spot: 'vercel', offset: [0.75, 0.55], scale: 2.2 },
      // Les ateliers Render : les API d'Actus-auto (bleu) et de DUPLIK (rouge)
      { model: 'building_lumbermill_blue', cell: [5, 4], spot: 'render', rot: 0 },
      { model: 'building_lumbermill_red', cell: [7, 4], spot: 'render', rot: 0 },
      // Le dépôt Azure : le CRM (jaune) en caisses, c'est-à-dire en conteneurs Docker
      { model: 'building_dirt', cell: [9, 2], spot: 'azure' },
      { model: 'crate_A_big', cell: [9, 2], spot: 'azure', offset: [-0.35, 0.1], scale: 2.4 },
      { model: 'crate_B_big', cell: [9, 2], spot: 'azure', offset: [0.15, 0.25], scale: 2.4 },
      { model: 'crate_A_big', cell: [9, 2], spot: 'azure', offset: [-0.1, -0.35], scale: 2.4 },
      { model: 'crate_A_small', cell: [9, 2], spot: 'azure', offset: [-0.33, 0.12], scale: 2.4, rot: 20 },
      { model: 'tent', cell: [9, 2], spot: 'azure', offset: [0.45, -0.3], scale: 1.8 },
      { model: 'flag_yellow', cell: [9, 2], spot: 'azure', offset: [0.6, 0.55], scale: 2.2 },
      // Les puits : PostgreSQL (bleu) et MongoDB Atlas (vert)
      { model: 'building_well_blue', cell: [5, 6], spot: 'wells', scale: 1.5 },
      { model: 'building_well_green', cell: [9, 4], spot: 'wells', scale: 1.5 },
      // Le décor
      { model: 'building_grain', cell: [4, 3] },
      { model: 'building_grain', cell: [7, 3] },
      { model: 'building_dirt', cell: [5, 3] },
      { model: 'building_grain', cell: [8, 3] },
      { model: 'trees_B_small', cell: [10, 1] },
      { model: 'trees_A_medium', cell: [10, 3] },
      { model: 'trees_A_small', cell: [2, 5] },
      { model: 'tree_single_A', cell: [3, 6] },
      { model: 'hill_single_A', cell: [8, 5], scale: 1.6 },
      { model: 'trees_B_small', cell: [7, 6] },
      { model: 'trees_A_medium', cell: [10, 5] },
      { model: 'rock_single_A', cell: [3, 4], offset: [0.2, -0.2], scale: 2 },
      { model: 'tree_single_B', cell: [10, 6] },
    ],
    labels: [
      { spot: 'river', cell: [4, 0], text: 'Rivière · Internet' },
      { spot: 'grange', cell: [1, 4], text: 'Grange · Git', height: 1.6 },
      { spot: 'mill', cell: [2, 2], text: 'Moulin · CI/CD', height: 1.6 },
      { spot: 'vercel', cell: [6, 2], text: 'Marché · Vercel', height: 1.3 },
      { spot: 'render', cell: [5, 4], text: 'Ateliers · Render', height: 2 },
      { spot: 'feed', cell: [7, 4], text: 'Rigole', height: 2 },
      { spot: 'azure', cell: [9, 2], text: 'Dépôt · Azure', height: 1 },
      { spot: 'wells', cell: [5, 6], text: 'Puits · PostgreSQL', height: 1.4 },
      { spot: 'wells', cell: [9, 4], text: 'Puits · MongoDB', height: 1.4 },
    ],
  },

  // --- Demain : tout le jardin rapatrié dans un domaine clos (un VPS) --------
  tomorrow: {
    cols: 11,
    rows: 7,
    water: [
      { spot: 'river', path: river(11), floaters: 3 },
      ...commonWater,
      // L'eau entre par la grille, passe l'écluse, puis irrigue la serre
      { spot: 'nginx', path: [[7, 0], [7, 1], [7, 2], [7, 3], [7, 4]], floaters: 1 },
      { spot: 'proxmox', path: [[7, 4], [6, 4], [5, 4]] },
      { spot: 'proxmox', path: [[7, 4], [8, 4], [9, 4]] },
      { spot: 'proxmox', path: [[6, 4], [6, 5]] },
      { spot: 'proxmox', path: [[8, 4], [8, 5]] },
    ],
    roads: [...commonRoads, { spot: 'vpn', path: [[2, 2], [2, 3], [3, 4], [3, 5]], barrow: true }],
    objects: [
      ...commonObjects,
      // L'écluse (nginx) : un pont-vanne sur le canal, juste après la grille
      { model: 'building_bridge_A', cell: [7, 3], spot: 'nginx', rot: 60 },
      // La grande serre (Proxmox) : une plate-bande par projet
      { model: 'building_grain', cell: [5, 4], spot: 'proxmox' },
      { model: 'flag_yellow', cell: [5, 4], spot: 'proxmox', offset: [-0.5, 0.4], scale: 2.2 },
      { model: 'building_grain', cell: [6, 5], spot: 'proxmox' },
      { model: 'flag_red', cell: [6, 5], spot: 'proxmox', offset: [-0.5, 0.4], scale: 2.2 },
      { model: 'building_grain', cell: [8, 5], spot: 'proxmox' },
      { model: 'flag_blue', cell: [8, 5], spot: 'proxmox', offset: [-0.5, 0.4], scale: 2.2 },
      { model: 'building_grain', cell: [9, 4], spot: 'proxmox' },
      { model: 'flag_green', cell: [9, 4], spot: 'proxmox', offset: [-0.5, 0.4], scale: 2.2 },
      // Le puits, à l'abri dans le domaine
      { model: 'building_well_blue', cell: [7, 6], spot: 'db', scale: 1.5 },
      // La tour de guet (Prometheus + Grafana)
      { model: 'building_tower_B_yellow', cell: [10, 2], spot: 'monitoring' },
      // La cabane du jardinier et l'entrée de la mine (VPN)
      { model: 'building_home_A_yellow', cell: [2, 5], spot: 'vpn', rot: -30 },
      { model: 'building_mine_blue', cell: [3, 5], spot: 'vpn', rot: 180 },
      { model: 'building_dirt', cell: [5, 6], spot: 'vpn' },
      // Le chantier : la migration est en préparation
      { model: 'building_scaffolding', cell: [10, 4] },
      { model: 'building_stage_B', cell: [10, 5] },
      { model: 'wheelbarrow', cell: [10, 6], offset: [-0.2, 0.1], scale: 2.4, rot: 40 },
      // Le décor
      { model: 'building_grain', cell: [5, 2] },
      { model: 'building_dirt', cell: [9, 2] },
      { model: 'trees_B_small', cell: [4, 1] },
      { model: 'trees_A_small', cell: [10, 1] },
      { model: 'trees_A_medium', cell: [4, 3] },
      { model: 'tree_single_A', cell: [3, 2] },
      { model: 'trees_B_small', cell: [1, 6] },
      { model: 'rock_single_B', cell: [4, 5], offset: [0, 0], scale: 2.2 },
    ],
    fence: { spot: 'gate', from: [5, 2], to: [10, 6], gate: [[7, 1], [7, 2]] },
    greenhouse: { spot: 'proxmox', from: [5, 4], to: [9, 5] },
    tunnel: { spot: 'vpn', from: [3, 5], to: [5, 6] },
    labels: [
      { spot: 'river', cell: [4, 0], text: 'Rivière · Internet' },
      { spot: 'grange', cell: [1, 4], text: 'Grange · Git', height: 1.6 },
      { spot: 'mill', cell: [2, 2], text: 'Moulin · CI/CD', height: 1.6 },
      { spot: 'gate', cell: [7, 1], text: 'Grille · pfSense', height: 0.9 },
      { spot: 'nginx', cell: [7, 3], text: 'Écluse · nginx', height: 0.8 },
      { spot: 'proxmox', cell: [7, 5], text: 'Serre · Proxmox', height: 2.1 },
      { spot: 'db', cell: [7, 6], text: 'Puits · PostgreSQL', height: 1.4 },
      { spot: 'monitoring', cell: [10, 2], text: 'Tour de guet · Grafana', height: 2.7 },
      { spot: 'vpn', cell: [3, 5], text: 'Mine · VPN', height: 1.4 },
    ],
  },
}
