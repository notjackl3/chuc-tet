import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

// Demo data for when Supabase is not configured
// Video filenames follow the pattern: greeting-{vietnamese-to-ascii-name}.mp4
const DEMO_MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Me',
    relationship: 'Self',
    category: 'family',
    parent_id: null,
    video_filename: 'greeting-me.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mẹ',
    relationship: 'Mother',
    category: 'family',
    parent_id: '1',
    video_filename: 'greeting-me.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ba',
    relationship: 'Father',
    category: 'family',
    parent_id: '1',
    video_filename: 'greeting-ba.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Bà Ngoại',
    relationship: 'Grandmother',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-ba-ngoai.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Ông Ngoại',
    relationship: 'Grandfather',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-ong-ngoai.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Bà Nội',
    relationship: 'Grandmother',
    category: 'family',
    parent_id: '3',
    video_filename: 'greeting-ba-noi.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Ông Nội',
    relationship: 'Grandfather',
    category: 'family',
    parent_id: '3',
    video_filename: 'greeting-ong-noi.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Me
  {
    id: '8',
    name: 'Lớp Vào Đời',
    relationship: 'Community',
    category: 'community',
    parent_id: '1',
    video_filename: 'greeting-lop-vao-doi.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Mẹ
  {
    id: '9',
    name: 'Cậu Hai',
    relationship: 'Uncle',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-cau-hai.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Cô Ngọc',
    relationship: 'Aunt',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-co-ngoc.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '11',
    name: 'Nhi',
    relationship: 'Cousin',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-nhi.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '12',
    name: 'Khôi',
    relationship: 'Cousin',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-khoi.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Ông Ngoại
  {
    id: '13',
    name: 'Gia đình bác Trí',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '5',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Ba
  {
    id: '14',
    name: 'Cô Nga',
    relationship: 'Aunt',
    category: 'family',
    parent_id: '3',
    video_filename: 'greeting-co-nga.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Ông Nội
  {
    id: '15',
    name: 'Bà Hồng',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '7',
    video_filename: 'greeting-ba-hong.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  // Below Bà Nội
  {
    id: '16',
    name: 'Bà Trà',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '6',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '17',
    name: 'Gia đình bà Trinh',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '6',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '18',
    name: 'Gia đình bà Nhàn',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '6',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '19',
    name: 'Gia đình bà Ngân',
    relationship: 'Extended Family',
    category: 'family',
    parent_id: '6',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
]

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<Error | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setMembers(data)
        } else {
          // Use demo data if no data in database
          setMembers(DEMO_MEMBERS)
          setIsDemo(true)
        }
      } catch (err) {
        console.warn('Using demo data:', err)
        setMembers(DEMO_MEMBERS)
        setIsDemo(true)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  return { members, loading, error, isDemo }
}
