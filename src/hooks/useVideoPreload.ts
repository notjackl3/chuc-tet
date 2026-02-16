import { useState, useEffect } from 'react'
import type { Member } from '../types'
import { getVideoUrl } from '../lib/video'

// Global cache to track preloaded videos
const preloadedVideos = new Map<string, boolean>()

export function useVideoPreload(members: Member[]) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isPreloading, setIsPreloading] = useState(true)

  useEffect(() => {
    const videoFilenames = members
      .map(m => m.video_filename)
      .filter((f): f is string => f !== null)

    if (videoFilenames.length === 0) {
      setIsPreloading(false)
      setLoadingProgress(100)
      return
    }

    let loadedCount = 0
    const totalVideos = videoFilenames.length

    videoFilenames.forEach(filename => {
      if (preloadedVideos.has(filename)) {
        loadedCount++
        setLoadingProgress(Math.round((loadedCount / totalVideos) * 100))
        if (loadedCount === totalVideos) {
          setIsPreloading(false)
        }
        return
      }

      const video = document.createElement('video')
      video.preload = 'auto'
      video.muted = true
      video.src = getVideoUrl(filename)

      const onLoaded = () => {
        preloadedVideos.set(filename, true)
        loadedCount++
        setLoadingProgress(Math.round((loadedCount / totalVideos) * 100))
        if (loadedCount === totalVideos) {
          setIsPreloading(false)
        }
      }

      video.addEventListener('canplaythrough', onLoaded, { once: true })
      video.addEventListener('error', onLoaded, { once: true })

      // Start loading
      video.load()
    })
  }, [members])

  return { loadingProgress, isPreloading }
}

export function useVideoLoadState(filename: string | null) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!filename) {
      setIsLoaded(true)
      return
    }

    // Check if already preloaded
    if (preloadedVideos.has(filename)) {
      setIsLoaded(true)
      return
    }

    // Set up listener for when it gets preloaded
    const checkInterval = setInterval(() => {
      if (preloadedVideos.has(filename)) {
        setIsLoaded(true)
        clearInterval(checkInterval)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [filename])

  return isLoaded
}
