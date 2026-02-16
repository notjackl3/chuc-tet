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
  const VERTICAL_SPACING = 140
  const HORIZONTAL_SPACING = 70
  const NODE_WIDTH = 85

  // Calculate the width needed for each subtree
  const subtreeWidths = new Map<string, number>()

  function calculateSubtreeWidth(member: Member): number {
    const children = childrenMap.get(member.id) || []
    if (children.length === 0) {
      subtreeWidths.set(member.id, NODE_WIDTH)
      return NODE_WIDTH
    }

    const childrenWidth = children.reduce((sum, child) => {
      return sum + calculateSubtreeWidth(child)
    }, 0) + (children.length - 1) * HORIZONTAL_SPACING

    const width = Math.max(NODE_WIDTH, childrenWidth)
    subtreeWidths.set(member.id, width)
    return width
  }

  // Calculate widths for all root subtrees
  rootMembers.forEach(root => calculateSubtreeWidth(root))

  // Position nodes based on subtree widths
  function positionNode(member: Member, x: number, y: number) {
    // Add slight randomness to positions for organic feel
    const random = seededRandom(member.id)
    const randomOffsetX = (random() - 0.5) * 15
    const randomOffsetY = (random() - 0.5) * 10

    nodes.push({
      id: member.id,
      type: 'maiNode',
      position: { x: x + randomOffsetX, y: y + randomOffsetY },
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

    // Position children
    const children = childrenMap.get(member.id) || []
    if (children.length > 0) {
      // Calculate total width needed for children
      const totalChildrenWidth = children.reduce((sum, child) => {
        return sum + (subtreeWidths.get(child.id) || NODE_WIDTH)
      }, 0) + (children.length - 1) * HORIZONTAL_SPACING

      // Start position for first child (centered under parent)
      let childX = x - totalChildrenWidth / 2

      children.forEach(child => {
        const childWidth = subtreeWidths.get(child.id) || NODE_WIDTH
        // Position child at center of its subtree space
        positionNode(child, childX + childWidth / 2, y + VERTICAL_SPACING)
        childX += childWidth + HORIZONTAL_SPACING
      })
    }
  }

  // Calculate total width for all roots
  const totalRootWidth = rootMembers.reduce((sum, root) => {
    return sum + (subtreeWidths.get(root.id) || NODE_WIDTH)
  }, 0) + (rootMembers.length - 1) * HORIZONTAL_SPACING

  // Position root nodes
  let rootX = 400 - totalRootWidth / 2
  rootMembers.forEach(root => {
    const rootWidth = subtreeWidths.get(root.id) || NODE_WIDTH
    positionNode(root, rootX + rootWidth / 2, 50)
    rootX += rootWidth + HORIZONTAL_SPACING
  })

  return { nodes, edges }
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
