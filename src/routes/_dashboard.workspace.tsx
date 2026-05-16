import { getSession } from '#/lib/auth.functions'

import { presentationQueryKeys } from '#/features/presentations'
import { listPresentations } from '#/features/presentations/api/presentation-queries'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouteContext } from '@tanstack/react-router'

import { DashboardLayout } from '#/components/dashboard/DashboardLayout'
import { PresentationHistory } from '#/components/dashboard/PresentationHistory'
import { PresentationBuilder } from '#/components/dashboard/PresentationBuilder'
import { useState, useRef } from 'react'
import { Plus, Download, Clock, UserCircle, Star, Layers, X } from 'lucide-react'
import { usePresentationImport } from '#/features/presentations/hooks/use-presentation-import'
import { ImportPreviewModal } from '#/features/presentations/components/import-preview-modal'

export const Route = createFileRoute('/_dashboard/workspace')({
  component: WorkspacePage,
})

function WorkspacePage() {
  const { data: presentations = [], isPending: listPending, isError, error } = useQuery({
    queryKey: presentationQueryKeys.list(),
    queryFn: () => listPresentations(),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  })

  const { user } = useRouteContext({ strict: false }) as { user: any }
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    isUploading,
    uploadProgress,
    showPreview,
    selectedFile,
    fileBuffer,
    previewSlides,
    thumbnailUrl,
    handleFileSelect,
    handleImport,
    handleClose
  } = usePresentationImport()

  const filteredPresentations = presentations.filter((p) => {
    if (activeTab === 'all') return true
    if (activeTab === 'recent') return !!p.lastViewedAt
    if (activeTab === 'created') return p.userId === user?.id
    if (activeTab === 'favorites') return !!p.isFavorite
    return true
  })

  const displayPresentations = (() => {
    if (activeTab === 'recent') {
      return [...filteredPresentations]
        .sort((a, b) => {
          const dateA = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0
          const dateB = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0
          return dateB - dateA
        })
        .slice(0, 4)
    }
    return filteredPresentations
  })()

  const { presentationId } = Route.useParams()

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pptx,.ppt,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />

        {/* Import Preview Modal */}
        <ImportPreviewModal 
          isOpen={showPreview}
          onClose={handleClose}
          onImport={handleImport}
          fileName={selectedFile?.name || ''}
          fileType={selectedFile?.type || ''}
          fileBuffer={fileBuffer}
          selectedFile={selectedFile}
          slides={previewSlides}
          thumbnailUrl={thumbnailUrl}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
        />
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-white text-bgDark1 flex items-center justify-center rounded-lg shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Presentations</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <button 
              onClick={() => setIsBuilderOpen(true)}
              className="flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/20 text-sm"
            >
              <Plus className="h-4 w-4" />
              Create new AI
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-transparent hover:bg-white/5 border border-white/20 text-white px-5 py-2.5 rounded-full font-semibold transition-all text-sm"
            >
              <Download className="h-4 w-4" />
              Import
            </button>
          </div>

          {/* Tabs Row */}
          <div className="flex items-center gap-6 border-b border-white/10 pb-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all' ? 'border-[#4F46E5] text-white' : 'border-transparent text-secondaryText hover:text-white'}`}
            >
              <Layers className="h-4 w-4" />
              All
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'recent' ? 'border-[#4F46E5] text-white' : 'border-transparent text-secondaryText hover:text-white'}`}
            >
              <Clock className="h-4 w-4" />
              Recently viewed
            </button>
            <button 
              onClick={() => setActiveTab('created')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'created' ? 'border-[#4F46E5] text-white' : 'border-transparent text-secondaryText hover:text-white'}`}
            >
              <UserCircle className="h-4 w-4" />
              Created by you
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'favorites' ? 'border-[#4F46E5] text-white' : 'border-transparent text-secondaryText hover:text-white'}`}
            >
              <Star className="h-4 w-4" />
              Favorites
            </button>
          </div>
        </div>

        {/* Content Section */}
        <section>
          {isError ? (
            <div className="p-8 border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400">
              <p className="font-bold mb-1">Failed to load presentations</p>
              <p className="text-sm opacity-80">{error instanceof Error ? error.message : 'Unknown error'}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-xs font-bold underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <PresentationHistory presentations={displayPresentations} isPending={listPending} />
          )}
        </section>

      {/* Builder Modal Overlay */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto relative custom-scrollbar">
            <button 
              onClick={() => setIsBuilderOpen(false)}
              className="absolute top-0 right-0 p-3 text-secondaryText hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="py-12">
              <PresentationBuilder />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
