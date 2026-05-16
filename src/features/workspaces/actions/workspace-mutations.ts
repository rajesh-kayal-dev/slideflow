import { createServerFn } from '@tanstack/react-start'
// Force refresh
import { prisma } from '#/db'
import { getSession } from '#/lib/auth.functions'

export const getMyWorkspace = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await getSession()
    console.log('Fetching workspace for user:', session?.user?.id)
    if (!session?.user) {
      console.error('No session found in getMyWorkspace')
      throw new Error('Unauthorized')
    }

    // Find membership
    let membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
    })

    console.log('Found membership:', !!membership)

    if (!membership) {
      console.log('Creating new failsafe workspace for user:', session.user.id)
      
      // ENSURE USER EXISTS FIRST (Failsafe for deleted users with valid tokens)
      let user = await prisma.user.findUnique({ where: { id: session.user.id } })
      if (!user) {
        console.log('User not found in DB, recreating from session payload...')
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name || 'User',
          }
        })
      }

      const workspace = await prisma.workspace.create({
        data: {
          name: `${session.user.name || 'Personal'}'s Workspace`,
          members: {
            create: {
              userId: session.user.id,
              role: 'OWNER',
            }
          }
        },
        include: {
          members: {
            where: { userId: session.user.id }
          }
        }
      })
      
      membership = workspace.members[0] as any
      if (membership) {
        (membership as any).workspace = workspace
      }
    }

    return membership?.workspace || null
  })

export const updateWorkspace = createServerFn({ method: 'POST' })
  .inputValidator((data: { 
    id: string; 
    name?: string; 
    logoUrl?: string;
    defaultWorkspaceSharing?: string;
    defaultLinkSharing?: string;
    siteCreationEnabled?: boolean;
    defaultTheme?: string;
  }) => data)
  .handler(async ({ data }) => {
    const session = await getSession()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: data.id,
          userId: session.user.id,
        },
      },
    })

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new Error('Unauthorized or not workspace manager')
    }

    const updated = await prisma.workspace.update({
      where: { id: data.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.defaultWorkspaceSharing !== undefined && { defaultWorkspaceSharing: data.defaultWorkspaceSharing }),
        ...(data.defaultLinkSharing !== undefined && { defaultLinkSharing: data.defaultLinkSharing }),
        ...(data.siteCreationEnabled !== undefined && { siteCreationEnabled: data.siteCreationEnabled }),
        ...(data.defaultTheme !== undefined && { defaultTheme: data.defaultTheme }),
      },
    })

    return updated
  })

export const getWorkspaceMembers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await getSession()
    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
    })

    if (!membership) {
      return []
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: membership.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return members
  })
