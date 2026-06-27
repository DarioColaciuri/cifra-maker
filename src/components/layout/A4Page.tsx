import type { ReactNode } from 'react'
import { A4_WIDTH_PX, A4_HEIGHT_PX } from '@/constants'

interface Props {
  children: ReactNode
}

export function A4Page({ children }: Props) {
  return (
    <div className="flex-1 overflow-y-auto flex justify-center py-8 px-4">
      <div
        className="flex-shrink-0 relative transition-shadow duration-500"
        data-a4-page
        style={{
          width: A4_WIDTH_PX,
          minHeight: A4_HEIGHT_PX,
          background: 'var(--bg-page)',
          boxShadow: 'var(--shadow-page)',
          borderRadius: '2px',
        }}
      >
        {/* Subtle paper texture on the page */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        {children}
      </div>
    </div>
  )
}
