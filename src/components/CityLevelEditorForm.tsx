import { useUiMessages } from '../i18n'
import { EditorHeader } from './EditorHeader'
import { IconPicker } from './IconPicker'
import { useWorldContext } from '../state/WorldContext'

interface CityLevelEditorFormProps {
  title: string
  name: string
  rank: number
  iconKey: string
  defaultIconKey: string
  iconScalePercent: number
  uniquePerCountry: boolean
  displayInCountryInfo: boolean
  canDelete: boolean
  deleteDisabled: boolean
  onClose: () => void
  onNameChange: (value: string) => void
  onRankChange: (value: string) => void
  onIconKeyChange: (value: string) => void
  onIconScalePercentChange: (value: string) => void
  onUniquePerCountryChange: (value: boolean) => void
  onDisplayInCountryInfoChange: (value: boolean) => void
  onDelete: () => void
  onSave: () => void
}

export function CityLevelEditorForm({ title,
  name,
  rank,
  iconKey,
  defaultIconKey,
  iconScalePercent,
  uniquePerCountry,
  displayInCountryInfo,
  canDelete,
  deleteDisabled,
  onClose,
  onNameChange,
  onRankChange,
  onIconKeyChange,
  onIconScalePercentChange,
  onUniquePerCountryChange,
  onDisplayInCountryInfoChange,
  onDelete,
  onSave,
}: CityLevelEditorFormProps) {
  const { iconRegistryEntries } = useWorldContext()
  const ui = useUiMessages()
  return (
    <>
      <EditorHeader title={title} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <label className="control-field">
          <span>{ui.cityLevelEditor.name}</span>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              onNameChange(event.target.value)
            }}
          />
        </label>
        <label className="control-field">
          <span>{ui.cityLevelEditor.rank}</span>
          <input
            type="number"
            min={0}
            step={1}
            value={rank}
            onChange={(event) => {
              onRankChange(event.target.value)
            }}
          />
        </label>
        <label className="control-field">
          <span>{ui.cityLevelEditor.iconKey}</span>
          <IconPicker
            value={iconKey}
            entries={iconRegistryEntries}
            onApply={(value) => {
              onIconKeyChange(value ?? defaultIconKey)
            }}
          />
        </label>
        <label className="control-field">
          <span>{ui.cityLevelEditor.iconScalePercent}</span>
          <input
            type="number"
            min={10}
            max={400}
            step={1}
            value={iconScalePercent}
            onChange={(event) => {
              onIconScalePercentChange(event.target.value)
            }}
          />
        </label>
        <label className="toggle-row">
          <span>{ui.cityLevelEditor.uniquePerCountry}</span>
          <input
            type="checkbox"
            checked={uniquePerCountry}
            onChange={(event) => {
              onUniquePerCountryChange(event.target.checked)
            }}
          />
        </label>
        <label className="toggle-row">
          <span>{ui.cityLevelEditor.displayInCountryInfo}</span>
          <input
            type="checkbox"
            checked={displayInCountryInfo}
            onChange={(event) => {
              onDisplayInCountryInfoChange(event.target.checked)
            }}
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
