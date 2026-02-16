// Video URL helper - uses R2 in production, local in development
const VIDEO_BASE_URL = import.meta.env.VITE_VIDEO_BASE_URL

console.log('[Video] VITE_VIDEO_BASE_URL:', VIDEO_BASE_URL || '(not set, using local)')

export function getVideoUrl(filename: string): string {
  if (VIDEO_BASE_URL && VIDEO_BASE_URL !== 'YOUR_R2_PUBLIC_URL_HERE') {
    // Use R2 URL (remove trailing slash if present)
    const baseUrl = VIDEO_BASE_URL.replace(/\/$/, '')
    const url = `${baseUrl}/${filename}`
    console.log('[Video] Using R2 URL:', url)
    return url
  }
  // Fallback to local videos
  const url = `/videos/${filename}`
  console.log('[Video] Using local URL:', url)
  return url
}
