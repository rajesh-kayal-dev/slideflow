import React from 'react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ message = 'Preparing your experience...', fullScreen = true }: LoadingScreenProps) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
    : "relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-transparent overflow-hidden"

  return (
    <div className={containerClasses}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
      
      <div className="relative flex flex-col items-center">
        {/* Logo Container with Orbiting Ring */}
        <div className="relative w-24 h-24 mb-8">
          {/* Animated Rings */}
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500/30 animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400/20 animate-[spin_2s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border-b-2 border-indigo-300/10 animate-[spin_4s_linear_infinite]" />
          
          {/* Central Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
              <img 
                src="/SlideFlowLogo.png" 
                alt="SlideFlow" 
                className="w-12 h-12 object-contain relative z-10 animate-[float_3s_easeInOut_infinite] brightness-110" 
              />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-white font-black text-sm uppercase tracking-[0.3em] ml-[0.3em] animate-pulse">
            SlideFlow
          </h2>
          <div className="flex items-center gap-2">
             <div className="h-1 w-1 rounded-full bg-indigo-500 animate-[loading-dot_1.5s_infinite]" />
             <p className="text-secondaryText text-[10px] font-bold uppercase tracking-widest min-w-[200px] text-center">
               {message}
             </p>
             <div className="h-1 w-1 rounded-full bg-indigo-500 animate-[loading-dot_1.5s_infinite_0.5s]" />
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        @keyframes loading-dot {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}} />
    </div>
  )
}
