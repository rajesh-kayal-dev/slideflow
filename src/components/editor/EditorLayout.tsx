/** 
 * EditorLayout — full-viewport 3-panel shell
 * Left: slide list  |  Center: canvas  |  Right: AI panel
 * Top: topbar
 */
export function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bgDark2 font-sans text-primaryText selection:bg-primaryColor selection:text-white">
      {children}
    </div>
  )
}

export function EditorPanelRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {children}
    </div>
  )
}
