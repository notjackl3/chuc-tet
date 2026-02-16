export interface Member {
  id: string
  name: string
  relationship: string | null
  category: 'family' | 'friends' | 'community'
  parent_id: string | null
  video_filename: string | null
  position_x: number
  position_y: number
  created_at: string
}

export interface Photo {
  id: string
  member_id: string
  photo_url: string
  captured_at: string
}

export interface TreeNodeData {
  member: Member
  onClick: (member: Member) => void
}
