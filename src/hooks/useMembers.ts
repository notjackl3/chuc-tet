import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Member } from '../types'

// Demo data for when Supabase is not configured
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
    name: 'Mom',
    relationship: 'Mother',
    category: 'family',
    parent_id: '1',
    video_filename: 'greeting-mom.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Dad',
    relationship: 'Father',
    category: 'family',
    parent_id: '1',
    video_filename: 'greeting-dad.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Grandma (Maternal)',
    relationship: 'Grandmother',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-grandma.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Grandpa (Maternal)',
    relationship: 'Grandfather',
    category: 'family',
    parent_id: '2',
    video_filename: 'greeting-grandpa.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Grandma (Paternal)',
    relationship: 'Grandmother',
    category: 'family',
    parent_id: '3',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Grandpa (Paternal)',
    relationship: 'Grandfather',
    category: 'family',
    parent_id: '3',
    video_filename: null,
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Close Friends',
    relationship: 'Friends',
    category: 'friends',
    parent_id: '1',
    video_filename: 'greeting-friends.mp4',
    position_x: 0,
    position_y: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'Work Team',
    relationship: 'Colleagues',
    category: 'community',
    parent_id: '1',
    video_filename: 'greeting-work.mp4',
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
