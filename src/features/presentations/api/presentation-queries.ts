import { createServerFn } from '@tanstack/react-start'

import { prisma } from '#/db'

import { requirePresentationUserId } from '../lib/server-helpers'
import { presentationIdInputSchema } from '../types/schemas'

export const listPresentations = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requirePresentationUserId()
    console.log('listPresentations: Fetching for user', userId)
    try {
      // 1. Fetch all presentations via Prisma Client
      const allPresentations = await prisma.presentation.findMany({
        where: { userId },
        include: {
          slides: {
            take: 3,
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              content: true,
              imageUrl: true,
              layoutType: true,
            },
          },
          template: {
            select: {
              config: true,
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
      })
      
      // 2. Fetch IDs of deleted presentations via RAW SQL 
      const deletedRows = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM "presentation" WHERE "isDeleted" = true`
      const deletedIds = new Set(deletedRows.map(r => r.id))

      const presentations = allPresentations.filter((p: any) => !deletedIds.has(p.id))

      // Generate signed URLs for thumbnails if they are S3 keys
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
      const { GetObjectCommand } = await import('@aws-sdk/client-s3')
      const { s3Client } = await import('#/lib/s3')

      const presentationsWithSignedUrls = await Promise.all(presentations.map(async (p) => {
        if (p.thumbnailUrl && !p.thumbnailUrl.startsWith('http')) {
          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_BUCKET!,
              Key: p.thumbnailUrl,
            })
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 }) // 24 hours
            return { ...p, thumbnailUrl: signedUrl }
          } catch (e) {
            console.error('Failed to sign thumbnail URL for', p.id, e)
            return p
          }
        }
        return p
      }))

      return presentationsWithSignedUrls
    } catch (error) {
      console.error('listPresentations: Database error:', error)
      throw error
    }
  },
)

export const listTrashPresentations = createServerFn({ method: 'GET' }).handler(
  async () => {
    const userId = await requirePresentationUserId()
    
    // Fetch IDs of deleted presentations via RAW SQL
    const deletedRows = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM "presentation" WHERE "isDeleted" = true AND "userId" = ${userId}`
    const deletedIds = new Set(deletedRows.map(r => r.id))

    const all = await prisma.presentation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        slides: {
          take: 1,
          orderBy: { order: 'asc' },
          select: { imageUrl: true }
        }
      }
    })

    const trashItems = all.filter((p: any) => deletedIds.has(p.id))

    // Generate signed URLs for thumbnails
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
    const { GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { s3Client } = await import('#/lib/s3')

    return Promise.all(trashItems.map(async (p) => {
      let thumb = p.thumbnailUrl || p.slides?.[0]?.imageUrl
      if (thumb && !thumb.startsWith('http')) {
        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET!,
            Key: thumb,
          })
          thumb = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 24 })
        } catch (e) {
          console.error('Failed to sign thumbnail URL for trash item', p.id, e)
        }
      }
      return { ...p, thumbnailUrl: thumb }
    }))
  },
)

export const restorePresentation = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    await prisma.$executeRaw`UPDATE "presentation" SET "isDeleted" = false, "updatedAt" = NOW() WHERE id = ${data.id}`
    return { ok: true as const }
  })

export const getPresentation = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const row = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    })
    if (!row) throw new Error('Not found')
    return row
  })

export const getPresentationWithSlides = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    const row = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
      include: {
        slides: {
          orderBy: { order: 'asc' },
        },
        template: true,
      },
    })
    if (!row) throw new Error('Not found')
    return row
  })
