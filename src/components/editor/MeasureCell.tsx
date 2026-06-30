import { useState } from 'react'
import type { Measure } from '@/types'
import { ChordSlot } from './ChordSlot'
import { PlacedSymbol } from './PlacedSymbol'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { getMeasureWidth } from '@/utils/layout'
import { formatChordName } from '@/utils/chord'

function RepeatBarGhost({ type }: { type: 'start' | 'end' }) {
  const amber = 'rgba(226, 168, 62, 0.3)'
  const darkAmber = 'rgba(226, 168, 62, 0.25)'
  const dotAmber = 'rgba(226, 168, 62, 0.35)'

  if (type === 'start') {
    return (
      <div className="flex items-center gap-[1px]">
        <div className="w-[2px] h-7" style={{ background: darkAmber }} />
        <div className="w-[1px] h-7" style={{ background: amber }} />
        <div className="flex flex-col gap-[3px]">
          <div className="w-1 h-1 rounded-full" style={{ background: dotAmber }} />
          <div className="w-1 h-1 rounded-full" style={{ background: dotAmber }} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-[1px]">
      <div className="flex flex-col gap-[3px]">
        <div className="w-1 h-1 rounded-full" style={{ background: dotAmber }} />
        <div className="w-1 h-1 rounded-full" style={{ background: dotAmber }} />
      </div>
      <div className="w-[1px] h-7" style={{ background: amber }} />
      <div className="w-[2px] h-7" style={{ background: darkAmber }} />
    </div>
  )
}

interface Props {
  measure: Measure
  systemId: string
  sectionId: string
  onClick: () => void
}

export function MeasureCell({ measure, systemId, sectionId, onClick }: Props) {
  const [editingRepeatCount, setEditingRepeatCount] = useState(false)
  const [repeatCountDraft, setRepeatCountDraft] = useState(measure.repeatCount ?? 2)

  const { removeMeasure, addChord, updateMeasure } = useDocumentStore()
  const { symbolToPlace, setSymbolToPlace, setToolMode, dragOverMeasureId, activeDragType, activeDragSymbolId } = useUIStore()

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
        case 'repeatCount': updates.repeatCount = measure.repeatCount === null ? 2 : null; break
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
      className="relative flex-1 cursor-pointer group transition-all duration-150 rounded-sm"
      style={(isOver || dragOverMeasureId === measure.id) ? {
        background: 'rgba(226, 168, 62, 0.15)',
        boxShadow: 'inset 0 0 0 3px var(--accent), 0 0 16px var(--accent-glow)',
        zIndex: 5,
      } : undefined}
      onClick={handleClick}
    >
      {/* Hover outline */}
      <div data-export-hide className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          border: '1px solid rgba(226, 168, 62, 0.3)',
          background: 'rgba(226, 168, 62, 0.06)',
        }}
      />

      {/* Delete button */}
      <button
        data-export-hide
        onClick={handleDelete}
        className="absolute top-0.5 right-0.5 z-20 w-5 h-5 flex items-center justify-center rounded-full opacity-20 hover:opacity-100 transition-all"
        style={{ color: '#000' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = 'rgba(192,57,43,0.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#000'; e.currentTarget.style.background = 'transparent' }}
        title="Delete measure"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Symbols above measure */}
      <div className="absolute top-0 left-0 right-0 flex justify-center gap-1 z-10" style={{ marginTop: -20 }}>
        {measure.fermata && (
          <PlacedSymbol symbolId="fermata" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-sm" style={{ color: '#000' }}>𝄐</span>
          </PlacedSymbol>
        )}
        {measure.segno && (
          <PlacedSymbol symbolId="segno" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-xs font-bold" style={{ color: '#000' }}>𝄉</span>
          </PlacedSymbol>
        )}
        {measure.coda && (
          <PlacedSymbol symbolId="coda" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-xs font-bold" style={{ color: '#000' }}>𝄌</span>
          </PlacedSymbol>
        )}
        {measure.rehearsalMark && (
          <PlacedSymbol symbolId="rehearsalMark" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-[10px] font-bold border px-1 rounded" style={{ borderColor: 'rgba(0,0,0,0.2)', color: '#000' }}>
              {measure.rehearsalMark}
            </span>
          </PlacedSymbol>
        )}
      </div>

      {/* Ending brackets */}
      {(measure.firstEnding || measure.secondEnding) && (
        <div className="absolute top-0 left-0 right-0 z-10" style={{ marginTop: -16 }}>
          <div className="h-3 mx-1" style={{ borderTop: '1px solid rgba(0,0,0,0.3)', borderLeft: '1px solid rgba(0,0,0,0.3)' }} />
          <div className="text-[10px] font-medium text-center flex justify-center gap-1" style={{ marginTop: -18, marginLeft: 4, color: '#000' }}>
            {measure.firstEnding && (
              <PlacedSymbol symbolId="firstEnding" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
                <span>1.</span>
              </PlacedSymbol>
            )}
            {measure.secondEnding && (
              <PlacedSymbol symbolId="secondEnding" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
                <span>2.</span>
              </PlacedSymbol>
            )}
          </div>
        </div>
      )}

      {/* Repeat count — top-right outside bar */}
      {measure.repeatCount !== null && (
        <div className="absolute z-10" style={{ top: -30, right: -15 }}>
          <PlacedSymbol symbolId="repeatCount" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            {editingRepeatCount ? (
              <input
                type="number"
                min={1}
                max={99}
                value={repeatCountDraft}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setRepeatCountDraft(isNaN(val) ? 1 : Math.max(1, Math.min(99, val)))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateMeasure(sectionId, systemId, measure.id, { repeatCount: repeatCountDraft })
                    setEditingRepeatCount(false)
                  }
                  if (e.key === 'Escape') setEditingRepeatCount(false)
                  e.stopPropagation()
                }}
                onBlur={() => {
                  updateMeasure(sectionId, systemId, measure.id, { repeatCount: repeatCountDraft })
                  setEditingRepeatCount(false)
                }}
                autoFocus
                className="w-8 text-center text-[11px] font-bold border rounded px-0.5"
                style={{ color: '#000', borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}
              />
            ) : (
              <span
                onClick={(e) => {
                  if (symbolToPlace) return
                  e.stopPropagation()
                  setRepeatCountDraft(measure.repeatCount ?? 2)
                  setEditingRepeatCount(true)
                }}
                className="text-[11px] font-bold cursor-pointer select-none"
                style={{ color: '#000' }}
                title="Click to edit repetition count"
              >
                x{measure.repeatCount}
              </span>
            )}
          </PlacedSymbol>
        </div>
      )}

      {/* Fine / D.C. / D.S. below */}
      <div className="absolute bottom-0 left-0 right-0 text-center z-10" style={{ marginBottom: -18 }}>
        {measure.fine && (
          <PlacedSymbol symbolId="fine" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-[10px] font-bold" style={{ color: '#000' }}>Fine</span>
          </PlacedSymbol>
        )}
        {measure.dcAlFine && (
          <PlacedSymbol symbolId="dcAlFine" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-[10px] font-bold" style={{ color: '#000' }}>D.C. al Fine</span>
          </PlacedSymbol>
        )}
        {measure.dsAlCoda && (
          <PlacedSymbol symbolId="dsAlCoda" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <span className="text-[10px] font-bold" style={{ color: '#000' }}>D.S. al Coda</span>
          </PlacedSymbol>
        )}
      </div>

      {/* Repeat symbols */}
      {measure.repeatStart && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center z-10" style={{ marginLeft: -8 }}>
          <PlacedSymbol symbolId="repeatStart" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <div className="flex items-center gap-[1px]">
              <div className="w-[2px] h-7" style={{ background: '#000' }} />
              <div className="w-[1px] h-7" style={{ background: '#000' }} />
              <div className="flex flex-col gap-[3px]">
                <div className="w-1 h-1 rounded-full" style={{ background: '#000' }} /><div className="w-1 h-1 rounded-full" style={{ background: '#000' }} />
              </div>
            </div>
          </PlacedSymbol>
        </div>
      )}
      {measure.repeatEnd && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10" style={{ marginRight: -8 }}>
          <PlacedSymbol symbolId="repeatEnd" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <div className="flex items-center gap-[1px]">
              <div className="flex flex-col gap-[3px]">
                <div className="w-1 h-1 rounded-full" style={{ background: '#000' }} /><div className="w-1 h-1 rounded-full" style={{ background: '#000' }} />
              </div>
              <div className="w-[1px] h-7" style={{ background: '#000' }} />
              <div className="w-[2px] h-7" style={{ background: '#000' }} />
            </div>
          </PlacedSymbol>
        </div>
      )}

      {/* Double barline */}
      {measure.doubleBarline && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-10" style={{ marginRight: -4 }}>
          <PlacedSymbol symbolId="doubleBarline" sectionId={sectionId} systemId={systemId} measureId={measure.id}>
            <div className="flex gap-[2px]">
              <div className="w-[2px] h-7" style={{ background: '#000' }} /><div className="w-[2px] h-7" style={{ background: '#000' }} />
            </div>
          </PlacedSymbol>
        </div>
      )}

      {/* Ghost preview for symbol drags — positioned exactly where symbol will land */}
      {dragOverMeasureId === measure.id && (activeDragType === 'symbol' || activeDragType === 'placed-symbol') && activeDragSymbolId && (
        <>
          {/* repeatStart ghost — left edge */}
          {(activeDragSymbolId === 'repeatStart') && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center z-30 pointer-events-none" style={{ marginLeft: -8 }}>
              <RepeatBarGhost type="start" />
            </div>
          )}
          {/* repeatEnd ghost — right edge */}
          {(activeDragSymbolId === 'repeatEnd') && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center z-30 pointer-events-none" style={{ marginRight: -8 }}>
              <RepeatBarGhost type="end" />
            </div>
          )}
          {/* doubleBarline ghost — right edge */}
          {(activeDragSymbolId === 'doubleBarline') && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center z-30 pointer-events-none" style={{ marginRight: -4 }}>
              <div className="flex gap-[2px]">
                <div className="w-[2px] h-7 bg-amber-400/30" />
                <div className="w-[2px] h-7 bg-amber-400/30" />
              </div>
            </div>
          )}
          {/* Above-measure ghosts: fermata, segno, coda */}
          {(activeDragSymbolId === 'fermata' || activeDragSymbolId === 'segno' || activeDragSymbolId === 'coda') && (
            <div className="absolute top-0 left-0 right-0 flex justify-center z-30 pointer-events-none" style={{ marginTop: -20 }}>
              <span style={{ fontSize: 18, opacity: 0.35, color: 'var(--accent)' }}>
                {activeDragSymbolId === 'fermata' ? '𝄐' : activeDragSymbolId === 'segno' ? '𝄉' : '𝄌'}
              </span>
            </div>
          )}
          {/* 1st/2nd ending ghost — above */}
          {(activeDragSymbolId === 'firstEnding' || activeDragSymbolId === 'secondEnding') && (
            <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none" style={{ marginTop: -16 }}>
              <div className="border-t border-l border-amber-400/30 h-3 mx-1" />
              <div className="text-[10px] font-medium text-center text-amber-400/30" style={{ marginTop: -18, marginLeft: 4 }}>
                {activeDragSymbolId === 'firstEnding' ? '1.' : '2.'}
              </div>
            </div>
          )}
          {/* repeatCount ghost — top-right */}
          {(activeDragSymbolId === 'repeatCount') && (
            <div className="absolute z-30 pointer-events-none" style={{ top: -30, right: -15 }}>
              <span className="text-[11px] font-bold text-amber-400/35">x2</span>
            </div>
          )}
          {/* Below-measure ghosts: fine, dc, ds */}
          {(activeDragSymbolId === 'fine' || activeDragSymbolId === 'dcAlFine' || activeDragSymbolId === 'dsAlCoda') && (
            <div className="absolute bottom-0 left-0 right-0 text-center z-30 pointer-events-none" style={{ marginBottom: -18 }}>
              <span className="font-bold text-amber-400/30" style={{ fontSize: 10, opacity: 0.35 }}>
                {activeDragSymbolId === 'fine' ? 'Fine' : activeDragSymbolId === 'dcAlFine' ? 'D.C. al Fine' : 'D.S. al Coda'}
              </span>
            </div>
          )}
        </>
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
