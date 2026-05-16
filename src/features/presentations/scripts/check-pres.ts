import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const p = new PrismaClient({ adapter })

async function check() {
  try {
    const pres = await p.presentation.findFirst({
      where: { title: { contains: 'Big Announcement' } },
      orderBy: { createdAt: 'desc' }
    })
    console.log('Presentation Status:', JSON.stringify(pres, null, 2))
    
    if (pres) {
        const slides = await p.slide.count({ where: { presentationId: pres.id } })
        console.log('Slide Count:', slides)
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await p.$disconnect()
    pool.end()
  }
}
check()
