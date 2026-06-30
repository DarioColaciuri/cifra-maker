import { useState } from 'react'
import { EXTENSIONS } from '@/constants'

interface Props {
  selected: string[]
  onToggle: (ext: string) => void
}

export function ExtensionSelector({ selected, onToggle }: Props) {
  const [showCustom, setShowCustom] = useState(false)
  const [customValue, setCustomValue] = useState('')

  const predefinedSet = new Set<string>(EXTENSIONS)
  const customExts = selected.filter((e) => !predefinedSet.has(e))

  const handleAddCustom = () => {
    const val = customValue.trim()
    if (!val) return
    if (selected.includes(val)) return
    onToggle(val)
    setCustomValue('')
    setShowCustom(false)
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
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
      {customExts.map((ext) => (
        <span
          key={ext}
          className="inline-flex items-center gap-0.5 px-2 py-1 text-xs rounded-md border border-dashed border-blue-300 bg-blue-50 text-blue-700 font-medium"
        >
          {ext}
          <button
            onClick={() => onToggle(ext)}
            className="ml-0.5 text-blue-400 hover:text-blue-600 leading-none text-[10px]"
          >
            x
          </button>
        </span>
      ))}
      {showCustom ? (
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCustom()
            if (e.key === 'Escape') { setShowCustom(false); setCustomValue('') }
          }}
          onBlur={() => { if (!customValue.trim()) { setShowCustom(false); setCustomValue('') } }}
          autoFocus
          placeholder="e.g. 7b13"
          className="w-16 px-1.5 py-1 text-xs rounded-md border border-blue-300 bg-white text-gray-700 outline-none focus:ring-1 focus:ring-blue-300"
        />
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="px-2 py-1 text-xs rounded-md border border-dashed border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
        >
          + Custom
        </button>
      )}
    </div>
  )
}
