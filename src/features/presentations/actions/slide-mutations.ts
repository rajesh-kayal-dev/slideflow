import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { requirePresentationUserId } from '../lib/server-helpers'
import { z } from 'zod'

export const updateSlideLayout = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    slideId: z.string(),
    layoutType: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    // Verify ownership through presentation
    const slide = await prisma.slide.findUnique({
      where: { id: input.slideId },
      include: { presentation: true }
    })
    
    if (!slide || slide.presentation.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return prisma.slide.update({
      where: { id: input.slideId },
      data: { layoutType: input.layoutType }
    })
  })

export const updateSlideContent = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    slideId: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const slide = await prisma.slide.findUnique({
      where: { id: input.slideId },
      include: { presentation: true }
    })
    
    if (!slide || slide.presentation.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return prisma.slide.update({
      where: { id: input.slideId },
      data: {
        title: input.title,
        content: input.content
      }
    })
  })
export const createSlide = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    presentationId: z.string(),
    order: z.number(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const presentation = await prisma.presentation.findUnique({
      where: { id: input.presentationId }
    })
    
    if (!presentation || presentation.userId !== userId) {
      throw new Error('Unauthorized')
    }

    // Shift all slides with order >= input.order by +1
    // We use sequential await instead of interactive transaction for better pooler compatibility
    await prisma.slide.updateMany({
      where: {
        presentationId: input.presentationId,
        order: { gte: input.order }
      },
      data: {
        order: { increment: 1 }
      }
    })

    const newSlide = await prisma.slide.create({
      data: {
        presentationId: input.presentationId,
        order: input.order,
        title: 'New Slide',
        content: 'Start typing here...',
        layoutType: 'title-content'
      }
    })

    return newSlide
  })

export const deleteSlide = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    slideId: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const slide = await prisma.slide.findUnique({
      where: { id: input.slideId },
      include: { presentation: true }
    })
    
    if (!slide || slide.presentation.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const presentationId = slide.presentationId
    const order = slide.order

    return prisma.$transaction(async (tx) => {
      // Delete the slide
      await tx.slide.delete({
        where: { id: input.slideId }
      })

      // Shift remaining slides down
      return tx.slide.updateMany({
        where: {
          presentationId,
          order: { gt: order }
        },
        data: {
          order: { decrement: 1 }
        }
      })
    })
  })

export const deleteSlideImage = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    slideId: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const slide = await prisma.slide.findUnique({
      where: { id: input.slideId },
      include: { presentation: true }
    })
    
    if (!slide || slide.presentation.userId !== userId) {
      throw new Error('Unauthorized')
    }

    return prisma.slide.update({
      where: { id: input.slideId },
      data: { imageUrl: null, imagePrompt: 'No image' }
    })
  })
