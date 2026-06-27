import { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, closestCenter } from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import { AppShell } from '@/components/layout/AppShell'
import { A4Page } from '@/components/layout/A4Page'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { RightSidebar } from '@/components/sidebar/RightSidebar'
import { EditorCanvas } from '@/components/editor/EditorCanvas'
import { ChordBuilderModal } from '@/components/chord/ChordBuilderModal'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAutosave } from '@/hooks/useAutosave'
import { useUIStore } from '@/stores/uiStore'
import { useDocumentStore } from '@/stores/documentStore'
import { formatChordName } from '@/utils/chord'
import type { Chord } from '@/types'

function DragPreview({ chord }: { chord: Chord }) {
  return (
    <div
      className="px-3 py-1.5 rounded-lg font-bold text-sm"
      style={{
        background: 'var(--bg-sidebar)',
        color: 'var(--accent)',
        border: '2px solid var(--accent)',
        boxShadow: '0 0 20px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {formatChordName(chord)}
    </div>
  )
}

interface DragData {
  type: string
  chord?: Chord
  sectionId?: string
  systemId?: string
  measureId?: string
  chordIndex?: number
  symbolId?: string
}

export default function App() {
  useKeyboardShortcuts()
  useAutosave()

  const { chordBuilderOpen } = useUIStore()
  const { addChord, moveChord, reorderChords } = useDocumentStore()
  const [activeChord, setActiveChord] = useState<Chord | null>(null)
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined
    if (data?.chord) setActiveChord(data.chord)
    else if (data?.type === 'symbol' && data?.symbolId) {
      setActiveSymbol(data.symbolId)
      useUIStore.getState().setActiveDragInfo('symbol', data.symbolId)
    }
    else if (data?.type === 'placed-symbol' && data?.symbolId) {
      useUIStore.getState().setActiveDragInfo('placed-symbol', data.symbolId)
    }
    else if (data?.type === 'new-chord') {
      useUIStore.getState().setActiveDragInfo('new-chord', null)
    }
    else if (data?.type === 'chord') {
      useUIStore.getState().setActiveDragInfo('chord', null)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const overData = event.over?.data.current as DragData | undefined
    useUIStore.getState().setDragOverMeasure(overData?.measureId || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    useUIStore.getState().setDragOverMeasure(null)
    useUIStore.getState().setActiveDragInfo(null, null)
    setActiveChord(null)
    setActiveSymbol(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as DragData | undefined
    const overData = over.data.current as DragData | undefined
    if (!activeData) return

    // CASE 1: New chord from sidebar dropped on a measure (or chord)
    if (activeData.type === 'new-chord') {
      if (overData?.type === 'measure' || overData?.type === 'chord') {
        addChord(overData.sectionId!, overData.systemId!, overData.measureId!, activeData.chord!)
      }
      return
    }

    // CASE 2: Existing chord being moved
    if (activeData.type === 'chord') {
      const fromSectionId = activeData.sectionId!
      const fromSystemId = activeData.systemId!
      const fromMeasureId = activeData.measureId!

      // CASE 2a: Dropped on another chord (within same or different measure)
      if (overData?.type === 'chord') {
        const toSectionId = overData.sectionId!
        const toSystemId = overData.systemId!
        const toMeasureId = overData.measureId!

        const sameMeasure = fromMeasureId === toMeasureId

        if (sameMeasure) {
          // Reorder within same measure
          const doc = useDocumentStore.getState().document
          const section = doc.sections.find((s) => s.id === toSectionId)
          if (!section) return
          const system = section.systems.find((sys) => sys.id === toSystemId)
          if (!system) return
          const measure = system.measures.find((m) => m.id === toMeasureId)
          if (!measure) return
          const fromIdx = measure.chords.findIndex((c) => c.id === active.id)
          const toIdx = measure.chords.findIndex((c) => c.id === over.id)
          if (fromIdx !== -1 && toIdx !== -1) {
            reorderChords(toSectionId, toSystemId, toMeasureId, fromIdx, toIdx)
          }
        } else {
          // Move to different measure, insert at target chord's position
          const doc = useDocumentStore.getState().document
          const section = doc.sections.find((s) => s.id === toSectionId)
          if (!section) return
          const system = section.systems.find((sys) => sys.id === toSystemId)
          if (!system) return
          const measure = system.measures.find((m) => m.id === toMeasureId)
          if (!measure) return
          const toIdx = measure.chords.findIndex((c) => c.id === over.id)
          moveChord(
            { sectionId: fromSectionId, systemId: fromSystemId, measureId: fromMeasureId, chordId: active.id as string },
            { sectionId: toSectionId, systemId: toSystemId, measureId: toMeasureId, index: toIdx }
          )
        }
        return
      }

      // CASE 2b: Dropped on a measure (empty space in measure)
      if (overData?.type === 'measure') {
        const sameMeasure = fromMeasureId === overData.measureId!
        if (sameMeasure) {
          // Same measure — move to end
          const doc = useDocumentStore.getState().document
          const section = doc.sections.find((s) => s.id === overData.sectionId!)
          if (!section) return
          const system = section.systems.find((sys) => sys.id === overData.systemId!)
          if (!system) return
          const measure = system.measures.find((m) => m.id === overData.measureId!)
          if (!measure) return
          const fromIdx = measure.chords.findIndex((c) => c.id === active.id)
          if (fromIdx !== -1 && fromIdx < measure.chords.length - 1) {
            reorderChords(overData.sectionId!, overData.systemId!, overData.measureId!, fromIdx, measure.chords.length - 1)
          }
        } else {
          // Different measure — move to end
          moveChord(
            { sectionId: fromSectionId, systemId: fromSystemId, measureId: fromMeasureId, chordId: active.id as string },
            { sectionId: overData.sectionId!, systemId: overData.systemId!, measureId: overData.measureId! }
          )
        }
        return
      }
    }

    // CASE 3: Symbol dropped on a measure or chord (from sidebar)
    if (activeData.type === 'symbol' && activeData.symbolId) {
      if (overData?.type === 'measure' || overData?.type === 'chord') {
        const symbolId = activeData.symbolId
        const doc = useDocumentStore.getState().document
        const section = doc.sections.find((s) => s.id === overData.sectionId!)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === overData.systemId!)
        if (!system) return
        const measure = system.measures.find((m) => m.id === overData.measureId!)
        if (!measure) return

        const updates: Record<string, boolean | number | string | null> = {}
        switch (symbolId) {
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
          const store = useDocumentStore.getState()
          store.updateMeasure(overData.sectionId!, overData.systemId!, overData.measureId!, updates)
        }
      }
      return
    }

    // CASE 4: Placed symbol dragged to another measure (move symbol)
    if (activeData.type === 'placed-symbol' && activeData.symbolId) {
      if (overData?.type === 'measure' || overData?.type === 'chord') {
        const symbolId = activeData.symbolId
        const fromSectionId = activeData.sectionId as string
        const fromSystemId = activeData.systemId as string
        const fromMeasureId = activeData.measureId as string

        const toSectionId = overData.sectionId as string
        const toSystemId = overData.systemId as string
        const toMeasureId = overData.measureId as string

        // Don't do anything if dropping on same measure
        if (fromMeasureId === toMeasureId) return

        const store = useDocumentStore.getState()
        // Remove from source
        store.updateMeasure(fromSectionId, fromSystemId, fromMeasureId, { [symbolId]: false })
        // Add to target
        store.updateMeasure(toSectionId, toSystemId, toMeasureId, { [symbolId]: true })
      }
      return
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <AppShell>
        <Sidebar />
        <A4Page>
          <EditorCanvas />
        </A4Page>
        <RightSidebar />
      </AppShell>
      {chordBuilderOpen && <ChordBuilderModal />}
      <DragOverlay dropAnimation={null}>
        {activeChord ? <DragPreview chord={activeChord} /> : null}
        {activeSymbol ? (
          <div className="px-3 py-1.5 rounded-lg text-lg"
            style={{
              background: 'var(--bg-sidebar)',
              color: 'var(--accent)',
              border: '2px solid var(--accent)',
              boxShadow: '0 0 20px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {activeSymbol === 'repeatStart' ? '𝄆' : activeSymbol === 'repeatEnd' ? '𝄇' :
             activeSymbol === 'doubleBarline' ? '𝄁' : activeSymbol === 'fermata' ? '𝄐' :
             activeSymbol === 'fine' ? '𝄂' : activeSymbol === 'dcAlFine' ? 'D.C. al Fine' :
             activeSymbol === 'dsAlCoda' ? 'D.S. al Coda' : activeSymbol === 'coda' ? '𝄌' :
             activeSymbol === 'segno' ? '𝄉' : activeSymbol === 'firstEnding' ? '1.' : '2.'}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
