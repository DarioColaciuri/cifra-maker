export const A4_WIDTH_PX = 794
export const A4_HEIGHT_PX = 1123
export const PAGE_MARGIN_LEFT = 60
export const PAGE_MARGIN_RIGHT = 60
export const PAGE_MARGIN_TOP = 80
export const PAGE_MARGIN_BOTTOM = 80

export const MEASURES_PER_SYSTEM = 4
export const DEFAULT_SYSTEM_SPACING = 24
export const DEFAULT_CHORD_FONT_SIZE = 15
export const DEFAULT_EXTENSION_FONT_SIZE = 10
export const DEFAULT_TITLE_FONT_SIZE = 28
export const DEFAULT_SUBTITLE_FONT_SIZE = 16
export const DEFAULT_LABEL_FONT_SIZE = 13

export const FONT_FAMILIES = [
  'Inter',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'Courier New',
  'Verdana',
] as const

export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
export const BLACK_KEYS = [
  { sharp: 'C#', flat: 'Db' },
  { sharp: 'D#', flat: 'Eb' },
  { sharp: 'F#', flat: 'Gb' },
  { sharp: 'G#', flat: 'Ab' },
  { sharp: 'A#', flat: 'Bb' },
] as const

export const QUALITIES: { value: string; label: string }[] = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'dim', label: 'Dim' },
  { value: 'aug', label: 'Aug' },
  { value: 'sus2', label: 'Sus2' },
  { value: 'sus4', label: 'Sus4' },
  { value: '5', label: '5' },
  { value: 'power', label: 'Power' },
]

export const EXTENSIONS = [
  '6', '7', '9', '11', '13',
  'maj7', 'maj9',
  'add9', 'add11',
  'b5', '#5',
  'b9', '#9',
  'b13',
  'm7b5',
] as const

export const SECTION_PRESETS = [
  'Verse',
  'Chorus',
  'Bridge',
  'Solo',
  'Outro',
  'Intro',
  'Tag',
  'Pre-Chorus',
  'Interlude',
  'Coda',
]

export const CHORD_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'Db': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'Bb': 466.16,
  'B': 493.88,
}

export const SEMITONE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export const CHORD_QUALITY_INTERVALS: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '5': [0, 7],
  power: [0, 7],
}

export const EXTENSION_INTERVALS: Record<string, number> = {
  '6': 9,
  '7': 10,
  '9': 2,
  '11': 5,
  '13': 9,
  'maj7': 11,
  'maj9': 2,
  'add9': 2,
  'add11': 5,
  'b5': 6,
  '#5': 8,
  'b9': 1,
  '#9': 3,
  'b13': 8,
  'm7b5': 10,
}
