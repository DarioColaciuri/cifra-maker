import type { ChordQuality } from '@/types'
import { QUALITIES } from '@/constants'

interface Props {
  selected: ChordQuality
  onSelect: (q: ChordQuality) => void
}

export function QualitySelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUALITIES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value as ChordQuality)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            selected === value
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
