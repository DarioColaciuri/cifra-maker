import type { Chord } from '@/types'
import { SEMITONE_ORDER, CHORD_QUALITY_INTERVALS, EXTENSION_INTERVALS, CHORD_FREQUENCIES } from '@/constants'

export function formatChordName(chord: Chord): string {
  let name = chord.root
  if (chord.quality === 'minor') name += 'm'
  else if (chord.quality === 'dim') name += 'dim'
  else if (chord.quality === 'aug') name += 'aug'
  else if (chord.quality === 'sus2') name += 'sus2'
  else if (chord.quality === 'sus4') name += 'sus4'
  else if (chord.quality === '5' || chord.quality === 'power') name += '5'

  if (chord.extensions.length > 0) {
    name += chord.extensions.join('')
  }

  if (chord.bass) {
    name += '/' + chord.bass
  }

  return name
}

export function chordToParts(chord: Chord): { root: string; qualitySuffix: string; extensionText: string; bassText: string } {
  let qualitySuffix = ''
  if (chord.quality === 'minor') qualitySuffix = 'm'
  else if (chord.quality === 'dim') qualitySuffix = 'dim'
  else if (chord.quality === 'aug') qualitySuffix = 'aug'
  else if (chord.quality === 'sus2') qualitySuffix = 'sus2'
  else if (chord.quality === 'sus4') qualitySuffix = 'sus4'
  else if (chord.quality === '5' || chord.quality === 'power') qualitySuffix = '5'

  const extensionText = chord.extensions.join('')
  const bassText = chord.bass ? '/' + chord.bass : ''

  return { root: chord.root, qualitySuffix, extensionText, bassText }
}

export function getChordFrequencies(chord: Chord): number[] {
  const rootIdx = SEMITONE_ORDER.indexOf(chord.root.replace(/[#b]/, (m) => m === '#' ? '#' : 'b'))
  if (rootIdx === -1) return []

  const intervals = CHORD_QUALITY_INTERVALS[chord.quality] || [0, 4, 7]
  const freqs: number[] = []

  for (const interval of intervals) {
    const noteIdx = (rootIdx + interval) % 12
    const noteName = SEMITONE_ORDER[noteIdx]
    const freq = CHORD_FREQUENCIES[noteName]
    if (freq) freqs.push(freq)
  }

  for (const ext of chord.extensions) {
    const extInterval = EXTENSION_INTERVALS[ext]
    if (extInterval !== undefined) {
      const noteIdx = (rootIdx + extInterval) % 12
      const noteName = SEMITONE_ORDER[noteIdx]
      const freq = CHORD_FREQUENCIES[noteName]
      if (freq) freqs.push(freq)
    }
  }

  return [...new Set(freqs)].sort((a, b) => a - b)
}

export function getNoteFrequency(note: string): number | null {
  return CHORD_FREQUENCIES[note] || null
}
