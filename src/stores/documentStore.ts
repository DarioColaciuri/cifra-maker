import { create } from 'zustand'
import { produce } from 'immer'
import { v4 as uuid } from 'uuid'
import type { CifraDocument, System, Measure, Chord, TextBlock, Project } from '@/types'
import { createDefaultDocument, createDefaultProject, createSection, createSystem, createEmptyMeasure, createChord } from '@/utils/defaults'
import { loadProject, saveProject } from '@/utils/persistence'

interface HistorySnapshot {
  document: CifraDocument
  description: string
  timestamp: number
}

interface DocumentState {
  project: Project
  document: CifraDocument
  history: HistorySnapshot[]
  historyIndex: number

  // Document actions
  setDocument: (doc: CifraDocument) => void
  newDocument: () => void
  updateTitle: (title: Partial<TextBlock>) => void
  updateSubtitle: (subtitle: Partial<TextBlock>) => void
  setNotationStyle: (style: CifraDocument['notationStyle']) => void
  updatePageTopMargin: (margin: number) => void
  updateTitleSectionGap: (gap: number) => void

  // Section actions
  addSection: (label?: string) => void
  removeSection: (sectionId: string) => void
  updateSectionLabel: (sectionId: string, label: string) => void
  updateSectionSpacing: (sectionId: string, spacing: number) => void
  updateSectionGap: (sectionId: string, gap: number) => void
  moveSection: (sectionId: string, newOrder: number) => void
  reorderSections: (fromIndex: number, toIndex: number) => void
  duplicateSection: (sectionId: string) => void
  updateSectionLyrics: (sectionId: string, lyrics: string[]) => void

  // System actions
  addSystem: (sectionId: string, afterSystemId?: string) => void
  removeSystem: (sectionId: string, systemId: string) => void

  // Measure actions
  addMeasure: (sectionId: string, systemId: string) => void
  addMeasures4: (sectionId: string) => void
  addSingleMeasure: (sectionId: string) => void
  removeMeasure: (sectionId: string, systemId: string, measureId: string) => void
  updateMeasure: (sectionId: string, systemId: string, measureId: string, updates: Partial<Measure>) => void

  // Chord actions
  addChord: (sectionId: string, systemId: string, measureId: string, chord: Chord) => void
  updateChord: (sectionId: string, systemId: string, measureId: string, chordId: string, updates: Partial<Chord>) => void
  removeChord: (sectionId: string, systemId: string, measureId: string, chordId: string) => void
  moveChord: (from: { sectionId: string; systemId: string; measureId: string; chordId: string }, to: { sectionId: string; systemId: string; measureId: string; index?: number }) => void
  reorderChords: (sectionId: string, systemId: string, measureId: string, fromIndex: number, toIndex: number) => void

  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Page actions
  createPage: () => void
  switchPage: (pageId: string) => void
  deletePage: (pageId: string) => void
  renamePage: (pageId: string, name: string) => void
  dismissWarning: () => void

  // Internal
  _saveToHistory: (description: string) => void
}

function initializeState(): { project: Project; document: CifraDocument } {
  const project = loadProject()
  const activePage = project.pages.find((p) => p.id === project.activePageId)
  if (activePage) return { project, document: activePage.data }
  if (project.pages.length > 0) {
    return { project, document: project.pages[0].data }
  }
  const defaultProject = createDefaultProject()
  return { project: defaultProject, document: defaultProject.pages[0].data }
}

