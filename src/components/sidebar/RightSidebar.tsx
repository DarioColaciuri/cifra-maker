import { useState } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { QUALITIES, EXTENSIONS, CHORD_DURATIONS, BLACK_KEYS, FONT_FAMILIES } from '@/constants'
import type { ChordQuality, ChordDuration } from '@/types'
import { DURATION_FRACTIONS } from '@/types'

const uiInputClass = "w-full px-2 py-1.5 text-xs rounded-md border transition-all"
const uiBtnActive = "px-1.5 py-0.5 text-[10px] rounded-md border transition-all"
const uiLabelClass = "text-[10px] font-medium block mb-1 tracking-wide"

export function RightSidebar() {
  const document = useDocumentStore((s) => s.document)
  const { updateTitle, updateSubtitle, updateSectionSpacing, updateSectionLabel, setNotationStyle, updateChord, updateSectionGap, updatePageTopMargin, updateTitleSectionGap } = useDocumentStore()
  const { selectedSectionIds, selectedChordIds, selectedChordContext, clearSelection } = useUIStore()

  const [showCustomExt, setShowCustomExt] = useState(false)
  const [customExtValue, setCustomExtValue] = useState('')
  const [sharpPref, setSharpPref] = useState<Record<string, 'sharp' | 'flat'>>({
    'C#': 'sharp', 'D#': 'sharp', 'F#': 'sharp', 'G#': 'sharp', 'A#': 'sharp',
  })

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
          {/* Title */}
          <div className="space-y-2">
            <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Title</label>
            <input
              type="text"
              value={document.title.text}
              onChange={(e) => updateTitle({ text: e.target.value })}
              placeholder="Enter title..."
              className={uiInputClass}
              style={inputStyle}
            />
            <div className="flex gap-2">
              <select
                value={document.title.fontFamily}
                onChange={(e) => updateTitle({ fontFamily: e.target.value })}
                className="flex-1 text-[10px] px-1.5 py-1 rounded-md border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-ui)', color: 'var(--text-ui)' }}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f} style={{ background: 'var(--bg-sidebar)' }}>{f}</option>
                ))}
              </select>
              <input
                type="number"
                value={document.title.fontSize}
                onChange={(e) => updateTitle({ fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 12)) })}
                className="w-14 text-[10px] px-1.5 py-1 rounded-md border text-center"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-ui)', color: 'var(--text-ui)' }}
                min={8} max={72}
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Subtitle</label>
            <input
              type="text"
              value={document.subtitle.text}
              onChange={(e) => updateSubtitle({ text: e.target.value })}
              placeholder="Enter subtitle..."
              className={uiInputClass}
              style={inputStyle}
            />
            <div className="flex gap-2">
              <select
                value={document.subtitle.fontFamily}
                onChange={(e) => updateSubtitle({ fontFamily: e.target.value })}
                className="flex-1 text-[10px] px-1.5 py-1 rounded-md border"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-ui)', color: 'var(--text-ui)' }}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f} style={{ background: 'var(--bg-sidebar)' }}>{f}</option>
                ))}
              </select>
              <input
                type="number"
                value={document.subtitle.fontSize}
                onChange={(e) => updateSubtitle({ fontSize: Math.max(8, Math.min(72, Number(e.target.value) || 12)) })}
                className="w-14 text-[10px] px-1.5 py-1 rounded-md border text-center"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-ui)', color: 'var(--text-ui)' }}
                min={8} max={72}
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
            {selectedChord.root}{selectedChord.quality !== 'major' ? selectedChord.quality : ''}{selectedChord.extensions.join('')}{selectedChord.bass ? '/' + selectedChord.bass : ''}
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
                {selectedChord!.extensions.filter((e) => !(EXTENSIONS as readonly string[]).includes(e)).map((ext) => (
                  <span
                    key={ext}
                    className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] rounded-md border border-dashed"
                    style={{ ...btnActive }}
                  >
                    {ext}
                    <button
                      onClick={() => {
                        const newExts = selectedChord!.extensions.filter((e) => e !== ext)
                        updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { extensions: newExts })
                      }}
                      className="text-[10px] leading-none opacity-60 hover:opacity-100"
                    >
                      x
                    </button>
                  </span>
                ))}
                {showCustomExt ? (
                  <input
                    type="text"
                    value={customExtValue}
                    onChange={(e) => setCustomExtValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = customExtValue.trim()
                        if (val && !selectedChord!.extensions.includes(val)) {
                          const newExts = [...selectedChord!.extensions, val]
                          updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { extensions: newExts })
                        }
                        setCustomExtValue('')
                        setShowCustomExt(false)
                      }
                      if (e.key === 'Escape') { setShowCustomExt(false); setCustomExtValue('') }
                    }}
                    onBlur={() => { if (!customExtValue.trim()) { setShowCustomExt(false); setCustomExtValue('') } }}
                    autoFocus
                    placeholder="custom..."
                    className="w-14 px-1 py-0.5 text-[9px] rounded-md border bg-transparent outline-none"
                    style={{ borderColor: 'var(--accent)', color: 'var(--text-ui)' }}
                  />
                ) : (
                  <button
                    onClick={() => setShowCustomExt(true)}
                    className="px-1 py-0.5 text-[9px] rounded-md border border-dashed transition-all duration-200 hover:-translate-y-0.5"
                    style={{ ...btnBase }}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: btnBase.background, borderColor: btnBase.borderColor })}
                  >
                    + Custom
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Bass Note</label>
              <div className="flex flex-wrap gap-0.5">
                {(() => {
                  const blackBySharp: Record<string, typeof BLACK_KEYS[number]> = {}
                  for (const bk of BLACK_KEYS) blackBySharp[bk.sharp] = bk
                  const entries: ({ key: string; sharp: string; flat: string } | string)[] = []
                  for (const n of ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']) {
                    if (blackBySharp[n]) entries.push({ key: blackBySharp[n].sharp, sharp: blackBySharp[n].sharp, flat: blackBySharp[n].flat })
                    else entries.push(n)
                  }
                  return entries.map((entry) => {
                    const isBlack = typeof entry !== 'string'
                    const noteKey = isBlack ? (entry as { key: string }).key : entry as string
                    const noteSharp = isBlack ? (entry as { sharp: string }).sharp : entry as string
                    const displayNote = isBlack
                      ? (sharpPref[noteSharp] || 'sharp') === 'sharp' ? noteSharp : (entry as { flat: string }).flat
                      : entry as string
                    const active = isBlack
                      ? selectedChord!.bass === noteSharp || selectedChord!.bass === (entry as { flat: string }).flat
                      : selectedChord!.bass === entry
                    return (
                      <button
                        key={noteKey}
                        onClick={() => updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { bass: active ? null : displayNote })}
                        onContextMenu={(e) => {
                          if (isBlack) {
                            e.preventDefault()
                            setSharpPref((prev) => ({
                              ...prev,
                              [noteSharp]: prev[noteSharp] === 'sharp' ? 'flat' : 'sharp',
                            }))
                          }
                        }}
                        className="px-1 py-0.5 text-[8px] rounded-md border transition-all duration-200 hover:-translate-y-0.5"
                        style={active ? { ...btnActive } : { ...btnBase }}
                        onMouseEnter={(e) => { if (!active) Object.assign(e.currentTarget.style, btnHover) }}
                        onMouseLeave={(e) => { if (!active) Object.assign(e.currentTarget.style, { background: btnBase.background, borderColor: btnBase.borderColor }) }}
                        title={isBlack ? `right-click to toggle ${noteSharp}/${(entry as { flat: string }).flat}` : undefined}
                      >
                        {displayNote}
                      </button>
                    )
                  })
                })()}
              </div>
            </div>

            <div>
              <label className={uiLabelClass} style={{ color: 'var(--text-ui-dim)' }}>Duration</label>
              <div className="flex flex-wrap gap-1">
                {CHORD_DURATIONS.map(({ value, label }) => {
                  const active = (selectedChord!.duration || 'none') === value
                  const otherChordsTotal = (() => {
                    if (!selectedChordContext || !selectedChord) return 0
                    const section = document.sections.find((s) => s.id === selectedChordContext.sectionId)
                    if (!section) return 0
                    const system = section.systems.find((sys) => sys.id === selectedChordContext.systemId)
                    if (!system) return 0
                    const measure = system.measures.find((m) => m.id === selectedChordContext.measureId)
                    if (!measure) return 0
                    return measure.chords
                      .filter((c) => c.id !== selectedChord.id)
                      .reduce((sum, c) => sum + DURATION_FRACTIONS[c.duration || 'none'], 0)
                  })()
                  const optionFraction = DURATION_FRACTIONS[value as ChordDuration]
                  const disabled = !active && optionFraction > 0 && otherChordsTotal + optionFraction > 1
                  return (
                    <button
                      key={value}
                      onClick={() => updateChord(selectedChordContext!.sectionId, selectedChordContext!.systemId, selectedChordContext!.measureId, selectedChord!.id, { duration: value as ChordDuration })}
                      className={uiBtnActive}
                      disabled={disabled}
                      style={{
                        ...(active ? { ...btnActive } : { ...btnBase }),
                        ...(disabled ? { opacity: 0.3, cursor: 'not-allowed' } : {}),
                      }}
                      onMouseEnter={(e) => { if (!active && !disabled) Object.assign(e.currentTarget.style, btnHover) }}
                      onMouseLeave={(e) => { if (!active && !disabled) Object.assign(e.currentTarget.style, { background: btnBase.background, borderColor: btnBase.borderColor }) }}
                    >
                      {label}
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
