import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { prisma } from '#/db'
import { requirePresentationUserId } from '../lib/server-helpers'

const partialEditSchema = z.object({
  slideId: z.string(),
  selection: z.string(),
  prompt: z.string(),
  fullContent: z.string(),
  field: z.enum(['title', 'content']),
})

export const partialEditWithAI = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => partialEditSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    
    const slide = await prisma.slide.findUnique({
      where: { id: data.slideId },
      include: { presentation: true }
    })

    if (!slide) throw new Error('Slide not found')
    if (slide.presentation.userId !== userId) throw new Error('Unauthorized')

    const systemPrompt = `You are a professional copywriter.
The user has selected a specific part of a slide and wants to rewrite it.

Original Full Text:
${data.fullContent}

Selected Segment to Change:
"${data.selection}"

User Request:
"${data.prompt}"

Goal:
Rewrite only the selected segment while keeping it naturally integrated with the rest of the text.
Return ONLY the newly rewritten segment text. Do not include quotes or extra commentary.`

    const result = await generateText({
      model: google('gemini-flash-latest'),
      system: systemPrompt,
      prompt: `Rewrite the segment: "${data.selection}"`,
    })

    const rewrittenSegment = result.text.trim()
    
    // Replace the segment in the full text
    const newFullText = data.fullContent.replace(data.selection, rewrittenSegment)

    // Update DB
    return prisma.slide.update({
      where: { id: data.slideId },
      data: {
        [data.field]: newFullText
      }
    })
  })
