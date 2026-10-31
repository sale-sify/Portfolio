// Fait jaillir des graines depuis un point de l'écran : elles montent, puis
// retombent en tournant. Animations Web (element.animate), aucune librairie.

const COLORS = ['#5b3a29', '#c8a27a', '#8c6a55', '#e9d3b0']

export function seedBurst(x: number, y: number, count = 18) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const layer = document.createElement('div')
  layer.setAttribute('aria-hidden', 'true')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;overflow:hidden'
  document.body.appendChild(layer)

  const animations = Array.from({ length: count }, () => {
    const seed = document.createElement('span')
    const size = 7 + Math.random() * 5
    seed.style.cssText = `
      position:absolute; left:${x + (Math.random() - 0.5) * 120}px; top:${y}px;
      width:${size}px; height:${size * 1.5}px; border-radius:50% / 60% 60% 40% 40%;
      background:${COLORS[Math.floor(Math.random() * COLORS.length)]}; border:1.5px solid #141414;`
    layer.appendChild(seed)

    const dx = (Math.random() - 0.5) * 260
    const up = -60 - Math.random() * 120
    const spin = (Math.random() - 0.5) * 720
    return seed.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${up}px) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px, ${up + 320}px) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(0.2, 0.6, 0.4, 1)', fill: 'forwards' },
    )
  })

  Promise.all(animations.map((a) => a.finished)).finally(() => layer.remove())
}
