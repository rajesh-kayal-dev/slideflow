// Template type definitions
export type BlockType = 
  | 'hero' 
  | 'title-content' 
  | 'two-column' 
  | 'stats' 
  | 'image-section' 
  | 'quote' 
  | 'cta' 
  | 'timeline';

export interface SlideBlock {
  type: BlockType;
  content: any;
  styles?: Record<string, string | number>;
}

export type TemplateConfig = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
    sizes: {
      heading: string;
      body: string;
    };
  };
  layout: {
    spacing: string;
    borderRadius: string;
  };
}
