import { createServerFn } from '@tanstack/react-start'
import { prisma } from '#/db'
import { z } from 'zod'

export const getTemplates = createServerFn({ method: 'GET' })
  .handler(async () => {
    return prisma.template.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    })
  })

export const getTemplate = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    return prisma.template.findUnique({
      where: { id }
    })
  })
