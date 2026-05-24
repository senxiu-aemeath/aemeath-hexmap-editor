import { useUiMessages } from '../i18n'
import { ColorPopoverPicker } from './ColorPopoverPicker'
import { EditorHeader } from './EditorHeader'

interface GovernmentTypeEditorFormProps {
  title: string
  name: string
  color: string
  activeThemeId: string
  canDelete: boolean
  deleteDisabled: boolean
  onClose: () => void
  onNameChange: (value: string) => void
  onColorApply: (value: string) => void
  onDelete: () => void
  onSave: () => void
}

export function GovernmentTypeEditorForm({ title,
  name,
  color,
  activeThemeId,
  canDelete,
  deleteDisabled,
  onClose,
  onNameChange,
  onColorApply,
  onDelete,
  onSave,
}: GovernmentTypeEditorFormProps) {
  const ui = useUiMessages()
  return (
    <>
      <EditorHeader title={title} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <label className="control-field">
          <span>{ui.governmentTypeEditor.name}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              onNameChange(event.target.value)
            }}
          />
        </label>
        <label className="control-field">
          <span>{ui.governmentTypeEditor.color}</span>
          <ColorPopoverPicker
            value={color}
            pickerKey="government-type"
            themeId={activeThemeId}
            onApply={onColorApply}
          />
        </label>
      </div>
      <div className="modal-actions">
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.cancel}
        </button>
        {canDelete ? (
          <button
            className="ghost-button danger-button"
            type="button"
            disabled={deleteDisabled}
            onClick={onDelete}
          >
            {ui.common.delete}
          </button>
        ) : null}
        <button className="apply-button modal-primary" type="button" onClick={onSave}>
          {ui.common.save}
        </button>
      </div>
    </>
  )
}
