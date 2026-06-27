import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'

const btnStyle = {
  borderColor: 'var(--border-ui)',
  color: 'var(--text-ui)',
  background: 'rgba(255,255,255,0.03)',
}
const btnHover = {
  background: 'var(--bg-sidebar-hover)',
  borderColor: 'var(--accent)',
  color: 'var(--accent)',
}

export function MeasurePanel() {
  const sections = useDocumentStore((s) => s.document.sections)
  const { addMeasure, addMeasures4, addSingleMeasure } = useDocumentStore()
  const { selectedSectionIds } = useUIStore()

  const sectionId = selectedSectionIds[0] || sections[0]?.id

  if (!sectionId) {
    return <p className="text-[10px] py-1" style={{ color: 'var(--text-ui-dim)' }}>Add a section first</p>
  }

  const section = sections.find((s) => s.id === sectionId)
  if (!section) return null

  const lastSystem = section.systems[section.systems.length - 1]

  const handleAddMeasure = () => {
    if (lastSystem && lastSystem.measures.length < 4) {
      addMeasure(sectionId, lastSystem.id)
    } else {
      addSingleMeasure(sectionId)
    }
  }

  return (
    <div className="space-y-1.5 py-1">
      <button
        onClick={handleAddMeasure}
        className="w-full text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
      >
        + Add Measure
      </button>
      <button
        onClick={() => addMeasures4(sectionId)}
        className="w-full text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
      >
        + Add 4 Measures
      </button>
    </div>
  )
}
