interface Props {
  type: 'start' | 'end'
}

export function RepeatSymbol({ type }: Props) {
  const thickBar = <div className="w-[2px] h-8 bg-gray-800" />
  const thinBar = <div className="w-[1px] h-8 bg-gray-300" />
  const dots = (
    <div className="flex flex-col gap-[3px]">
      <div className="w-1 h-1 rounded-full bg-gray-800" />
      <div className="w-1 h-1 rounded-full bg-gray-800" />
    </div>
  )

  if (type === 'start') {
    return (
      <div className="flex items-center gap-[1px]">
        {thickBar}
        {thinBar}
        {dots}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-[1px]">
      {dots}
      {thinBar}
      {thickBar}
    </div>
  )
}
