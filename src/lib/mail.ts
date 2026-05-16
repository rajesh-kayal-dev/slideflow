import nodemailer from 'nodemailer'
import { env } from '../env'

const transporter = nodemailer.createTransport({
  service: env.SMTP_HOST?.includes('gmail') ? 'gmail' : undefined,
  host: env.SMTP_HOST?.includes('gmail') ? undefined : env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '465'),
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER?.trim(),
    pass: env.SMTP_PASS?.trim(),
    authMethod: 'PLAIN'
  },
})

console.log('Nodemailer Configured:', {
  user: env.SMTP_USER,
  passLength: env.SMTP_PASS?.length,
  port: env.SMTP_PORT
})

interface SendMailOptions {
  to: string
  subject: string
  html: string
  attachments?: any[]
}

export async function sendMail({ to, subject, html, attachments }: SendMailOptions) {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email will not be sent.')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM || `"SlideFlow" <${env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    })
    console.log('Email sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
