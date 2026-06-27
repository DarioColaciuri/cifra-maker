import { useCallback, useRef } from 'react'
import type { Chord } from '@/types'
import { useAudioStore } from '@/stores/audioStore'
import { Synthesizer } from '@/audio/synthesizer'

export function useAudioPreview() {
  const { initAudio } = useAudioStore()
  const synthRef = useRef<Synthesizer | null>(null)

  const getSynth = useCallback((): Synthesizer | null => {
    if (synthRef.current) return synthRef.current
    const ctx = initAudio()
    if (!ctx) return null
    synthRef.current = new Synthesizer(ctx)
    return synthRef.current
  }, [initAudio])

  const previewChord = useCallback((chord: Chord) => {
    const synth = getSynth()
    if (synth) synth.playChord(chord)
  }, [getSynth])

  const previewNote = useCallback((note: string) => {
    const synth = getSynth()
    if (synth) synth.playSingleNote(note)
  }, [getSynth])

  return { previewChord, previewNote }
}
