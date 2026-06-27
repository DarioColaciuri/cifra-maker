interface Props {
  number: 1 | 2
}

export function EndingMark({ number }: Props) {
  return (
    <div className="relative">
      <div className="border-t border-l border-gray-500 h-4 w-full" style={{ minWidth: 40 }} />
      <div
        className="absolute top-0 left-1 text-[10px] font-medium text-gray-700"
        style={{ marginTop: -14 }}
      >
        {number}.
      </div>
    </div>
  )
}
