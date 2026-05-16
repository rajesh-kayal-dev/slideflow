import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { requirePresentationUserId } from '../lib/server-helpers'
import { createGoogleSlides } from '../lib/google-slides'
import { z } from 'zod'

export const exportToGoogleSlidesAction = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => z.object({
    presentationId: z.string(),
  }).parse(d))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const presentation = await prisma.presentation.findUnique({
      where: { id: input.presentationId },
      include: { 
        slides: { orderBy: { order: 'asc' } }
      }
    })

    if (!presentation || presentation.userId !== userId) {
      throw new Error('Presentation not found or unauthorized')
    }

    try {
      const result = await createGoogleSlides(userId, presentation.title, presentation.slides)
      return result
    } catch (error) {
      console.error('Google Slides Export Error:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to export to Google Slides')
    }
  })
