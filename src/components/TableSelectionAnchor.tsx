import type { KeyboardEvent, ReactNode } from 'react'

interface TableSelectionAnchorProps {
  label: string
  onClearSelection: () => void
  children: ReactNode
}

export function TableSelectionAnchor({
  label,
  onClearSelection,
  children,
}: TableSelectionAnchorProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      onClearSelection()
    }
  }

  return (
    <span
      className="table-selection-anchor"
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClearSelection()
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </span>
  )
}
