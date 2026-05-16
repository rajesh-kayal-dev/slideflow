import type { Presentation } from '../types/presentation.types'
import { PresentationCard } from './presentation-card'
import { Skeleton } from '#/components/ui/skeleton'


type PresentationListSectionProps = {
  presentations: Presentation[]
  isPending: boolean
}

import { RefreshCw } from 'lucide-react'

export function PresentationListSection({
  presentations,
  isPending,
}: PresentationListSectionProps) {
  return (
    <section>
      {isPending ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
           <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center relative">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-xl animate-pulse" />
           </div>
           <div className="text-center">
              <p className="font-bold text-lg text-white mb-1">Loading Workspace</p>
              <p className="text-secondaryText text-xs uppercase tracking-widest font-black opacity-60">
                Fetching your latest presentations…
              </p>
           </div>
        </div>
      ) : presentations.length === 0 ? (




        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-bgDark3 border border-white/5 rounded-2xl">
          <div className="w-16 h-16 bg-bgDark mb-4 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
            <svg className="w-8 h-8 text-primaryColor opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">No presentations yet</h3>
          <p className="text-zinc-400 max-w-sm mb-6">
            Get started by generating your first presentation using a prompt, URL, or template in the Quick Start area.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {presentations.map((p) => (
            <li key={p.id}>
              <PresentationCard presentation={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
