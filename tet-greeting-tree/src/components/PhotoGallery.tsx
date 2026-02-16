import type { Photo } from '../types'

interface PhotoGalleryProps {
  photos: Photo[]
  loading: boolean
}

export function PhotoGallery({ photos, loading }: PhotoGalleryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Click "capture" to take a photo</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <img
            src={photo.photo_url}
            alt={`Photo from ${new Date(photo.captured_at).toLocaleDateString()}`}
            className="w-full aspect-square object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
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
  )
}
