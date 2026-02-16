interface VideoPlayerProps {
  filename: string | null
  memberName: string
}

export function VideoPlayer({ filename, memberName }: VideoPlayerProps) {
  if (!filename) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🎬</div>
          <p>No video greeting yet for {memberName}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <video
        className="w-full shadow-lg"
        controls
        autoPlay
        src={`/videos/${filename}`}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
