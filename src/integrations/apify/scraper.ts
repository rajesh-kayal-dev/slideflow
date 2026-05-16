import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN })

export interface ScrapeResult {
  content: string
  title: string
  url: string
}

/**
 * Scrapes a single webpage using Apify's website-content-crawler actor.
 * Returns clean markdown text of the page content.
 */
export async function scrapeWebpage(url: string): Promise<ScrapeResult> {
  if (!process.env.APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN is not set in environment variables')
  }

  const run = await client.actor('apify/website-content-crawler').call({
    startUrls: [{ url }],
    maxCrawlPages: 1,           // Only scrape the given page — no following links
    crawlerType: 'cheerio',     // Fast HTML scraper — no JS rendering needed
    maxCrawlDepth: 0,           // Don't follow any links
    outputFormats: ['markdown'], // Get clean markdown instead of raw HTML
    removeCookieWarnings: true,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  if (!items.length) {
    throw new Error(`No content could be extracted from: ${url}`)
  }

  const item = items[0] as {
    markdown?: string
    text?: string
    title?: string
    url?: string
  }

  const content = item.markdown ?? item.text ?? ''

  if (!content || content.trim().length < 100) {
    throw new Error(`Page content is too short or empty. The page may be behind a login or JavaScript wall: ${url}`)
  }

  return {
    content,
    title: item.title ?? new URL(url).hostname,
    url: item.url ?? url,
  }
}
