import { useUiMessages } from '../i18n'
import { EditorHeader } from './EditorHeader'

interface PendingAssignedLabelRemoval {
  targetKind: 'city' | 'country' | 'province'
  targetId: string
  groupId: string
  groupName: string
}

interface AssignedLabelRemovalDialogProps {
  pending: PendingAssignedLabelRemoval
  skipConfirm: boolean
  onClose: () => void
  onSkipConfirmChange: (value: boolean) => void
  onConfirm: () => void
}

export function AssignedLabelRemovalDialog({ pending,
  skipConfirm,
  onClose,
  onSkipConfirmChange,
  onConfirm,
}: AssignedLabelRemovalDialogProps) {
  const ui = useUiMessages()
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <EditorHeader
          title={ui.automation.removeConfirmTitle}
          closeLabel={ui.common.close}
          onClose={onClose}
        />
        <div className="control-list">
          <p>
            {ui.automation.removeConfirmMessage(
              pending.groupName,
              pending.targetKind === 'city'
                ? ui.label.cityTarget
                : pending.targetKind === 'country'
                  ? ui.label.countryTarget
                  : ui.label.provinceTarget,
            )}
          </p>
          <label className="toggle-row">
            <span>{ui.automation.dontAskAgain}</span>
            <input
              type="checkbox"
              checked={skipConfirm}
              onChange={(event) => {
                onSkipConfirmChange(event.target.checked)
              }}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            {ui.common.cancel}
          </button>
          <button
            className="apply-button modal-primary danger-button"
            type="button"
            onClick={onConfirm}
          >
            {ui.common.delete}
          </button>
        </div>
      </div>
    </div>
  )
}
