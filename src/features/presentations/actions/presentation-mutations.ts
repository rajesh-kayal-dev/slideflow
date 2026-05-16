import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

import { prisma } from '#/db'
import { inngest } from '#/integrations/inngest/client'

import { deriveTitle, requirePresentationUserId } from '../lib/server-helpers'
import {
  createPresentationInputSchema,
  presentationIdInputSchema,
  updatePresentationInputSchema,
} from '../types/schemas'
import { z } from 'zod'

const createPresentationWithTemplateSchema = createPresentationInputSchema.extend({
  templateId: z.string().optional(),
  googleTemplateId: z.string().optional(),
  config: z.any().optional()
})

export const createPresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => createPresentationWithTemplateSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    
    // Find a workspace for the user
    let membership = await prisma.workspaceMember.findFirst({
      where: { userId },
      select: { workspaceId: true }
    })

    let workspaceId = membership?.workspaceId
    if (!workspaceId) {
       const user = await prisma.user.findUnique({ where: { id: userId } })
       const workspace = await prisma.workspace.create({
         data: {
           name: `${user?.name || 'Personal'}'s Workspace`,
           members: {
             create: { userId, role: 'OWNER' }
           }
         }
       })
       workspaceId = workspace.id
    }

    // 1. Create the presentation shell
    const presentation = await prisma.presentation.create({
      data: {
        user: { connect: { id: userId } },
        workspace: { connect: { id: workspaceId } },
        template: data.templateId ? { connect: { id: data.templateId } } : undefined,
        title: deriveTitle(data.prompt),
        prompt: data.prompt,
        slideCount: data.slideCount,
        style: data.style,
        tone: data.tone,
        layout: data.layout,
        status: data.googleTemplateId ? 'COMPLETED' : 'GENERATING',
        config: data.config,
      },
    })

    // 2. If it's a Google Slide, fetch content and create slides immediately
    if (data.googleTemplateId) {
      try {
        const { fetchGoogleSlidesContent } = await import('../lib/google-slides')
        const googleSlides = await fetchGoogleSlidesContent(userId, data.googleTemplateId)
        
        if (googleSlides.length > 0) {
          await prisma.slide.createMany({
            data: googleSlides.map((s, i) => ({
              presentationId: presentation.id,
              title: s.title,
              content: s.content,
              order: i,
            }))
          })
        }
      } catch (error) {
        console.error('Failed to import Google Slides:', error)
        throw new Error('Could not import from Google Slides. Please check your permissions.')
      }
    } else {
      // 3. Otherwise, send to AI generation pipeline
      await inngest.send({
        name: 'presentation/generate',
        data: { presentationId: presentation.id },
      })
    }

    return presentation
  })

export const updatePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const { id, ...patch } = data
    const existing = await prisma.presentation.findFirst({
      where: { id, userId },
    })
    if (!existing) throw new Error('Not found')
    const updateData = patch
    return prisma.presentation.update({
      where: { id },
      data: updateData,
    })
  })

/**
 * Moves presentation to trash (Soft Delete)
 */
export const deletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    
    // NOTE: Using executeRaw template literal for better parameter handling
    // Using lowercase "presentation" because of @@map in schema.
    console.log('deletePresentation: Soft deleting', data.id)
    const result = await prisma.$executeRaw`UPDATE "presentation" SET "isDeleted" = true, "updatedAt" = NOW() WHERE id = ${data.id}`
    console.log('deletePresentation: Result rows affected', result)
    return { ok: true as const }
  })

/**
 * Permanently deletes presentation from database
 */
export const permanentlyDeletePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    
    await prisma.$executeRaw`DELETE FROM "presentation" WHERE id = ${data.id}`
    return { ok: true as const }
  })

export const regeneratePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')

    if (existing.contentType === 'pptx' || existing.contentType === 'pdf') {
       throw new Error('Imported presentations cannot be regenerated. They are fixed documents.')
    }

    await prisma.presentation.update({
      where: { id: data.id },
      data: { status: 'GENERATING' },
    })

    await inngest.send({
      name: 'presentation/generate',
      data: { presentationId: data.id },
    })
  })

export const toggleFavorite = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    return prisma.presentation.update({
      where: { id: data.id },
      data: { isFavorite: !existing.isFavorite },
    })
  })

export const markAsViewed = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!existing) throw new Error('Not found')
    return prisma.presentation.update({
      where: { id: data.id },
      data: { lastViewedAt: new Date() },
    })
  })

const enhancePromptSchema = z.object({
  prompt: z.string(),
  slideCount: z.number(),
  style: z.string(),
  tone: z.string(),
  layout: z.string(),
})

export const enhancePresentationPrompt = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => enhancePromptSchema.parse(data))
  .handler(async ({ data }) => {
    await requirePresentationUserId()
    return runEnhance(data)
  })

/**
 * Public version for the landing page (no login required)
 */
export const enhancePublicPrompt = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => enhancePromptSchema.parse(data))
  .handler(async ({ data }) => {
    return runEnhance(data)
  })

async function runEnhance(data: z.infer<typeof enhancePromptSchema>) {
  const systemPrompt = `You are an expert prompt engineer for AI presentation generation. 
Your goal is to transform a simple user request into a professional, structured, and detailed presentation outline prompt.

The enhanced prompt should:
- Clearly define the target audience
- Outline a logical flow of slides based on the requested slide count (${data.slideCount})
- Incorporate the requested style (${data.style}), tone (${data.tone}), and layout (${data.layout})
- Be concise but descriptive enough for a LLM to generate high-quality content.

Return ONLY the enhanced prompt text, without any additional commentary or formatting markers.`

  const result = await generateText({
    model: google('gemini-flash-latest'),
    system: systemPrompt,
    prompt: `User Prompt: ${data.prompt}\nSlides: ${data.slideCount}\nStyle: ${data.style}\nTone: ${data.tone}\nLayout: ${data.layout}`,
  })

  return { enhancedPrompt: result.text.trim() }
}
