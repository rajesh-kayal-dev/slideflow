import { useTemplate } from '../context';
import { ImageActionsOverlay } from '#/components/editor/ImageActionsOverlay';

interface TitleContentBlockProps {
  title: string;
  content: string;
  imageUrl?: string | null;
}

export function TitleContentBlock({ title, content, imageUrl }: TitleContentBlockProps) {
  const { config, isFullscreen, onUpdate, slideId, onRegenerateImage, onRegenerateImageAuto, onDeleteImage, isUpdatingImage } = useTemplate();
  
  return (
    <div className="h-full w-full flex flex-col md:flex-row p-12 gap-12 items-center justify-center overflow-hidden">
      <div className={`flex-1 space-y-6 ${imageUrl ? 'md:w-1/2' : 'w-full'} flex flex-col justify-center`}>
        <h2 
          id={`slide-title-${slideId}`}
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.currentTarget.innerText || '';
            if (newTitle.trim() !== title.trim()) onUpdate?.({ title: newTitle });
          }}
          className={`text-4xl md:text-5xl font-bold tracking-tight line-clamp-2 outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-lg p-2 -m-2 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
          }`}
          style={{ 
            fontFamily: config.typography.heading,
            color: config.colors.primary 
          }}
        >
          {title}
        </h2>
        <div 
          contentEditable={!!onUpdate && !isFullscreen}
          suppressContentEditableWarning
          onBlur={(e) => {
            const newContent = e.currentTarget.innerText || '';
            if (newContent.trim() !== content.trim()) onUpdate?.({ content: newContent });
          }}
          className={`text-lg md:text-xl opacity-90 leading-relaxed whitespace-pre-line line-clamp-6 outline-none focus:ring-2 focus:ring-primaryColor/20 rounded-lg p-2 -m-2 transition-all ${
            !!onUpdate && !isFullscreen ? 'hover:bg-white/5 cursor-text' : ''
          }`}
          style={{ fontFamily: config.typography.body }}
        >
          {content}
        </div>
      </div>
      
      {imageUrl && (
        <div className="flex-1 md:w-1/2 h-full flex items-center justify-center min-h-[300px]">
          <div className="w-full h-full p-4 group/img relative">
            <img 
              src={imageUrl} 
              className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10" 
              alt="" 
            />
            {!isFullscreen && onUpdate && (
              <ImageActionsOverlay 
                onRegenerate={(prompt) => onRegenerateImage?.(prompt)}
                onRegenerateAuto={() => onRegenerateImageAuto?.()}
                onDelete={() => onDeleteImage?.()}
                isPending={isUpdatingImage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
