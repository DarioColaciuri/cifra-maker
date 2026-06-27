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

export interface Chord {
  id: string
  root: string
  quality: ChordQuality
  extensions: string[]
  bass: string | null
  fontSize?: number
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
