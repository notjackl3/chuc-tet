import { useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { TreeNode } from './TreeNode'
import { FlowerEdge } from './FlowerEdge'
import type { Member } from '../types'

interface MaiTreeProps {
  members: Member[]
  onNodeClick: (member: Member) => void
}

const nodeTypes = {
  maiNode: TreeNode,
}

const edgeTypes = {
  flowerEdge: FlowerEdge,
}

// Seeded random for consistent layout
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

const NODE_SIZE = 80 // Coin size
const MIN_DISTANCE = NODE_SIZE + 20 // Minimum distance between node centers

function checkCollision(pos1: { x: number; y: number }, pos2: { x: number; y: number }): boolean {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < MIN_DISTANCE
}

function resolveCollisions(nodes: Node[]): Node[] {
  const resolvedNodes = nodes.map(n => ({ ...n, position: { ...n.position } }))
  const maxIterations = 50

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasCollision = false

    for (let i = 0; i < resolvedNodes.length; i++) {
      for (let j = i + 1; j < resolvedNodes.length; j++) {
        const nodeA = resolvedNodes[i]
        const nodeB = resolvedNodes[j]

        if (checkCollision(nodeA.position, nodeB.position)) {
          hasCollision = true

          // Move the node that's lower in the tree (higher index usually means child)
          const nodeToMove = j > i ? nodeB : nodeA
          const random = seededRandom(nodeToMove.id + iteration)

          // Try moving in different directions
          const moveX = (random() - 0.5) * 60
          const moveY = random() * 40 + 20 // Bias towards moving down

          nodeToMove.position.x += moveX
          nodeToMove.position.y += moveY
        }
      }
    }

    if (!hasCollision) break
  }

  return resolvedNodes
}

function buildTreeLayout(members: Member[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Find root nodes (no parent)
  const rootMembers = members.filter(m => !m.parent_id)
  const childrenMap = new Map<string, Member[]>()

  // Build children map
  members.forEach(m => {
    if (m.parent_id) {
      const children = childrenMap.get(m.parent_id) || []
      children.push(m)
      childrenMap.set(m.parent_id, children)
    }
  })

  // Layout constants
  const VERTICAL_SPACING = 130
  const HORIZONTAL_SPACING = 110

  // Process nodes level by level
  function processLevel(levelMembers: Member[], y: number, centerX: number) {
    const totalWidth = (levelMembers.length - 1) * HORIZONTAL_SPACING
    const startX = centerX - totalWidth / 2

    levelMembers.forEach((member, index) => {
      // Add slight randomness to positions
      const random = seededRandom(member.id)
      const randomOffsetX = (random() - 0.5) * 30
      const randomOffsetY = (random() - 0.5) * 20

      const x = startX + index * HORIZONTAL_SPACING + randomOffsetX
      const yPos = y + randomOffsetY

      nodes.push({
        id: member.id,
        type: 'maiNode',
        position: { x, y: yPos },
        data: { member, onClick: () => {} },
      })

      // Create edge to parent
      if (member.parent_id) {
        edges.push({
          id: `${member.parent_id}-${member.id}`,
          source: member.parent_id,
          target: member.id,
          type: 'flowerEdge',
        })
      }

      // Process children
      const children = childrenMap.get(member.id) || []
      if (children.length > 0) {
        processLevel(children, yPos + VERTICAL_SPACING, x)
      }
    })
  }

  // Start processing from root - centered layout
  const centerX = 400
  processLevel(rootMembers, 50, centerX)

  // Resolve any collisions
  const resolvedNodes = resolveCollisions(nodes)

  return { nodes: resolvedNodes, edges }
}

export function MaiTree({ members, onNodeClick }: MaiTreeProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildTreeLayout(members),
    [members]
  )

  // Update nodes with click handler
  const nodesWithHandler = useMemo(
    () => initialNodes.map(node => ({
      ...node,
      data: { ...node.data, onClick: onNodeClick },
    })),
    [initialNodes, onNodeClick]
  )

  const [nodes, , onNodesChange] = useNodesState(nodesWithHandler)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.5, maxZoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'flowerEdge',
        }}
        style={{ background: 'transparent' }}
      >
        <Controls
          className="bg-red-800/80 rounded-lg [&>button]:text-yellow-400 [&>button]:border-yellow-500"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  )
}
