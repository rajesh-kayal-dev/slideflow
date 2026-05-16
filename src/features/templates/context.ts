import React from 'react';
import type { TemplateConfig } from './types';

export const TemplateContext = React.createContext<{
  config: TemplateConfig;
  isFullscreen: boolean;
  onUpdate?: (data: { title?: string; content?: string }) => void;
  onRegenerateImage?: (prompt: string) => void;
  onRegenerateImageAuto?: () => void;
  onDeleteImage?: () => void;
  isUpdatingImage?: boolean;
  slideId?: string;
} | null>(null);

export function useTemplate() {
  const context = React.useContext(TemplateContext);
  if (!context) throw new Error('useTemplate must be used within TemplateProvider');
  return context;
}
