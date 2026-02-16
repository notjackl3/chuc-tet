import { useState } from 'react'
import { useVideoLoadState } from '../hooks/useVideoPreload'
import { getVideoUrl } from '../lib/video'

interface VideoPlayerProps {
  filename: string | null
  memberName: string
}

function VideoContent({ filename }: { filename: string }) {
  const isPreloaded = useVideoLoadState(filename)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const videoUrl = getVideoUrl(filename)
  const showLoading = !isPreloaded || !isVideoReady

  return (
    <div className="w-full h-full relative">
      {showLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto mb-2" />
            <p className="text-sm">Wait for video to load...</p>
          </div>
        </div>
      )}
      <video
        className="w-full h-full object-contain bg-black"
        controls
        controlsList="nodownload"
        playsInline
        src={videoUrl}
        onCanPlay={() => setIsVideoReady(true)}
        onLoadedData={() => setIsVideoReady(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export function VideoPlayer({ filename }: VideoPlayerProps) {
  if (!filename) {
    return (
      <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>No video greeting yet</p>
        </div>
      </div>
    )
  }

  // Key prop ensures component remounts when filename changes, resetting state
  return <VideoContent key={filename} filename={filename} />
}
