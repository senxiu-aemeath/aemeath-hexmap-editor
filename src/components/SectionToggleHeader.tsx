import type { ReactNode } from 'react'

interface SectionToggleHeaderProps {
  title: ReactNode
  expanded: boolean
  onToggle: () => void
}

export function SectionToggleHeader({
  title,
  expanded,
  onToggle,
}: SectionToggleHeaderProps) {
  return (
    <div className="data-table-heading">
      <button
        className={`section-toggle-button${expanded ? '' : ' is-collapsed'}`}
        type="button"
        onClick={onToggle}
      >
        <span className="section-disclosure-icon section-disclosure-icon--leading">
          {expanded ? '▾' : '▸'}
        </span>
        <span className="section-title-text">{title}</span>
      </button>
    </div>
  )
}
