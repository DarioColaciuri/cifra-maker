import { useDocumentStore } from '@/stores/documentStore'
import { useUIStore } from '@/stores/uiStore'
import { DocumentHeader } from './DocumentHeader'
import { SectionBlock } from './SectionBlock'
import { PAGE_MARGIN_LEFT, PAGE_MARGIN_RIGHT, PAGE_MARGIN_TOP, PAGE_MARGIN_BOTTOM } from '@/constants'

export function EditorCanvas() {
  const document = useDocumentStore((s) => s.document)
  const clearSelection = useUIStore((s) => s.clearSelection)

  return (
    <div
      className="min-h-full"
      onClick={() => clearSelection()}
      style={{
        paddingTop: PAGE_MARGIN_TOP,
        paddingBottom: PAGE_MARGIN_BOTTOM,
        paddingLeft: PAGE_MARGIN_LEFT,
        paddingRight: PAGE_MARGIN_RIGHT,
      }}
    >
      <DocumentHeader
        title={document.title}
        subtitle={document.subtitle}
      />
      <div className="mt-8">
        {document.sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>
    </div>
  )
}
