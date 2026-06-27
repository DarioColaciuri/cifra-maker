import React from 'react'
import type { System } from '@/types'
import { MeasureCell } from './MeasureCell'

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

  return (
    <div className="relative w-full" style={{ minHeight: 44 }}>
      <StaffLines />
      <div className="absolute inset-0 flex items-center">
        <MeasureDivider />
        {system.measures.map((measure, idx) => (
          <React.Fragment key={measure.id}>
            <div className="flex-1 h-full relative">
              <MeasureCell
                measure={measure}
                systemId={system.id}
                sectionId={sectionId}
                onClick={onMeasureClick}
              />
            </div>
            <MeasureDivider />
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
