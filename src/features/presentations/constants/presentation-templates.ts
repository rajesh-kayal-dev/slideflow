import type { SlideLayout, SlideStyle, SlideTone } from './presentation-options'

export type PresentationTemplate = {
  id: string
  label: string
  content: string
  slides: number
  style: SlideStyle
  tone: SlideTone
  layout: SlideLayout
  category: string
  thumbnailUrl: string
}

export const PRESENTATION_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'future-of-ai',
    label: 'Future of AI',
    category: 'Technology',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    content: `Create a comprehensive presentation on the Future of Artificial Intelligence.
    
Focus on:
1. Generative AI advancements and their impact on creative industries.
2. The shift from Narrow AI to AGI (Artificial General Intelligence).
3. Ethical challenges: Bias, deepfakes, and the need for global regulation.
4. AI in healthcare and climate change solutions.
5. The future of human-AI collaboration in the workplace.

Style: Forward-looking, visionary, and data-driven.`,
    slides: 12,
    style: 'creative',
    tone: 'informative',
    layout: 'visual',
  },
  {
    id: 'cyber-security-2024',
    label: 'Cyber Security Essentials',
    category: 'Security',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    content: `A strategic overview of Modern Cyber Security for enterprise environments.

Key pillars to cover:
- Zero Trust Architecture: "Never trust, always verify".
- Ransomware Defense: Prevention, detection, and recovery strategies.
- Cloud Security: Protecting data in AWS, Azure, and GCP.
- Social Engineering: Training employees to spot phishing and deepfake scams.
- Regulatory Compliance: GDPR, CCPA, and industry-specific standards.

Target Audience: IT Managers and C-level Executives.`,
    slides: 10,
    style: 'professional',
    tone: 'formal',
    layout: 'balanced',
  },
  {
    id: 'full-stack-roadmap',
    label: 'Full Stack Development',
    category: 'Development',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
    content: `A complete roadmap for becoming a Full Stack Developer in the modern era.

Include these sections:
- Frontend Mastery: React, Next.js, and the power of Tailwind CSS.
- Backend Excellence: Node.js, Express, and modern ORMs like Prisma.
- Database Strategy: Comparing SQL (PostgreSQL) vs NoSQL (MongoDB).
- DevOps for Developers: Docker, CI/CD pipelines, and serverless deployment.
- Soft Skills: Agile methodology and effective code reviews.

Aim for an educational and motivating tone for aspiring developers.`,
    slides: 15,
    style: 'minimal',
    tone: 'casual',
    layout: 'bullet-points',
  },
  {
    id: 'indian-nationality',
    label: 'Indian Nationality & Heritage',
    category: 'Culture',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop',
    content: `A deep dive into Indian Nationality, Cultural Heritage, and Global Influence.

Themes:
- The Freedom Struggle: Landmarks of the Indian Independence Movement.
- Unity in Diversity: A celebration of varied languages, religions, and traditions.
- Economic Rise: India as a global tech and pharmaceutical hub.
- Cultural Soft Power: Yoga, Ayurveda, and the global influence of Bollywood.
- Vision 2047: The roadmap to a fully developed nation.

Style: Patriotic, inspiring, and visually rich.`,
    slides: 10,
    style: 'bold',
    tone: 'persuasive',
    layout: 'visual',
  },
  {
    id: 'ai-vs-humans-debate',
    label: 'Debate: AI vs Humans',
    category: 'Debate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=800&auto=format&fit=crop',
    content: `A structured debate presentation: "Can Artificial Intelligence replace Human Creativity?"

Structure the debate:
1. Opening Statement: The current state of AI creativity (Midjourney, ChatGPT).
2. Pro-AI Argument: Speed, efficiency, and data-driven pattern recognition.
3. Pro-Human Argument: Emotional depth, unique lived experiences, and subjective intent.
4. The "Hybrid" Perspective: AI as a tool for human enhancement (Centaur creativity).
5. Closing Rebuttal: The irreplaceable nature of the "human spark".

Format this as a point-counterpoint discussion.`,
    slides: 8,
    style: 'bold',
    tone: 'persuasive',
    layout: 'balanced',
  },
]
