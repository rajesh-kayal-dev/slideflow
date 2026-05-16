import { createFileRoute } from '@tanstack/react-router'
import { 
  FileUp, 
  Upload, 
  Cloud, 
  History, 
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getImportHistory } from '#/features/presentations/actions/import-actions'
import { PresentationCard } from '#/features/presentations/components/presentation-card'
import { ImportPreviewModal } from '#/features/presentations/components/import-preview-modal'
import { usePresentationImport } from '#/features/presentations/hooks/use-presentation-import'
import { GoogleDriveImportModal } from '#/features/presentations/components/google-drive-import-modal'
import { useState } from 'react'

export const Route = createFileRoute('/_dashboard/import')({
  component: ImportPage,
})

function ImportPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  
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

  // Fetch History
  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['import-history'],
    queryFn: () => getImportHistory()
  })

  return (
    <div className="flex flex-col h-full bg-bgDark1 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full pt-12 px-6 pb-20">
        
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

        <GoogleDriveImportModal 
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
        />

        <div className="mb-10">
          <div className="flex items-center gap-3 text-[#4F46E5] mb-3">
            <FileUp className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Import Document</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">
            Bring your existing work <span className="text-white/40 italic">to life</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <div 
            className={`lg:col-span-2 relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] border-2 border-dashed ${
              isDragging 
                ? 'border-[#4F46E5] bg-[#4F46E5]/5 scale-[0.99]' 
                : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { 
              e.preventDefault()
              setIsDragging(false)
              const file = e.dataTransfer.files[0]
              if (file) handleFileSelect(file)
            }}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.pptx,.ppt,.pdf'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) handleFileSelect(file)
              }
              input.click()
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-6 relative">
                <div className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isDragging ? 'bg-[#4F46E5] scale-110 shadow-2xl shadow-[#4F46E5]/40' : 'bg-white/5 group-hover:scale-105'
                }`}>
                  <Upload className={`h-10 w-10 transition-colors ${isDragging ? 'text-white' : 'text-secondaryText group-hover:text-white'}`} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a document</h3>
              <p className="text-secondaryText text-sm mb-8">PPTX or PDF supported</p>
            </div>
            <div className="aspect-[16/9] lg:aspect-auto h-[400px]" />
          </div>

          <div 
            className="bg-[#4F46E5]/10 border border-[#4F46E5]/20 rounded-[2.5rem] p-8 flex flex-col items-center text-center relative overflow-hidden group transition-all"
          >
            <div className="mb-auto w-full flex flex-col items-center">
              <div className="h-20 w-20 rounded-3xl bg-[#4F46E5] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-[#4F46E5]/40 transform group-hover:rotate-6 transition-transform">
                <Cloud className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 leading-tight">Google Drive</h3>
              <p className="text-secondaryText text-sm leading-relaxed mb-10">
                Import from your Drive account.
              </p>
              <button 
                onClick={() => setIsGoogleModalOpen(true)}
                className="w-full max-w-[240px] bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90 hover:scale-[1.02] active:scale-[0.98] py-4 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-[#4F46E5]/20"
              >
                Connect with Google Cloud
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center">
                <History className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Recent Imports</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoadingHistory ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse">
                  <div className="aspect-video w-full rounded-xl bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-white/5 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))
            ) : (
              history.map((p: any) => (
                <PresentationCard key={p.id} presentation={p} />
              ))
            )}
          </div>
        </div>
    </div>
    </div>
  )
}
