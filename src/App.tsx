import { useState, useCallback, useEffect, useRef } from 'react'
import { MaiTree } from './components/MaiTree'
import { MemberModal } from './components/MemberModal'
import { useMembers } from './hooks/useMembers'
import { supabase } from './lib/supabase'
import type { Member, Photo } from './types'

interface FallingCoin {
  id: number
  x: number
  size: number
  duration: number
  delay: number
}

function App() {
  const { members, loading, isDemo } = useMembers()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [expandedPhoto, setExpandedPhoto] = useState<Photo | null>(null)
  const [fallingCoins, setFallingCoins] = useState<FallingCoin[]>([])
  const coinIdRef = useRef(0)

  // Background music
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(true)

  // Initialize audio and autoplay
  useEffect(() => {
    audioRef.current = new Audio('/background-music.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.05 // 15% volume for light background music

    // Try to autoplay immediately
    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Autoplay blocked - try again on first interaction
          const startOnInteraction = () => {
            audioRef.current?.play().catch(() => {})
          }
          document.addEventListener('click', startOnInteraction, { once: true })
          document.addEventListener('touchstart', startOnInteraction, { once: true })
        })
      }
    }

    tryPlay()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return

    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {})
      setIsMusicPlaying(true)
    } else {
      audioRef.current.pause()
      setIsMusicPlaying(false)
    }
  }, [])

  // Spawn falling coins at random intervals
  useEffect(() => {
    const spawnCoin = () => {
      const newCoin: FallingCoin = {
        id: coinIdRef.current++,
        x: Math.random() * 100, // Random horizontal position (%)
        size: 16 + Math.random() * 16, // 16-32px
        duration: 4 + Math.random() * 3, // 4-7 seconds to fall
        delay: 0,
      }
      setFallingCoins(prev => [...prev, newCoin])

      // Remove coin after animation completes
      setTimeout(() => {
        setFallingCoins(prev => prev.filter(c => c.id !== newCoin.id))
      }, newCoin.duration * 1000 + 500)
    }

    // Spawn first coin after a short delay
    const initialTimeout = setTimeout(spawnCoin, 2000)

    // Set up recurring spawn with random interval
    const scheduleNextCoin = () => {
      const interval = 5000 + Math.random() * 2000 // 5-7 seconds
      return setTimeout(() => {
        spawnCoin()
        timeoutRef.current = scheduleNextCoin()
      }, interval)
    }

    const timeoutRef = { current: scheduleNextCoin() }

    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Fetch all photos when gallery opens
  useEffect(() => {
    if (isGalleryOpen && allPhotos.length === 0) {
      fetchAllPhotos()
    }
  }, [isGalleryOpen])

  const fetchAllPhotos = async () => {
    setLoadingPhotos(true)
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('captured_at', { ascending: false })

      if (error) throw error
      setAllPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleNodeClick = useCallback((member: Member) => {
    setSelectedMember(member)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedMember(null)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="bg-gray-800/80 hover:bg-gray-700 text-yellow-400 px-3 py-1 rounded text-sm transition flex items-center gap-2 pointer-events-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gallery
          </button>
          <button
            onClick={toggleMusic}
            className="bg-gray-800/80 hover:bg-gray-700 text-yellow-400 w-8 h-8 rounded flex items-center justify-center pointer-events-auto transition"
            title={isMusicPlaying ? 'Mute music' : 'Play music'}
          >
            {isMusicPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            )}
          </button>
        </div>
        {isDemo && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded text-xs pointer-events-auto">
            Demo Mode
          </div>
        )}
      </header>

      {/* Gallery Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#B91C1C] transform transition-transform duration-300 ease-in-out ${
          isGalleryOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-red-900/50">
            <h2 className="text-yellow-400 font-semibold text-lg">Photo Gallery</h2>
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="text-yellow-400/70 hover:text-yellow-400 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Photos Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingPhotos ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
              </div>
            ) : allPhotos.length === 0 ? (
              <div className="text-center text-yellow-200/70 py-8">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No photos yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {allPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative cursor-pointer group"
                    onClick={() => setExpandedPhoto(photo)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Photo from ${new Date(photo.captured_at).toLocaleDateString()}`}
                      className="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 rounded-b-lg">
                      {new Date(photo.captured_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isGalleryOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsGalleryOpen(false)}
        />
      )}

      {/* Expanded Photo Lightbox */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={expandedPhoto.photo_url}
              alt="Expanded photo"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setExpandedPhoto(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-lg">
              {new Date(expandedPhoto.captured_at).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tree */}
      <div className="absolute inset-0 top-14 bottom-12 z-10">
        <MaiTree members={members} onNodeClick={handleNodeClick} />
      </div>

      {/* Modal */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={handleCloseModal} />
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center pointer-events-none z-30">
        <p className="text-yellow-300/90 text-sm font-medium drop-shadow-lg">
          Click on a lucky coin to see greetings
        </p>
      </footer>

      {/* Falling Coins */}
      {fallingCoins.map(coin => (
        <div
          key={coin.id}
          className="falling-coin pointer-events-none"
          style={{
            left: `${coin.x}%`,
            width: coin.size,
            height: coin.size,
            animationDuration: `${coin.duration}s`,
          }}
        >
          <div className="w-full h-full rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-lg flex items-center justify-center">
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
