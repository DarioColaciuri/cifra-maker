import { useState, useEffect, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import type { Chord, ChordQuality } from '@/types'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { useAudioPreview } from '@/hooks/useAudioPreview'
import { PianoKeyboard } from './PianoKeyboard'
import { QualitySelector } from './QualitySelector'
import { ExtensionSelector } from './ExtensionSelector'
import { ChordRenderer } from './ChordRenderer'
import { formatChordName } from '@/utils/chord'

export function ChordBuilderModal() {
  const { chordBuilderTarget, closeChordBuilder } = useUIStore()
  const { addChord, updateChord, document } = useDocumentStore()
  const { previewChord } = useAudioPreview()

  // Find existing chord if editing
  const existingChord = chordBuilderTarget?.chordId && chordBuilderTarget
    ? document.sections
        .find((s) => s.id === chordBuilderTarget.sectionId)
        ?.systems.find((sys) => sys.id === chordBuilderTarget.systemId)
        ?.measures.find((m) => m.id === chordBuilderTarget.measureId)
        ?.chords.find((c) => c.id === chordBuilderTarget.chordId)
    : null

  const [root, setRoot] = useState(existingChord?.root || 'C')
  const [quality, setQuality] = useState<ChordQuality>(existingChord?.quality || 'major')
  const [extensions, setExtensions] = useState<string[]>(existingChord?.extensions || [])
  const [bass, setBass] = useState<string | null>(existingChord?.bass || null)
  const [sharpPreference, setSharpPreference] = useState<Record<string, 'sharp' | 'flat'>>({
    'C#': 'sharp', 'D#': 'sharp', 'F#': 'sharp', 'G#': 'sharp', 'A#': 'sharp',
  })

  const chordId = useMemo(() => existingChord?.id || uuid(), [existingChord?.id])

  const chord: Chord = {
    id: chordId,
    root,
    quality,
    extensions,
    bass,
  }

  useEffect(() => {
    previewChord(chord)
  }, [root, quality, extensions, bass, previewChord])

  const handleSave = () => {
    if (!chordBuilderTarget) return
    if (existingChord) {
      updateChord(
        chordBuilderTarget.sectionId,
        chordBuilderTarget.systemId,
        chordBuilderTarget.measureId,
        existingChord.id,
        { root, quality, extensions, bass },
      )
    } else {
      addChord(
        chordBuilderTarget.sectionId,
        chordBuilderTarget.systemId,
        chordBuilderTarget.measureId,
        chord,
      )
    }
    closeChordBuilder()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) closeChordBuilder() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {existingChord ? 'Edit Chord' : 'Add Chord'}
          </h2>
          <button
            onClick={closeChordBuilder}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Live Preview */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-500">Preview:</span>
            <ChordRenderer chord={chord} />
            <span className="text-xs text-gray-400 font-mono">{formatChordName(chord)}</span>
          </div>

          {/* Piano Keyboard - Root Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Root Note: <span className="text-blue-600">{root}</span>
            </label>
            <PianoKeyboard
              selectedRoot={root}
              onSelectRoot={setRoot}
              sharpPreference={sharpPreference}
              onTogglePreference={(key) => {
                setSharpPreference((prev) => ({
                  ...prev,
                  [key]: prev[key] === 'sharp' ? 'flat' : 'sharp',
                }))
              }}
            />
          </div>

          {/* Quality Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Quality</label>
            <QualitySelector selected={quality} onSelect={setQuality} />
          </div>

          {/* Extensions */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Extensions</label>
            <ExtensionSelector selected={extensions} onToggle={(ext) => {
              setExtensions((prev) =>
                prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
              )
            }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            onClick={closeChordBuilder}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            {existingChord ? 'Update' : 'Add Chord'}
          </button>
        </div>
      </div>
    </div>
  )
}
