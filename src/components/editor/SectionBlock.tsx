import type { Section } from '@/types'
import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { SystemRow } from './SystemRow'

interface Props {
  section: Section
}

export function SectionBlock({ section }: Props) {
  const { setSelectedSection, selectedSectionIds } = useUIStore()
  const { removeSection } = useDocumentStore()

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

  return (
    <div
      onClick={handleSectionClick}
      className="relative mb-6 rounded-lg border-2 transition-all duration-300 cursor-pointer group/section"
      style={{
        borderColor: isSelected ? 'var(--accent)' : 'transparent',
        background: isSelected ? 'rgba(226, 168, 62, 0.04)' : 'transparent',
        boxShadow: isSelected ? '0 0 0 1px var(--accent-glow), 0 4px 20px rgba(226,168,62,0.08)' : 'none',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'transparent' }}
    >
      <div className="flex items-center gap-2 px-3 py-1">
        <div
          className="inline-block px-3 py-0.5 rounded font-semibold text-xs tracking-wide"
          style={{
            background: 'rgba(0,0,0,0.04)',
            color: 'var(--text-page)',
            border: '1px solid rgba(0,0,0,0.08)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 14,
          }}
        >
          {section.label}
        </div>
        <button
          onClick={handleDeleteSection}
          className="opacity-20 hover:opacity-100 p-1 rounded transition-all ml-auto"
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

      {section.systems.length === 0 ? (
        <div className="px-4 pb-2 text-center text-xs py-3" style={{ color: '#bbb' }}>
          Click <span className="font-medium" style={{ color: '#999' }}>+ Add 4 Measures</span> in the sidebar to add measures
        </div>
      ) : (
        <div className="px-3 pb-2">
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
