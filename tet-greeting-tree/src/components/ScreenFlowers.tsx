import { useMemo } from 'react'

const FLOWER_COLORS = ['#FFD700', '#FFA500', '#FF69B4', '#FFB6C1', '#FFFF00']

// Simple seeded random for consistent placement
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

interface Flower {
  x: string
  y: string
  size: number
  rotation: number
  color: string
  id: number
}

export function ScreenFlowers() {
  const flowers = useMemo(() => {
    const random = seededRandom(12345)
    const result: Flower[] = []
    const flowerCount = 20

    for (let i = 0; i < flowerCount; i++) {
      // Distribute flowers along the edges
      const edge = Math.floor(random() * 4) // 0: top, 1: right, 2: bottom, 3: left
      let x: string
      let y: string

      switch (edge) {
        case 0: // top edge
          x = `${random() * 100}%`
          y = `${random() * 8}%`
          break
        case 1: // right edge
          x = `${92 + random() * 8}%`
          y = `${random() * 100}%`
          break
        case 2: // bottom edge
          x = `${random() * 100}%`
          y = `${92 + random() * 8}%`
          break
        default: // left edge
          x = `${random() * 8}%`
          y = `${random() * 100}%`
          break
      }

      const size = 16 + random() * 20
      const rotation = random() * 360
      const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)]

      result.push({ x, y, size, rotation, color, id: i })
    }

    return result
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {flowers.map((flower) => (
        <svg
          key={flower.id}
          className="absolute"
          style={{
            left: flower.x,
            top: flower.y,
            transform: `translate(-50%, -50%) rotate(${flower.rotation}deg)`,
            width: flower.size,
            height: flower.size,
          }}
          viewBox="0 0 24 24"
        >
          <g fill={flower.color}>
            <ellipse cx="12" cy="5" rx="3" ry="5" />
            <ellipse cx="12" cy="5" rx="3" ry="5" transform="rotate(72 12 12)" />
            <ellipse cx="12" cy="5" rx="3" ry="5" transform="rotate(144 12 12)" />
            <ellipse cx="12" cy="5" rx="3" ry="5" transform="rotate(216 12 12)" />
            <ellipse cx="12" cy="5" rx="3" ry="5" transform="rotate(288 12 12)" />
            <circle cx="12" cy="12" r="3" fill="#8B4513" />
          </g>
        </svg>
      ))}
    </div>
  )
}
