import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-screen bg-[var(--bg-deep)]">
      {children}
    </div>
  )
}
