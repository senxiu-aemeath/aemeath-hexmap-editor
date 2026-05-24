import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface MoveSelectionSectionProps {
  isMoveSelectionMode: boolean
  onToggleMoveSelectionMode: () => void
  onClearMoveSelection: () => void
  moveSelectionRestrictToView: boolean
  onSetMoveSelectionRestrictToView: (value: boolean) => void
  moveRequireConfirm: boolean
  onSetMoveRequireConfirm: (value: boolean) => void
  selectedCellsText: string
  previewCellsText: string
  blockedCellsText: string
  selectionScopeHint: string
  sourceAnchorText: string
  targetAnchorText: string
  offsetText: string
  applyLabel: string
  canApply: boolean
  onApply: () => void
}

export function MoveSelectionSection({ isMoveSelectionMode,
  onToggleMoveSelectionMode,
  onClearMoveSelection,
  moveSelectionRestrictToView,
  onSetMoveSelectionRestrictToView,
  moveRequireConfirm,
  onSetMoveRequireConfirm,
  selectedCellsText,
  previewCellsText,
  blockedCellsText,
  selectionScopeHint,
  sourceAnchorText,
  targetAnchorText,
  offsetText,
  applyLabel,
  canApply,
  onApply,
}: MoveSelectionSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section">
      <SectionToggleHeader title={ui.move.selection} expanded={true} onToggle={() => {}} />
      <div className="mode-tool-card-list">
        <CardTitle>{ui.move.selection}</CardTitle>
        <ControlCard variant="frameless">
          <div className="move-selection-actions">
            <div className="table-action-group table-action-group--label-primary table-action-group--equal-2">
              <button
                className={`toolbar-action-button toolbar-action-button--secondary${isMoveSelectionMode ? ' is-active' : ''}`}
                type="button"
                onClick={onToggleMoveSelectionMode}
              >
                {ui.move.newSelection}
              </button>
              <button
                className="toolbar-action-button toolbar-action-button--secondary"
                type="button"
                onClick={onClearMoveSelection}
              >
                {ui.move.clearSelection}
              </button>
            </div>
            {moveRequireConfirm ? (
              <button className="apply-button move-selection-apply-button" type="button" disabled={!canApply} onClick={onApply}>
                {applyLabel}
              </button>
            ) : (
              <div className="surface-brush-summary move-selection-apply-notice">{ui.move.instantApplyNotice}</div>
            )}
          </div>
        </ControlCard>

        <CardTitle>{ui.move.selectionOptions}</CardTitle>
        <ControlCard variant="frameless">
          <label className="toggle-row">
            <span>{ui.move.restrictToCurrentView}</span>
            <input
              type="checkbox"
              checked={moveSelectionRestrictToView}
              onChange={(event) => {
                onSetMoveSelectionRestrictToView(event.target.checked)
              }}
            />
          </label>
          <label className="toggle-row">
            <span>{ui.move.requireConfirm}</span>
            <input
              type="checkbox"
              checked={moveRequireConfirm}
              onChange={(event) => {
                onSetMoveRequireConfirm(event.target.checked)
              }}
            />
          </label>
        </ControlCard>

        <CardTitle>{ui.move.preview}</CardTitle>
        <ControlCard variant="framed">
          <div className="move-status-card">
            <div className="move-status-counts">
              <span>{selectedCellsText}</span>
              <span>{previewCellsText}</span>
              <span>{blockedCellsText}</span>
            </div>
            <div className="surface-brush-summary">{selectionScopeHint}</div>
            <div className="move-summary-grid">
              <div className="surface-summary-item">
                <strong>{ui.move.sourceAnchor}</strong>
                <span>{sourceAnchorText}</span>
              </div>
              <div className="surface-summary-item">
                <strong>{ui.move.targetAnchor}</strong>
                <span>{targetAnchorText}</span>
              </div>
              <div className="surface-summary-item">
                <strong>{ui.move.offset}</strong>
                <span>{offsetText}</span>
              </div>
            </div>
          </div>
        </ControlCard>
      </div>
    </section>
  )
}
