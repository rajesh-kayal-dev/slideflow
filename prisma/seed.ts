import { PrismaClient } from '@local/prisma'

const prisma = new PrismaClient()

const templates = [
  {
    name: 'Future of AI',
    category: 'Technology',
    content: `Create a comprehensive presentation on the Future of Artificial Intelligence.
    
Focus on:
1. Generative AI advancements and their impact on creative industries.
2. The shift from Narrow AI to AGI (Artificial General Intelligence).
3. Ethical challenges: Bias, deepfakes, and the need for global regulation.
4. AI in healthcare and climate change solutions.
5. The future of human-AI collaboration in the workplace.

Style: Forward-looking, visionary, and data-driven.`,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    previewSlides: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop'
    ],
    layoutType: 'visual',
    themeType: 'modern gradient',
    config: {
      colors: {
        primary: '#4F46E5',
        secondary: '#06B6D4',
        background: '#0a0a0a',
        surface: '#111111',
        text: '#ffffff',
        textMuted: '#94A3B8'
      },
      typography: {
        fontFamily: "'Outfit', sans-serif"
      },
      slideBlocks: ['title_slide', 'overview', 'core_technologies', 'ethical_considerations', 'future_impact', 'summary']
    }
  },
  {
    name: 'Cyber Security Essentials',
    category: 'Security',
    content: `A strategic overview of Modern Cyber Security for enterprise environments.

Key pillars to cover:
- Zero Trust Architecture: "Never trust, always verify".
- Ransomware Defense: Prevention, detection, and recovery strategies.
- Cloud Security: Protecting data in AWS, Azure, and GCP.
- Social Engineering: Training employees to spot phishing and deepfake scams.
- Regulatory Compliance: GDPR, CCPA, and industry-specific standards.

Target Audience: IT Managers and C-level Executives.`,
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    previewSlides: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'
    ],
    layoutType: 'balanced',
    themeType: 'high tech',
    config: {
      colors: {
        primary: '#06B6D4',
        secondary: '#10B981',
        background: '#020617',
        surface: '#0f172a',
        text: '#f8fafc',
        textMuted: '#64748B'
      },
      typography: {
        fontFamily: "'Space Grotesk', sans-serif"
      },
      slideBlocks: ['title_slide', 'threat_landscape', 'security_frameworks', 'incident_response', 'best_practices', 'conclusion']
    }
  },
  {
    name: 'Full Stack Roadmap',
    category: 'Development',
    content: `A complete roadmap for becoming a Full Stack Developer in the modern era.

Include these sections:
- Frontend Mastery: React, Next.js, and the power of Tailwind CSS.
- Backend Excellence: Node.js, Express, and modern ORMs like Prisma.
- Database Strategy: Comparing SQL (PostgreSQL) vs NoSQL (MongoDB).
- DevOps for Developers: Docker, CI/CD pipelines, and serverless deployment.
- Soft Skills: Agile methodology and effective code reviews.

Aim for an educational and motivating tone for aspiring developers.`,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
    previewSlides: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop'
    ],
    layoutType: 'grid',
    themeType: 'clean dev',
    config: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textMuted: '#64748B'
      },
      typography: {
        fontFamily: "'Inter', sans-serif"
      },
      slideBlocks: ['title_slide', 'frontend_tech', 'backend_tech', 'database_design', 'deployment_ops', 'resources']
    }
  },
  {
    name: 'Indian Nationality & Heritage',
    category: 'Culture',
    content: `A deep dive into Indian Nationality, Cultural Heritage, and Global Influence.

Themes:
- The Freedom Struggle: Landmarks of the Indian Independence Movement.
- Unity in Diversity: A celebration of varied languages, religions, and traditions.
- Economic Rise: India as a global tech and pharmaceutical hub.
- Cultural Soft Power: Yoga, Ayurveda, and the global influence of Bollywood.
- Vision 2047: The roadmap to a fully developed nation.

Style: Patriotic, inspiring, and visually rich.`,
    thumbnail: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop',
    previewSlides: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop'
    ],
    layoutType: 'visual',
    themeType: 'cultural vibrant',
    config: {
      colors: {
        primary: '#EA580C',
        secondary: '#16A34A',
        background: '#fff7ed',
        surface: '#ffffff',
        text: '#431407',
        textMuted: '#9a3412'
      },
      typography: {
        fontFamily: "'Playfair Display', serif"
      },
      slideBlocks: ['title_slide', 'history', 'diversity', 'economy', 'global_influence', 'vision']
    }
  },
  {
    name: 'Debate: AI vs Humans',
    category: 'Debate',
    content: `A structured debate presentation: "Can Artificial Intelligence replace Human Creativity?"

Structure the debate:
1. Opening Statement: The current state of AI creativity (Midjourney, ChatGPT).
2. Pro-AI Argument: Speed, efficiency, and data-driven pattern recognition.
3. Pro-Human Argument: Emotional depth, unique lived experiences, and subjective intent.
4. The "Hybrid" Perspective: AI as a tool for human enhancement (Centaur creativity).
5. Closing Rebuttal: The irreplaceable nature of the "human spark".

Format this as a point-counterpoint discussion.`,
    thumbnail: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=800&auto=format&fit=crop',
    previewSlides: [
      'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=800&auto=format&fit=crop'
    ],
    layoutType: 'balanced',
    themeType: 'bold minimal',
    config: {
      colors: {
        primary: '#DC2626',
        secondary: '#2563EB',
        background: '#fafafa',
        surface: '#ffffff',
        text: '#111827',
        textMuted: '#4B5563'
      },
      typography: {
        fontFamily: "'Outfit', sans-serif"
      },
      slideBlocks: ['title_slide', 'opening_statements', 'human_creativity', 'ai_efficiency', 'rebuttal', 'closing']
    }
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Seed Templates
  console.log('Seeding templates...')
  await prisma.template.deleteMany()
  for (const template of templates) {
    await prisma.template.create({ 
      data: {
        ...template,
        isPublic: true
      } 
    })
  }
  console.log(`✅ Created ${templates.length} templates`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
