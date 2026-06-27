interface Props {
  type: 'fine' | 'dc' | 'ds'
}

export function FineDC({ type }: Props) {
  const label = type === 'fine' ? 'Fine' : type === 'dc' ? 'D.C. al Fine' : 'D.S. al Coda'
  
  return (
    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
      {label}
    </span>
  )
}
