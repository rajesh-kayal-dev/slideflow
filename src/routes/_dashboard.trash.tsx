import { getSession } from '#/lib/auth.functions'
import { presentationQueryKeys } from '#/features/presentations'
import { listTrashPresentations, restorePresentation } from '#/features/presentations/api/presentation-queries'
import { permanentlyDeletePresentation } from '#/features/presentations/actions/presentation-mutations'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Trash2, RotateCcw, Trash, ArrowLeft } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/trash')({
  component: TrashPage,
})

function TrashPage() {
  const queryClient = useQueryClient()
  const { data: presentations = [], isPending, isError } = useQuery({
    queryKey: presentationQueryKeys.trash(),
    queryFn: () => listTrashPresentations(),
  })

  const restoreMut = useMutation({
    mutationFn: (id: string) => restorePresentation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.trash() })
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
      toast.success('Presentation restored')
    },
    onError: (e: any) => toast.error(e.message)
  })

  const permanentDeleteMut = useMutation({
    mutationFn: (id: string) => permanentlyDeletePresentation({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presentationQueryKeys.trash() })
      toast.success('Presentation permanently deleted')
    },
    onError: (e: any) => toast.error(e.message)
  })

  const handlePermanentDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`)) {
      permanentDeleteMut.mutate(id)
    }
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/workspace" className="p-2 hover:bg-white/5 rounded-full transition-colors text-secondaryText hover:text-white">
             <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-red-500/10 text-red-500 flex items-center justify-center rounded-lg">
              <Trash2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trash Bin</h1>
          </div>
        </div>
        <p className="text-secondaryText text-sm ml-14">Items in trash are visible only to you. You can restore them anytime.</p>
      </div>
      
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bgDark2 rounded-2xl border border-white/5 overflow-hidden animate-pulse">
               <div className="aspect-[16/10] w-full bg-white/5" />
               <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-white/5 rounded" />
                  <div className="h-3 w-1/2 bg-white/5 rounded" />
                  <div className="flex gap-2 pt-4">
                     <div className="h-9 flex-1 bg-white/5 rounded-xl" />
                     <div className="h-9 flex-1 bg-white/5 rounded-xl" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
      {presentations.length === 0 && !isPending ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="h-10 w-10 text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Trash is empty</h3>
          <p className="text-secondaryText max-w-xs">Presentations you delete from your workspace will appear here.</p>
          <Link to="/workspace" className="mt-8">
            <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/5 text-white">
              Back to Workspace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {presentations.map((p: any) => (
            <div key={p.id} className="group relative bg-bgDark2 rounded-2xl border border-white/5 overflow-hidden hover:border-white/20 transition-all flex flex-col">
              <div className="aspect-[16/10] w-full bg-[#111111] relative overflow-hidden group-hover:bg-[#1a1a1a] transition-all duration-500">
                {p.thumbnailUrl ? (
                  <img 
                    src={p.thumbnailUrl} 
                    alt="" 
                    className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 ease-out scale-105 group-hover:scale-100" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                     <Trash2 className="size-8" />
                     <span className="text-[10px] font-bold tracking-tighter">NO PREVIEW</span>
                  </div>
                )}
                {/* Subtle overlay for professional look */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              </div>
              <div className="p-5 flex-1 flex flex-col gap-1 bg-bgDark2">
                 <h3 className="font-bold text-white truncate text-sm tracking-tight">{p.title || 'Untitled'}</h3>
                 <p className="text-[10px] text-secondaryText/60 font-bold uppercase tracking-[0.15em] mb-4">
                   {new Date(p.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                 </p>
                 
                 <div className="flex items-center gap-2 mt-auto">
                    <Button 
                      onClick={() => restoreMut.mutate(p.id)}
                      disabled={restoreMut.isPending}
                      className="flex-1 bg-white text-bgDark1 hover:bg-white/90 text-[10px] font-black uppercase tracking-widest rounded-xl h-9 gap-2 shadow-sm transition-transform active:scale-95"
                    >
                       <RotateCcw className="size-3.5" />
                       Restore
                    </Button>
                    <Button 
                      onClick={() => handlePermanentDelete(p.id, p.title)}
                      disabled={permanentDeleteMut.isPending}
                      variant="ghost"
                      className="px-3 h-9 rounded-xl border border-white/[0.03] hover:bg-red-500/10 hover:text-red-400 text-secondaryText transition-all active:scale-95"
                    >
                       <Trash className="size-3.5" />
                    </Button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
