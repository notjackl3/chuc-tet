import { useEffect, useState, useCallback } from 'react'
import type { Member, Photo } from '../types'
import { VideoPlayer } from './VideoPlayer'
import { PhotoBooth } from './PhotoBooth'
import { PhotoGallery } from './PhotoGallery'
import { supabase } from '../lib/supabase'

interface MemberModalProps {
  member: Member
  onClose: () => void
}

export function MemberModal({ member, onClose }: MemberModalProps) {
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [showContent, setShowContent] = useState(false)
  const [activeTab, setActiveTab] = useState<'video' | 'photos'>('video')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)

  const fetchPhotos = useCallback(async () => {
    setLoadingPhotos(true)
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('member_id', member.id)
        .order('captured_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoadingPhotos(false)
    }
  }, [member.id])

  useEffect(() => {
    fetchPhotos()
    // Show envelope for 2 seconds, then fade to content
    const timer = setTimeout(() => {
      setShowEnvelope(false)
      setTimeout(() => setShowContent(true), 500)
    }, 2000)

    return () => clearTimeout(timer)
  }, [fetchPhotos])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      {/* Outer wrapper for close button positioning */}
      <div
        className="relative w-full max-w-[28vh] sm:max-w-[35vh] md:max-w-[40vh] lg:max-w-[45vh]"
        style={{ aspectRatio: '9/16' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - outside overflow-hidden container */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 hover:bg-yellow-300 text-red-700 font-bold shadow-lg z-50 flex items-center justify-center transition-colors text-lg sm:text-xl"
        >
          ×
        </button>

        {/* Container with rounded corners */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {/* Li Xi Envelope - large, centered */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              showEnvelope ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="w-full h-full bg-red-600 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
              {/* Gold border pattern */}
              <div className="absolute inset-4 sm:inset-6 border-2 sm:border-4 border-yellow-400" />

              {/* Top decorative flap */}
              <div className="absolute left-0 right-0 top-0 h-[15%] bg-red-500">
                <div
                  className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-red-600"
                  style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }}
                />
              </div>

              {/* Member name - centered */}
              <div className="text-center z-10 px-4">
                <h2 className="text-yellow-400 font-bold text-2xl sm:text-3xl md:text-4xl mb-2">
                  {member.name}
                </h2>
                {member.relationship && (
                  <p className="text-yellow-300 text-sm sm:text-base md:text-lg">
                    {member.relationship}
                  </p>
                )}
              </div>

              {/* Bottom decoration */}
              <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2">
                <div className="text-yellow-400 text-xs sm:text-sm font-medium">
                  Chúc Mừng Năm Mới
                </div>
              </div>
            </div>
          </div>

          {/* Content - same size as envelope */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out flex flex-col ${
              showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Tabs */}
            <div className="flex bg-red-600 overflow-hidden shrink-0">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 py-5 px-4 font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'video'
                    ? 'bg-yellow-400 text-white'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Video
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 py-5 px-4 font-medium transition-colors text-sm sm:text-base ${
                  activeTab === 'photos'
                    ? 'bg-yellow-400 text-white'
                    : 'text-white hover:text-white/80'
                }`}
              >
                Photos ({photos.length})
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden shadow-2xl bg-white">
              {activeTab === 'video' ? (
                <VideoPlayer
                  filename={member.video_filename}
                  memberName={member.name}
                />
              ) : (
                <div className="h-full overflow-hidden bg-amber-50">
                  <PhotoBooth
                    memberId={member.id}
                    onPhotoTaken={fetchPhotos}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
