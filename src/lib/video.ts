// Video URL helper - uses R2 in production, local in development
const VIDEO_BASE_URL = import.meta.env.VITE_VIDEO_BASE_URL

export function getVideoUrl(filename: string): string {
  if (VIDEO_BASE_URL && VIDEO_BASE_URL !== 'YOUR_R2_PUBLIC_URL_HERE') {
    // Use R2 URL (remove trailing slash if present)
    const baseUrl = VIDEO_BASE_URL.replace(/\/$/, '')
    return `${baseUrl}/${filename}`
  }
  // Fallback to local videos
  return `/videos/${filename}`
}
