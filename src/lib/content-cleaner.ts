/**
 * Content Cleaner — strips noise from scraped web content
 * and chunks large pages to stay within Gemini's context window.
 *
 * Target: ~12,000 chars (~3,000 tokens), safely under Gemini's limit.
 */

const CONTENT_MAX_CHARS = 12_000

/** Patterns that represent page noise — nav, footer, cookie banners, etc. */
const NOISE_PATTERNS = [
  /\b(cookie policy|privacy policy|terms of service|terms and conditions)\b[^\n]*/gi,
  /\b(subscribe to our newsletter|sign up for|follow us on)\b[^\n]*/gi,
  /\b(all rights reserved|copyright ©|©\s*\d{4})\b[^\n]*/gi,
  /\b(skip to content|back to top|share this (article|page|post))\b[^\n]*/gi,
]

/**
 * Cleans raw scraped content:
 * 1. Removes markdown image tags (useless without rendering)
 * 2. Removes hyperlinks but keeps link text
 * 3. Strips common nav/footer noise
 * 4. Collapses excessive whitespace/blank lines
 * 5. Truncates to max token-safe length
 */
export function cleanContent(raw: string): string {
  let cleaned = raw

  // Remove markdown images: ![alt](url)
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, '')

  // Convert markdown links to plain text: [text](url) → text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove common noise lines
  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, '')
  }

  // Collapse 3+ consecutive blank lines into 2
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  // Remove lines that are only dashes/equals (decorative separators)
  cleaned = cleaned.replace(/^[-=]{3,}\s*$/gm, '')

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim()

  // Truncate to safe length for Gemini
  if (cleaned.length > CONTENT_MAX_CHARS) {
    cleaned = cleaned.slice(0, CONTENT_MAX_CHARS)
    // Don't cut in the middle of a sentence — find the last period
    const lastPeriod = cleaned.lastIndexOf('.')
    if (lastPeriod > CONTENT_MAX_CHARS * 0.8) {
      cleaned = cleaned.slice(0, lastPeriod + 1)
    }
    cleaned += '\n\n[Content truncated for processing]'
  }

  return cleaned
}

/**
 * Extracts a clean title from a URL hostname as a fallback.
 * e.g., "en.wikipedia.org" → "Wikipedia"
 */
export function titleFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    const parts = hostname.replace(/^www\./, '').split('.')
    const domain = parts[0]
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch {
    return 'Web Page'
  }
}
