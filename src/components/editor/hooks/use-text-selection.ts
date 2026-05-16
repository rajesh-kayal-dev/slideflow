import { useState, useEffect, useCallback } from 'react'

export function useTextSelection() {
  const [selection, setSelection] = useState<{
    text: string
    rect: DOMRect | null
    range: Range | null
  }>({
    text: '',
    rect: null,
    range: null,
  })

  const handleSelection = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setSelection({ text: '', rect: null, range: null })
      return
    }

    const range = sel.getRangeAt(0)
    const text = sel.toString().trim()
    
    if (text) {
      const rect = range.getBoundingClientRect()
      setSelection({ text, rect, range })
    } else {
      setSelection({ text: '', rect: null, range: null })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('keyup', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('keyup', handleSelection)
    }
  }, [handleSelection])

  return selection
}
