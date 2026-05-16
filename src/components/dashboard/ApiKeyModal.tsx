import React, { useState } from 'react'
import { X, Key, Copy, Check, Plus, Trash2, ShieldAlert } from 'lucide-react'
import { BrandName } from '#/components/BrandName'
import { toast } from 'sonner'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
}

export function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Development Key', key: 'sf_live_492...93x', createdAt: '2026-05-10' },
  ])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    toast.success('API Key copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreate = () => {
    const name = window.prompt('Enter a name for the new API Key:')
    if (name) {
      const newKey: ApiKey = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        key: `sf_live_${Math.random().toString(36).substr(2, 12)}`,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setKeys([...keys, newKey])
      toast.success('New API Key generated')
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this API Key? Any applications using it will stop working.')) {
      setKeys(keys.filter(k => k.id !== id))
      toast.success('API Key deleted')
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-xl bg-bgDark1 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-secondaryText hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Key className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">API Keys</h2>
              <p className="text-xs text-secondaryText">Manage access keys for the <BrandName className="text-[10px]" /> API.</p>
            </div>
          </div>

          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{k.name}</span>
                  <span className="text-[10px] text-secondaryText uppercase tracking-widest font-bold">Created {k.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-xs bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-secondaryText truncate">
                    {k.key}
                  </div>
                  <button 
                    onClick={() => handleCopy(k.id, k.key)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                  >
                    {copiedId === k.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button 
                    onClick={() => handleDelete(k.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-secondaryText hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {keys.length === 0 && (
              <div className="py-12 flex flex-col items-center text-center opacity-40">
                <ShieldAlert className="h-10 w-10 mb-3" />
                <p className="text-sm font-bold">No API keys found</p>
                <p className="text-xs text-secondaryText">Create a key to get started with the API.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleCreate}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-white text-bgDark1 hover:bg-white/90 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <Plus className="h-4 w-4" />
            Create New Key
          </button>

          <p className="mt-6 text-[10px] text-secondaryText text-center leading-relaxed px-4">
            Keep your keys secret. If a key is compromised, delete it immediately and generate a new one.
          </p>
        </div>
      </div>
    </div>
  )
}
