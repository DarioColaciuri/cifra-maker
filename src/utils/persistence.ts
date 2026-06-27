import type { CifraDocument } from '@/types'

export { createDefaultDocument } from './defaults'

const STORAGE_KEY = 'cifra-maker-document'

export function saveDocument(doc: CifraDocument): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
  } catch {
    // storage full or unavailable
  }
}

export function loadDocument(): CifraDocument | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.id && Array.isArray(parsed.sections)) {
      return parsed as CifraDocument
    }
    return null
  } catch {
    return null
  }
}

export function clearDocument(): void {
  localStorage.removeItem(STORAGE_KEY)
}
