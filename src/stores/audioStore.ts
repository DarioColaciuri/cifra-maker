import { create } from 'zustand'

interface AudioState {
  audioContext: AudioContext | null
  initialized: boolean
  initAudio: () => AudioContext | null
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioContext: null,
  initialized: false,
  initAudio: () => {
    if (get().audioContext) return get().audioContext
    try {
      const ctx = new AudioContext()
      set({ audioContext: ctx, initialized: true })
      return ctx
    } catch {
      return null
    }
  },
}))
