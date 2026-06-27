import type { Measure } from '@/types'
import { ChordSlot } from './ChordSlot'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { getMeasureWidth } from '@/utils/layout'
import { formatChordName } from '@/utils/chord'

interface Props {
  measure: Measure
  systemId: string
  sectionId: string
  onClick: () => void
}

export function MeasureCell({ measure, systemId, sectionId, onClick }: Props) {
  const { removeMeasure, updateMeasure } = useDocumentStore()
  const { symbolToPlace, setSymbolToPlace, setToolMode } = useUIStore()

  const droppableId = `${sectionId}--${systemId}--${measure.id}`

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: 'measure',
      sectionId,
      systemId,
      measureId: measure.id,
    },
  })

  const chordIds = measure.chords.map((c) => c.id)

  // Calculate scale factor to fit chords within measure width
  const measureWidth = getMeasureWidth() - 12 // account for dividers and padding
  let chordScale = 1
  if (measure.chords.length > 0) {
    const estimateChordWidth = (fs: number, name: string) => name.length * fs * 0.7 + 4
    const totalEstimated = measure.chords.reduce((sum, c) => {
      const name = formatChordName(c)
      return sum + estimateChordWidth(c.fontSize || 15, name)
    }, 0)
    if (totalEstimated > measureWidth) {
      chordScale = Math.max(0.4, measureWidth / totalEstimated)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (symbolToPlace) {
      e.stopPropagation()
      const updates: Record<string, boolean | number | string | null> = {}
      switch (symbolToPlace) {
        case 'repeatStart': updates.repeatStart = !measure.repeatStart; break
        case 'repeatEnd': updates.repeatEnd = !measure.repeatEnd; break
        case 'doubleBarline': updates.doubleBarline = !measure.doubleBarline; break
        case 'fermata': updates.fermata = !measure.fermata; break
        case 'fine': updates.fine = !measure.fine; break
        case 'dcAlFine': updates.dcAlFine = !measure.dcAlFine; break
        case 'dsAlCoda': updates.dsAlCoda = !measure.dsAlCoda; break
        case 'coda': updates.coda = !measure.coda; break
        case 'segno': updates.segno = !measure.segno; break
        case 'firstEnding': updates.firstEnding = !measure.firstEnding; break
        case 'secondEnding': updates.secondEnding = !measure.secondEnding; break
      }
      if (Object.keys(updates).length > 0) {
        updateMeasure(sectionId, systemId, measure.id, updates)
      }
      setSymbolToPlace(null)
      setToolMode('select')
      return
    }
    onClick()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeMeasure(sectionId, systemId, measure.id)
  }

  return (
    <div
      ref={setNodeRef}
      className="relative flex-1 cursor-pointer group transition-colors rounded-sm"
      style={isOver ? {
        background: 'rgba(226, 168, 62, 0.12)',
        boxShadow: 'inset 0 0 0 2px var(--accent), 0 0 12px var(--accent-glow)',
      } : undefined}
      onClick={handleClick}
    >
      {/* Hover outline */}
      <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          border: '1px solid rgba(226, 168, 62, 0.3)',
          background: 'rgba(226, 168, 62, 0.06)',
        }}
      />

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute top-0.5 right-0.5 z-20 w-5 h-5 flex items-center justify-center rounded-full opacity-20 hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-gray-500 transition-all"
        title="Delete measure"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Symbols above measure */}
      <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 z-10" style={{ marginTop: -20 }}>
        {measure.fermata && <span className="text-sm text-gray-700" title="Fermata">𝄐</span>}
        {measure.segno && <span className="text-xs font-bold text-gray-700" title="Segno">𝄉</span>}
        {measure.coda && <span className="text-xs font-bold text-gray-700" title="Coda">𝄌</span>}
        {measure.rehearsalMark && (
          <span className="text-[10px] font-bold border border-gray-300 px-1 rounded text-gray-600">{measure.rehearsalMark}</span>
        )}
      </div>

      {/* Ending brackets */}
      {(measure.firstEnding || measure.secondEnding) && (
        <div className="absolute top-0 left-0 right-0 z-10" style={{ marginTop: -16 }}>
          <div className="border-t border-l border-gray-500 h-3 mx-1" />
          <div className="text-[10px] text-gray-700 font-medium text-center" style={{ marginTop: -18, marginLeft: 4 }}>
            {measure.firstEnding && '1.'}
            {measure.secondEnding && '2.'}
          </div>
        </div>
      )}

      {/* Fine / D.C. / D.S. below */}
      <div className="absolute bottom-0 left-0 right-0 text-center z-10" style={{ marginBottom: -18 }}>
        {measure.fine && <span className="text-[10px] font-bold text-gray-700">Fine</span>}
        {measure.dcAlFine && <span className="text-[10px] font-bold text-gray-700">D.C. al Fine</span>}
        {measure.dsAlCoda && <span className="text-[10px] font-bold text-gray-700">D.S. al Coda</span>}
      </div>

      {/* Repeat symbols */}
      {measure.repeatStart && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10" style={{ marginLeft: -8 }}>
          <div className="flex items-center gap-[1px]">
            <div className="w-[2px] h-10 bg-gray-800" />
            <div className="w-[1px] h-10 bg-gray-300" />
            <div className="flex flex-col gap-[3px]">
              <div className="w-1 h-1 rounded-full bg-gray-800" /><div className="w-1 h-1 rounded-full bg-gray-800" />
            </div>
          </div>
        </div>
      )}
      {measure.repeatEnd && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10" style={{ marginRight: -8 }}>
          <div className="flex items-center gap-[1px]">
            <div className="flex flex-col gap-[3px]">
              <div className="w-1 h-1 rounded-full bg-gray-800" /><div className="w-1 h-1 rounded-full bg-gray-800" />
            </div>
            <div className="w-[1px] h-10 bg-gray-300" />
            <div className="w-[2px] h-10 bg-gray-800" />
          </div>
        </div>
      )}

      {/* Double barline */}
      {measure.doubleBarline && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10" style={{ marginRight: -4 }}>
          <div className="flex gap-[2px]">
            <div className="w-[2px] h-12 bg-gray-700" /><div className="w-[2px] h-12 bg-gray-700" />
          </div>
        </div>
      )}

      {/* Chords — sortable within the measure */}
      <SortableContext items={chordIds} strategy={rectSortingStrategy}>
        <div className="absolute inset-0 flex items-center justify-evenly px-1 z-10">
          {measure.chords.map((chord) => (
              <ChordSlot
                key={chord.id}
                chord={chord}
                sectionId={sectionId}
                systemId={systemId}
                measureId={measure.id}
                scale={chordScale}
              />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
