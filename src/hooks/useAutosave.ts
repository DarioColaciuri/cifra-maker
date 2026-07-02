import { useEffect, useRef } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { saveProject } from '@/utils/persistence'

export function useAutosave() {
  const project = useDocumentStore((s) => s.project)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveProject(project)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [project])
}
