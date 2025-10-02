import axios from 'axios'
import * as cheerio from 'cheerio'
import { logger } from '@/lib/utils/logger'
import { retryWithBackoff } from '@/lib/utils/retry'
import type { CompanyMetadata } from '@/types/database'

/**
 * Scrape and extract company metadata from URL
 */
export async function scrapeCompanyWebsite(url: string): Promise<CompanyMetadata> {
  return retryWithBackoff(async () => {
    logger.info('Scraping company website', { url })

    // Fetch the HTML
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TinkerbellBot/1.0)',
      },
    })

    const html = response.data
    const $ = cheerio.load(html)

    // Extract metadata
    const metadata: CompanyMetadata = {
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
      description:
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '',
      keywords: extractKeywords($),
      content: extractMainContent($),
      industry: inferIndustry($),
      targetAudience: inferTargetAudience($),
    }

    logger.info('Successfully scraped website', {
      url,
      titleLength: metadata.title?.length,
      contentLength: metadata.content?.length,
    })

    return metadata
  })
}

/**
 * Extract keywords from meta tags and content
 */
function extractKeywords($: cheerio.CheerioAPI): string[] {
  const keywords: string[] = []

  // Meta keywords
  const metaKeywords = $('meta[name="keywords"]').attr('content')
  if (metaKeywords) {
    keywords.push(...metaKeywords.split(',').map(k => k.trim()))
  }

  // H1/H2 headings
  $('h1, h2').each((_, el) => {
    const text = $(el).text().trim()
    if (text && text.length < 50) {
      keywords.push(text)
    }
  })

  // Remove duplicates and limit
  return [...new Set(keywords)].slice(0, 10)
}

/**
 * Extract main content from page
 */
function extractMainContent($: cheerio.CheerioAPI): string {
  // Remove scripts, styles, nav, footer
  $('script, style, nav, footer, header').remove()

  // Get main content
  const mainContent =
    $('main').text() ||
    $('article').text() ||
    $('.content').text() ||
    $('#content').text() ||
    $('body').text()

  // Clean up whitespace
  return mainContent
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000) // Limit to 5000 chars
}

/**
 * Infer industry from content
 */
function inferIndustry($: cheerio.CheerioAPI): string {
  const text = $('body').text().toLowerCase()

  const industries = {
    'SaaS/Software': ['saas', 'software', 'platform', 'cloud', 'api'],
    'Marketing': ['marketing', 'advertising', 'campaign', 'seo'],
    'Finance': ['finance', 'banking', 'payment', 'fintech'],
    'Healthcare': ['healthcare', 'medical', 'health', 'patient'],
    'E-commerce': ['ecommerce', 'online store', 'shopping', 'retail'],
    'Education': ['education', 'learning', 'training', 'course'],
    'HR/Recruiting': ['recruiting', 'hiring', 'hr', 'talent'],
    'Sales': ['sales', 'crm', 'leads', 'pipeline'],
  }

  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return industry
    }
  }

  return 'B2B Technology'
}

/**
 * Infer target audience from content
 */
function inferTargetAudience($: cheerio.CheerioAPI): string {
  const text = $('body').text().toLowerCase()

  if (text.includes('enterprise') || text.includes('large business')) {
    return 'Enterprise businesses'
  }
  if (text.includes('small business') || text.includes('smb')) {
    return 'Small and medium businesses'
  }
  if (text.includes('startup')) {
    return 'Startups and scale-ups'
  }
  if (text.includes('agency') || text.includes('agencies')) {
    return 'Agencies and consultants'
  }

  return 'Business professionals'
}
