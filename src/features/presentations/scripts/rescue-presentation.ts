import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { generateText, Output } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const slideSchema = z.object({
  title: z.string(),
  content: z.string(),
  notes: z.string().optional(),
  imagePrompt: z.string(),
})

const slidesResponseSchema = z.object({
  slides: z.array(slideSchema),
})

import { uploadImageFromUrl } from '../../../lib/imagekit'

function buildImagePromptUrl(prompt: string): string {
  const sanitizedPrompt = prompt
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(sanitizedPrompt)}?width=1280&height=720&nologo=true&enhance=true`
}

async function rescue(presentationId: string) {
  console.log('🚀 Starting rescue for presentation:', presentationId)
  
  try {
    const p = await prisma.presentation.findUnique({
      where: { id: presentationId },
      include: { template: true, slides: true }
    })
    
    if (!p) throw new Error('Presentation not found')

    console.log(`📸 Found ${p.slides.length} slides. Regenerating images...`)

    for (const slide of p.slides) {
      console.log(`  - Processing slide ${slide.order}: ${slide.title}`)
      const promptUrl = buildImagePromptUrl(slide.imagePrompt || slide.title)
      
      try {
        const imageUrl = await uploadImageFromUrl(
          promptUrl,
          `slide-${presentationId}-${slide.order}.jpg`,
          `presentations/${presentationId}`
        )
        
        await prisma.slide.update({
          where: { id: slide.id },
          data: { imageUrl }
        })
        console.log(`    ✅ Fixed image: ${imageUrl}`)
      } catch (err) {
        console.error(`    ❌ Failed to upload for slide ${slide.order}:`, err)
      }
    }

    await prisma.presentation.update({
      where: { id: presentationId },
      data: { status: 'COMPLETED' },
    })

    console.log('🎉 Rescue complete! Refresh your browser.')
  } catch (e) {
    console.error('❌ Rescue failed:', e)
  } finally {
    await prisma.$disconnect()
    pool.end()
  }
}

// Target ID from user's screenshot URL: cmp634uix001y8kivilupjpvj
rescue('cmp634uix001y8kivilupjpvj')
