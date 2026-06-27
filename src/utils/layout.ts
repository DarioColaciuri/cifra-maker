import { A4_WIDTH_PX, PAGE_MARGIN_LEFT, PAGE_MARGIN_RIGHT, MEASURES_PER_SYSTEM } from '@/constants'

export function getContentWidth(): number {
  return A4_WIDTH_PX - PAGE_MARGIN_LEFT - PAGE_MARGIN_RIGHT
}

export function getMeasureWidth(): number {
  return getContentWidth() / MEASURES_PER_SYSTEM
}

export function getSystemGap(gap: number): number {
  return Math.max(0, Math.min(48, gap))
}

export function snapToGrid(value: number, gridSize: number = 4): number {
  return Math.round(value / gridSize) * gridSize
}
