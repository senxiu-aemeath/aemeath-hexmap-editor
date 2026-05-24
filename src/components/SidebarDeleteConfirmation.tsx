import { useEffect, useRef } from 'react'
import { useUiMessages } from '../i18n'

export interface SidebarDeleteConfirmationState {
  title: string
  x: number
  y: number
  width: number
  onConfirm: () => void
}

interface SidebarDeleteConfirmationProps {
  confirmation: SidebarDeleteConfirmationState | null
  onClose: () => void
}

export function SidebarDeleteConfirmation({ confirmation,
  onClose,
}: SidebarDeleteConfirmationProps) {
  const ui = useUiMessages()
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!confirmation) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && containerRef.current?.contains(target)) {
        return
      }
      onClose()
    }

    window.addEventListener('resize', onClose)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('resize', onClose)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [confirmation, onClose])

  if (!confirmation) {
    return null
  }

  return (
    <aside
      ref={containerRef}
      className="submap-floating-confirm submap-floating-confirm--sidebar"
      style={{
        top: `${confirmation.y}px`,
        left: `${confirmation.x}px`,
        width: `${confirmation.width}px`,
      }}
      role="dialog"
      aria-modal="false"
      aria-label={confirmation.title}
    >
      <div className="submap-floating-confirm-card submap-floating-confirm-card--sidebar">
        <div className="submap-confirm-slot submap-confirm-slot--label">
          <span className="submap-confirm-title">{ui.common.confirm}</span>
          <span title={confirmation.title}>{confirmation.title}</span>
        </div>
        <button
          className="mini-icon-button danger-button submap-confirm-slot submap-confirm-slot--action"
          type="button"
          onClick={() => {
            confirmation.onConfirm()
            onClose()
          }}
        >
          {ui.common.confirm}
        </button>
        <button
          className="mini-icon-button submap-confirm-slot submap-confirm-slot--action"
          type="button"
          onClick={onClose}
        >
          {ui.common.cancel}
        </button>
      </div>
    </aside>
  )
}
