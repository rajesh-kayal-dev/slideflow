import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { 
  importPresentation, 
  getPresignedUploadUrl 
} from '../actions/import-actions'
import { 
  countSlides, 
  getPptxThumbnail, 
  getPptxThumbnailBlob,
  type ExtractedSlide 
} from '../lib/pptx-parser'

export function usePresentationImport() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [previewSlides, setPreviewSlides] = useState<ExtractedSlide[]>([])
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null)
  
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleFileSelect = async (file: File) => {
    const isPptx = file.name.endsWith('.pptx') || file.name.endsWith('.ppt')
    const isPdf = file.name.endsWith('.pdf')

    if (!isPptx && !isPdf) {
      toast.error('Only PPT/PPTX or PDF files are supported')
      return
    }

    try {
      let slideCount = 0
      let thumbUrl = null
      let thumbBlob = null
      let buffer = await file.arrayBuffer()

      if (isPptx) {
        slideCount = await countSlides(buffer)
        thumbUrl = await getPptxThumbnail(buffer)
        thumbBlob = await getPptxThumbnailBlob(buffer)
      } else if (isPdf) {
        slideCount = 1 
      }
      
      setSelectedFile(file)
      setFileBuffer(buffer)
      setThumbnailUrl(thumbUrl)
      setThumbnailBlob(thumbBlob)
      
      setPreviewSlides(Array(slideCount).fill(0).map((_, i) => ({
        title: `Slide ${i + 1}`,
        content: 'Content hidden',
        order: i
      })))
      setShowPreview(true)
    } catch (error) {
      console.error('Local parse error:', error)
      toast.error('Could not read presentation content')
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // A. Upload Thumbnail First if exists
      let uploadedThumbnailUrl = undefined
      if (thumbnailBlob) {
        const { url: thumbSignUrl, fileKey: thumbKey } = await getPresignedUploadUrl({
          data: {
            fileName: `thumb-${selectedFile.name.split('.')[0]}-${Date.now()}.jpg`,
            fileType: 'image/jpeg'
          }
        })
        
        await fetch(thumbSignUrl, {
          method: 'PUT',
          body: thumbnailBlob,
          headers: { 'Content-Type': 'image/jpeg' }
        })
        
        uploadedThumbnailUrl = thumbKey
      }

      // B. Get Signed URL for original file
      const { url, fileKey } = await getPresignedUploadUrl({
        data: {
          fileName: selectedFile.name,
          fileType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        }
      })

      // C. Upload original file
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Content-Type', selectedFile.type)

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = (e.loaded / e.total) * 100
            setUploadProgress(pct)
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) resolve(true)
          else reject(new Error('S3 upload failed'))
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(selectedFile)
      })

      // D. Confirm Import on Server
      const presentation = await importPresentation({
        data: {
          fileKey,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          source: 'Local',
          slideCount: previewSlides.length,
          thumbnailUrl: uploadedThumbnailUrl,
        }
      })

      toast.success('File imported successfully!')
      setShowPreview(false)
      setIsUploading(false)
      queryClient.invalidateQueries({ queryKey: ['import-history'] })
      queryClient.invalidateQueries({ queryKey: ['presentations'] })
      
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
      setFileBuffer(null)
      
      // Navigate to native editor directly
      navigate({ to: '/presentations/$presentationId', params: { presentationId: presentation.id } })

    } catch (error) {
      console.error('Import error:', error)
      toast.error('Import failed. Please try again.')
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setShowPreview(false)
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
      setThumbnailUrl(null)
      setFileBuffer(null)
      setSelectedFile(null)
    }
  }

  return {
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
  }
}
