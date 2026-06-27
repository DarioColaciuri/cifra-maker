import type { Section } from '@/types'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { SystemRow } from './SystemRow'

interface Props {
  section: Section
  dragHandleListeners?: SyntheticListenerMap
  isDragging?: boolean
}

export function SectionBlock({ section, dragHandleListeners, isDragging }: Props) {
  const { setSelectedSection, selectedSectionIds } = useUIStore()
  const { removeSection, duplicateSection } = useDocumentStore()

  const isSelected = selectedSectionIds.includes(section.id)

  const selectThisSection = () => {
    setSelectedSection(section.id)
  }

  const handleSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSection(section.id)
  }

  const handleDeleteSection = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeSection(section.id)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateSection(section.id)
  }

  return (
    <div
      onClick={handleSectionClick}
      className="relative rounded-lg border-2 transition-all duration-300 cursor-pointer group/section"
      style={{
        borderColor: isSelected ? 'var(--accent)' : isDragging ? 'var(--accent)' : 'transparent',
        background: isSelected ? 'rgba(226, 168, 62, 0.04)' : isDragging ? 'rgba(226, 168, 62, 0.08)' : 'transparent',
        boxShadow: (isSelected || isDragging) ? '0 0 0 1px var(--accent-glow), 0 4px 20px rgba(226,168,62,0.08)' : 'none',
        opacity: isDragging ? 0.4 : 1,
      }}
      onMouseEnter={(e) => { if (!isSelected && !isDragging) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)' }}
      onMouseLeave={(e) => { if (!isSelected && !isDragging) e.currentTarget.style.borderColor = 'transparent' }}
    >
      {/* Section header with drag handle */}
      <div className="flex items-center gap-2 px-3 py-0.5">
        {/* Drag handle */}
        <span
          {...dragHandleListeners}
          data-export-hide
          className="cursor-grab active:cursor-grabbing flex-shrink-0 opacity-20 group-hover/section:opacity-60 transition-opacity"
          style={{ color: 'var(--text-page)', fontSize: 16, lineHeight: 1 }}
        >
          ⋮⋮
        </span>

        {/* Section label chip */}
        <div
          className="px-2.5 rounded-full font-extrabold tracking-wider uppercase flex items-center justify-center"
          style={{
            background: 'rgba(0,0,0,0.06)',
            color: '#000',
            border: '1px solid rgba(0,0,0,0.1)',
            fontFamily: "'Manrope', system-ui, sans-serif",
            fontSize: 12,
            letterSpacing: '0.05em',
            minHeight: 22,
            lineHeight: 1,
          }}
        >
          {section.label}
        </div>

        <div data-export-hide className="flex items-center gap-0.5 ml-auto opacity-0 group-hover/section:opacity-100 transition-opacity">
          {/* Duplicate button */}
          <button
            onClick={handleDuplicate}
            className="p-1 rounded transition-all"
            style={{ color: 'var(--text-page)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-soft)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-page)'; e.currentTarget.style.background = 'transparent' }}
            title="Duplicate section"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={handleDeleteSection}
            className="p-1 rounded transition-all"
            style={{ color: 'var(--text-page)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = 'rgba(192,57,43,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-page)'; e.currentTarget.style.background = 'transparent' }}
            title="Delete section"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      {section.systems.length === 0 ? (
        <div className="px-4 pb-1 text-center text-xs py-2" style={{ color: '#bbb' }}>
          Click <span className="font-medium" style={{ color: '#999' }}>+ Add 4 Measures</span> to add measures
        </div>
      ) : (
        <div className="px-3 pb-1">
          {section.systems.map((system, sysIdx) => (
            <div
              key={system.id}
              className="animate-fade-up"
              style={{
                marginTop: sysIdx > 0 ? section.systemSpacing : 0,
                animationDelay: `${sysIdx * 60}ms`,
              }}
            >
              <SystemRow
                system={system}
                sectionId={section.id}
                onMeasureClick={selectThisSection}
              />
              {section.lyrics[sysIdx] && (
                <div
                  className="text-[11px] text-center mt-0.5 italic leading-tight"
                  style={{
                    color: 'rgba(0,0,0,0.4)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {section.lyrics[sysIdx]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
