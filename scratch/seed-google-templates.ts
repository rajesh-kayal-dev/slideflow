import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const templates = [
    {
      id: 'google-pitch-deck',
      name: 'Google Pitch Deck (Classic)',
      category: 'Startup',
      googleId: '1U_u8G78_6W8l9wD_kP-vD2vL2P7o-L-6W', // Example public ID
      thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop',
      layoutType: 'visual',
      themeType: 'professional',
      config: {
        colors: {
           primary: '#4285F4',
           background: '#FFFFFF',
           text: '#202124'
        },
        typography: { fontFamily: 'Roboto, sans-serif' }
      },
      previewSlides: [
        'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop'
      ]
    },
    {
      id: 'minimalist-blue',
      name: 'Minimalist Ocean',
      category: 'Minimal',
      googleId: '1_D-T6Wv_D-T6Wv_D-T6Wv_D-T6Wv', 
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
      layoutType: 'balanced',
      themeType: 'minimal',
      config: {
        colors: {
           primary: '#0D47A1',
           background: '#F5F5F5',
           text: '#212121'
        },
        typography: { fontFamily: 'Inter, sans-serif' }
      },
      previewSlides: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'
      ]
    }
  ]

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    })
  }

  console.log('Seeded Google Templates!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
