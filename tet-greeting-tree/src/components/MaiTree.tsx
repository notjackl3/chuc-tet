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

  // Layout constants - more vertical layout
  const VERTICAL_SPACING = 140
  const HORIZONTAL_SPACING = 120

  // Process nodes level by level
  function processLevel(levelMembers: Member[], y: number, centerX: number) {
    const totalWidth = (levelMembers.length - 1) * HORIZONTAL_SPACING
    const startX = centerX - totalWidth / 2

    levelMembers.forEach((member, index) => {
      const x = startX + index * HORIZONTAL_SPACING

      nodes.push({
        id: member.id,
        type: 'maiNode',
        position: { x, y },
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
        processLevel(children, y + VERTICAL_SPACING, x)
      }
    })
  }

  // Start processing from root - centered layout
  const centerX = 400
  processLevel(rootMembers, 50, centerX)

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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
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
