import type { System } from '@/types'
import { MeasureCell } from './MeasureCell'
import { getContentWidth } from '@/utils/layout'
import { MEASURES_PER_SYSTEM, SECTION_H_PADDING } from '@/constants'

interface Props {
  system: System
  sectionId: string
  onMeasureClick: () => void
}

function StaffLines() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            borderTop: '1px solid rgba(0,0,0,0.28)',
            marginTop: i === 0 ? 0 : 7,
            height: i === 4 ? 'auto' : 0,
          }}
        />
      ))}
    </div>
  )
}

const STAFF_HEIGHT = 28

function MeasureDivider() {
  return (
    <div
      className="flex-shrink-0"
      style={{ width: 1, height: STAFF_HEIGHT, background: 'rgba(0,0,0,0.32)' }}
    />
  )
}

export function SystemRow({ system, sectionId, onMeasureClick }: Props) {
  if (system.measures.length === 0) return null

  const numMeasures = system.measures.length
  const isFull = numMeasures === MEASURES_PER_SYSTEM
  const sectionContentWidth = getContentWidth() - SECTION_H_PADDING
  const perMeasureWidth = (sectionContentWidth - (MEASURES_PER_SYSTEM + 1)) / MEASURES_PER_SYSTEM
  const totalWidth = numMeasures * perMeasureWidth + (numMeasures + 1)

  return (
    <div className="relative" style={{ width: isFull ? '100%' : totalWidth, minHeight: 44 }}>
      <StaffLines />
      <div className="absolute inset-0 flex items-center">
        {system.measures.map((measure) => (
          <div key={measure.id} className="contents">
            <MeasureDivider />
            <div
              className={isFull ? 'flex-1 relative' : 'relative'}
              style={isFull ? undefined : { width: perMeasureWidth }}
            >
              <MeasureCell
                measure={measure}
                systemId={system.id}
                sectionId={sectionId}
                onClick={onMeasureClick}
              />
            </div>
          </div>
        ))}
        <MeasureDivider />
      </div>
    </div>
  )
}
