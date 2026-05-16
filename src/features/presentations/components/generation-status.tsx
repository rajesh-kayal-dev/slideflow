import { Loader2, CheckCircle2, XCircle, FileEdit, Globe, Sparkles } from 'lucide-react'

type GenerationStatusProps = {
  status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED'
  scrapeStatus?: string | null
  contentType?: string | null
}

export function GenerationStatus({ status, scrapeStatus, contentType }: GenerationStatusProps) {
  // For URL-based presentations, show granular scraping progress
  if (status === 'GENERATING' && contentType === 'url') {
    if (scrapeStatus === 'scraping' || scrapeStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Globe className="size-4 text-primary animate-pulse" />
          <span className="text-primary">Reading website…</span>
        </div>
      )
    }
    if (scrapeStatus === 'done') {
      return (
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary animate-pulse" />
          <span className="text-primary">AI generating slides…</span>
        </div>
      )
    }
  }

  const statusConfig = {
    DRAFT: {
      icon: FileEdit,
      label: 'Draft',
      className: 'text-muted-foreground',
    },
    GENERATING: {
      icon: Loader2,
      label: 'Generating slides…',
      className: 'text-primary animate-spin',
    },
    COMPLETED: {
      icon: CheckCircle2,
      label: 'Ready',
      className: 'text-green-500',
    },
    FAILED: {
      icon: XCircle,
      label: 'Generation failed',
      className: 'text-destructive',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`size-4 ${config.className}`} />
      <span className={status === 'GENERATING' ? 'text-primary' : ''}>
        {config.label}
      </span>
    </div>
  )
}
