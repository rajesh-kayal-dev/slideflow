import {
  AUTH_LOGIN_PATH,
  isLoginPath,
  isPublicPath,
} from '@/lib/auth-paths'

import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { auth } from '@/lib/auth'

export const authFnMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    return next()
  },
)

export const authMiddleware = createMiddleware({ type: 'request' }).server(
  async ({ request, next }) => {
    const { pathname } = new URL(request.url)
    const session = await auth.api.getSession({
      headers: request.headers
    })

    const isLoggedIn = !!session?.user

    // logged-in users should not visit login
    if (isLoginPath(pathname) && isLoggedIn) throw redirect({ to: '/' })

    // allow public paths
    if (isPublicPath(pathname)) return next()

    // protect everything else
    if (!isLoggedIn) throw redirect({ to: AUTH_LOGIN_PATH })

    return next({ 
      context: { 
        user: {
          id: session!.user.id,
          email: session!.user.email,
          name: session!.user.name,
          image: session!.user.image
        } 
      } 
    })
  },
)
