import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { getSession } from '#/lib/auth.functions'

export const globalSearch = createServerFn({ method: 'GET' })
  .inputValidator((query: string) => query)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 2) return { presentations: [], templates: [] }

    const session = await getSession()
    if (!session?.user) throw new Error('Unauthorized')

    const [presentations, templates] = await Promise.all([
      // Search user's presentations
      prisma.presentation.findMany({
        where: {
          userId: session.user.id,
          isDeleted: false,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 5,
        orderBy: { updatedAt: 'desc' }
      }),
      // Search public templates
      prisma.template.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ])

    return { presentations, templates }
  })
