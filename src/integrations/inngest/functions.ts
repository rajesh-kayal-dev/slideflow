import { Output, generateText } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

import { prisma } from '#/db'
import { scrapeWebpage } from '#/integrations/apify/scraper'
import { cleanContent } from '#/lib/content-cleaner'
import { uploadImageFromUrl } from '#/lib/imagekit'

import { inngest } from './client'
import { parsePptx } from '#/features/presentations/lib/pptx-parser'
import { getFileFromS3 } from '#/lib/s3'

// ---------------------------------------------------------------------------
// Image Generation
// ---------------------------------------------------------------------------

function buildImagePromptUrl(prompt: string): string {
  const sanitizedPrompt = prompt
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  // Use Pollinations.ai for free, high-quality image generation from text
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}?width=1280&height=720&nologo=true&enhance=true`
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const slideSchema = z.object({
  title: z.string().describe('Slide title'),
  content: z.string().describe('Main content / bullet points for the slide'),
  notes: z.string().optional().describe('Speaker notes'),
  imagePrompt: z
    .string()
    .describe(
      'A concise prompt to generate an illustration for this slide (professional, clean style, no text in image)',
    ),
})

const slidesResponseSchema = z.object({
  slides: z.array(slideSchema),
})

export const generatePresentation = inngest.createFunction(
  {
    id: 'generate-presentation',
    retries: 2,
    triggers: [{ event: 'presentation/generate' }],
  },
  async ({ event, step }) => {
    const { presentationId } = event.data as { presentationId: string }

    const presentation = await step.run('fetch-presentation', async () => {
      const p = await prisma.presentation.findUnique({
        where: { id: presentationId },
        include: { template: true }
      })
      if (!p) throw new Error('Presentation not found')
      return p
    })

    await step.run('mark-generating', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { status: 'GENERATING' },
      })
    })

    const { slides } = await step.run('generate-slides-content', async () => {
      let templateInstructions = ''
      if (presentation.template) {
        const config = (presentation.config as any) || (presentation.template.config as any)
        const layouts = config?.slideBlocks ? config.slideBlocks.join(', ') : ''
        const colors = config?.colors ? `Primary: ${config.colors.primary}, Background: ${config.colors.background}, Text: ${config.colors.text}` : ''
        const typography = config?.typography ? `Font: ${config.typography.fontFamily}` : ''
        
        templateInstructions = `
Template Active: ${presentation.template.name}
You must align the slides with the template structure.
Available Layouts: ${layouts}
Visual Style: ${colors} ${typography}
Ensure the content matches the tone and structural expectation of this template.
`
      }

      const systemPrompt = `You are an expert presentation designer. Given a user's content/prompt, create a compelling presentation.

Style: ${presentation.style}
Tone: ${presentation.tone}
Layout preference: ${presentation.layout}
Number of slides requested: ${presentation.slideCount}
${templateInstructions}
Guidelines:
- Create exactly ${presentation.slideCount} slides
- First slide should be a title slide
- Last slide should be a summary or call-to-action
- Keep content concise and impactful
- For imagePrompt, describe a professional illustration that complements the slide (no text in images)
`

      const result = await generateText({
        model: google('gemini-flash-latest'),
        output: Output.object({ schema: slidesResponseSchema }),
        system: systemPrompt,
        prompt: presentation.prompt,
      })

      return result.output
    })

    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({
        where: { presentationId },
      })
    })

    await step.run('create-slides', async () => {
      const slidesWithImages = await Promise.all(
        slides.map(async (s, i) => {
          const promptUrl = buildImagePromptUrl(s.imagePrompt)
          let imageUrl = promptUrl

          try {
            // Upload the generated image to ImageKit for persistence
            imageUrl = await uploadImageFromUrl(
              promptUrl,
              `slide-${presentationId}-${i}.jpg`,
              `presentations/${presentationId}`
            )
          } catch (error) {
            console.error('Failed to upload to ImageKit, falling back to direct URL:', error)
          }

          return {
            presentationId,
            order: i,
            title: s.title,
            content: s.content,
            notes: s.notes ?? null,
            imagePrompt: s.imagePrompt,
            imageUrl,
          }
        })
      )

      await prisma.slide.createMany({ data: slidesWithImages })
    })

    await step.run('mark-completed', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { status: 'COMPLETED' },
      })
    })

    return { success: true, slideCount: slides.length }
  },
)

export const helloWorld = inngest.createFunction(
  {
    id: 'hello-world',
    triggers: [{ event: 'test/hello.world' }],
  },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    return { message: `Hello ${event.data.email}!` }
  },
)

// ---------------------------------------------------------------------------
// Generate Presentation from URL (Apify → Gemini → Slides)
// ---------------------------------------------------------------------------

const summarisedContentSchema = z.object({
  title: z.string().describe('Concise title extracted from the page (max 10 words)'),
  summary: z.string().describe('2-3 sentence summary of the page purpose'),
  keyTopics: z.array(z.string()).describe('5-8 key topics or sections from the page'),
  facts: z.array(z.string()).describe('Important facts, numbers, or conclusions'),
})

export const generateFromUrl = inngest.createFunction(
  {
    id: 'generate-from-url',
    retries: 2,
    triggers: [{ event: 'presentation/generate-from-url' }],
  },
  async ({ event, step }) => {
    const { presentationId, url } = event.data as {
      presentationId: string
      url: string
    }

    // ── Step A: Scrape the webpage via Apify ─────────────────────────────────
    const scrapeResult = await step.run('scrape-url', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { scrapeStatus: 'scraping' },
      })

      try {
        const result = await scrapeWebpage(url)
        const cleaned = cleanContent(result.content)

        await prisma.presentation.update({
          where: { id: presentationId },
          data: {
            scrapeStatus: 'done',
            extractedContent: cleaned,
          },
        })

        return { content: cleaned, pageTitle: result.title }
      } catch (err) {
        await prisma.presentation.update({
          where: { id: presentationId },
          data: {
            scrapeStatus: 'failed',
            scrapeError: String(err),
            status: 'FAILED',
          },
        })
        throw err
      }
    })

    // ── Step B: Fetch presentation config from DB ─────────────────────────────
    const presentation = await step.run('fetch-presentation', async () => {
      const p = await prisma.presentation.findUnique({ 
        where: { id: presentationId },
        include: { template: true }
      })
      if (!p) throw new Error('Presentation not found')
      return p
    })

    // ── Step C: Gemini — Summarise and extract structure ─────────────────────
    const structured = await step.run('summarise-content', async () => {
      const result = await generateText({
        model: google('gemini-flash-latest'),
        output: Output.object({ schema: summarisedContentSchema }),
        system: `You are a content analyst. Extract a structured summary from the provided webpage content. Be extremely concise.`,
        prompt: `CONTENT:\n${scrapeResult.content}`,
      })
      return result.output
    })

    // ── Step D: Gemini — Generate slide JSON from summary ────────────────────
    const { slides } = await step.run('generate-slides', async () => {
      let templateInstructions = ''
      if (presentation.template) {
        const config = presentation.template.config as any
        const layouts = config?.slideBlocks ? config.slideBlocks.join(', ') : ''
        templateInstructions = `
