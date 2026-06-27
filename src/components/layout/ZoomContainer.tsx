import type { ReactNode } from 'react'
import { useUIStore } from '@/stores/uiStore'

interface Props {
  children: ReactNode
}

export function ZoomContainer({ children }: Props) {
  const zoom = useUIStore((s) => s.zoom)
  
  return (
    <div
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease',
      }}
    >
      {children}
    </div>
  )
}
