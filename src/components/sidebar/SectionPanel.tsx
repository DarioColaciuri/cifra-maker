import { useState } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { SECTION_PRESETS } from '@/constants'

const btnStyle = {
  borderColor: 'var(--border-ui)',
  color: 'var(--text-ui)',
  background: 'rgba(255,255,255,0.03)',
}
const btnHover = {
  background: 'var(--bg-sidebar-hover)',
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
}
const sectionBg = { background: 'rgba(255,255,255,0.03)' }
const inputStyle = {
  background: 'transparent',
  color: 'var(--text-ui)',
  border: 'none',
}

export function SectionPanel() {
  const sections = useDocumentStore((s) => s.document.sections)
  const { addSection, removeSection, updateSectionLabel, updateSectionLyrics } = useDocumentStore()
  const [showPresets, setShowPresets] = useState(false)
  const [expandedLyrics, setExpandedLyrics] = useState<Set<string>>(new Set())

  return (
    <div className="space-y-1.5 py-1">
      {sections.map((section) => (
        <div key={section.id} className="rounded-md p-2 space-y-1" style={sectionBg}>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-ui-dim)' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z"/>
            </svg>
            <input
              type="text"
              value={section.label}
              onChange={(e) => updateSectionLabel(section.id, e.target.value)}
              className="flex-1 text-xs font-medium outline-none"
              style={inputStyle}
            />
            <button
              onClick={() => removeSection(section.id)}
              className="opacity-30 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-ui-dim)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-ui-dim)')}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <button
            onClick={() => setExpandedLyrics((prev) => {
              const n = new Set(prev); n.has(section.id) ? n.delete(section.id) : n.add(section.id); return n
            })}
            className="text-[10px] transition-colors"
            style={{ color: 'var(--text-ui-dim)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-ui-dim)')}
          >
            {expandedLyrics.has(section.id) ? '− lyrics' : '+ lyrics'}
          </button>
          {expandedLyrics.has(section.id) && (
            <textarea
              value={section.lyrics.join('\n')}
              onChange={(e) => updateSectionLyrics(section.id, e.target.value.split('\n'))}
              placeholder="One line per system..."
              className="w-full text-[10px] rounded p-1.5 resize-none h-14"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-ui)', color: 'var(--text-ui)' }}
            />
          )}
        </div>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full text-[10px] py-1.5 rounded-md border border-dashed transition-all duration-200 hover:-translate-y-0.5"
          style={btnStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
        >
          + Add Section
        </button>
        {showPresets && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl z-30 py-1 overflow-hidden animate-fade-up"
            style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-ui)', boxShadow: 'var(--shadow-card)' }}
          >
            {SECTION_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { addSection(preset); setShowPresets(false) }}
                className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                style={{ color: 'var(--text-ui)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-ui)' }}
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
