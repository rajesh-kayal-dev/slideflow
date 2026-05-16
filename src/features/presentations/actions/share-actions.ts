import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { prisma } from '#/db'
import { sendMail } from '#/lib/mail'
import { requirePresentationUserId } from '../lib/server-helpers'
import path from 'path'

const shareInputSchema = z.object({
  presentationId: z.string(),
  email: z.string().email(),
  baseUrl: z.string(),
})

import { env } from '#/env'

export const sharePresentationAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => shareInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requirePresentationUserId()
    
    // 1. Verify presentation exists
    const presentation = await prisma.presentation.findUnique({
      where: { id: data.presentationId },
      include: { slides: { take: 1, orderBy: { order: 'asc' } } }
    })

    if (!presentation) throw new Error('Presentation not found')
    
    // 2. Build the share URL
    const shareUrl = `${data.baseUrl}/viewer/${data.presentationId}`
    const previewImage = presentation.slides[0]?.imageUrl || 'https://SlideFlow.ai/og-preview.jpg'

    // 3. Create HTML template
    const appName = env.APP_NAME || 'SlideFlow'
    const logoUrl = 'cid:logo'
    
    const attachments = [
      {
        filename: 'SlideFlowLogo.png',
        path: path.join(process.cwd(), 'public', 'SlideFlowLogo.png'),
        cid: 'logo'
      }
    ]
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #E2E8F0; margin: 0; padding: 0; background-color: #050505; }
          .container { max-width: 600px; margin: 40px auto; background: #0F172A; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
          .header { padding: 48px 40px 32px; text-align: center; position: relative; }
          .logo { height: 48px; width: auto; margin-bottom: 24px; }
          .content { padding: 0 40px 48px; text-align: center; }
          .footer { padding: 32px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
          .btn { display: inline-block; padding: 18px 36px; background: #4F46E5; color: #ffffff !important; text-decoration: none; border-radius: 16px; font-weight: 800; font-size: 15px; margin-top: 32px; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3); transition: all 0.2s; }
          .thumbnail-container { position: relative; margin: 32px 0; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #020617; }
          .thumbnail { width: 100%; display: block; object-fit: cover; aspect-ratio: 16/9; }
          .title-overlay { padding: 24px; background: linear-gradient(to top, #0F172A, transparent); text-align: left; }
          h1 { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.04em; color: #ffffff; }
          p { margin: 0 0 16px; font-size: 16px; color: #94A3B8; }
          .meta { font-size: 13px; color: #475569; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 32px; }
          .meta a { color: #6366F1; text-decoration: none; }
          strong { color: #ffffff; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="${appName}" class="logo">
            <h1>Shared with you</h1>
          </div>
          <div class="content">
            <p>You've been invited to view a professional presentation crafted on <strong>${appName}</strong>.</p>
            
            <div class="thumbnail-container">
              <img src="${previewImage}" class="thumbnail" alt="${presentation.title}">
              <div class="title-overlay">
                 <h2 style="margin: 0 0 4px; font-size: 20px; color: #ffffff; font-weight: 800;">${presentation.title}</h2>
                 <p style="margin: 0; font-size: 12px; font-weight: 700; color: #6366F1; text-transform: uppercase; letter-spacing: 0.05em;">AI-Powered Presentation</p>
              </div>
            </div>

            <a href="${shareUrl}" class="btn">Open Presentation</a>
            
            <div class="meta">
              <p style="margin-top: 24px;">If the button doesn't work, copy this link:<br>
              <a href="${shareUrl}">${shareUrl}</a></p>
            </div>
          </div>
          <div class="footer">
            &copy; 2026 ${appName}.ai &bull; The Future of Visual Storytelling
          </div>
        </div>
      </body>
      </html>
    `

    // 4. Send the email
    return await sendMail({
      to: data.email,
      subject: `Shared Presentation: ${presentation.title}`,
      html,
      attachments,
    })
  })
