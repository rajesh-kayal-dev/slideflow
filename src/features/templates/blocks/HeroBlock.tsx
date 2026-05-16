import { useTemplate } from '../context';
import { ImageActionsOverlay } from '#/components/editor/ImageActionsOverlay';

interface HeroBlockProps {
  title: string;
  content: string;
  imageUrl?: string | null;
}

export function HeroBlock({ title, content, imageUrl }: HeroBlockProps) {
  const { config, isFullscreen, onUpdate, slideId, onRegenerateImage, onRegenerateImageAuto, onDeleteImage, isUpdatingImage } = useTemplate();
  
  return (
    <div className="relative h-full w-full flex items-center justify-center text-center p-16 overflow-hidden">
      {imageUrl && (
        <div className="absolute inset-0 group/img">
          <img 
            src={imageUrl} 
            className="w-full h-full object-cover opacity-30 transition-opacity duration-700" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {!isFullscreen && onUpdate && (
            <ImageActionsOverlay 
              onRegenerate={(prompt) => onRegenerateImage?.(prompt)}
              onRegenerateAuto={() => onRegenerateImageAuto?.()}
              onDelete={() => onDeleteImage?.()}
              isPending={isUpdatingImage}
            />
          )}
        </div>
      )}
      
      <div className="relative z-10 max-w-4xl space-y-8 flex flex-col items-center">
        <h1 
          id={`slide-title-${slideId}`}
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.currentTarget.innerText || '';
            if (newTitle.trim() !== title.trim()) onUpdate?.({ title: newTitle });
          }}
          className={`text-5xl md:text-7xl font-black tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700 line-clamp-3 outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-2xl p-4 -m-4 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
          }`}
          style={{ 
            fontFamily: config.typography.heading,
            color: config.colors.primary 
          }}
        >
          {title}
        </h1>
        <p 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newContent = e.currentTarget.innerText || '';
            if (newContent.trim() !== content.trim()) onUpdate?.({ content: newContent });
          }}
          className={`text-xl md:text-2xl opacity-80 leading-relaxed max-w-2xl mx-auto line-clamp-4 outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-xl p-3 -m-3 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
          }`}
          style={{ fontFamily: config.typography.body }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
