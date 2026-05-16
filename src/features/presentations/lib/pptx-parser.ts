import JSZip from 'jszip';

export interface ExtractedSlide {
  title: string;
  content: string;
  order: number;
}

/**
 * Extracts the embedded thumbnail from a PPTX file if it exists.
 */
export async function getPptxThumbnail(buffer: ArrayBuffer | Buffer): Promise<string | null> {
  const blob = await getPptxThumbnailBlob(buffer);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

/**
 * Extracts the thumbnail as a Blob for S3 upload.
 * Uses a multi-stage search strategy to find the highest-fidelity cover image.
 */
export async function getPptxThumbnailBlob(buffer: ArrayBuffer | Buffer): Promise<Blob | null> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const files = Object.keys(zip.files);
    
    // 1. Try standard thumbnail (Fastest, usually Slide 1)
    const thumbFile = files.find(f => {
      const lower = f.toLowerCase();
      return lower === 'docprops/thumbnail.jpeg' || 
             lower === 'docprops/thumbnail.jpg' || 
             lower === 'docprops/thumbnail.png' ||
             lower === 'metadata/thumbnail.jpeg'
    });
    if (thumbFile) return await zip.file(thumbFile)!.async('blob');

    // 2. Try to find Slide 1 Background via Relationships
    // This is much higher fidelity than a generic thumbnail
    const relsFile = zip.file('ppt/slides/_rels/slide1.xml.rels');
    if (relsFile) {
      const relsXml = await relsFile.async('string');
      // Look for Image relationship: Target="../media/imageN.jpeg"
      const imageMatch = relsXml.match(/Target="\.\.\/media\/([^"]+)"/);
      if (imageMatch) {
        const mediaPath = `ppt/media/${imageMatch[1]}`;
        const mediaFile = zip.file(mediaPath);
        if (mediaFile) {
          return await mediaFile.async('blob');
        }
      }
    }

    // 3. Fallback to any image in docProps
    const anyDocPropsImg = files.find(f => 
      f.toLowerCase().startsWith('docprops/') && 
      (f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'))
    );
    if (anyDocPropsImg) return await zip.file(anyDocPropsImg)!.async('blob');

    // 4. Fallback to largest image in media (often the high-res background)
    const mediaImages = files.filter(f => 
      f.toLowerCase().startsWith('ppt/media/') && 
      (f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.png'))
    );
    if (mediaImages.length > 0) {
      let largestFile = mediaImages[0];
      let maxBytes = 0;
      for (const f of mediaImages) {
        const fileData = zip.file(f);
        const bytes = (fileData as any)?._data?.uncompressedSize || 0;
        if (bytes > maxBytes) {
          maxBytes = bytes;
          largestFile = f;
        }
      }
      return await zip.file(largestFile)!.async('blob');
    }
  } catch (err) {
    console.error('Error extracting thumbnail blob:', err);
  }
  return null;
}

/**
 * Rapidly counts slides in a PPTX without extracting text content.
 */
export async function countSlides(buffer: ArrayBuffer | Buffer): Promise<number> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slideFiles = Object.keys(zip.files).filter(name => 
      name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
    );
    return slideFiles.length;
  } catch (e) {
    return 0;
  }
}

/**
 * Extracts high-fidelity slide data including text and embedded images.
 */
export async function parsePptx(buffer: ArrayBuffer | Buffer): Promise<ExtractedSlide[]> {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files).filter(name => 
    name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
  );
  
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0');
    const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0');
    return numA - numB;
  });

  const extractedSlides: ExtractedSlide[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const slidePath = slideFiles[i];
    const slideXml = await zip.file(slidePath)?.async('string');
    if (!slideXml) continue;

    // 1. Extract Text
    const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g);
    const textElements = textMatches 
      ? textMatches.map(m => {
          const content = m.substring(5, m.length - 6);
          return content
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
        })
      : [];

    let title = `Slide ${i + 1}`;
    let contentParts: string[] = [];

    if (textElements.length > 0) {
      const firstTextIdx = textElements.findIndex(t => t.trim().length > 0);
      if (firstTextIdx !== -1) {
        title = textElements[firstTextIdx].trim();
        contentParts = textElements.slice(firstTextIdx + 1);
      } else {
        contentParts = textElements;
      }
    }

    const content = contentParts.join(' ').replace(/\s+/g, ' ').trim();

    // 2. Extract First Significant Image for this slide
    let slideImageUrl: string | undefined = undefined;
    const relsPath = slidePath.replace('slides/slide', 'slides/_rels/slide') + '.rels';
    const relsFile = zip.file(relsPath);
    if (relsFile) {
       const relsXml = await relsFile.async('string');
       const imageMatch = relsXml.match(/Target="\.\.\/media\/([^"]+)"/);
       if (imageMatch) {
          const mediaPath = `ppt/media/${imageMatch[1]}`;
          const mediaFile = zip.file(mediaPath);
          if (mediaFile) {
             const blob = await mediaFile.async('blob');
             // In browser, we can't upload here easily without passing it back.
             // We'll store the blob temporarily or use a data URL for now
             // But for server function, we'll return the buffer/blob.
             (extractedSlides as any)._hasBinaryMedia = true;
             (extractedSlides as any)._mediaFiles = (extractedSlides as any)._mediaFiles || {};
             (extractedSlides as any)._mediaFiles[i] = blob;
          }
       }
    }

    extractedSlides.push({
      title: title.slice(0, 100),
      content: content || 'No text content',
      order: i,
    });
  }

  return extractedSlides;
}
