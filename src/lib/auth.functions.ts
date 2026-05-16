import { createServerFn } from '@tanstack/react-start'
import { auth } from './auth'

export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { getRequestHeaders } = await import('@tanstack/react-start/server')
  const headers = getRequestHeaders()
  
  const session = await auth.api.getSession({
    headers
  })
  
  if (!session) return null

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image
    },
    session: {
      expiresAt: session.session.expiresAt.toISOString(),
    }
  }
})

export const ensureSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    return session
  },
)
