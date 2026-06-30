import { useState, useMemo, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import type { Chord, ChordQuality } from '@/types'
import { useAudioPreview } from '@/hooks/useAudioPreview'
import { WHITE_KEYS, BLACK_KEYS, QUALITIES, EXTENSIONS } from '@/constants'
import { formatChordName } from '@/utils/chord'
import { useDraggable } from '@dnd-kit/core'

const WHITE_KEY_W = 26
const WHITE_KEY_H = 80
const BLACK_KEY_W = 18
const BLACK_KEY_H = 50

const BLACK_POSITIONS: { note: string; left: number }[] = [
  { note: 'C#/Db', left: 19 },
  { note: 'D#/Eb', left: 45 },
  { note: 'F#/Gb', left: 97 },
  { note: 'G#/Ab', left: 123 },
  { note: 'A#/Bb', left: 149 },
]

const labelStyle: React.CSSProperties = { color: 'var(--text-ui-dim)', fontSize: 10, fontWeight: 500, marginBottom: 4, display: 'block' }

export function ChordPanel() {
  const { previewChord, previewNote } = useAudioPreview()

  const [root, setRoot] = useState('C')
  const [quality, setQuality] = useState<ChordQuality>('major')
  const [extensions, setExtensions] = useState<string[]>([])
  const [bass, setBass] = useState<string | null>(null)
  const [showCustomExt, setShowCustomExt] = useState(false)
  const [customExtValue, setCustomExtValue] = useState('')
  const [sharpPref, setSharpPref] = useState<Record<string, 'sharp' | 'flat'>>({
    'C#': 'sharp', 'D#': 'sharp', 'F#': 'sharp', 'G#': 'sharp', 'A#': 'sharp',
  })

  const chord = useMemo((): Chord => ({
    id: uuid(),
    root,
    quality,
    extensions,
    bass,
  }), [root, quality, extensions, bass])

  useEffect(() => {
    previewChord(chord)
  }, [root, quality, extensions, bass])

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'sidebar-chord',
    data: { type: 'new-chord', chord },
  })

  const dragStyle: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
  }

  const getBlackNoteDisplay = (bk: typeof BLACK_KEYS[number]) => {
    const pref = sharpPref[bk.sharp] || 'sharp'
    return pref === 'sharp' ? bk.sharp : bk.flat
  }

  const isBlackSelected = (note: string) => {
    if (root === note) return true
    for (const bk of BLACK_KEYS) {
      if (root === bk.sharp && note === bk.flat) return true
      if (root === bk.flat && note === bk.sharp) return true
    }
    return false
  }

  const totalWidth = WHITE_KEYS.length * WHITE_KEY_W

  return (
    <div className="space-y-3 py-1">
      {/* Piano keyboard */}
      <div>
        <label style={labelStyle}>Root: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{root}</span></label>
        <div className="mx-auto relative rounded-md overflow-hidden" style={{ width: totalWidth, height: WHITE_KEY_H + 8, background: 'rgba(0,0,0,0.2)' }}>
          {/* White keys */}
          <div className="absolute inset-0 flex">
            {WHITE_KEYS.map((key) => {
              const active = root === key
              return (
                <button
                  key={key}
                  onClick={() => { setRoot(key); previewNote(key) }}
                  className="flex items-end justify-center pb-1 transition-all duration-150"
                  style={{
                    width: WHITE_KEY_W,
                    height: WHITE_KEY_H,
                    background: active ? 'var(--accent-soft)' : 'rgba(240,238,230,0.95)',
                    borderRight: '1px solid rgba(0,0,0,0.15)',
                    borderBottom: '1px solid rgba(0,0,0,0.15)',
                    color: active ? 'var(--accent)' : '#444',
                  }}
                >
                  <span className="text-[8px] font-bold">{key}</span>
                </button>
              )
            })}
          </div>
          {/* Black keys on top */}
          {BLACK_KEYS.map((bk, idx) => {
            const note = getBlackNoteDisplay(bk)
            const selected = isBlackSelected(note)
            return (
              <button
                key={bk.sharp}
                onClick={() => { setRoot(note); previewNote(note) }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setSharpPref((prev) => ({ ...prev, [bk.sharp]: prev[bk.sharp] === 'sharp' ? 'flat' : 'sharp' }))
                }}
                className="absolute top-0 rounded-b-[2px] flex flex-col items-center justify-end pb-0.5 transition-all z-10"
                style={{
                  left: BLACK_POSITIONS[idx].left,
                  width: BLACK_KEY_W,
                  height: BLACK_KEY_H,
                  background: selected ? 'var(--accent)' : '#1a1a2e',
                  border: selected ? '1px solid var(--accent-dim)' : '1px solid rgba(0,0,0,0.4)',
                }}
                title={`${bk.sharp}/${bk.flat} (right-click)`}
              >
                <span className="text-[7px] text-white font-medium leading-tight">{note}</span>
                <span className="text-[6px] leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {note === bk.sharp ? bk.flat : bk.sharp}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quality */}
      <div>
        <label style={labelStyle}>Quality</label>
        <div className="flex flex-wrap gap-1">
          {QUALITIES.map(({ value, label }) => {
            const active = quality === value
            return (
              <button
                key={value}
                onClick={() => setQuality(value as ChordQuality)}
                className="px-1.5 py-0.5 text-[10px] rounded-md border transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border-ui)',
                  color: active ? 'var(--accent)' : 'var(--text-ui-dim)',
                  background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Extensions */}
      <div>
        <label style={labelStyle}>Extensions</label>
        <div className="flex flex-wrap gap-0.5">
          {EXTENSIONS.map((ext) => {
            const active = extensions.includes(ext)
            return (
              <button
                key={ext}
                onClick={() => setExtensions((prev) => prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext])}
                className="px-1 py-0.5 text-[9px] rounded-md border transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border-ui)',
                  color: active ? 'var(--accent)' : 'var(--text-ui-dim)',
                  background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {ext}
              </button>
            )
          })}
          {extensions.filter((e) => !(EXTENSIONS as readonly string[]).includes(e)).map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[9px] rounded-md border border-dashed"
              style={{
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
                background: 'var(--accent-soft)',
              }}
            >
              {ext}
              <button
                onClick={() => setExtensions((prev) => prev.filter((e) => e !== ext))}
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
                  if (val && !extensions.includes(val)) setExtensions((prev) => [...prev, val])
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
              className="px-1 py-0.5 text-[9px] rounded-md border border-dashed transition-all duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: 'var(--border-ui)',
                color: 'var(--text-ui-dim)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              + Custom
            </button>
          )}
        </div>
      </div>

      {/* Bass Note */}
      <div>
        <label style={labelStyle}>Bass: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{bass || 'none'}</span></label>
        <div className="flex flex-wrap gap-0.5">
          {((): (string | { key: string; sharp: string; flat: string })[] => {
            const blackBySharp: Record<string, typeof BLACK_KEYS[number]> = {}
            for (const bk of BLACK_KEYS) blackBySharp[bk.sharp] = bk
            const entries: (string | { key: string; sharp: string; flat: string })[] = []
            for (const n of ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']) {
              if (blackBySharp[n]) entries.push({ key: blackBySharp[n].sharp, sharp: blackBySharp[n].sharp, flat: blackBySharp[n].flat })
              else entries.push(n)
            }
            return entries
          })().map((entry) => {
            const isBlack = typeof entry !== 'string'
            const noteSharp = isBlack ? entry.sharp : entry
            const displayNote = isBlack
              ? (sharpPref[entry.sharp] || 'sharp') === 'sharp' ? entry.sharp : entry.flat
              : entry
            const altNote = isBlack
              ? (sharpPref[entry.sharp] || 'sharp') === 'sharp' ? entry.flat : entry.sharp
              : null
            const active = isBlack
              ? bass === entry.sharp || bass === entry.flat
              : bass === noteSharp
            return (
              <button
                key={noteSharp}
                onClick={() => setBass(active ? null : displayNote)}
                onContextMenu={(e) => {
                  if (isBlack) {
                    e.preventDefault()
                    setSharpPref((prev) => ({
                      ...prev,
                      [entry.sharp]: prev[entry.sharp] === 'sharp' ? 'flat' : 'sharp',
                    }))
                  }
                }}
                className="px-1 py-0.5 text-[8px] rounded-md border transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  borderColor: active ? 'var(--accent)' : 'var(--border-ui)',
                  color: active ? 'var(--accent)' : 'var(--text-ui-dim)',
                  background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
                }}
                title={isBlack ? `right-click to toggle ${entry.sharp}/${entry.flat}` : undefined}
              >
                {displayNote}
                {altNote && (
                  <span style={{ fontSize: 6, color: 'var(--text-ui-dim)', opacity: 0.5, marginLeft: 1 }}>{altNote}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Draggable chord chip */}
      <div
        ref={setNodeRef}
        style={dragStyle}
        {...attributes}
        {...listeners}
        className="w-full flex items-center justify-center py-2 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all select-none animate-pulse-glow"
        onClick={() => previewChord(chord)}
      >
        <span className="text-sm font-bold tracking-wide" style={{ color: 'var(--accent)' }}>
          {formatChordName(chord)}
        </span>
        <span className="text-[9px] ml-2" style={{ color: 'var(--text-ui-dim)' }}>
          drag to measure
        </span>
      </div>
    </div>
  )
}
