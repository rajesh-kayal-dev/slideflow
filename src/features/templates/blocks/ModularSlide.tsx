import React from 'react';
import type { TemplateConfig, BlockType } from '../types';
import { TemplateContext } from '../context';
import { HeroBlock } from './HeroBlock';
import { TitleContentBlock } from './TitleContentBlock';
import { StatsBlock } from './StatsBlock';
import { TwoColumnBlock } from './TwoColumnBlock';
import { QuoteBlock } from './QuoteBlock';
import { CTABlock } from './CTABlock';

interface ModularSlideProps {
  slide: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    order: number;
    layoutType?: BlockType; // Optional override
  };
  config: TemplateConfig;
  isFullscreen?: boolean;
  onUpdate?: (data: { title?: string; content?: string }) => void;
  onRegenerateImage?: (prompt: string) => void;
  onRegenerateImageAuto?: () => void;
  onDeleteImage?: () => void;
  isUpdatingImage?: boolean;
}

export function ModularSlide({ 
  slide, 
  config, 
  isFullscreen = false, 
  onUpdate,
  onRegenerateImage,
  onRegenerateImageAuto,
  onDeleteImage,
  isUpdatingImage
}: ModularSlideProps) {
  // Simple heuristic for layout selection if not explicitly provided
  const getLayout = (): BlockType => {
    if (slide.layoutType) return slide.layoutType;
    if (slide.order === 0) return 'hero';
    if (slide.content.length > 0 && slide.content.length < 50 && !slide.content.includes('\n')) return 'cta';
    if (slide.content.includes(':') && slide.content.split('\n').length > 1) return 'stats';
    if (slide.content.includes('\n\n')) return 'two-column';
    return 'title-content';
  };

  const type = getLayout();

  const renderBlock = () => {
    switch (type) {
      case 'hero':
        return <HeroBlock title={slide.title} content={slide.content} imageUrl={slide.imageUrl} />;
      case 'stats':
        return <StatsBlock title={slide.title} content={slide.content} />;
      case 'two-column':
        return <TwoColumnBlock title={slide.title} content={slide.content} />;
      case 'quote':
        return <QuoteBlock title={slide.title} content={slide.content} />;
      case 'cta':
        return <CTABlock title={slide.title} content={slide.content} />;
      case 'title-content':
      default:
        return <TitleContentBlock title={slide.title} content={slide.content} imageUrl={slide.imageUrl} />;
    }
  };

  const defaultConfig: TemplateConfig = {
    colors: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      background: '#18181b',
      text: '#ffffff',
      accent: '#3b82f6',
    },
    typography: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      sizes: {
        heading: '3rem',
        body: '1.25rem',
      },
    },
    layout: {
      spacing: '2rem',
      borderRadius: '1.5rem',
    },
  };

  const finalConfig = {
    ...defaultConfig,
    ...config,
    colors: { ...defaultConfig.colors, ...config?.colors },
    typography: { 
      ...defaultConfig.typography, 
      ...config?.typography,
      sizes: { ...defaultConfig.typography.sizes, ...config?.typography?.sizes }
    },
    layout: { ...defaultConfig.layout, ...config?.layout },
  };

  return (
    <TemplateContext.Provider 
      value={{ 
        config: finalConfig, 
        isFullscreen, 
        onUpdate, 
        slideId: slide.id,
        onRegenerateImage,
        onRegenerateImageAuto,
        onDeleteImage,
        isUpdatingImage
      }}
    >
      <div 
        className="w-full h-full overflow-hidden transition-all duration-500"
        style={{ 
          backgroundColor: finalConfig.colors.background,
          color: finalConfig.colors.text,
          borderRadius: isFullscreen ? '0' : finalConfig.layout.borderRadius 
        }}
      >
        {renderBlock()}
      </div>
    </TemplateContext.Provider>
  );
}
