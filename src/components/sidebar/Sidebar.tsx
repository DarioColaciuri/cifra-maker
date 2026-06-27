import { useState } from 'react'
import { SectionPanel } from './SectionPanel'
import { MeasurePanel } from './MeasurePanel'
import { ChordPanel } from './ChordPanel'
import { SymbolPanel } from './SymbolPanel'
import { ExportPanel } from './ExportPanel'

const PANELS = [
  { id: 'section', label: 'Sections', icon: 'S', Component: SectionPanel },
  { id: 'measure', label: 'Measures', icon: 'M', Component: MeasurePanel },
  { id: 'chord', label: 'Chords', icon: 'C', Component: ChordPanel },
  { id: 'symbol', label: 'Symbols', icon: '♫', Component: SymbolPanel },
  { id: 'export', label: 'Export', icon: 'E', Component: ExportPanel },
]

export function Sidebar() {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set(['chord']))

  const togglePanel = (id: string) => {
    setOpenPanels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div
      className="w-[260px] h-full flex flex-col flex-shrink-0 select-none overflow-y-auto"
      style={{
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
            }}
          >
            ♪
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide" style={{ color: '#e8e8f0' }}>
              Cifra Maker
            </h1>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-ui-dim)' }}>
              chord chart editor
            </p>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1">
        {PANELS.map(({ id, label, icon, Component }, idx) => {
          const isOpen = openPanels.has(id)
          return (
            <div
              key={id}
              className="animate-fade-up"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                animationDelay: `${idx * 40}ms`,
              }}
            >
              <button
                onClick={() => togglePanel(id)}
                className="w-full px-4 py-2.5 text-left flex items-center justify-between group"
                style={{ transition: 'background var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-sidebar-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: isOpen ? 'var(--accent-soft)' : 'rgba(255,255,255,0.04)',
                      color: isOpen ? 'var(--accent)' : 'var(--text-ui-dim)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {icon}
                  </span>
                  <span
                    className="text-xs font-medium tracking-wide"
                    style={{
                      color: isOpen ? '#d0d0e0' : 'var(--text-ui-dim)',
                      transition: 'color var(--transition-fast)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{
                    color: 'var(--text-ui-dim)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform var(--transition-smooth)',
                  }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <Component />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div
        className="px-4 py-2.5 flex-shrink-0"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-ui-dim)' }}>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded text-[8px]" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘Z</kbd>
            undo
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded text-[8px]" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘⇧Z</kbd>
            redo
          </span>
        </div>
      </div>
    </div>
  )
}
