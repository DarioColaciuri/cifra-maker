import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { QUALITIES, EXTENSIONS } from '@/constants'
import type { ChordQuality } from '@/types'

const uiInputClass = "w-full px-2 py-1.5 text-xs rounded-md border transition-all"
const uiBtnActive = "px-1.5 py-0.5 text-[10px] rounded-md border transition-all"
const uiLabelClass = "text-[10px] font-medium block mb-1 tracking-wide"

export function RightSidebar() {
  const document = useDocumentStore((s) => s.document)
  const { updateTitle, updateSubtitle, updateSectionSpacing, updateSectionLabel, setNotationStyle, updateChord, updateSectionGap, updatePageTopMargin, updateTitleSectionGap } = useDocumentStore()
  const { selectedSectionIds, selectedChordIds, selectedChordContext, clearSelection } = useUIStore()

  const selectedSection = selectedSectionIds[0]
    ? document.sections.find((s) => s.id === selectedSectionIds[0])
    : null

  let selectedChord = null
  if (selectedChordIds.length > 0 && selectedChordContext) {
    const section = document.sections.find((s) => s.id === selectedChordContext.sectionId)
    if (section) {
      const system = section.systems.find((sys) => sys.id === selectedChordContext.systemId)
      if (system) {
        const measure = system.measures.find((m) => m.id === selectedChordContext.measureId)
        if (measure) {
          selectedChord = measure.chords.find((c) => c.id === selectedChordIds[0]) || null
        }
      }
    }
  }

  const hasSelection = selectedSection || selectedChord

  const sidebarStyle = {
    background: 'var(--bg-sidebar)',
    borderLeft: '1px solid var(--border-subtle)',
  }
  const headerBorder = { borderBottom: '1px solid var(--border-subtle)' }
  const sectionStyle = { borderTop: '1px solid var(--border-subtle)' }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'var(--border-ui)',
    color: 'var(--text-ui)',
  }
  const btnBase = {
    borderColor: 'var(--border-ui)',
    color: 'var(--text-ui-dim)',
    background: 'rgba(255,255,255,0.02)',
  }
  const btnActive = {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
  }
  const btnHover = {
    background: 'var(--bg-sidebar-hover)',
    borderColor: 'var(--accent)',
  }

  // No selection: show page-level settings
  if (!hasSelection) {
    return (
      <div className="w-[260px] h-full flex flex-col flex-shrink-0 select-none" style={sidebarStyle}>
        <div className="px-4 py-4 flex-shrink-0" style={headerBorder}>
          <h2 className="text-xs font-semibold tracking-wide" style={{ color: '#d0d0e0' }}>
            Page Settings
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Title & Subtitle */}
          <div className="space-y-3">
            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Title</label>
              <input
                type="text"
                value={document.title.text}
                onChange={(e) => updateTitle({ text: e.target.value })}
                placeholder="Enter title..."
                className={uiInputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Subtitle</label>
              <input
                type="text"
                value={document.subtitle.text}
                onChange={(e) => updateSubtitle({ text: e.target.value })}
                placeholder="Enter subtitle..."
                className={uiInputClass}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Notation</label>
            <div className="flex gap-1.5">
              {(['symbols', 'text'] as const).map((s) => {
                const active = document.notationStyle === s
                return (
                  <button
                    key={s}
                    onClick={() => setNotationStyle(s)}
                    className="flex-1 text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
                    style={active ? { ...btnActive } : { ...btnBase }}
                    onMouseEnter={(e) => { if (!active) Object.assign(e.currentTarget.style, btnHover) }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = btnBase.background }}
                    title={s === 'symbols' ? 'Jazz notation' : 'Standard notation'}
                  >
                    <div className="text-[10px] font-semibold">{s === 'symbols' ? 'Jazz Symbols' : 'Standard Text'}</div>
                    <div style={{ fontSize: 8, opacity: 0.6 }}>{s === 'symbols' ? 'Δ ♭ ♯ ø' : 'maj7 b5 m7b5'}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px]" style={{ color: 'var(--text-ui-dim)' }}>Top Margin</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-ui-dim)' }}>{document.pageTopMargin}px</span>
                </div>
                <input type="range" min={20} max={150} step={4} value={document.pageTopMargin} onChange={(e) => updatePageTopMargin(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px]" style={{ color: 'var(--text-ui-dim)' }}>Title → Section</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-ui-dim)' }}>{document.titleSectionGap}px</span>
                </div>
                <input type="range" min={8} max={120} step={4} value={document.titleSectionGap} onChange={(e) => updateTitleSectionGap(Number(e.target.value))} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[260px] h-full flex flex-col flex-shrink-0 select-none" style={sidebarStyle}>
      <div className="px-4 py-4 flex-shrink-0" style={headerBorder}>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wide" style={{ color: '#d0d0e0' }}>
            Properties
          </h2>
          <button
            onClick={clearSelection}
            className="text-[10px] hover:underline transition-colors"
            style={{ color: 'var(--text-ui-dim)' }}
          >
            deselect
          </button>
        </div>
        {selectedSection && (
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--accent)' }}>
            {selectedSection.label}
          </p>
        )}
        {selectedChord && (
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'var(--accent)' }}>
            {selectedChord.root}{selectedChord.quality !== 'major' ? selectedChord.quality : ''}{selectedChord.extensions.join('')}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Section properties */}
        {selectedSection && (
          <>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Section Label</label>
              <input
                type="text"
                value={selectedSection.label}
                onChange={(e) => updateSectionLabel(selectedSection.id, e.target.value)}
                className={uiInputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>System Spacing</label>
                <span className="text-[10px]" style={{ color: 'var(--text-ui-dim)' }}>
                  {selectedSection.systemSpacing}px
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={80}
                step={1}
                value={selectedSection.systemSpacing}
                onChange={(e) => updateSectionSpacing(selectedSection.id, Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Gap before section</label>
                <span className="text-[10px]" style={{ color: 'var(--text-ui-dim)' }}>
                  {selectedSection.sectionSpacing}px
                </span>
              </div>
                <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={selectedSection.sectionSpacing}
                onChange={(e) => updateSectionGap(selectedSection.id, Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Lyrics</label>
              <textarea
                value={selectedSection.lyrics.join('\n')}
                onChange={(e) => {
                  const store = useDocumentStore.getState()
                  store.updateSectionLyrics(selectedSection.id, e.target.value.split('\n'))
                }}
                placeholder="One line per system..."
                className={`${uiInputClass} resize-none h-16 text-[10px]`}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {/* Chord properties */}
        {selectedChord && selectedChordContext && (
          <div className="space-y-4" style={sectionStyle}>
            <div className="pt-4">
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Chord Root</label>
              <input
                type="text"
                value={selectedChord.root}
                onChange={(e) => updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { root: e.target.value })}
                className={uiInputClass}
                style={inputStyle}
              />
            </div>

            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Quality</label>
              <div className="flex flex-wrap gap-1">
                {QUALITIES.map(({ value, label }) => {
                  const active = selectedChord!.quality === value
                  return (
                    <button
                      key={value}
                      onClick={() => updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { quality: value as ChordQuality })}
                      className={uiBtnActive}
                      style={active ? { ...btnActive } : { ...btnBase }}
                      onMouseEnter={(e) => { if (!active) Object.assign(e.currentTarget.style, btnHover) }}
                      onMouseLeave={(e) => { if (!active) Object.assign(e.currentTarget.style, { background: btnBase.background, borderColor: btnBase.borderColor }) }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Extensions</label>
              <div className="flex flex-wrap gap-0.5">
                {EXTENSIONS.map((ext) => {
                  const active = selectedChord!.extensions.includes(ext)
                  return (
                    <button
                      key={ext}
                      onClick={() => {
                        const newExts = active
                          ? selectedChord!.extensions.filter((e) => e !== ext)
                          : [...selectedChord!.extensions, ext]
                        updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { extensions: newExts })
                      }}
                      className="px-1 py-0.5 text-[9px] rounded-md border transition-all duration-200 hover:-translate-y-0.5"
                      style={active ? { ...btnActive } : { ...btnBase }}
                      onMouseEnter={(e) => { if (!active) Object.assign(e.currentTarget.style, btnHover) }}
                      onMouseLeave={(e) => { if (!active) Object.assign(e.currentTarget.style, { background: btnBase.background, borderColor: btnBase.borderColor }) }}
                    >
                      {ext}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Font Size</label>
                <span className="text-[10px]" style={{ color: 'var(--text-ui-dim)' }}>
                  {selectedChord.fontSize || 15}px
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={28}
                step={1}
                value={selectedChord.fontSize || 15}
                onChange={(e) => updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { fontSize: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <button
              onClick={() => {
                const store = useDocumentStore.getState()
                store.removeChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id)
                clearSelection()
              }}
              className="w-full text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
              }}
            >
              Delete Chord
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
