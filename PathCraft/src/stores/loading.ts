import { reactive } from 'vue'

// L'accueil passe `ready` à true quand la scène 3D a rendu sa première image.
export const loading = reactive({ ready: false })
