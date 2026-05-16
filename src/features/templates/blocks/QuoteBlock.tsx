import React from 'react';
import { useTemplate } from '../context';

interface QuoteBlockProps {
  title: string;
  content: string;
}

export function QuoteBlock({ title, content }: QuoteBlockProps) {
  const { config, onUpdate, isFullscreen, slideId } = useTemplate();
  
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center bg-white/5">
      <div className="max-w-3xl space-y-8">
        <span 
          className="text-8xl font-serif opacity-20"
          style={{ color: config.colors.primary }}
        >
          &ldquo;
        </span>
        <blockquote 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newContent = e.currentTarget.innerText.trim();
            if (newContent && newContent !== content) {
              onUpdate?.({ content: newContent });
            }
          }}
          className="text-3xl md:text-5xl font-medium italic leading-tight outline-none focus:ring-2 ring-primaryColor/20 rounded-xl p-4"
          style={{ 
            fontFamily: config.typography.body,
            color: config.colors.text 
          }}
        >
          {content}
        </blockquote>
        <cite 
          id={`slide-title-${slideId}`}
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.currentTarget.innerText.replace('— ', '').trim();
            if (newTitle && newTitle !== title) {
              onUpdate?.({ title: newTitle });
            }
          }}
          className="block text-xl md:text-2xl font-bold not-italic outline-none focus:ring-2 ring-primaryColor/20 rounded-lg px-2"
          style={{ 
            fontFamily: config.typography.heading,
            color: config.colors.primary 
          }}
        >
          &mdash; {title}
        </cite>
      </div>
    </div>
  );
}
