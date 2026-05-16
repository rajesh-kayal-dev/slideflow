import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sendMail } from '#/lib/mail'
import { env } from '#/env'
import path from 'path'

const inviteInputSchema = z.object({
  emails: z.array(z.string().email()),
  workspaceName: z.string(),
  baseUrl: z.string(),
})

export const inviteMembersAction = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => inviteInputSchema.parse(data))
  .handler(async ({ data }) => {
    console.log('Invite Action Started for:', data.emails)
    const appName = env.APP_NAME || 'SlideFlow'
    const logoUrl = 'cid:logo'
    
    const attachments = [
      {
        filename: 'SlideFlowLogo.png',
        path: path.join(process.cwd(), 'public', 'SlideFlowLogo.png'),
        cid: 'logo'
      }
    ]

    const results = []
    for (const email of data.emails) {
      console.log('Sending invite to:', email)
      const joinUrl = `${data.baseUrl}/workspaces/${data.workspaceName.toLowerCase().replace(/\s+/g, '-')}/join`
      
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
              <h1>Join the team</h1>
            </div>
            <div class="content">
              <p>You've been invited to join <strong>${data.workspaceName}</strong> on <strong>${appName}</strong>.</p>
              <p>Collaborate on professional presentations, share assets, and build together with the power of AI.</p>
              
              <a href="${joinUrl}" class="btn">Accept Invitation</a>
              
              <div class="meta">
                <p style="margin-top: 24px;">If the button doesn't work, copy this link:<br>
                <a href="${joinUrl}">${joinUrl}</a></p>
              </div>
            </div>
            <div class="footer">
              &copy; 2026 ${appName}.ai &bull; The Future of Visual Storytelling
            </div>
          </div>
        </body>
        </html>
      `

      const result = await sendMail({
        to: email,
        subject: `Invitation to join ${data.workspaceName} on ${appName}`,
        html,
        attachments,
      })
      results.push({ email, success: result.success })
      console.log(`Invite to ${email} result:`, result.success ? 'SUCCESS' : 'FAILED')
    }
    
    return { success: true, results }
  })
