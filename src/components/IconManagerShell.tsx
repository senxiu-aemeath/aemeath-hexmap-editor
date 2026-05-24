import type { ComponentProps } from 'react'
import { useUiMessages } from '../i18n'
import { IconManagerPanel } from './IconManagerPanel'

type IconManagerPanelProps = ComponentProps<typeof IconManagerPanel>

interface IconManagerShellProps extends IconManagerPanelProps {
  width: number
  height: number
  onClose: () => void
  onResizeWidthStart: () => void
  onResizeHeightStart: () => void
}

export function IconManagerShell({ width,
  height,
  onClose,
  onResizeWidthStart,
  onResizeHeightStart,
  ...panelProps
}: IconManagerShellProps) {
  const ui = useUiMessages()
  return (
    <aside
      className="icon-manager-shell"
      aria-modal="false"
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <button
        className="icon-manager-shell__resize-handle icon-manager-shell__resize-handle--right"
        type="button"
        aria-label={ui.common.resizeExpandedTable}
        onMouseDown={onResizeWidthStart}
      />
      <button
        className="icon-manager-shell__resize-handle icon-manager-shell__resize-handle--bottom"
        type="button"
        aria-label={ui.common.resizeExpandedTable}
        onMouseDown={onResizeHeightStart}
      />
      <div className="icon-manager-shell__header">
        <div className="icon-manager-shell__heading">
          <strong>{ui.icons.managerTitle}</strong>
          <span>{ui.icons.uploadHint}</span>
        </div>
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.close}
        </button>
      </div>
      <div className="icon-manager-shell__body">
        <IconManagerPanel {...panelProps} />
      </div>
    </aside>
  )
}
