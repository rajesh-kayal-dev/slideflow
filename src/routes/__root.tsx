import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'


import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import QueryClientProvider from '#/integrations/tanstack-query/root-provider'
import { Toaster } from '#/components/ui/sonner'
import { Button } from '#/components/ui/button'
import { LoadingScreen } from '#/components/ui/LoadingScreen'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SlideFlow',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/SlideFlowLogo.png',
      },
    ],
  }),
  component: RootLayout,
  pendingComponent: () => <LoadingScreen />,
  shellComponent: RootDocument,
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Button asChild variant="outline">
        <a href="/">Go Home</a>
      </Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
         <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-3xl font-black text-white tracking-tight">Something went wrong</h1>
      <p className="text-secondaryText max-w-md mx-auto leading-relaxed">
        {error instanceof Error ? error.message : 'An unexpected error occurred. This might be a temporary database connection issue.'}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white rounded-xl px-8 font-bold">
           Try Again
        </Button>
        <Button variant="outline" asChild className="rounded-xl border-white/10 text-white">
           <a href="/">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  ),
})

function RootLayout() {
  return (
    <div className="min-h-svh">
      <Outlet />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/20">
        <QueryClientProvider>
          {children}
          <Toaster closeButton position="top-center" richColors />
          <Scripts />
        </QueryClientProvider>
      </body>
    </html>
  )
}
