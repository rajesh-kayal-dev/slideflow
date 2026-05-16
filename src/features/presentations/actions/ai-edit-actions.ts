import { createServerFn } from '@tanstack/react-start'
import { Output, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '#/db'
import { requirePresentationUserId } from '../lib/server-helpers'
import { uploadImageFromUrl } from '#/lib/imagekit'

function buildImagePromptUrl(prompt: string): string {
  const sanitizedPrompt = prompt
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  // Use Pollinations.ai for free, high-quality image generation from text
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}?width=1280&height=720&nologo=true&enhance=true`
}

const slideSchema = z.object({
  title: z.string().describe('Slide title'),
  content: z.string().describe('Main content / bullet points for the slide'),
  notes: z.string().optional().describe('Speaker notes'),
  imagePrompt: z.string().describe('A concise prompt to generate an illustration for this slide (professional, clean style, no text in image)'),
})

const aiEditInputSchema = z.object({
  slideId: z.string(),
  prompt: z.string(),
})

export const editSlideWithAI = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => aiEditInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    
    // 1. Fetch current slide
    const slide = await prisma.slide.findUnique({
      where: { id: data.slideId },
      include: { presentation: true }
    })

    if (!slide) throw new Error('Slide not found')
    if (slide.presentation.userId !== userId) throw new Error('Unauthorized')

    // 2. Generate updated content
    const systemPrompt = `You are an expert presentation designer. The user wants to modify a specific slide.
Current Slide Data:
Title: ${slide.title}
Content: ${slide.content}
Image Prompt: ${slide.imagePrompt}

Instructions:
- Update the slide based on the user's request.
- Keep the tone professional and aligned with the presentation's style.
- Return the full updated slide structure.
- Describe a professional illustration for the imagePrompt that perfectly matches the new content.`

    const result = await generateText({
      model: google('gemini-flash-latest'),
      output: Output.object({ schema: slideSchema }),
      system: systemPrompt,
      prompt: data.prompt,
    })

    const updatedSlide = result.output

    // 3. Generate and persistence for new image
    const promptUrl = buildImagePromptUrl(updatedSlide.imagePrompt)
    let imageUrl = promptUrl

    try {
      imageUrl = await uploadImageFromUrl(
        promptUrl,
        `slide-${slide.id}-${Date.now()}.jpg`,
        `presentations/${slide.presentationId}`
      )
    } catch (error) {
      console.error('Failed to upload new image:', error)
    }

    // 4. Update the slide in the database
    return prisma.slide.update({
      where: { id: data.slideId },
      data: {
        title: updatedSlide.title,
        content: updatedSlide.content,
        notes: updatedSlide.notes ?? null,
        imagePrompt: updatedSlide.imagePrompt,
        imageUrl: imageUrl, 
      }
    })
  })

export const regenerateImageOnly = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    slideId: z.string(),
    prompt: z.string(),
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    const slide = await prisma.slide.findUnique({
      where: { id: input.slideId },
      include: { presentation: true }
    })

    if (!slide) throw new Error('Slide not found')
    if (slide.presentation.userId !== userId) throw new Error('Unauthorized')

    // 1. Persist the generated image
    const promptUrl = buildImagePromptUrl(input.prompt)
    let imageUrl = promptUrl

    try {
      imageUrl = await uploadImageFromUrl(
        promptUrl,
        `slide-${slide.id}-regen-${Date.now()}.jpg`,
        `presentations/${slide.presentationId}`
      )
    } catch (error) {
      console.error('Failed to upload new image during regeneration:', error)
    }

    // 2. Update the slide
    return prisma.slide.update({
      where: { id: input.slideId },
      data: {
        imageUrl: imageUrl,
        imagePrompt: input.prompt
      }
    })
  })
export const handleChatAction = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    presentationId: z.string(),
    prompt: z.string(),
    currentSlideId: z.string().optional(),
    slides: z.array(z.object({
      id: z.string(),
      title: z.string(),
      order: z.number()
    }))
  }))
  .handler(async ({ data: input }) => {
    const userId = await requirePresentationUserId()
    
    // 1. Verify presentation ownership
    const presentation = await prisma.presentation.findUnique({
      where: { id: input.presentationId }
    })
    if (!presentation || presentation.userId !== userId) throw new Error('Unauthorized')

    // 2. Classify the user's intent using AI
    const systemPrompt = `You are a presentation management assistant. 
    Analyze the user's prompt and decide which action to take.
    Current Slides: ${JSON.stringify(input.slides)}
    Current Active Slide ID: ${input.currentSlideId}

    Actions:
    - ADD: Create a new slide. Specify the title, content, and the slide ID it should come AFTER.
    - DELETE: Remove a slide. Specify the slideId.
    - EDIT: Modify an existing slide's content. Specify the slideId and a prompt for the change.

    Generate a short, helpful message (max 20 words) describing what you did.`

    const actionSchema = z.object({
      action: z.enum(['ADD', 'DELETE', 'EDIT']),
      title: z.string().optional(), // For ADD
      content: z.string().optional(), // For ADD
      afterSlideId: z.string().optional(), // For ADD
      slideId: z.string().optional(), // For DELETE/EDIT
      prompt: z.string().optional(), // For EDIT
      message: z.string().describe('A very short dynamic response (15-20 words) about what you did')
    })

    const result = await generateText({
      model: google('gemini-flash-latest'),
      output: Output.object({ schema: actionSchema }),
      system: systemPrompt,
      prompt: input.prompt,
    })

    const decision = result.output

    // 3. Execute the decision
    let resultData: any = { message: decision.message }

    if (decision.action === 'ADD') {
      const afterSlide = input.slides.find(s => s.id === decision.afterSlideId)
      const newOrder = afterSlide ? afterSlide.order + 1 : input.slides.length

      // Shift slides
      await prisma.slide.updateMany({
        where: { presentationId: input.presentationId, order: { gte: newOrder } },
        data: { order: { increment: 1 } }
      })

      const newSlide = await prisma.slide.create({
        data: {
          presentationId: input.presentationId,
          order: newOrder,
          title: decision.title || 'New Slide',
          content: decision.content || '',
          layoutType: 'title-content',
          imagePrompt: decision.title || 'Illustration'
        }
      })
      resultData = { ...resultData, id: newSlide.id }
    } else if (decision.action === 'DELETE' && decision.slideId) {
      const slide = await prisma.slide.findUnique({ where: { id: decision.slideId } })
      if (slide) {
        await prisma.slide.delete({ where: { id: decision.slideId } })
        await prisma.slide.updateMany({
          where: { presentationId: input.presentationId, order: { gt: slide.order } },
          data: { order: { decrement: 1 } }
        })
      }
    } else if (decision.action === 'EDIT' && decision.slideId) {
      const targetSlide = await prisma.slide.findUnique({ where: { id: decision.slideId } })
      if (targetSlide) {
        const editResult = await generateText({
          model: google('gemini-flash-latest'),
          output: Output.object({ schema: slideSchema }),
          system: `Update this slide: ${targetSlide.title}\n${targetSlide.content}`,
          prompt: decision.prompt || input.prompt,
        })
        const updated = editResult.output
        await prisma.slide.update({
          where: { id: decision.slideId },
          data: {
            title: updated.title,
            content: updated.content,
            notes: updated.notes,
            imagePrompt: updated.imagePrompt
          }
        })
        resultData = { ...resultData, id: targetSlide.id }
      }
    }

    return resultData
  })
