import jsPDF from 'jspdf'
import * as htmlToImage from 'html-to-image'

type Slide = {
  id: string
  order: number
  title: string
  content: string
}

type ExportOptions = {
  title: string
  slides: Slide[]
  onProgress?: (progress: number) => void
}

export async function exportToPdf({ title, slides, onProgress }: ExportOptions) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1280, 720]
  })

  for (let i = 0; i < slides.length; i++) {
    onProgress?.(Math.round((i / slides.length) * 100))
    
    const element = document.getElementById(`slide-editor-${i}`)
    
    if (element) {
      try {
        // html-to-image is generally more robust with modern CSS/Images
        const dataUrl = await htmlToImage.toJpeg(element, {
          quality: 0.95,
          pixelRatio: 2,
          backgroundColor: '#000000',
          style: {
            opacity: '1',
            visibility: 'visible',
            transform: 'scale(1)' // Ensure no scaling artifacts
          }
        })
        
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape')
        }
        
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1280, 720)
        
        // Small delay
        await new Promise(r => setTimeout(r, 150))
      } catch (err) {
        console.error(`Failed to capture slide ${i}:`, err)
        if (i > 0) pdf.addPage([1280, 720], 'landscape')
        pdf.setTextColor(255, 0, 0)
        pdf.text(`Error rendering slide ${i+1}. Please ensure it is visible in the editor.`, 50, 50)
      }
    } else {
      console.warn(`Slide element slide-editor-${i} not found`)
    }
  }

  onProgress?.(100)
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  pdf.save(filename)

  return filename
}
