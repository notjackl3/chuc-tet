import { useMemo } from 'react'
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

const FLOWER_COLORS = ['#FFD700', '#FFA500', '#FF69B4', '#FFB6C1', '#FFFF00']

// Simple seeded random for consistent flower placement per edge
function seededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff
    return hash / 0x7fffffff
  }
}

// Mai flower SVG as a reusable component
function MaiFlower({ x, y, size, rotation, color }: { x: number; y: number; size: number; rotation: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${size / 24})`}>
      <g fill={color}>
        <ellipse cx="0" cy="-7" rx="3" ry="5" />
        <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(72)" />
        <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(144)" />
        <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(216)" />
        <ellipse cx="0" cy="-7" rx="3" ry="5" transform="rotate(288)" />
        <circle cx="0" cy="0" r="3" fill="#8B4513" />
      </g>
    </g>
  )
}

export function FlowerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Generate flowers along the edge
  const flowers = useMemo(() => {
    const random = seededRandom(id)
    const count = Math.floor(random() * 2) + 1 // 1-2 flowers per edge
    const result = []

    for (let i = 0; i < count; i++) {
      // Position along the edge (avoid endpoints)
      const t = 0.3 + random() * 0.4

      // Interpolate position (simplified - works well for mostly vertical edges)
      const x = sourceX + (targetX - sourceX) * t + (random() - 0.5) * 20
      const y = sourceY + (targetY - sourceY) * t

      const size = 12 + random() * 6
      const rotation = random() * 360
      const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)]

      result.push({ x, y, size, rotation, color, id: i })
    }
    return result
  }, [id, sourceX, sourceY, targetX, targetY])

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{ stroke: '#FFD700', strokeWidth: 1.5 }}
      />
      {flowers.map((flower) => (
        <MaiFlower
          key={flower.id}
          x={flower.x}
          y={flower.y}
          size={flower.size}
          rotation={flower.rotation}
          color={flower.color}
        />
      ))}
    </>
  )
}
