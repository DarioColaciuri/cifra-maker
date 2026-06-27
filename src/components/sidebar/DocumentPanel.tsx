import { useDocumentStore } from '@/stores/documentStore'

const inputClass = "w-full px-2 py-1.5 text-xs rounded-md border transition-all duration-150 focus:ring-0"

export function DocumentPanel() {
  const document = useDocumentStore((s) => s.document)
  const { updateTitle, updateSubtitle } = useDocumentStore()

  const s = {
    input: {
      background: 'rgba(255,255,255,0.04)',
      borderColor: 'var(--border-ui)',
      color: 'var(--text-ui)',
    },
    label: { color: 'var(--text-ui-dim)', fontSize: 10, fontWeight: 500, marginBottom: 4, display: 'block' as const },
  }

  return (
    <div className="space-y-3 py-1">
      <div>
        <label style={s.label}>Title</label>
        <input
          type="text"
          value={document.title.text}
          onChange={(e) => updateTitle({ text: e.target.value })}
          placeholder="Enter title..."
          className={inputClass}
          style={s.input}
        />
      </div>
      <div>
        <label style={s.label}>Subtitle</label>
        <input
          type="text"
          value={document.subtitle.text}
          onChange={(e) => updateSubtitle({ text: e.target.value })}
          placeholder="Enter subtitle..."
          className={inputClass}
          style={s.input}
        />
      </div>
    </div>
  )
}
