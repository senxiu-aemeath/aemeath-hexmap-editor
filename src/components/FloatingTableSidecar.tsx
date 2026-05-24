import type { CSSProperties, ReactNode } from 'react'
import { useUiMessages } from '../i18n'

interface FloatingTableSidecarProps {
  title: string
  subtitle?: string | null
  width: number
  onResizeStart: () => void
  onClose: () => void
  toolbar?: ReactNode
  children: ReactNode
}

export function FloatingTableSidecar({
  title,
  subtitle = null,
  width,
  onResizeStart,
  onClose,
  toolbar,
  children,
}: FloatingTableSidecarProps) {
  const ui = useUiMessages()

  return (
    <aside
      className="floating-table-sidecar"
      aria-modal="false"
      style={{ '--floating-table-width': `${width}px` } as CSSProperties}
    >
      <button
        className="floating-table-sidecar-resize-handle"
        type="button"
        aria-label={ui.common.resizeExpandedTable}
        onMouseDown={onResizeStart}
      />
      <div className="floating-table-sidecar-card">
        <button
          className="floating-table-sidecar-header"
          type="button"
          onClick={onClose}
          aria-label={ui.common.closeExpandedTable}
        >
          <div className="floating-table-sidecar-heading">
            <strong>{title}</strong>
            {subtitle ? <span>{subtitle}</span> : null}
          </div>
          <span className="floating-table-sidecar-close" aria-hidden="true">
            {ui.common.tapToClose}
          </span>
        </button>
        {toolbar ? <div className="floating-table-sidecar-toolbar">{toolbar}</div> : null}
        <div className="floating-table-sidecar-body">{children}</div>
      </div>
    </aside>
  )
}
