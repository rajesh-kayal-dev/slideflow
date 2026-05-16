import 'dotenv/config'
import { prisma } from '../../../db'

const templates = [
  {
    id: 'pitch-deck-startup',
    name: 'Startup Pitch Deck',
    category: 'Startup',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop',
    previewSlides: [],
    layoutType: 'visual',
    themeType: 'professional',
    config: {
      colors: { primary: '#3B82F6', secondary: '#8B5CF6', background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', textMuted: '#94A3B8' },
      typography: { fontFamily: "'Inter', sans-serif" },
      slideBlocks: ['hero', 'title-content', 'stats', 'two-column', 'quote', 'cta']
    }
  },
  {
    id: 'marketing-plan-neon',
    name: 'Neon Marketing Plan',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    previewSlides: [],
    layoutType: 'bold',
    themeType: 'bold',
    config: {
      colors: { primary: '#EAB308', secondary: '#F43F5E', background: '#000000', surface: '#171717', text: '#FFFFFF', textMuted: '#A3A3A3' },
      typography: { fontFamily: "'Poppins', sans-serif" },
      slideBlocks: ['hero', 'stats', 'image-section', 'cta']
    }
  },
  {
    id: 'product-roadmap-clean',
    name: 'Clean Product Roadmap',
    category: 'Project Management',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop',
    previewSlides: [],
    layoutType: 'balanced',
    themeType: 'minimal',
    config: {
      colors: { primary: '#10B981', secondary: '#064E3B', background: '#FFFFFF', surface: '#F9FAFB', text: '#111827', textMuted: '#6B7280' },
      typography: { fontFamily: "'Geist', sans-serif" },
      slideBlocks: ['title-content', 'timeline', 'stats', 'two-column']
    }
  },
  {
    id: 'executive-summary-pro',
    name: 'Executive Summary Pro',
    category: 'Company',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    previewSlides: [],
    layoutType: 'balanced',
    themeType: 'professional',
    config: {
      colors: { primary: '#1E293B', secondary: '#64748B', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A', textMuted: '#64748B' },
      typography: { fontFamily: "'Inter', sans-serif" },
      slideBlocks: ['hero', 'title-content', 'stats', 'conclusion']
    }
  },
  {
    id: 'creative-portfolio-dark',
    name: 'Creative Portfolio Dark',
    category: 'Creative',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    previewSlides: [],
    layoutType: 'visual',
    themeType: 'creative',
    config: {
      colors: { primary: '#FFFFFF', secondary: '#A1A1AA', background: '#09090B', surface: '#18181B', text: '#FAFAFA', textMuted: '#A1A1AA' },
      typography: { fontFamily: "'Inter', sans-serif" },
      slideBlocks: ['hero', 'image-section', 'quote', 'cta']
    }
  }
]

async function main() {
  console.log('Seeding templates...')
  
  // Clear existing templates to avoid duplicates during dev
  await prisma.template.deleteMany()

  for (const template of templates) {
    await prisma.template.create({
      data: template
    })
  }
  
  console.log('Seeded ' + templates.length + ' templates successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
