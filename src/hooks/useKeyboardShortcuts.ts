import { useEffect } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'

export function useKeyboardShortcuts() {
  const { undo, redo, removeSection } = useDocumentStore()
  const {
    selectedSectionIds,
    closeChordBuilder,
    chordBuilderOpen,
    clearSelection,
  } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
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
        e.preventDefault()
        if (chordBuilderOpen) {
          closeChordBuilder()
        }
        clearSelection()
        return
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (chordBuilderOpen) return
        e.preventDefault()
        for (const id of selectedSectionIds) {
          removeSection(id)
        }
        clearSelection()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, selectedSectionIds, chordBuilderOpen, closeChordBuilder, removeSection, clearSelection])
}
