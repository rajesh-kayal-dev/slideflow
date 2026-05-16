import React, { useState } from 'react'
import { Globe, Link2, Loader2, Wand2 } from 'lucide-react'
import { LAYOUT_OPTIONS, SLIDE_STYLES, TONE_OPTIONS } from '#/features/presentations/constants/presentation-options'

type UrlFormState = {
  url: string
  slideCount: number
  style: 'minimal' | 'professional' | 'creative' | 'bold'
  tone: 'formal' | 'casual' | 'persuasive' | 'informative'
  layout: 'text-heavy' | 'visual' | 'balanced' | 'bullet-points'
}

type UrlGenerateFormProps = {
  onSubmit: (data: UrlFormState) => void
  isPending: boolean
}

const EXAMPLE_URLS = [
  { label: 'Wikipedia article', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
  { label: 'MDN Docs page', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { label: 'React homepage', url: 'https://react.dev' },
]

const SELECT_FIELDS = [
  { key: 'style' as const, label: 'Style', options: SLIDE_STYLES },
  { key: 'tone' as const, label: 'Tone', options: TONE_OPTIONS },
  { key: 'layout' as const, label: 'Layout', options: LAYOUT_OPTIONS },
]

export function UrlGenerateForm({ onSubmit, isPending }: UrlGenerateFormProps) {
  const [form, setForm] = useState<UrlFormState>({
    url: '',
    slideCount: 8,
    style: 'professional',
    tone: 'informative',
    layout: 'balanced',
  })
  const [urlError, setUrlError] = useState<string | null>(null)

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) { setUrlError('Please enter a URL'); return false }
    try {
      const parsed = new URL(value)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setUrlError('URL must start with http:// or https://')
        return false
      }
      setUrlError(null)
      return true
    } catch {
      setUrlError('Please enter a valid URL (e.g. https://example.com)')
      return false
    }
  }

  const handleSubmit = () => {
    if (!validateUrl(form.url)) return
    onSubmit(form)
  }

  const handleUrlChange = (value: string) => {
    setForm((s) => ({ ...s, url: value }))
    if (urlError) validateUrl(value)
  }

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-secondaryText uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-primaryColor" />
          Website URL
        </label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondaryText pointer-events-none" />
          <input
            id="url-input"
            type="url"
            placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
            value={form.url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUrlChange(e.target.value)}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => validateUrl(e.target.value)}
            className={`form-input pl-9 h-11 bg-bgDark1/50 ${
              urlError ? 'border-red-500/60 focus:border-red-500' : ''
            }`}
          />
        </div>
        {urlError && (
          <p className="text-xs text-red-400">{urlError}</p>
        )}

        {/* Example quick-fills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-secondaryText self-center">Try:</span>
          {EXAMPLE_URLS.map((ex) => (
            <button
              key={ex.url}
              type="button"
              onClick={() => { setForm((s) => ({ ...s, url: ex.url })); setUrlError(null) }}
              className="text-xs px-3 py-1.5 rounded-md bg-bgDark2 border border-mainBorderDarker text-secondaryText hover:text-primaryText hover:border-mainBorderSubtler transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options grid — identical layout to Prompt tab */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="space-y-2">
          <label className="text-xs font-bold text-secondaryText uppercase tracking-wider">
            Slides: {form.slideCount}
          </label>
          <input
            type="range"
            min="3" max="20" step="1"
            value={form.slideCount}
            onChange={(e) => setForm((s) => ({ ...s, slideCount: parseInt(e.target.value) }))}
            className="w-full accent-primaryColor cursor-pointer mt-2"
          />
        </div>

        {SELECT_FIELDS.map(({ key, label, options }) => (
          <div key={key} className="space-y-2">
            <label className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              {label}
            </label>
            <select
              value={form[key]}
              onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value as any }))}
              className="w-full h-10 rounded-lg border border-mainBorderSubtler bg-bgDark1/50 px-3 text-sm text-primaryText focus:border-primaryColor focus:outline-none cursor-pointer"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value} className="bg-bgDark1">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl bg-primaryColor/5 border border-primaryColor/15 px-4 py-3">
        <Globe className="h-4 w-4 text-primaryColor mt-0.5 shrink-0" />
        <p className="text-xs text-secondaryText leading-relaxed">
          We'll scrape the webpage, clean the content, and generate a structured presentation.
          Scraping usually takes{' '}
          <strong className="text-primaryText font-semibold">15–30 seconds</strong>{' '}
          depending on the page.
        </p>
      </div>

      {/* Generate button — matches Prompt tab exactly */}
      <div className="flex justify-end pt-4 border-t border-mainBorderDarker">
        <button
          id="generate-from-url-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !form.url.trim()}
          className="contained-button h-11 px-6 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Wand2 className="size-4" />
          )}
          {isPending ? 'Scraping & Generating…' : 'Generate from URL'}
        </button>
      </div>
    </div>
  )
}
