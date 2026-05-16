import { createServerFn } from '@tanstack/react-start'
import { requirePresentationUserId } from '../lib/server-helpers'
import { listGoogleSlides } from '../lib/google-slides'

export const getGoogleSlidesTemplates = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const userId = await requirePresentationUserId()
      const files = await listGoogleSlides(userId)
      return files
    } catch (error) {
      console.error('Failed to fetch Google Slides:', error)
      // Return empty array instead of throwing to avoid crashing the UI
      return []
    }
  })
