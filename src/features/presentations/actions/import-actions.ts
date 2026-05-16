import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requirePresentationUserId } from '../lib/server-helpers'
import { prisma } from '#/db'
import { s3Client } from '#/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { parsePptx } from '../lib/pptx-parser'
import { inngest } from '#/integrations/inngest/client'

const importPptSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileBase64: z.string(), // We'll send it as base64 for now in server fns
  source: z.enum(['Local', 'Google Drive']),
})

// 1. Get Signed URL for direct client upload
export const getPresignedUploadUrl = createServerFn({ method: 'POST' })
  .inputValidator((d: { fileName: string; fileType: string }) => d)
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const fileKey = `imports/${userId}/${Date.now()}-${data.fileName}`
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileKey,
      ContentType: data.fileType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    return { url, fileKey }
  })

// 2. Import Presentation (Confirm step)
export const importPresentation = createServerFn({ method: 'POST' })
  .inputValidator((d: { 
    fileKey: string; 
    fileName: string; 
    fileType: string;
    source: string;
    slideCount: number;
    thumbnailUrl?: string;
    slides?: { title: string; content: string; order: number }[];
  }) => d)
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

    const extension = data.fileName.split('.').pop()?.toLowerCase() || 'pptx'
    const isPptx = extension === 'pptx'

    // 1. Create presentation record (initially AI type to open in editor)
    const presentation = await prisma.presentation.create({
      data: {
        userId,
        workspaceId,
        title: data.fileName.replace(/\.[^/.]+$/, ""),
        status: isPptx ? 'PROCESSING' : 'COMPLETED', 
        contentType: extension, // Keep original extension to identify imported files
        prompt: `Imported ${extension.toUpperCase()} from ${data.source}`,
        sourceUrl: data.fileKey, 
        slideCount: data.slideCount,
        thumbnailUrl: data.thumbnailUrl,
        style: 'Modern',
        tone: 'Professional',
        layout: 'Standard',
      }
    })

    // 2. For PPTX, auto-extract and create slide records immediately
    if (isPptx) {
       try {
          const { getFileFromS3, s3Client } = await import('#/lib/s3')
          const { PutObjectCommand } = await import('@aws-sdk/client-s3')
          
          const buffer = await getFileFromS3(data.fileKey)
          const slides = await parsePptx(buffer)
          const mediaFiles = (slides as any)._mediaFiles || {}

          await prisma.$transaction(async (tx) => {
            for (let i = 0; i < slides.length; i++) {
              const s = slides[i]
              let imageUrl: string | undefined = undefined

              const blob = mediaFiles[i] as Blob
              if (blob) {
                 const arrayBuffer = await blob.arrayBuffer()
                 const fileBuffer = Buffer.from(arrayBuffer)
                 const imageKey = `assets/${presentation.id}/slide-${i}-img.png`
                 
                 await s3Client.send(new PutObjectCommand({
                   Bucket: process.env.AWS_BUCKET,
                   Key: imageKey,
                   Body: fileBuffer,
                   ContentType: 'image/png'
                 }))
                 imageUrl = imageKey
              }

              await tx.slide.create({
                data: {
                  presentationId: presentation.id,
                  title: s.title,
                  content: s.content,
                  imageUrl: imageUrl,
                  order: i,
                  layoutType: imageUrl ? 'TWO_COLUMN' : 'TITLE_CONTENT', 
                }
              })
            }
            
            // Mark as completed
            await tx.presentation.update({
               where: { id: presentation.id },
               data: { status: 'COMPLETED' }
            })
          })
       } catch (e) {
          console.error('Auto-conversion failed during import:', e)
          // Fallback: stay as PPTX extension if conversion fails
          await prisma.presentation.update({
             where: { id: presentation.id },
             data: { status: 'COMPLETED' }
          })
       }
    }

    // 3. For PDF, create a single placeholder slide for now
    if (extension === 'pdf') {
       await prisma.slide.create({
          data: {
             presentationId: presentation.id,
             title: presentation.title,
             content: 'PDF content is being processed. You can now use AI to generate slides from this document.',
             order: 0,
             layoutType: 'TITLE_CONTENT'
          }
       })
    }

    return presentation
  })

export const getImportHistory = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = await requirePresentationUserId()
    const presentations = await prisma.presentation.findMany({
      where: { 
        userId,
        contentType: { in: ['pptx', 'pdf'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    
    return Promise.all(presentations.map(async (p) => {
      if (p.thumbnailUrl && !p.thumbnailUrl.startsWith('http')) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET!,
            Key: p.thumbnailUrl,
          })
          const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 })
          return { ...p, thumbnailUrl: signedUrl }
        } catch (e) {
          return p
        }
      }
      return p
    }))
  })

export const convertToEditable = createServerFn({ method: 'POST' })
  .inputValidator((d: { presentationId: string }) => d)
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const presentation = await prisma.presentation.findUnique({
      where: { id: data.presentationId, userId }
    })

    if (!presentation || !presentation.sourceUrl) throw new Error('Document not found')
    
    // Check if already converted
    if (presentation.contentType === 'ai') return presentation

    // A. Download from S3
    const { getFileFromS3 } = await import('#/lib/s3')
    const buffer = await getFileFromS3(presentation.sourceUrl)

    // B. Parse PPTX
    const slides = await parsePptx(buffer)
    const mediaFiles = (slides as any)._mediaFiles || {}

    // C. Create Slide Records with Images
    const { s3Client } = await import('#/lib/s3')
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < slides.length; i++) {
        const s = slides[i]
        let imageUrl: string | undefined = undefined

        // Upload media if exists
        const blob = mediaFiles[i] as Blob
        if (blob) {
           const arrayBuffer = await blob.arrayBuffer()
           const fileBuffer = Buffer.from(arrayBuffer)
           const imageKey = `assets/${presentation.id}/slide-${i}-img.png`
           
           await s3Client.send(new PutObjectCommand({
             Bucket: process.env.AWS_BUCKET,
             Key: imageKey,
             Body: fileBuffer,
             ContentType: 'image/png'
           }))
           imageUrl = imageKey
        }

        await tx.slide.create({
          data: {
            presentationId: presentation.id,
            title: s.title,
            content: s.content,
            imageUrl: imageUrl,
            order: i,
            layoutType: imageUrl ? 'TWO_COLUMN' : 'TITLE_CONTENT', 
          }
        })
      }
    })

    // D. Update Presentation Status
    return prisma.presentation.update({
      where: { id: presentation.id },
      data: {
        status: 'COMPLETED',
      }
    })
  })
