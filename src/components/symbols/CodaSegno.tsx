interface Props {
  type: 'coda' | 'segno'
}

export function CodaSegno({ type }: Props) {
  if (type === 'segno') {
    return (
      <div className="flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-700">
          <text x="2" y="18" fontSize="18" fontWeight="bold" fill="currentColor">%</text>
          <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.3" />
          <circle cx="6" cy="6" r="2" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-700">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
