import { auth } from '#/lib/auth'

export function deriveTitle(prompt: string) {
  const line =
    prompt
      .split('\n')
      .map((l) => l.trim())
      .find(Boolean) ?? ''
  const shortened = line.slice(0, 80).trim()
  return shortened || 'Untitled presentation'
}


export async function requirePresentationUserId() {
  if (typeof window !== 'undefined') throw new Error('Server-only function called on client')
  
  console.log('requirePresentationUserId: Getting request headers...')
  const { getRequestHeaders } = await import('@tanstack/react-start/server')
  const headers = getRequestHeaders()
  
  console.log('requirePresentationUserId: Fetching session...')
  const session = await auth.api.getSession({
    headers
  })
  
  console.log('requirePresentationUserId: Session found?', !!session, session?.user?.id)
  
  if (!session?.user?.id) {
    console.error('requirePresentationUserId: No user ID found in session')
    throw new Error('Unauthorized')
  }
  
  return session.user.id
}

