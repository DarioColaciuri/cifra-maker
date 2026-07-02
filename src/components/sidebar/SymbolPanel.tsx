import { useUIStore } from '@/stores/uiStore'
import { useDraggable } from '@dnd-kit/core'

interface SymbolDef {
  id: string
  label: string
  icon: string
  desc: string
}

const SYMBOLS: SymbolDef[] = [
  { id: 'repeatStart', label: 'Repeat start', icon: '𝄆', desc: 'Begin repeat' },
  { id: 'repeatEnd', label: 'Repeat end', icon: '𝄇', desc: 'End repeat' },
  { id: 'doubleBarline', label: 'Double bar', icon: '𝄁', desc: 'Double barline' },
  { id: 'repeatCount', label: 'Repeat count', icon: 'x2', desc: 'Number of repetitions' },
  { id: 'percentSign', label: '% Symbol', icon: '%', desc: 'Percent sign' },
]

function DraggableSymbol({ sym }: { sym: SymbolDef }) {
  const { symbolToPlace, setSymbolToPlace, setToolMode } = useUIStore()
  const active = symbolToPlace === sym.id

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `symbol-${sym.id}`,
    data: { type: 'symbol', symbolId: sym.id },
    disabled: active,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation()
        if (active) {
          setSymbolToPlace(null)
          setToolMode('select')
        } else {
          setSymbolToPlace(sym.id)
          setToolMode('addSymbol')
        }
      }}
      className="flex items-center gap-1 text-[9px] py-1 px-1 rounded-md border transition-all duration-150 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing"
      title={`${sym.desc} — drag to measure or click then click measure`}
      style={{
        opacity: isDragging ? 0.4 : 1,
        borderColor: active ? 'var(--accent)' : 'var(--border-ui)',
        color: active ? 'var(--accent)' : 'var(--text-ui-dim)',
        background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1, width: 18, textAlign: 'center' }}>{sym.icon}</span>
      <span className="leading-tight">{sym.label}</span>
    </div>
  )
}

export function SymbolPanel() {
  return (
    <div className="space-y-1 py-1">
      <p className="text-[9px] mb-1" style={{ color: 'var(--text-ui-dim)' }}>
        Drag to measure or click then click measure
      </p>
      <div className="flex flex-col gap-0.5">
        {SYMBOLS.map((sym) => (
          <DraggableSymbol key={sym.id} sym={sym} />
        ))}
      </div>
    </div>
  )
}
