// La légende du plan du jardin (section Infra). Chaque `id` correspond à un
// élément dessiné dans GardenMap.vue : survoler l'un met l'autre en avant.

export type GardenMode = 'today' | 'tomorrow'

export type GardenSpot = {
  id: string
  name: string
  tech: string
  text: string
}

const river: GardenSpot = {
  id: 'river',
  name: 'La rivière',
  tech: 'Internet',
  text: 'Les visiteurs (les nénuphars) arrivent par l’eau. Des canaux la détournent jusqu’au bon endroit.',
}

const grange: GardenSpot = {
  id: 'grange',
  name: 'La grange',
  tech: 'Git · GitLab · GitHub',
  text: 'Toutes les graines sont rangées ici, versionnées. Chaque push en sort une nouvelle fournée.',
}

export const garden: Record<GardenMode, { caption: string; spots: GardenSpot[] }> = {
  today: {
    caption: 'Plan du jardin · état actuel',
    spots: [
      river,
      grange,
      {
        id: 'mill',
        name: 'Le moulin à eau',
        tech: 'CI/CD',
        text: 'À chaque push, la roue tourne : tests, build, images Docker. Puis la brouette suit les chemins de terre pour livrer chaque parcelle.',
      },
      {
        id: 'vercel',
        name: 'Le marché Vercel',
        tech: 'Fronts Vue',
        text: 'Les vitrines de DUPLIK (drapeau rouge) et d’Actus-auto (bleu), servies en statique au plus près des visiteurs.',
      },
      {
        id: 'render',
        name: 'Les ateliers Render',
        tech: 'API Express',
        text: 'Les API d’Actus-auto (bleu) et de DUPLIK (rouge). Les requêtes /api descendent du marché par leur propre canal.',
      },
      {
        id: 'feed',
        name: 'La rigole',
        tech: 'Actus-auto → DUPLIK',
        text: 'Les articles rédigés par Actus-auto arrosent le blog de DUPLIK, par une API d’ingestion protégée par clé.',
      },
      {
        id: 'azure',
        name: 'Le dépôt Azure',
        tech: 'Docker · Prometheus',
        text: 'Le CRM (drapeau jaune) rangé en caisses, c’est-à-dire en conteneurs Docker, avec Prometheus qui remonte ses métriques.',
      },
      {
        id: 'wells',
        name: 'Les puits',
        tech: 'PostgreSQL · MongoDB Atlas',
        text: 'Les données sont puisées dans des bases managées : PostgreSQL pour les API, MongoDB Atlas pour le CRM.',
      },
    ],
  },
  tomorrow: {
    caption: 'Plan du domaine · migration en préparation',
    spots: [
      river,
      grange,
      {
        id: 'mill',
        name: 'Le moulin à eau',
        tech: 'CI/CD',
        text: 'Toujours là : tests, build et images Docker à chaque push, avant de livrer le domaine.',
      },
      {
        id: 'gate',
        name: 'La grille',
        tech: 'pfSense',
        text: 'Le pare-feu : un mur de pierre tout autour du domaine, et une seule grille d’entrée. Seule l’eau propre passe.',
      },
      {
        id: 'nginx',
        name: 'L’écluse',
        tech: 'nginx · HTTPS',
        text: 'Le reverse proxy : un pont-vanne juste après la grille, qui lit l’adresse de chaque visiteur et l’envoie vers la bonne plate-bande.',
      },
      {
        id: 'proxmox',
        name: 'La grande serre',
        tech: 'Proxmox · LXC',
        text: 'Une plate-bande isolée par projet (CRM jaune, DUPLIK rouge, Actus-auto bleu, CMF vert), en conteneur LXC ou en VM. Déjà rodé sur AlterMatch : prod, dev et staging.',
      },
      {
        id: 'db',
        name: 'Le puits',
        tech: 'PostgreSQL',
        text: 'Les données rentrent au domaine, à l’abri derrière la grille.',
      },
      {
        id: 'monitoring',
        name: 'La tour de guet',
        tech: 'Prometheus · Grafana',
        text: 'Elle surveille tout le domaine : métriques, tableaux de bord et alertes. Je vois venir l’orage avant qu’il éclate.',
      },
      {
        id: 'vpn',
        name: 'La mine',
        tech: 'VPN',
        text: 'Depuis ma cabane, je passe par en dessous : l’administration se fait uniquement par le tunnel VPN, rien n’est exposé.',
      },
    ],
  },
}
