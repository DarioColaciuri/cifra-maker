interface Props {
  mark: string
}

export function RehearsalMark({ mark }: Props) {
  return (
    <span className="text-[10px] font-bold border border-gray-400 px-1.5 rounded text-gray-600">
      {mark}
    </span>
  )
}
