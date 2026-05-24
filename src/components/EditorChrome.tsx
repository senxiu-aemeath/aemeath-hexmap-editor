import type { ReactNode } from 'react'

interface EditorChromeProps {
  presentation: 'sidecar'
  sidecarAnchor?: 'inspector' | 'expanded-table' | 'left-sidebar'
  cardOffsetTop?: number
  shellLeft?: number | null
  closeZoneLabel?: string
  onClose: () => void
  children: ReactNode
}

export function EditorChrome({
  presentation,
  sidecarAnchor = 'inspector',
  cardOffsetTop,
  shellLeft,
  closeZoneLabel = 'Close Editor',
  onClose,
  children,
}: EditorChromeProps) {
  if (presentation === 'sidecar') {
    const topCloseZoneStyle =
      sidecarAnchor === 'left-sidebar' && typeof cardOffsetTop === 'number'
        ? { flex: `0 0 ${cardOffsetTop}px` }
        : undefined
    const shellStyle =
      sidecarAnchor === 'left-sidebar' && typeof shellLeft === 'number'
        ? { left: `${shellLeft}px` }
        : undefined

    return (
      <aside
        className={`editor-sidecar-shell${sidecarAnchor === 'expanded-table' ? ' is-expanded-table-anchor' : ''}${sidecarAnchor === 'left-sidebar' ? ' is-left-sidebar-anchor' : ''}`}
        aria-modal="false"
        style={shellStyle}
      >
        <button
          className="editor-sidecar-close-zone"
          type="button"
          onClick={onClose}
          style={topCloseZoneStyle}
        >
          {closeZoneLabel}
        </button>
        <div className="editor-sidecar-card">{children}</div>
        <button className="editor-sidecar-close-zone" type="button" onClick={onClose}>
          {closeZoneLabel}
        </button>
      </aside>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {children}
      </div>
    </div>
  )
}
