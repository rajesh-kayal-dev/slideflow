import React from 'react';
import { useTemplate } from '../context';

interface TwoColumnBlockProps {
  title: string;
  content: string;
}

export function TwoColumnBlock({ title, content }: TwoColumnBlockProps) {
  const { config, isFullscreen, onUpdate } = useTemplate();
  
  // Split content by two newlines for columns
  const [col1, col2] = content.split('\n\n').map(s => s.trim());

  const handleUpdate = (newCol1: string, newCol2: string) => {
    onUpdate?.({ content: `${newCol1}\n\n${newCol2}` });
  };

  return (
    <div className="h-full w-full flex flex-col p-12">
      <h2 
        contentEditable={!!onUpdate && !isFullscreen}
        suppressContentEditableWarning
        onBlur={(e) => {
          const newTitle = e.currentTarget.innerText || '';
          if (newTitle.trim() !== title.trim()) onUpdate?.({ title: newTitle });
        }}
        className={`text-3xl md:text-4xl font-bold mb-12 outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-lg p-2 -m-2 transition-all ${
          !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
        }`}
        style={{ 
          fontFamily: config.typography.heading,
          color: config.colors.primary 
        }}
      >
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 flex-1">
        <div 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newText = e.currentTarget.innerText || '';
            if (newText.trim() !== col1.trim()) handleUpdate(newText, col2 || '');
          }}
          className={`text-lg md:text-xl opacity-90 leading-relaxed outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-xl p-2 -m-2 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
          }`}
          style={{ fontFamily: config.typography.body }}
        >
          {col1}
        </div>
        <div 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newText = e.currentTarget.innerText || '';
            if (newText.trim() !== col2.trim()) handleUpdate(col1 || '', newText);
          }}
          className={`text-lg md:text-xl opacity-90 leading-relaxed p-8 rounded-3xl bg-white/5 border border-white/5 outline-none focus:ring-2 focus:ring-primaryColor/20 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/10 cursor-text' : ''
          }`}
          style={{ fontFamily: config.typography.body }}
        >
          {col2 || 'Add more content to see the second column...'}
        </div>
      </div>
    </div>
  );
}
