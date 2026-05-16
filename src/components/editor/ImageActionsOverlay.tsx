import React, { useState } from 'react';
import { Wand2, Trash2, RefreshCw, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog';

interface ImageActionsOverlayProps {
  onRegenerate: (prompt: string) => void;
  onRegenerateAuto: () => void;
  onDelete: () => void;
  isPending?: boolean;
}

export function ImageActionsOverlay({ onRegenerate, onRegenerateAuto, onDelete, isPending }: ImageActionsOverlayProps) {
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isPending) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <RefreshCw className="h-5 w-5 text-white animate-spin" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">Processing Image...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerateAuto();
          }}
          className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-indigo-400 hover:text-indigo-300 hover:bg-black/80 transition-all shadow-2xl"
          title="Regenerate based on content"
        >
          <RefreshCw className="size-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPromptInput(true);
          }}
          className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-black/80 transition-all shadow-2xl"
          title="Describe image to AI"
        >
          <Wand2 className="size-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="p-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/40 transition-all shadow-2xl"
          title="Delete Image"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* AI Prompt Input Modal (Mini) */}
      {showPromptInput && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in zoom-in-95 duration-200">
          <div className="bg-bgDark1 border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative">
            <button 
              onClick={() => setShowPromptInput(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Wand2 className="size-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Describe new image</h3>
            </div>
            <textarea
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic city in neon blue colors, professional cinematic lighting..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 outline-none focus:ring-2 ring-indigo-500/20 mb-4 resize-none"
            />
            <button
              onClick={() => {
                if (prompt.trim()) {
                  onRegenerate(prompt);
                  setShowPromptInput(false);
                  setPrompt('');
                }
              }}
              disabled={!prompt.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              Generate Image
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-bgDark1 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this image?</AlertDialogTitle>
            <AlertDialogDescription className="text-secondaryText text-sm">
              This will permanently remove the image from this slide. You can always regenerate a new one later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete Image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
