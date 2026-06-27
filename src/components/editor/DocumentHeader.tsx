import type { TextBlock } from '@/types'

interface Props {
  title: TextBlock
  subtitle: TextBlock
}

export function DocumentHeader({ title, subtitle }: Props) {
  const textStyle = (block: TextBlock): React.CSSProperties => ({
    fontFamily: block.fontFamily === 'Inter'
      ? "'Cormorant Garamond', Georgia, serif"
      : block.fontFamily,
    fontSize: block.fontSize,
    fontWeight: block.bold ? 700 : 500,
    fontStyle: block.italic ? 'italic' : 'normal',
    textAlign: block.alignment,
  })

  return (
    <div className="mb-6">
      {title.text && (
        <div style={{ ...textStyle(title), color: '#1a1a1a' }} className="leading-tight">
          {title.text}
        </div>
      )}
      {subtitle.text && (
        <div style={{ ...textStyle(subtitle), color: 'rgba(0,0,0,0.5)' }} className="mt-1 leading-tight">
          {subtitle.text}
        </div>
      )}
      {!title.text && !subtitle.text && (
        <div className="text-center italic py-4 text-sm" style={{ color: '#ccc' }}>
          add a title and subtitle in the sidebar
        </div>
      )}
    </div>
  )
}
