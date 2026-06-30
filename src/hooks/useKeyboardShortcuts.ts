import { useEffect } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'

export function useKeyboardShortcuts() {
  const { undo, redo } = useDocumentStore()
  const {
    selectedSectionIds,
    selectedSystemIds,
    selectedMeasureIds,
    selectedChordIds,
    selectedChordContext,
    closeChordBuilder,
    chordBuilderOpen,
    clearSelection,
  } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+Z -> Undo
      if (ctrl && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      // Ctrl+Shift+Z or Ctrl+Y -> Redo
      if ((ctrl && e.shiftKey && e.key === 'z') || (ctrl && e.key === 'y')) {
        e.preventDefault()
        redo()
        return
      }

      // Escape
      if (e.key === 'Escape') {
        if (isInput) return
        e.preventDefault()
        if (chordBuilderOpen) {
          closeChordBuilder()
        }
        clearSelection()
        return
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isInput) return
        if (chordBuilderOpen) return
        e.preventDefault()

        const store = useDocumentStore.getState()
        const doc = store.document

        // Delete selected chords
        if (selectedChordIds.length > 0 && selectedChordContext) {
          for (const chordId of selectedChordIds) {
            store.removeChord(
              selectedChordContext.sectionId,
              selectedChordContext.systemId,
              selectedChordContext.measureId,
              chordId,
            )
          }
          clearSelection()
          return
        }

        // Delete selected measures
        if (selectedMeasureIds.length > 0) {
          for (const section of doc.sections) {
            for (const system of section.systems) {
              for (const measure of system.measures) {
                if (selectedMeasureIds.includes(measure.id)) {
                  store.removeMeasure(section.id, system.id, measure.id)
                }
              }
            }
          }
          clearSelection()
          return
        }

        // Delete selected systems
        if (selectedSystemIds.length > 0) {
          for (const section of doc.sections) {
            for (const system of section.systems) {
              if (selectedSystemIds.includes(system.id)) {
                store.removeSystem(section.id, system.id)
              }
            }
          }
          clearSelection()
          return
        }

        // Delete selected sections
        for (const id of selectedSectionIds) {
          store.removeSection(id)
        }
        clearSelection()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedSectionIds, selectedSystemIds, selectedMeasureIds, selectedChordIds, selectedChordContext, chordBuilderOpen, closeChordBuilder, clearSelection])
}
