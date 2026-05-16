import React from 'react';
import { useTemplate } from '../context';

interface StatsBlockProps {
  title: string;
  content: string; // We'll parse this for stats: "Stat 1: Value\nStat 2: Value"
}

export function StatsBlock({ title, content }: StatsBlockProps) {
  const { config, onUpdate, isFullscreen, slideId } = useTemplate();
  
  // Simple parser for "Label: Value" or "Value: Label"
  const stats = content.split('\n').filter(Boolean).map(line => {
    const [left, right] = line.split(':').map(s => s.trim());
    return { label: right || left, value: right ? left : '100%' };
  });

  return (
    <div className="h-full w-full flex flex-col p-12 items-center justify-center">
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
        className="text-3xl md:text-4xl font-bold mb-12 text-center outline-none focus:ring-2 ring-primaryColor/20 rounded-lg px-2"
        style={{ 
          fontFamily: config.typography.heading,
          color: config.colors.primary 
        }}
      >
        {title}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-2 hover:bg-white/10 transition-all"
          >
            <span 
              className="text-4xl md:text-5xl font-black"
              style={{ color: config.colors.accent }}
            >
              {stat.value}
            </span>
            <span className="text-sm uppercase tracking-widest opacity-60 font-bold">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
