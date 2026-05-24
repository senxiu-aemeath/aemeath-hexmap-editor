import { useUiMessages } from '../i18n'
import { EditorHeader } from './EditorHeader'

interface UniqueLevelConflict {
  levelId: string
  countryId: string | null
  existingCityId: string
  actionType: 'place' | 'change'
  cityData?: { name: string; cellId: string; levelId: string }
}

interface UniqueLevelConflictDialogProps {
  conflict: UniqueLevelConflict
  levelName: string
  countryName: string
  existingCityName: string
  onClose: () => void
  onConfirm: () => void
}

export function UniqueLevelConflictDialog({ conflict,
  levelName,
  countryName,
  existingCityName,
  onClose,
  onConfirm,
}: UniqueLevelConflictDialogProps) {
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
          title={ui.validation.uniqueLevelExistsTitle}
          closeLabel={ui.common.close}
          onClose={onClose}
        />
        <div className="control-list">
          <p>{ui.validation.uniqueLevelExistsMessage(levelName, countryName, existingCityName)}</p>
          <p>{ui.validation.uniqueLevelConfirm}</p>
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
            {conflict.actionType === 'place'
              ? ui.validation.uniqueLevelPlaceConfirm
              : ui.validation.uniqueLevelChangeConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}
