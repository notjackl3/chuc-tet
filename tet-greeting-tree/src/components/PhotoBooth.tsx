import { useRef, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

interface PhotoBoothProps {
  memberId: string
  onPhotoTaken: () => void
}

export function PhotoBooth({ memberId, onPhotoTaken }: PhotoBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)

  // Fetch existing photos
  useEffect(() => {
    async function fetchPhotos() {
      setLoadingPhotos(true)
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
      } finally {
        setLoadingPhotos(false)
      }
    }
    fetchPhotos()
  }, [memberId])

  // Set srcObject when stream changes and video element is available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream, isCameraOn])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsVideoReady(false)

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported on this device/browser.')
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false,
      })
      setStream(mediaStream)
      setIsCameraOn(true)
    } catch (err: unknown) {
      const error = err as Error & { name?: string }
      console.error('Camera error:', error)

      // Provide specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No camera found. Please connect a camera and try again.')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Camera is in use by another application. Please close other apps using the camera.')
      } else if (error.name === 'OverconstrainedError') {
        setError('Camera does not support the requested resolution.')
      } else {
        setError(`Could not access camera: ${error.message || 'Unknown error'}`)
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOn(false)
    setIsVideoReady(false)
    setCapturedImage(null)
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    setIsCapturing(false)
  }, [])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
  }, [])

  const uploadPhoto = useCallback(async () => {
    if (!capturedImage) return

    setUploading(true)
    setError(null)

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage)
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

      // Success - reset and notify parent
      setCapturedImage(null)
      stopCamera()
      // Refresh photos list
      const { data } = await supabase
        .from('photos')
        .select('*')
        .eq('member_id', memberId)
        .order('captured_at', { ascending: false })
      setPhotos(data || [])
      onPhotoTaken()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [capturedImage, memberId, onPhotoTaken, stopCamera])

  // Show loading state
  if (loadingPhotos) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      {!isCameraOn ? (
        photos.length > 0 ? (
          // Show existing photos with "Capture more" button
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photo_url}
                      alt={`Photo from ${new Date(photo.captured_at).toLocaleDateString()}`}
                      className="w-full aspect-square object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                      {new Date(photo.captured_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={startCamera}
              className="shrink-0 w-full py-4 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <span>Capture More</span>
            </button>
          </div>
        ) : (
          // No photos - show "Take a Photo" button
          <button
            onClick={startCamera}
            className="w-full flex-1 py-10 px-4 bg-white text-gray-800 font-semibold shadow-md transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <span>Take a Photo</span>
          </button>
        )
      ) : (
        <div className="h-full flex flex-col">
          {/* Camera preview or captured image */}
          <div className="relative flex-1 min-h-0 overflow-hidden bg-black">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => setIsVideoReady(true)}
                />
                {!isVideoReady && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Countdown overlay */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="text-4xl">📸</div>
              </div>
            )}
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex shrink-0">
            {capturedImage ? (
              <>
                <button
                  onClick={retakePhoto}
                  className="flex-1 py-4 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors text-lg"
                >
                  Retake
                </button>
                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 py-4 px-4 bg-green-500 hover:bg-green-600 text-white font-medium transition-colors disabled:opacity-50 text-lg"
                >
                  {uploading ? 'Uploading...' : 'Save Photo'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="flex-1 py-4 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-4 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-medium transition-colors text-lg"
                >
                  Capture
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
