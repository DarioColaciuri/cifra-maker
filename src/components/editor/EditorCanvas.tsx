import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { DocumentHeader } from './DocumentHeader'
import { SectionBlockSortable } from './SectionBlockSortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PAGE_MARGIN_LEFT, PAGE_MARGIN_RIGHT, PAGE_MARGIN_BOTTOM } from '@/constants'

export function EditorCanvas() {
  const document = useDocumentStore((s) => s.document)
  const clearSelection = useUIStore((s) => s.clearSelection)

  const sectionIds = document.sections.map((s) => s.id)

  return (
    <div
      className="min-h-full"
      onClick={() => clearSelection()}
      style={{
        paddingTop: document.pageTopMargin || 80,
        paddingBottom: PAGE_MARGIN_BOTTOM,
        paddingLeft: PAGE_MARGIN_LEFT,
        paddingRight: PAGE_MARGIN_RIGHT,
      }}
    >
      <DocumentHeader
        title={document.title}
        subtitle={document.subtitle}
      />
      <div style={{ marginTop: document.titleSectionGap || 32 }}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          {document.sections.map((section, idx) => (
            <SectionBlockSortable
              key={section.id}
              section={section}
              isFirst={idx === 0}
            />
          ))}
        </SortableContext>
      </div>
      {document.sections.length === 0 && (
        <div className="text-center text-sm py-12" style={{ color: '#ccc' }}>
          Add a section to get started
        </div>
      )}
    </div>
  )
}
