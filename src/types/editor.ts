export type ToolMode = 'select' | 'addSection' | 'addMeasure' | 'addSymbol'

export interface SelectionState {
  selectedSectionIds: string[]
  selectedSystemIds: string[]
  selectedMeasureIds: string[]
  selectedChordIds: string[]
}

export interface ClipboardItem {
  type: 'section' | 'system' | 'measure' | 'chord'
  data: unknown
}

export interface HistoryEntry {
  description: string
  timestamp: number
  undo: () => void
  redo: () => void
}