export const useDocumentStore = create<DocumentState>((set, get) => {
  const initial = initializeState()

  return {
    project: initial.project,
    document: initial.document,
    history: [],
    historyIndex: -1,

    _saveToHistory: (description: string) => {
      const { document, history, historyIndex, project } = get()
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({
        document: JSON.parse(JSON.stringify(document)),
        description,
        timestamp: Date.now(),
      })
      if (newHistory.length > 100) newHistory.shift()
      const newIndex = newHistory.length - 1

      const updatedPages = project.pages.map((p) =>
        p.id === project.activePageId ? { ...p, data: JSON.parse(JSON.stringify(document)) } : p,
      )

      set({
        history: newHistory,
        historyIndex: newIndex,
        project: { ...project, pages: updatedPages },
      })
      saveProject(get().project)
    },

    setDocument: (doc) => set({ document: doc }),

    newDocument: () => {
      const defaultProject = createDefaultProject()
      set({
        project: defaultProject,
        document: defaultProject.pages[0].data,
        history: [],
        historyIndex: -1,
      })
      saveProject(defaultProject)
    },

    updateTitle: (title) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        Object.assign(draft.title, title)
      })
      set({ document: next })
      get()._saveToHistory('Update title')
    },

    updateSubtitle: (subtitle) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        Object.assign(draft.subtitle, subtitle)
      })
      set({ document: next })
      get()._saveToHistory('Update subtitle')
    },

    setNotationStyle: (style) => {
      const prev = get().document
      const next = produce(prev, (draft) => { draft.notationStyle = style })
      set({ document: next })
      get()._saveToHistory('Toggle notation style')
    },

    updatePageTopMargin: (margin) => {
      const prev = get().document
      const next = produce(prev, (draft) => { draft.pageTopMargin = margin })
      set({ document: next })
      get()._saveToHistory('Update page top margin')
    },

    updateTitleSectionGap: (gap) => {
      const prev = get().document
      const next = produce(prev, (draft) => { draft.titleSectionGap = gap })
      set({ document: next })
      get()._saveToHistory('Update title-section gap')
    },

    addSection: (label = 'Verse') => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const order = draft.sections.length
        draft.sections.push(createSection(label, order))
      })
      set({ document: next })
      get()._saveToHistory('Add section')
    },

    removeSection: (sectionId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        draft.sections = draft.sections.filter((s) => s.id !== sectionId)
        draft.sections.forEach((s, i) => { s.order = i })
      })
      set({ document: next })
      get()._saveToHistory('Remove section')
    },

    updateSectionLabel: (sectionId, label) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.label = label
      })
      set({ document: next })
      get()._saveToHistory('Update section label')
    },

    updateSectionSpacing: (sectionId, spacing) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.systemSpacing = spacing
      })
      set({ document: next })
      get()._saveToHistory('Update system spacing')
    },

    updateSectionGap: (sectionId, gap) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.sectionSpacing = gap
      })
      set({ document: next })
      get()._saveToHistory('Update section gap')
    },

    reorderSections: (fromIndex, toIndex) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const [moved] = draft.sections.splice(fromIndex, 1)
        draft.sections.splice(toIndex, 0, moved)
        draft.sections.forEach((s, i) => { s.order = i })
      })
      set({ document: next })
      get()._saveToHistory('Reorder sections')
    },

    duplicateSection: (sectionId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const idx = draft.sections.findIndex((s) => s.id === sectionId)
        if (idx === -1) return
        const original = JSON.parse(JSON.stringify(draft.sections[idx]))
        original.id = uuid()
        original.label = original.label + ' (copy)'
        original.order = draft.sections.length
        original.systems?.forEach((sys: System) => {
          sys.id = uuid()
          sys.measures?.forEach((m: Measure) => {
            m.id = uuid()
            m.chords?.forEach((c: Chord) => { c.id = uuid() })
          })
        })
        draft.sections.splice(idx + 1, 0, original)
        draft.sections.forEach((s, i) => { s.order = i })
      })
      set({ document: next })
      get()._saveToHistory('Duplicate section')
    },

    moveSection: (sectionId, newOrder) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const idx = draft.sections.findIndex((s) => s.id === sectionId)
        if (idx === -1) return
        const [section] = draft.sections.splice(idx, 1)
        draft.sections.splice(newOrder, 0, section)
        draft.sections.forEach((s, i) => { s.order = i })
      })
      set({ document: next })
      get()._saveToHistory('Move section')
    },

    updateSectionLyrics: (sectionId, lyrics) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.lyrics = lyrics
      })
      set({ document: next })
      get()._saveToHistory('Update lyrics')
    },

    addSystem: (sectionId, afterSystemId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        if (afterSystemId) {
          const idx = section.systems.findIndex((sys) => sys.id === afterSystemId)
          section.systems.splice(idx + 1, 0, createSystem())
        } else {
          section.systems.push(createSystem())
        }
      })
      set({ document: next })
      get()._saveToHistory('Add system')
    },

    removeSystem: (sectionId, systemId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.systems = section.systems.filter((sys) => sys.id !== systemId)
      })
      set({ document: next })
      get()._saveToHistory('Remove system')
    },

    addMeasure: (sectionId, systemId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        if (system.measures.length < 4) {
          system.measures.push(createEmptyMeasure())
        }
      })
      set({ document: next })
      get()._saveToHistory('Add measure')
    },

    addMeasures4: (sectionId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (section) section.systems.push(createSystem())
      })
      set({ document: next })
      get()._saveToHistory('Add 4 measures')
    },

    addSingleMeasure: (sectionId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        section.systems.push({
          id: uuid(),
          measures: [createEmptyMeasure()],
        })
      })
      set({ document: next })
      get()._saveToHistory('Add measure')
    },

    removeMeasure: (sectionId, systemId, measureId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        system.measures = system.measures.filter((m) => m.id !== measureId)
      })
      set({ document: next })
      get()._saveToHistory('Remove measure')
    },

    updateMeasure: (sectionId, systemId, measureId, updates) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        const measure = system.measures.find((m) => m.id === measureId)
        if (measure) Object.assign(measure, updates)
      })
      set({ document: next })
      get()._saveToHistory('Update measure')
    },

    addChord: (sectionId, systemId, measureId, chord) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        const measure = system.measures.find((m) => m.id === measureId)
        if (measure) measure.chords.push({ ...chord, id: chord.id || uuid() })
      })
      set({ document: next })
      get()._saveToHistory('Add chord')
    },

    updateChord: (sectionId, systemId, measureId, chordId, updates) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        const measure = system.measures.find((m) => m.id === measureId)
        if (!measure) return
        const chord = measure.chords.find((c) => c.id === chordId)
        if (chord) Object.assign(chord, updates)
      })
      set({ document: next })
      get()._saveToHistory('Update chord')
    },

    removeChord: (sectionId, systemId, measureId, chordId) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        const measure = system.measures.find((m) => m.id === measureId)
        if (!measure) return
        measure.chords = measure.chords.filter((c) => c.id !== chordId)
      })
      set({ document: next })
      get()._saveToHistory('Remove chord')
    },

    moveChord: (from, to) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const fromSection = draft.sections.find((s) => s.id === from.sectionId)
        if (!fromSection) return
        const fromSystem = fromSection.systems.find((sys) => sys.id === from.systemId)
        if (!fromSystem) return
        const fromMeasure = fromSystem.measures.find((m) => m.id === from.measureId)
        if (!fromMeasure) return
        const chordIdx = fromMeasure.chords.findIndex((c) => c.id === from.chordId)
        if (chordIdx === -1) return

        const [chord] = fromMeasure.chords.splice(chordIdx, 1)

        const toSection = draft.sections.find((s) => s.id === to.sectionId)
        if (!toSection) return
        const toSystem = toSection.systems.find((sys) => sys.id === to.systemId)
        if (!toSystem) return
        const toMeasure = toSystem.measures.find((m) => m.id === to.measureId)
        if (!toMeasure) return
        if (to.index !== undefined && to.index >= 0) {
          toMeasure.chords.splice(to.index, 0, chord)
        } else {
          toMeasure.chords.push(chord)
        }
      })
      set({ document: next })
      get()._saveToHistory('Move chord')
    },

    reorderChords: (sectionId, systemId, measureId, fromIndex, toIndex) => {
      const prev = get().document
      const next = produce(prev, (draft) => {
        const section = draft.sections.find((s) => s.id === sectionId)
        if (!section) return
        const system = section.systems.find((sys) => sys.id === systemId)
        if (!system) return
        const measure = system.measures.find((m) => m.id === measureId)
        if (!measure) return
        const [moved] = measure.chords.splice(fromIndex, 1)
        measure.chords.splice(toIndex, 0, moved)
      })
      set({ document: next })
      get()._saveToHistory('Reorder chords')
    },

    undo: () => {
      const { history, historyIndex, project } = get()
      if (historyIndex <= 0) return
      const newIndex = historyIndex - 1
      const snapshot = history[newIndex]
      const document = JSON.parse(JSON.stringify(snapshot.document)) as CifraDocument

      const updatedPages = project.pages.map((p) =>
        p.id === project.activePageId ? { ...p, data: JSON.parse(JSON.stringify(document)) } : p,
      )

      set({
        document,
        historyIndex: newIndex,
        project: { ...project, pages: updatedPages },
      })
      saveProject(get().project)
    },

    redo: () => {
      const { history, historyIndex, project } = get()
      if (historyIndex >= history.length - 1) return
      const newIndex = historyIndex + 1
      const snapshot = history[newIndex]
      const document = JSON.parse(JSON.stringify(snapshot.document)) as CifraDocument

      const updatedPages = project.pages.map((p) =>
        p.id === project.activePageId ? { ...p, data: JSON.parse(JSON.stringify(document)) } : p,
      )

      set({
        document,
        historyIndex: newIndex,
        project: { ...project, pages: updatedPages },
      })
      saveProject(get().project)
    },

    canUndo: () => get().historyIndex > 0,

    canRedo: () => get().historyIndex < get().history.length - 1,

    // Page management actions

    createPage: () => {
      const { project, document } = get()
      // Save current page data first
      const updatedPages = project.pages.map((p) =>
        p.id === project.activePageId ? { ...p, data: JSON.parse(JSON.stringify(document)) } : p,
      )

      const newId = uuid()
      const pageNum = updatedPages.length + 1
      const newPage = {
        id: newId,
        name: `Page ${pageNum}`,
        data: createDefaultDocument(newId),
        createdAt: Date.now(),
      }

      const newProject: Project = {
        ...project,
        pages: [...updatedPages, newPage],
        activePageId: newId,
      }

      set({
        project: newProject,
        document: newPage.data,
        history: [],
        historyIndex: -1,
      })
      saveProject(newProject)
    },

    switchPage: (pageId: string) => {
      const { project, document } = get()
      // Save current page data
      const updatedPages = project.pages.map((p) =>
        p.id === project.activePageId ? { ...p, data: JSON.parse(JSON.stringify(document)) } : p,
      )

      const targetPage = updatedPages.find((p) => p.id === pageId)
      if (!targetPage) return

      const newProject: Project = {
        ...project,
        pages: updatedPages,
        activePageId: pageId,
      }

      set({
        project: newProject,
        document: targetPage.data,
        history: [],
        historyIndex: -1,
      })
      saveProject(newProject)
    },

    deletePage: (pageId: string) => {
      const { project, document } = get()
      if (project.pages.length <= 1) return

      const updatedPages = project.pages
        .map((p) =>
          p.id === project.activePageId && p.id !== pageId
            ? { ...p, data: JSON.parse(JSON.stringify(document)) }
            : p,
        )
        .filter((p) => p.id !== pageId)

      const newActiveId = pageId === project.activePageId
        ? updatedPages[0].id
        : project.activePageId

      const targetPage = updatedPages.find((p) => p.id === newActiveId)

      const newProject: Project = {
        ...project,
        pages: updatedPages,
        activePageId: newActiveId,
      }

      set({
        project: newProject,
        document: targetPage ? targetPage.data : createDefaultDocument(),
        history: [],
        historyIndex: -1,
      })
      saveProject(newProject)
    },

    renamePage: (pageId: string, name: string) => {
      const { project } = get()
      const updatedPages = project.pages.map((p) =>
        p.id === pageId ? { ...p, name } : p,
      )

      const newProject: Project = {
        ...project,
        pages: updatedPages,
      }

      set({ project: newProject })
      saveProject(newProject)
    },

    dismissWarning: () => {
      const { project } = get()
      const newProject: Project = { ...project, warningDismissed: true }
      set({ project: newProject })
      saveProject(newProject)
    },
  }
})
