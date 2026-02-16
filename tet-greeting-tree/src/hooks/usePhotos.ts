import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(memberId: string | null) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPhotos = useCallback(async () => {
    if (!memberId) {
      setPhotos([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('member_id', memberId)
        .order('captured_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError(err as Error)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const uploadPhoto = useCallback(async (imageData: string): Promise<boolean> => {
    if (!memberId) return false

    try {
      // Convert base64 to blob
      const response = await fetch(imageData)
      const blob = await response.blob()

      // Generate unique filename
      const filename = `${memberId}/${Date.now()}.jpg`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filename)

      // Save to photos table
      const { error: insertError } = await supabase
        .from('photos')
        .insert({
          member_id: memberId,
          photo_url: urlData.publicUrl,
        })

      if (insertError) throw insertError

      // Refresh photos
      await fetchPhotos()
      return true
    } catch (err) {
      console.error('Upload error:', err)
      setError(err as Error)
      return false
    }
  }, [memberId, fetchPhotos])

  return { photos, loading, error, fetchPhotos, uploadPhoto }
}
