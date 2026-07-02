import type { v4 as uuidv4 } from 'uuid'

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dim'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | '5'
  | 'power'

export type ChordDuration = 'none' | 'whole' | 'half' | 'dottedHalf' | 'quarter'

export const DURATION_FRACTIONS: Record<ChordDuration, number> = {
  none: 0,
  whole: 1,
  half: 0.5,
  dottedHalf: 0.75,
  quarter: 0.25,
}

export interface Chord {
  id: string
  root: string
  quality: ChordQuality
  extensions: string[]
  bass: string | null
  fontSize?: number
  duration?: ChordDuration
}

export type TextAlignment = 'left' | 'center' | 'right'

export interface TextBlock {
  text: string
  fontFamily: string
  fontSize: number
  bold: boolean
  italic: boolean
  alignment: TextAlignment
}

export type NotationStyle = 'symbols' | 'text'

export interface Measure {
  id: string
  chords: Chord[]
  doubleBarline: boolean
  repeatStart: boolean
  repeatEnd: boolean
  repeatCount: number | null
  firstEnding: boolean
  secondEnding: boolean
  fermata: boolean
  fine: boolean
  dcAlFine: boolean
  dsAlCoda: boolean
  segno: boolean
  coda: boolean
  rehearsalMark: string | null
  percentSign: boolean
}

export interface System {
  id: string
  measures: Measure[]
}

export interface Section {
  id: string
  label: string
  systemSpacing: number
  sectionSpacing: number
  systems: System[]
  order: number
  lyrics: string[]
  doubleBarlineMeasureId: string | null
}

export interface CifraDocument {
  id: string
  title: TextBlock
  subtitle: TextBlock
  sections: Section[]
  notationStyle: NotationStyle
  pageTopMargin: number
  titleSectionGap: number
}

export interface Page {
  id: string
  name: string
  data: CifraDocument
  createdAt: number
}

export interface Project {
  pages: Page[]
  activePageId: string
  warningDismissed: boolean
}
