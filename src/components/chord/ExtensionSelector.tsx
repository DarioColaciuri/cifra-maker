import { EXTENSIONS } from '@/constants'

interface Props {
  selected: string[]
  onToggle: (ext: string) => void
}

export function ExtensionSelector({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EXTENSIONS.map((ext) => (
        <button
          key={ext}
          onClick={() => onToggle(ext)}
          className={`px-2 py-1 text-xs rounded-md border transition-colors ${
            selected.includes(ext)
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {ext}
        </button>
      ))}
    </div>
  )
}
