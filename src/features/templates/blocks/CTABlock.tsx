import React from 'react';
import { useTemplate } from '../context';

interface CTABlockProps {
  title: string;
  content: string;
}

export function CTABlock({ title, content }: CTABlockProps) {
  const { config, onUpdate, isFullscreen, slideId } = useTemplate();
  
  return (
    <div className="h-full w-full flex items-center justify-center p-12 text-center bg-linear-to-br from-primaryColor/5 to-accentColor/5">
      <div className="max-w-3xl p-16 rounded-[4rem] bg-white/5 border border-white/10 shadow-2xl space-y-8 backdrop-blur-xl">
        <h2 
          id={`slide-title-${slideId}`}
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.currentTarget.innerText.trim();
            if (newTitle && newTitle !== title) {
              onUpdate?.({ title: newTitle });
            }
          }}
          className="text-4xl md:text-6xl font-black tracking-tight outline-none focus:ring-2 ring-primaryColor/20 rounded-2xl px-4"
          style={{ 
            fontFamily: config.typography.heading,
            color: config.colors.primary 
          }}
        >
          {title}
        </h2>
        <p 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newContent = e.currentTarget.innerText.trim();
            if (newContent && newContent !== content) {
              onUpdate?.({ content: newContent });
            }
          }}
          className="text-xl md:text-2xl opacity-70 leading-relaxed outline-none focus:ring-2 ring-primaryColor/20 rounded-xl p-4"
          style={{ fontFamily: config.typography.body }}
        >
          {content}
        </p>
        <button 
          className="px-12 py-5 rounded-full font-black text-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
          style={{ 
            backgroundColor: config.colors.accent,
            color: '#fff',
            boxShadow: `0 20px 40px -10px ${config.colors.accent}44`
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
