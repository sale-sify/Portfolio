// Toutes les données des projets du portfolio.
// Ajouter un projet = ajouter un objet ici. S'il a un `salesify`, une petite racine
// apparaît dans le potager avec son problème, et le projet devient son remède.

export type Accessory = 'headset' | 'bubble' | 'magnifier' | 'antenna' | 'heart'

export type ProjectKind = 'pro' | 'etna' | 'weekend' | 'perso'

export type Salesify = {
  name: string
  epithet: string
  problem: string
  color: string
  accessory: Accessory
  scale: number
}

export type Project = {
  id: string
  name: string
  kind: ProjectKind
  year: string
  tagline: string
  description: string
  stack: string[]
  status?: string
  link?: { label: string; url: string }
  confidential?: boolean
  salesify?: Salesify
}

export const kindLabels: Record<ProjectKind, string> = {
  pro: 'En prod · Framboise',
  etna: 'Projet de fin d’études · ETNA',
  weekend: 'Fait en un weekend',
  perso: 'Projet perso',
}

export const projects: Project[] = [
  {
    id: 'crm',
    name: 'CRM Framboise',
    kind: 'pro',
    year: '2026',
    tagline: 'Le cockpit commercial du réseau',
    description:
      'CRM métier qui reçoit, attribue et suit les leads des enseignes en franchise : dispatch, prise de rendez-vous, appels depuis la fiche, tableau de bord et intégrations IA. Je le maintiens et le fais évoluer, du back jusqu’à la mise en prod.',
    stack: ['Angular', 'Express', 'MongoDB Atlas', 'Docker', 'Prometheus'],
    confidential: true,
    salesify: {
      name: 'Prospère',
      epithet: 'le commercial débordé',
      problem:
        'Des leads arrivent de partout, j’ai des post-it jusque sous la chaise et j’oublie de rappeler la moitié des gens. Au secours.',
      color: '#ffd23f',
      accessory: 'headset',
      scale: 1.05,
    },
  },
  {
    id: 'duplik',
    name: 'DUPLIK',
    kind: 'pro',
    year: '2026',
    tagline: 'La centrale d’achat privée des franchisés',
    description:
      'Plateforme à trois rôles (franchisés, partenaires, admin) : catalogue d’offres négociées, messagerie en temps réel, notifications, tableaux de bord vendeurs et modération.',
    stack: ['Vue 3', 'Pinia', 'Express', 'PostgreSQL', 'Socket.io', 'S3'],
    link: { label: 'duplik.consulting', url: 'https://www.duplik.consulting' },
    salesify: {
      name: 'Franchie',
      epithet: 'la franchisée qui paie plein pot',
      problem:
        'J’achète tout au prix fort, toute seule dans mon coin, alors que des centaines de franchisés achètent exactement la même chose que moi.',
      color: '#8c52ff',
      accessory: 'bubble',
      scale: 0.95,
    },
  },
  {
    id: 'cmf',
    name: 'Cent Mille Franchises',
    kind: 'pro',
    year: '2026',
    tagline: 'Refondre un site sans perdre son trafic',
    description:
      'Reconstruction de cent-mille-franchises.com, d’un site PHP 5 vers Nuxt 4 en rendu serveur. Ici, le trafic organique est le produit : 4 468 URLs inventoriées avant la première ligne de code, et des redirections traitées comme un engagement.',
    stack: ['Nuxt 4', 'Express', 'TypeScript', 'PostgreSQL', 'SEO'],
    status: 'Refonte en cours',
    link: { label: 'cent-mille-franchises.com', url: 'https://www.cent-mille-franchises.com' },
    salesify: {
      name: 'Pagerank',
      epithet: 'le vieux site qui tient au scotch',
      problem:
        'Je tourne en PHP 5 depuis des années. Tout le monde a peur de me toucher, parce qu’au moindre faux pas, 4 468 pages disparaissent de Google.',
      color: '#3ddc97',
      accessory: 'magnifier',
      scale: 1.12,
    },
  },
  {
    id: 'actus-auto',
    name: 'Actus-auto',
    kind: 'pro',
    year: '2026',
    tagline: 'La rédaction qui tourne toute seule',
    description:
      'Outil d’automatisation éditoriale : veille web, tri et rédaction par IA, actus SEO, posts LinkedIn prêts à publier et articles de blog, pour le développement des réseaux de franchise.',
    stack: ['Vue 3', 'Express', 'PostgreSQL', 'OpenAI', 'SerpAPI', 'API LinkedIn'],
    confidential: true,
    salesify: {
      name: 'Plume',
      epithet: 'le rédacteur à sec',
      problem:
        'Je dois sortir des actus tous les jours sur des dizaines d’enseignes. Je n’ai plus d’idées, plus de temps, et franchement plus d’encre.',
      color: '#4d9de0',
      accessory: 'antenna',
      scale: 0.92,
    },
  },
  {
    id: 'altermatch',
    name: 'AlterMatch',
    kind: 'etna',
    year: '2026',
    tagline: 'Le Tinder de l’alternance',
    description:
      'Swipes et matchs entre candidats et entreprises. Auth JWT, PostgreSQL auto-hébergé sur conteneurs LXC (prod, dev, staging), Docker, reverse proxy et CI.',
    stack: ['Vue 3', 'Pinia', 'Express', 'PostgreSQL', 'LXC', 'Docker', 'Cypress'],
    salesify: {
      name: 'Alti',
      epithet: 'l’alternant invisible',
      problem:
        '80 candidatures, 0 réponse. Les entreprises ne me voient même pas passer, et moi je ne sais pas lesquelles cherchent vraiment.',
      color: '#fff4e0',
      accessory: 'heart',
      scale: 1,
    },
  },
  {
    id: 'casse-brique',
    name: 'Casse-brique',
    kind: 'weekend',
    year: '2025',
    tagline: 'Un breakout en JS vanilla',
    description: 'Raquette, balle, briques et collisions, dessinés à la main dans un canvas HTML.',
    stack: ['JavaScript', 'Canvas'],
    link: { label: 'Jouer', url: 'https://js-casse-brique-game.vercel.app/' },
  },
  {
    id: 'egg-timer',
    name: 'Egg Timer',
    kind: 'weekend',
    year: '2025',
    tagline: 'Mollet, coque ou dur ?',
    description: 'Un minuteur à œufs animé et un peu absurde, pour un outil du quotidien.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    link: { label: 'Essayer', url: 'https://egg-timer-gamma.vercel.app/' },
  },
]

export const salesifyProjects = projects.filter((p) => p.salesify)
