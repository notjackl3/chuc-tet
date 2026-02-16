import { useState } from 'react'
import { getVideoUrl } from '../lib/video'

interface VideoPlayerProps {
  filename: string | null
  memberName: string
}

function downloadVideo(videoUrl: string, filename: string) {
  // Use direct link to avoid CORS issues with R2/Cloudflare
  const link = document.createElement('a')
  link.href = videoUrl
  link.download = filename
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function VideoContent({ filename }: { filename: string }) {
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [hasError, setHasError] = useState(false)

  const videoUrl = getVideoUrl(filename)
  const showLoading = !isVideoReady && !hasError

  const handleDownload = () => {
    downloadVideo(videoUrl, filename)
  }

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
        playsInline
        src={videoUrl}
        onCanPlay={() => setIsVideoReady(true)}
        onLoadedData={() => setIsVideoReady(true)}
        onError={() => setHasError(true)}
      >
        Your browser does not support the video tag.
      </video>
      {/* Download button */}
      {isVideoReady && !hasError && (
        <button
          onClick={handleDownload}
          className="absolute bottom-20 right-4 w-8 h-8 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          title="Download video"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      )}
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
