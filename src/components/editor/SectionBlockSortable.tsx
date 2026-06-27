import type { Section } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SectionBlock } from './SectionBlock'

interface Props {
  section: Section
  isFirst: boolean
}

export function SectionBlockSortable({ section, isFirst }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: 'section', section },
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    marginTop: isFirst ? 0 : section.sectionSpacing,
    cursor: 'grab',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SectionBlock
        section={section}
        dragHandleListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}
