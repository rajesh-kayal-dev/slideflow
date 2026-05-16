import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/auth.functions'
import { DashboardLayout } from '#/components/dashboard/DashboardLayout'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const session = await queryClient.ensureQueryData({
      queryKey: ['session'],
      queryFn: () => getSession(),
      staleTime: 1000 * 60 * 5, // 5 mins
    })

    if (!session?.user) {
      throw redirect({ to: '/' })
    }
    return { user: session.user }
  },
  component: DashboardLayoutWrapper,
})

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPresentation } from '#/features/presentations/actions/presentation-mutations'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { presentationQueryKeys } from '#/features/presentations'

function DashboardLayoutWrapper() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const createMut = useMutation({
    mutationFn: (data: any) => createPresentation({ data }),
    onSuccess: (presentation) => {
      toast.success('Your landing page presentation is generating!')
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      navigate({
        to: '/presentations/$presentationId',
        params: { presentationId: presentation.id },
      })
    },
  })

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_presentation')
    if (pending) {
      try {
        const data = JSON.parse(pending)
        // Only process if it's recent (within 10 mins)
        if (Date.now() - data.timestamp < 1000 * 60 * 10) {
          createMut.mutate({
            prompt: data.prompt,
            slideCount: data.slideCount,
            style: data.style,
            tone: data.tone,
            layout: data.layout,
          })
        }
      } catch (e) {
        console.error('Failed to parse pending presentation', e)
      } finally {
        sessionStorage.removeItem('pending_presentation')
      }
    }
  }, [])

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
