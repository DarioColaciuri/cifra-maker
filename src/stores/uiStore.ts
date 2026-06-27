import { create } from 'zustand'
import type { ToolMode, Chord } from '@/types'

interface UIState {
  zoom: number
  activeSidebarPanel: string | null
  chordBuilderOpen: boolean
  chordBuilderTarget: {
    sectionId: string
    systemId: string
    measureId: string
    chordId?: string
  } | null
  toolMode: ToolMode
  selectedSectionIds: string[]
  selectedSystemIds: string[]
  selectedMeasureIds: string[]
  selectedChordIds: string[]
  selectedChordContext: { sectionId: string; systemId: string; measureId: string } | null
  symbolToPlace: string | null

  // Chord placement mode (from sidebar)
  currentChord: Chord | null
  addChordToMeasure: boolean

  setZoom: (zoom: number) => void
  setActiveSidebarPanel: (panel: string | null) => void
  openChordBuilder: (target: { sectionId: string; systemId: string; measureId: string; chordId?: string }) => void
  closeChordBuilder: () => void
  setToolMode: (mode: ToolMode) => void
  setSelectedSection: (id: string | null) => void
  setSelectedMeasure: (id: string | null) => void
  setSelectedChord: (id: string | null, context?: { sectionId: string; systemId: string; measureId: string }) => void
  clearSelection: () => void
  setSymbolToPlace: (symbol: string | null) => void

  // Chord placement
  setCurrentChord: (chord: Chord | null) => void
  setAddChordToMeasure: (active: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  zoom: 1,
  activeSidebarPanel: 'document',
  chordBuilderOpen: false,
  chordBuilderTarget: null,
  toolMode: 'select',
  selectedSectionIds: [],
  selectedSystemIds: [],
  selectedMeasureIds: [],
  selectedChordIds: [],
  selectedChordContext: null,
  symbolToPlace: null,
  currentChord: null,
  addChordToMeasure: false,

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),
  openChordBuilder: (target) => set({ chordBuilderOpen: true, chordBuilderTarget: target }),
  closeChordBuilder: () => set({ chordBuilderOpen: false, chordBuilderTarget: null }),
  setToolMode: (mode) => set({ toolMode: mode }),
  setSelectedSection: (id) => set({ selectedSectionIds: id ? [id] : [], selectedChordIds: [], selectedChordContext: null }),
  setSelectedMeasure: (id) => set({ selectedMeasureIds: id ? [id] : [] }),
  setSelectedChord: (id, context) => set({
    selectedChordIds: id ? [id] : [],
    selectedChordContext: context || null,
    selectedSectionIds: id ? [] : undefined,
  }),
  clearSelection: () => set({
    selectedSectionIds: [],
    selectedSystemIds: [],
    selectedMeasureIds: [],
    selectedChordIds: [],
    selectedChordContext: null,
  }),
  setSymbolToPlace: (symbol) => set({ symbolToPlace: symbol }),
  setCurrentChord: (chord) => set({ currentChord: chord }),
  setAddChordToMeasure: (active) => set({ addChordToMeasure: active }),
}))
