import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const p = new PrismaClient({ adapter })
async function test() {
  try {
    const count = await p.template.count()
    console.log('Template count:', count)
    const templates = await p.template.findMany()
    console.log('Templates:', JSON.stringify(templates, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await p.$disconnect()
  }
}
test()
