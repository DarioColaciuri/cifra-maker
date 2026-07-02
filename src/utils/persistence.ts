import type { CifraDocument, Project } from '@/types'
import { createDefaultProject } from './defaults'
import { v4 as uuid } from 'uuid'

const STORAGE_KEY = 'cifra-maker-document'

function isValidDoc(parsed: unknown): parsed is CifraDocument {
  if (!parsed || typeof parsed !== 'object') return false
  const doc = parsed as Record<string, unknown>
  return typeof doc.id === 'string' && Array.isArray(doc.sections)
}

function isValidProject(parsed: unknown): parsed is Project {
  if (!parsed || typeof parsed !== 'object') return false
  const proj = parsed as Record<string, unknown>
  return (
    Array.isArray(proj.pages) &&
    typeof proj.activePageId === 'string' &&
    proj.pages.every((p: unknown) => {
      if (!p || typeof p !== 'object') return false
      const page = p as Record<string, unknown>
      return typeof page.id === 'string' && typeof page.name === 'string' && isValidDoc(page.data)
    })
  )
}

export function saveProject(project: Project): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
  } catch {
    // storage full or unavailable
  }
}

export function loadProject(): Project {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultProject()
    const parsed = JSON.parse(raw)

    // Migration: old format (single CifraDocument) — wrap into a Project
    if (isValidDoc(parsed)) {
      const pageId = uuid()
      const project: Project = {
        pages: [{ id: pageId, name: 'Page 1', data: parsed, createdAt: Date.now() }],
        activePageId: pageId,
        warningDismissed: false,
      }
      saveProject(project)
      return project
    }

    // New format (Project)
    if (isValidProject(parsed)) return parsed

    return createDefaultProject()
  } catch {
    return createDefaultProject()
  }
}

export function saveDocument(_doc: CifraDocument): void {
  // Legacy compatibility — now handled through saveProject
}

export function loadDocument(): CifraDocument | null {
  // Legacy compatibility
  const project = loadProject()
  const activePage = project.pages.find((p) => p.id === project.activePageId)
  if (activePage) return activePage.data
  if (project.pages.length > 0) return project.pages[0].data
  return null
}

export function clearDocument(): void {
  localStorage.removeItem(STORAGE_KEY)
}
