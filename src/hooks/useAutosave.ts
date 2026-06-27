import { useEffect, useRef } from 'react'
import { useDocumentStore } from '@/stores/documentStore'
import { saveDocument } from '@/utils/persistence'

export function useAutosave() {
  const document = useDocumentStore((s) => s.document)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveDocument(document)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [document])
}
