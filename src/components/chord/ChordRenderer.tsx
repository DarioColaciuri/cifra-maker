import type { Chord } from '@/types'
import { useDocumentStore } from '@/stores/documentStore'
import { chordToParts } from '@/utils/chord'

interface Props {
  chord: Chord
  large?: boolean
}

export function ChordRenderer({ chord, large = false }: Props) {
  const document = useDocumentStore((s) => s.document)
  const useSymbols = document.notationStyle === 'symbols'
  const parts = chordToParts(chord)

  const rootSize = large ? 28 : 18
  const superSize = Math.round(rootSize * 0.55)
  const superTop = -Math.round(rootSize * 0.48)

  const formatQuality = (q: string): string => {
    if (!useSymbols) return q
    if (q === 'dim') return '\u00B0'
    if (q === 'aug') return '+'
    return q
  }

  const formatExtension = (ext: string): string => {
    if (!useSymbols) return ext
    if (ext === 'maj7') return '\u0394\u2077'
    if (ext === 'maj9') return '\u0394\u2079'
    if (ext === 'm7b5') return '\u00F8'
    return ext
      .replace(/7/g, '\u2077')
      .replace(/9/g, '\u2079')
      .replace(/11/g, '\u00B9\u00B9')
      .replace(/13/g, '\u00B9\u00B3')
      .replace(/6/g, '\u2076')
      .replace(/5/g, '\u2075')
      .replace(/b/g, '\u266D')
      .replace(/#/g, '\u266F')
  }

  const hasSuper = parts.qualitySuffix || parts.extensionText

  return (
    <div className="inline-flex flex-col items-center leading-none">
      <div>
        {/* Root: bold, anchor at baseline */}
        <span className="font-bold text-gray-900 align-baseline" style={{ fontSize: rootSize }}>
          {chord.root}
        </span>

        {/* Quality + Extensions as superscript */}
        {hasSuper && (
          <span className="font-normal text-gray-600 relative" style={{ fontSize: superSize, top: superTop }}>
            {parts.qualitySuffix && formatQuality(parts.qualitySuffix)}
            {parts.extensionText && chord.extensions.map(formatExtension).join('')}
          </span>
        )}
      </div>

      {/* Bass note below */}
      {parts.bassText && (
        <div className="text-gray-400 leading-none" style={{ fontSize: superSize }}>
          {parts.bassText}
        </div>
      )}
    </div>
  )
}
