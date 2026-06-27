import { useUIStore } from '@/stores/uiStore'

const SYMBOLS = [
  { id: 'repeatStart', label: 'Repeat Start' },
  { id: 'repeatEnd', label: 'Repeat End' },
  { id: 'doubleBarline', label: 'Double Bar' },
  { id: 'fermata', label: 'Fermata' },
  { id: 'fine', label: 'Fine' },
  { id: 'dcAlFine', label: 'D.C. al Fine' },
  { id: 'dsAlCoda', label: 'D.S. al Coda' },
  { id: 'coda', label: 'Coda' },
  { id: 'segno', label: 'Segno' },
  { id: 'firstEnding', label: '1st Ending' },
  { id: 'secondEnding', label: '2nd Ending' },
]

export function SymbolPanel() {
  const { symbolToPlace, setSymbolToPlace, setToolMode } = useUIStore()

  return (
    <div className="space-y-1 py-1">
      <p className="text-[9px] mb-1" style={{ color: 'var(--text-ui-dim)' }}>Select then click a measure</p>
      <div className="grid grid-cols-2 gap-1">
        {SYMBOLS.map(({ id, label }) => {
          const active = symbolToPlace === id
          return (
            <button
              key={id}
              onClick={() => {
                if (active) { setSymbolToPlace(null); setToolMode('select') }
                else { setSymbolToPlace(id); setToolMode('addSymbol') }
              }}
              className="text-[9px] py-1 px-1 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: active ? 'var(--accent)' : 'var(--border-ui)',
                color: active ? 'var(--accent)' : 'var(--text-ui-dim)',
                background: active ? 'var(--accent-soft)' : 'rgba(255,255,255,0.02)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
