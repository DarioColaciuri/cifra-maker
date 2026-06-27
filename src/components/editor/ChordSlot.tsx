import type { Chord as ChordType } from '@/types'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { chordToParts } from '@/utils/chord'
import { useAudioPreview } from '@/hooks/useAudioPreview'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  chord: ChordType
  sectionId: string
  systemId: string
  measureId: string
  scale?: number
}

export function ChordSlot({ chord, sectionId, systemId, measureId, scale = 1 }: Props) {
  const openChordBuilder = useUIStore((s) => s.openChordBuilder)
  const setSelectedChord = useUIStore((s) => s.setSelectedChord)
  const { previewChord } = useAudioPreview()
  const document = useDocumentStore((s) => s.document)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chord.id,
    data: {
      type: 'chord',
      chord,
      sectionId,
      systemId,
      measureId,
    },
  })

  const parts = chordToParts(chord)
  const useSymbols = document.notationStyle === 'symbols'

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 10,
  }

  const rootSize = Math.round((chord.fontSize || 15) * scale)
  const superSize = Math.max(5, Math.round(rootSize * 0.55))
  const superTop = -Math.round(rootSize * 0.48)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedChord(chord.id, { sectionId, systemId, measureId })
    previewChord(chord)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openChordBuilder({ sectionId, systemId, measureId, chordId: chord.id })
  }

  const formatQuality = (q: string): string => {
    if (!useSymbols) return q
    if (q === 'dim') return '\u00B0'
    if (q === 'aug') return '+'
    return q
  }

  const formatExtension = (ext: string): string => {
    if (!useSymbols) return ext
    if (ext === 'maj7') return '\u0394\u2077'
    if (ext === 'maj9') return '\u0394\u2079'
    if (ext === 'm7b5') return '\u00F8'
    return ext
      .replace(/7/g, '\u2077')
      .replace(/9/g, '\u2079')
      .replace(/11/g, '\u00B9\u00B9')
      .replace(/13/g, '\u00B9\u00B3')
      .replace(/6/g, '\u2076')
      .replace(/5/g, '\u2075')
      .replace(/b/g, '\u266D')
      .replace(/#/g, '\u266F')
  }

  const hasSuper = parts.qualitySuffix || parts.extensionText

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing select-none group px-1 rounded hover:bg-blue-50/50 transition-colors"
      onClick={handleClick}
      onDoubleClick={handleEdit}
      title={`${parts.root + parts.qualitySuffix + parts.extensionText + parts.bassText} (drag to reorder, double-click to edit)`}
    >
      <div className="text-center leading-none inline-block">
        <span className="font-bold text-gray-900 align-baseline" style={{ fontSize: rootSize }}>
          {chord.root}
        </span>
        {hasSuper && (
          <span className="font-normal text-gray-700 relative" style={{ fontSize: superSize, top: superTop }}>
            {parts.qualitySuffix && formatQuality(parts.qualitySuffix)}
            {parts.extensionText && chord.extensions.map(formatExtension).join('')}
          </span>
        )}
      </div>
      {parts.bassText && (
        <div className="text-center text-gray-500 leading-none" style={{ fontSize: superSize }}>
          {parts.bassText}
        </div>
      )}
    </div>
  )
}
