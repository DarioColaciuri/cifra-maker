import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'

export function SystemPanel() {
  const sections = useDocumentStore((s) => s.document.sections)
  const { selectedSectionIds } = useUIStore()
  const updateSectionSpacing = useDocumentStore((s) => s.updateSectionSpacing)

  const selectedId = selectedSectionIds[0]
  const section = selectedId ? sections.find((s) => s.id === selectedId) : null

  if (!section) {
    return (
      <p className="text-xs text-gray-400 py-1">Select a section to adjust spacing</p>
    )
  }

  return (
    <div className="space-y-3 py-1">
      <div>
        <div className="flex justify-between items-center">
          <label className="text-xs text-gray-500 font-medium">System Spacing</label>
          <span className="text-xs text-gray-400">{section.systemSpacing}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={80}
          step={1}
          value={section.systemSpacing}
          onChange={(e) => updateSectionSpacing(section.id, Number(e.target.value))}
          className="w-full mt-1"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>1px</span>
          <span>40px</span>
          <span>80px</span>
        </div>
      </div>
    </div>
  )
}
