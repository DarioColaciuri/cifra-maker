import type { ReactNode } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useDocumentStore } from '@/stores/documentStore'

interface Props {
  symbolId: string
  sectionId: string
  systemId: string
  measureId: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

const SYMBOL_KEYS: Record<string, string> = {
  fermata: 'fermata',
  segno: 'segno',
  coda: 'coda',
  fine: 'fine',
  dcAlFine: 'dcAlFine',
  dsAlCoda: 'dsAlCoda',
  repeatStart: 'repeatStart',
  repeatEnd: 'repeatEnd',
  doubleBarline: 'doubleBarline',
  firstEnding: 'firstEnding',
  secondEnding: 'secondEnding',
  rehearsalMark: 'rehearsalMark',
}

export function PlacedSymbol({ symbolId, sectionId, systemId, measureId, children, className, style }: Props) {
  const { updateMeasure, removeMeasure } = useDocumentStore()

  const dragId = `placed-${symbolId}-${sectionId}-${systemId}-${measureId}`

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: {
      type: 'placed-symbol',
      symbolId,
      sectionId,
      systemId,
      measureId,
    },
  })

  const dragStyle: React.CSSProperties = {
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 10,
    cursor: 'grab',
    pointerEvents: 'auto',
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const key = SYMBOL_KEYS[symbolId]
    if (!key) return
    const value: boolean | null = symbolId === 'rehearsalMark' ? null : false
    updateMeasure(sectionId, systemId, measureId, { [key]: value })
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`relative group/sym ${className || ''}`}
      style={{ ...dragStyle, ...style }}
      title={`Drag to move, click × to remove`}
    >
      {children}
      {/* Remove button */}
      <button
        onClick={handleRemove}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover/sym:opacity-100 transition-opacity z-30"
        style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          fontSize: 10,
          lineHeight: 1,
          border: 'none',
        }}
      >
        ×
      </button>
    </div>
  )
}