Template Active: ${presentation.template.name}
You must align the slides with the template structure.
Available Layouts: ${layouts}
Ensure the content matches the tone and structural expectation of this template.
`
      }

      const systemPrompt = `You are an expert presentation designer. Create EXACTLY ${presentation.slideCount} slides based on the summary.
Style: ${presentation.style} | Tone: ${presentation.tone} | Layout: ${presentation.layout}
${templateInstructions}
Rule: Keep content concise. Use "• " for bullets. Describe professional illustrations in imagePrompt.`

      const prompt = `TITLE: ${structured.title}\nSUMMARY: ${structured.summary}\nTOPICS: ${structured.keyTopics.join(', ')}`

      const result = await generateText({
        model: google('gemini-flash-latest'),
        output: Output.object({ schema: slidesResponseSchema }),
        system: systemPrompt,
        prompt,
      })
      return result.output
    })

    // ── Step E: Delete old slides and save new ones ───────────────────────────
    await step.run('delete-old-slides', async () => {
      await prisma.slide.deleteMany({ where: { presentationId } })
    })

    await step.run('create-slides', async () => {
      const slidesWithImages = await Promise.all(
        slides.map(async (s, i) => {
          const promptUrl = buildImagePromptUrl(s.imagePrompt)
          let imageUrl = promptUrl

          try {
            imageUrl = await uploadImageFromUrl(
              promptUrl,
              `slide-${presentationId}-${i}.jpg`,
              `presentations/${presentationId}`
            )
          } catch (error) {
            console.error('Failed to upload to ImageKit:', error)
          }

          return {
            presentationId,
            order: i,
            title: s.title,
            content: s.content,
            notes: s.notes ?? null,
            imagePrompt: s.imagePrompt,
            imageUrl,
          }
        })
      )
      await prisma.slide.createMany({ data: slidesWithImages })
    })

    // ── Step F: Mark COMPLETED and update title ───────────────────────────────
    await step.run('mark-completed', async () => {
      await prisma.presentation.update({
        where: { id: presentationId },
        data: {
          status: 'COMPLETED',
          title: structured.title || scrapeResult.pageTitle,
        },
      })
    })

    return { success: true, slideCount: slides.length, title: structured.title }
  },
)
export const processImport = inngest.createFunction(
  {
    id: 'process-import',
    retries: 1,
    triggers: [{ event: 'process-import' }],
  },
  async ({ event, step }) => {
    const { presentationId, fileKey } = event.data as {
      presentationId: string
      fileKey: string
    }

    // ── Step 1: Fetch file from S3 ──────────────────────────────────────────
    const buffer = await step.run('fetch-from-s3', async () => {
      return getFileFromS3(fileKey)
    })

    // ── Step 2: Parse the PPTX ──────────────────────────────────────────────
    const extractedSlides = await step.run('parse-pptx', async () => {
      return parsePptx(buffer)
    })

    // ── Step 3: Create slides in DB ─────────────────────────────────────────
    await step.run('create-slides', async () => {
      const slidesToCreate = extractedSlides.map((s, i) => ({
        presentationId,
        order: s.order,
        title: s.title,
        content: s.content,
        // For thumbnails, we'll generate a "vibe" image based on the title
        imageUrl: buildImagePromptUrl(`Professional presentation slide about ${s.title}`),
      }))

      await prisma.slide.createMany({ data: slidesToCreate })
      
      // Update presentation slide count
      await prisma.presentation.update({
        where: { id: presentationId },
        data: { 
          slideCount: extractedSlides.length,
          status: 'COMPLETED'
        }
      })
    })

    return { success: true, slidesProcessed: extractedSlides.length }
  }
)
