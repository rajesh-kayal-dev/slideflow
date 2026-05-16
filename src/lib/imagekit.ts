import ImageKit from '@imagekit/nodejs'

// @ts-ignore
const IK = ImageKit.default || ImageKit

export const imagekit = new IK({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_BASE_URL!,
})

export async function uploadImageFromUrl(
  url: string,
  fileName: string,
  folder = 'slides',
): Promise<string> {
  try {
    // Download image first to bypass potential blocks on ImageKit's downloader
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await imagekit.files.upload({
      file: buffer,
      fileName,
      folder,
      useUniqueFileName: true,
    })
    return result.url
  } catch (error) {
    console.error('Error uploading to ImageKit:', error)
    // Fallback to original URL if upload fails
    return url
  }
}
