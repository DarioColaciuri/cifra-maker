import { exportPNG, exportPDF } from '@/export'

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

export function ExportPanel() {
  return (
    <div className="space-y-1.5 py-1">
      <button
        onClick={() => exportPNG(2)}
        className="w-full text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
      >
        Export PNG (HD)
      </button>
      <button
        onClick={() => exportPDF()}
        className="w-full text-[10px] py-1.5 rounded-md border transition-all duration-200 hover:-translate-y-0.5"
        style={btnStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, btnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, btnStyle)}
      >
        Export PDF
      </button>
    </div>
  )
}
