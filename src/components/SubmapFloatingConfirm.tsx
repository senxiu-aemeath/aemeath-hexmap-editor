import { useUiMessages } from '../i18n'

interface SubmapFloatingConfirmProps {
  top: number
  left: number
  onConfirm: () => void
  onCancel: () => void
}

export function SubmapFloatingConfirm({ top,
  left,
  onConfirm,
  onCancel,
}: SubmapFloatingConfirmProps) {
  const ui = useUiMessages()
  return (
    <aside
      className="submap-floating-confirm"
      style={{
        top: `${top}px`,
        left: `${left}px`,
      }}
      aria-modal="false"
    >
      <div className="submap-floating-confirm-card">
        <div className="submap-confirm-actions">
          <button
            className="mini-icon-button danger-button"
            type="button"
            onClick={onConfirm}
          >
            {ui.common.confirm}
          </button>
          <button className="mini-icon-button" type="button" onClick={onCancel}>
            {ui.common.cancel}
          </button>
        </div>
      </div>
    </aside>
  )
}
