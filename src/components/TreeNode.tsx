import { Handle, Position } from '@xyflow/react'
import { useMemo } from 'react'
import type { Member } from '../types'

interface TreeNodeProps {
  data: {
    member: Member
    onClick: (member: Member) => void
  }
}

// Simple seeded random for consistent flower placement per member
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

const FLOWER_COLORS = ['#FFD700', '#FFA500', '#FF69B4', '#FFB6C1', '#FFFF00']

export function TreeNode({ data }: TreeNodeProps) {
  const { member, onClick } = data

  // Generate random flowers around the coin
  const flowers = useMemo(() => {
    const random = seededRandom(member.id)
    const count = Math.floor(random() * 3) + 2 // 2-4 flowers
    const result = []

    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2
      const distance = 38 + random() * 8 // Position around edge
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      const size = 10 + random() * 6
      const rotation = random() * 360
      const color = FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)]

      result.push({ x, y, size, rotation, color, id: i })
    }
    return result
  }, [member.id])

  return (
    <div
      className="lucky-coin cursor-pointer relative"
      onClick={() => onClick(member)}
    >
      {/* Connection handles - hidden but functional */}
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0 w-2 h-2"
      />

      {/* Random flowers around the coin */}
      {flowers.map((flower) => (
        <svg
          key={flower.id}
          className="absolute pointer-events-none"
          style={{
            left: `calc(50% + ${flower.x}px)`,
            top: `calc(50% + ${flower.y}px)`,
            transform: `translate(-50%, -50%) rotate(${flower.rotation}deg)`,
            width: flower.size,
            height: flower.size,
          }}
          viewBox="0 0 24 24"
        >
          {/* 5-petal Mai flower */}
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

      {/* Lucky Coin - solid gold with white highlight */}
      <div className="w-20 h-20 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center border-4 border-yellow-500 relative overflow-hidden">
        {/* White highlight on corner */}
        <div className="absolute top-2 left-2 w-5 h-5 bg-white/60 rounded-full" />
        {/* Name inside coin */}
        <span className="text-[9px] sm:text-xs font-bold text-red-700 text-center px-1 leading-tight z-10">
          {member.name}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0 w-2 h-2"
      />
    </div>
  )
}
