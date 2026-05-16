import { createServerFn } from '@tanstack/react-start'

import { prisma } from '#/db'
import { inngest } from '#/integrations/inngest/client'

import { requirePresentationUserId } from '../lib/server-helpers'
import { urlPresentationInputSchema } from '../types/schemas'

/**
 * Server action to create a presentation from a URL.
 *
 * Flow:
 * 1. Validate input (URL, slideCount, style, tone, layout)
 * 2. Create a Presentation row immediately (so the user can be redirected)
 * 3. Send Inngest event to trigger background scraping + generation
 */
export const createPresentationFromUrl = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => urlPresentationInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()

    // Derive a human-friendly title from the URL hostname
    let title = 'Generating from URL...'
    try {
      const hostname = new URL(data.url).hostname.replace(/^www\./, '')
      title = `Presentation from ${hostname}`
    } catch {
      // Zod already validated URL — this is a safe fallback
    }

    // Find a workspace for the user (required by schema)
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
             create: {
               userId,
               role: 'OWNER',
             }
           }
         }
       })
       workspaceId = workspace.id
    }

    // Create the row immediately so the user can be redirected to the detail page
    const presentation = await prisma.presentation.create({
      data: {
        user: { connect: { id: userId } },
        workspace: { connect: { id: workspaceId } },
        title,
        prompt: `Generated from URL: ${data.url}`,
        sourceUrl: data.url,
        contentType: 'url',
        scrapeStatus: 'pending',
        status: 'GENERATING',
        slideCount: data.slideCount,
        style: data.style,
        tone: data.tone,
        layout: data.layout,
      },
    })

    // Fire background Inngest job — this handles scraping + AI generation
    await inngest.send({
      name: 'presentation/generate-from-url',
      data: {
        presentationId: presentation.id,
        url: data.url,
      },
    })

    return presentation
  })
