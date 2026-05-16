import React, { useState } from 'react';
import { Palette, Type, Layout, Check, RotateCcw, Image as ImageIcon, Save } from 'lucide-react';
import type { Template } from '#/generated/client';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';

interface TemplateCustomizerProps {
  template: Template;
  onSave: (config: any) => void;
  onCancel: () => void;
}

export function TemplateCustomizer({ template, onSave, onCancel }: TemplateCustomizerProps) {
  const initialConfig = (template.config as any) || {
    colors: { primary: '#3b82f6', background: '#ffffff', text: '#000000' },
    typography: { fontFamily: 'Inter, sans-serif' }
  };

  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'content'>('colors');

  const handleColorChange = (key: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  return (
    <div className="flex h-full bg-bgDark1 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-bgDark2/50">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold text-white">Customize Template</h3>
          <p className="text-xs text-secondaryText mt-1">Adjust styles before generating</p>
        </div>

        <div className="flex border-b border-white/5">
          {[
            { id: 'colors', icon: Palette, label: 'Colors' },
            { id: 'typography', icon: Type, label: 'Fonts' },
            { id: 'content', icon: Layout, label: 'Structure' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id ? 'text-indigo-400 bg-white/5' : 'text-secondaryText hover:text-white'
              }`}
            >
              <tab.icon className="size-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {Object.entries(config.colors || {}).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryText uppercase tracking-widest">{key}</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={value as string}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="size-10 rounded-lg bg-bgDark1 border border-white/10 cursor-pointer overflow-hidden"
                    />
                    <Input
                      value={value as string}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 bg-bgDark1 border-white/10 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryText uppercase tracking-widest">Font Family</label>
                  <select 
                    value={config.typography?.fontFamily}
                    onChange={(e) => setConfig((prev: any) => ({ ...prev, typography: { ...prev.typography, fontFamily: e.target.value }}))}
                    className="w-full bg-bgDark1 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Playfair Display, serif">Playfair Display</option>
                    <option value="Montserrat, sans-serif">Montserrat</option>
                  </select>
               </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4 text-center py-10">
               <ImageIcon className="size-12 text-white/10 mx-auto mb-4" />
               <p className="text-xs text-secondaryText">Content structure is optimized based on the template layout.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 space-y-3">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            onClick={() => onSave(config)}
          >
            <Save className="size-4 mr-2" />
            Apply Customizations
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-secondaryText hover:text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-[#0f0f0f]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-bgDark1/30">
          <span className="text-xs font-bold text-secondaryText uppercase tracking-widest">Live Preview</span>
          <div className="flex items-center gap-2">
             <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] text-emerald-500 font-bold">Syncing changes</span>
          </div>
        </div>
        
        <div className="flex-1 p-12 flex items-center justify-center">
           <div 
             className="w-full max-w-4xl aspect-[16/9] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 relative group"
             style={{ 
               backgroundColor: config.colors?.background || '#ffffff',
               fontFamily: config.typography?.fontFamily || 'sans-serif'
             }}
           >
              {/* Mock Slide Content */}
              <div className="absolute inset-0 p-16 flex flex-col justify-center">
                 <h1 
                    className="text-6xl font-black mb-6 tracking-tight"
                    style={{ color: config.colors?.primary || '#3b82f6' }}
                 >
                    {template.name}
                 </h1>
                 <p 
                    className="text-xl max-w-xl leading-relaxed"
                    style={{ color: config.colors?.text || '#000000', opacity: 0.8 }}
                 >
                    Experience the next level of presentation design. Completely customizable and AI-ready.
                 </p>
                 
                 <div className="mt-12 flex gap-4">
                    <div className="size-12 rounded-lg" style={{ backgroundColor: config.colors?.primary }} />
                    <div className="size-12 rounded-lg opacity-50" style={{ backgroundColor: config.colors?.primary }} />
                    <div className="size-12 rounded-lg opacity-20" style={{ backgroundColor: config.colors?.primary }} />
                 </div>
              </div>
              
              <div className="absolute bottom-8 right-12 text-[10px] uppercase tracking-widest font-bold opacity-30" style={{ color: config.colors?.text }}>
                 Template: {template.id}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
