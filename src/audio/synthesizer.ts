import type { Chord } from '@/types'
import { getChordFrequencies, getNoteFrequency } from '@/utils/chord'

export class Synthesizer {
  private ctx: AudioContext

  constructor(ctx: AudioContext) {
    this.ctx = ctx
  }

  playNote(frequency: number, startTime: number, duration: number = 0.6): void {
    const now = this.ctx.currentTime + startTime

    // Fundamental oscillator - triangle wave for piano-like tone
    const osc1 = this.ctx.createOscillator()
    osc1.type = 'triangle'
    osc1.frequency.value = frequency

    // Second harmonic - softer
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'triangle'
    osc2.frequency.value = frequency * 2

    // Third harmonic - very soft
    const osc3 = this.ctx.createOscillator()
    osc3.type = 'sine'
    osc3.frequency.value = frequency * 3

    // Main gain envelope
    const gainNode = this.ctx.createGain()
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.08)
    gainNode.gain.linearRampToValueAtTime(0, now + duration)

    // Harmonic gain nodes
    const gain2 = this.ctx.createGain()
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.05, now + 0.01)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + duration)

    const gain3 = this.ctx.createGain()
    gain3.gain.setValueAtTime(0, now)
    gain3.gain.linearRampToValueAtTime(0.02, now + 0.01)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc1.connect(gainNode).connect(this.ctx.destination)
    osc2.connect(gain2).connect(this.ctx.destination)
    osc3.connect(gain3).connect(this.ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc3.start(now)
    osc1.stop(now + duration + 0.1)
    osc2.stop(now + duration + 0.1)
    osc3.stop(now + duration + 0.1)
  }

  playArpeggio(frequencies: number[], speed: number = 0.08): void {
    frequencies.forEach((freq, i) => {
      this.playNote(freq, i * speed, 0.5)
    })
  }

  playChord(chord: Chord): void {
    const freqs = getChordFrequencies(chord)
    if (freqs.length === 0) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    this.playArpeggio(freqs, 0.08)
  }

  playSingleNote(note: string): void {
    const freq = getNoteFrequency(note)
    if (!freq) return
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    this.playNote(freq, 0, 0.4)
  }
}
