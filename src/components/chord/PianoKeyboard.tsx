import { WHITE_KEYS, BLACK_KEYS } from '@/constants'
import { useAudioPreview } from '@/hooks/useAudioPreview'

interface Props {
  selectedRoot: string
  onSelectRoot: (note: string) => void
  sharpPreference: Record<string, 'sharp' | 'flat'>
  onTogglePreference: (key: string) => void
}

export function PianoKeyboard({ selectedRoot, onSelectRoot, sharpPreference, onTogglePreference }: Props) {
  const { previewNote } = useAudioPreview()

  const isSelected = (note: string) => {
    if (note === selectedRoot) return true
    // Check black key alternatives
    for (const bk of BLACK_KEYS) {
      if (bk.sharp === selectedRoot && bk.flat === note) return true
      if (bk.flat === selectedRoot && bk.sharp === note) return true
    }
    return false
  }

  const whiteKeyWidth = 48
  const whiteKeyHeight = 140
  const totalWidth = WHITE_KEYS.length * whiteKeyWidth

  // Black key positions (relative to white key indices)
  const blackKeyPositions = [0.65, 1.65, 3.2, 4.2, 5.2]

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: totalWidth, height: whiteKeyHeight + 20 }}>
        {/* White keys */}
        <div className="flex">
          {WHITE_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => { onSelectRoot(key); previewNote(key) }}
              className={`border border-gray-300 rounded-b-md flex items-end justify-center pb-2 transition-colors ${
                isSelected(key) || key === selectedRoot
                  ? 'bg-blue-100 border-blue-400'
                  : 'bg-white hover:bg-gray-100'
              }`}
              style={{ width: whiteKeyWidth, height: whiteKeyHeight }}
            >
              <span className={`text-sm font-semibold ${key === selectedRoot ? 'text-blue-700' : 'text-gray-600'}`}>
                {key}
              </span>
            </button>
          ))}
        </div>

        {/* Black keys */}
        {blackKeyPositions.map((pos, idx) => {
          const key = BLACK_KEYS[idx]
          const pref = sharpPreference[key.sharp] || 'sharp'
          const note = pref === 'sharp' ? key.sharp : key.flat
          const selected = isSelected(note)

          return (
            <div
              key={idx}
              className="absolute top-0"
              style={{ left: pos * whiteKeyWidth }}
            >
              <button
                onClick={() => { onSelectRoot(note); previewNote(note) }}
                className={`w-7 h-[90px] rounded-b-md flex flex-col items-center justify-end pb-1 transition-colors ${
                  selected ? 'bg-blue-800' : 'bg-gray-900 hover:bg-gray-800'
                }`}
                title={note}
              >
                <span className="text-[8px] text-white font-medium leading-tight text-center">
                  {note}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTogglePreference(key.sharp)
                    previewNote(pref === 'sharp' ? key.flat : key.sharp)
                  }}
                  className="text-[7px] text-gray-400 hover:text-white mt-0.5"
                >
                  {pref === 'sharp' ? key.flat : key.sharp}
                </button>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
