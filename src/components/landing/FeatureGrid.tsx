import { Wand2, Globe, Layout, Download, Zap, Sparkles } from 'lucide-react';
import { BrandName } from '#/components/BrandName';

const features = [
  {
    title: 'Prompt to PPT',
    description: 'Describe your idea, and our AI will generate a complete presentation in seconds.',
    icon: <Wand2 className="h-6 w-6 text-primaryColor" />
  },
  {
    title: 'URL to PPT',
    description: 'Paste any article or website URL. We extract the key points and build your slides.',
    icon: <Globe className="h-6 w-6 text-primaryColor" />
  },
  {
    title: 'AI Slide Editing',
    description: 'Easily tweak text, tone, and layouts using our intuitive AI chat editor.',
    icon: <Sparkles className="h-6 w-6 text-primaryColor" />
  },
  {
    title: 'Clean Dashboard',
    description: 'Manage all your presentations in one organized, beautiful workspace.',
    icon: <Layout className="h-6 w-6 text-primaryColor" />
  },
  {
    title: 'Fast Generation',
    description: 'Stop waiting. Our optimized models deliver ready-to-present slides instantly.',
    icon: <Zap className="h-6 w-6 text-primaryColor" />
  },
  {
    title: 'Export to PowerPoint',
    description: 'Download your presentation directly as a native .pptx file.',
    icon: <Download className="h-6 w-6 text-primaryColor" />
  }
];

export function FeatureGrid() {
  return (
    <section className="bg-bgDark1 py-24 sm:py-32" id="features">
      <div className="content-container">
        <div className="mx-auto max-w-2xl text-center fade-in">
          <span className="block-subtitle">Features</span>
          <h2 className="block-big-title mt-4">Everything you need to create</h2>
          <p className="mt-6 text-secondaryText text-lg">
            <BrandName /> combines cutting-edge AI with premium design to give you a seamless presentation building experience.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="card card-colored-hover fade-in p-8"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-bgDark2 main-border-gray-darker">
                  {feature.icon}
                </div>
                <h3 className="content-title mb-3">{feature.title}</h3>
                <p className="content-text-gray text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
