import { useUiMessages } from '../i18n'
import {
  findAssignedLabelForObject,
  type CityLevel,
  type Country,
  type LabelGroup,
} from '../domain/world'
import { getCityLevelName } from '../political/display'
import { EditorHeader } from './EditorHeader'
import { ControlCard, FieldUnit } from './ToolControlPrimitives'
import { useWorldContext } from '../state/WorldContext'

interface CityEditorFormProps {
  title: string
  editingCityId: string | null
  pendingCityCellId: string | null
  name: string
  secondName: string
  levelId: string
  countryId: string
  description: string
  cityLevels: CityLevel[]
  countries: Country[]
  assignedLabelGroups: LabelGroup[]
  assignedLabelDrafts: Record<string, boolean>
  onClose: () => void
  onNameChange: (value: string) => void
  onSecondNameChange: (value: string) => void
  onLevelChange: (value: string) => void
  onCountryChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onExistingAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  onDraftAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  onDelete: () => void
  onSave: () => void
}

export function CityEditorForm({ title,
  editingCityId,
  pendingCityCellId,
  name,
  secondName,
  levelId,
  countryId,
  description,
  cityLevels,
  countries,
  assignedLabelGroups,
  assignedLabelDrafts,
  onClose,
  onNameChange,
  onSecondNameChange,
  onLevelChange,
  onCountryChange,
  onDescriptionChange,
  onExistingAssignedLabelToggle,
  onDraftAssignedLabelToggle,
  onDelete,
  onSave,
}: CityEditorFormProps) {
  const { world } = useWorldContext()
  const ui = useUiMessages()
  return (
    <>
      <EditorHeader title={title} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.cityEditor.name} stacked>
            <input
              className="deferred-text-input"
              type="text"
              value={name}
              onChange={(event) => {
                onNameChange(event.target.value)
              }}
            />
          </FieldUnit>
          <FieldUnit fieldKey={ui.cityEditor.secondName} stacked>
            <input
              className="deferred-text-input"
              type="text"
              value={secondName}
              onChange={(event) => {
                onSecondNameChange(event.target.value)
              }}
            />
          </FieldUnit>
          <FieldUnit fieldKey={ui.cityEditor.type} stacked>
            <select
              value={levelId}
              onChange={(event) => {
                onLevelChange(event.target.value)
              }}
            >
              {cityLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {getCityLevelName(level.id, world.cityLevels, ui)}
                </option>
              ))}
            </select>
          </FieldUnit>
          <FieldUnit fieldKey={ui.cityEditor.country} stacked>
            <select
              value={countryId}
              onChange={(event) => {
                onCountryChange(event.target.value)
              }}
            >
              <option value="unassigned">{ui.common.unassigned}</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </FieldUnit>
        </ControlCard>
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.cityEditor.description} stacked>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => {
                onDescriptionChange(event.target.value)
              }}
            />
          </FieldUnit>
        </ControlCard>
        {editingCityId && assignedLabelGroups.length > 0 ? (
          <>
            <h3 className="editor-section-title">{ui.label.groups}</h3>
            <div className="editor-form-card editor-assigned-label-groups">
              {assignedLabelGroups.map((group) => {
                const existingLabel = findAssignedLabelForObject(world, group.id, editingCityId)
                return (
                  <label key={group.id} className="toggle-row editor-assigned-label-row">
                    <span>{group.name}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(existingLabel)}
                      onChange={(event) => {
                        onExistingAssignedLabelToggle(group, event.target.checked)
                      }}
                    />
                  </label>
                )
              })}
            </div>
          </>
        ) : null}
        {!editingCityId && pendingCityCellId && assignedLabelGroups.length > 0 ? (
          <>
            <h3 className="editor-section-title">{ui.label.groups}</h3>
            <div className="editor-form-card editor-assigned-label-groups">
              {assignedLabelGroups.map((group) => (
                <label key={group.id} className="toggle-row editor-assigned-label-row">
                  <span>{group.name}</span>
                  <input
                    type="checkbox"
                    checked={assignedLabelDrafts[group.id] ?? false}
                    onChange={(event) => {
                      onDraftAssignedLabelToggle(group, event.target.checked)
                    }}
                  />
                </label>
              ))}
            </div>
          </>
        ) : null}
      </div>
      <div className="modal-actions modal-actions--editor">
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.cancel}
        </button>
        <button
          className="ghost-button danger-button editor-delete-button"
          type="button"
          disabled={!editingCityId}
          onClick={onDelete}
        >
          {ui.common.delete}
        </button>
        <button className="ghost-button modal-primary editor-save-button" type="button" onClick={onSave}>
          {ui.common.save}
        </button>
      </div>
    </>
  )
}
