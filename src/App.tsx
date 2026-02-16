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
        <button
          onClick={() => setIsGalleryOpen(true)}
          className="bg-gray-800/80 hover:bg-gray-700 text-yellow-400 px-3 py-1 rounded text-sm transition flex items-center gap-2 pointer-events-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Gallery
        </button>
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
      <div className="relative z-10 h-full">
        <MaiTree members={members} onNodeClick={handleNodeClick} />
      </div>

      {/* Modal */}
      {selectedMember && (
        <MemberModal member={selectedMember} onClose={handleCloseModal} />
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 text-center pointer-events-none z-20">
        <p className="text-yellow-300/90 text-sm font-medium">
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
