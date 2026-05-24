import { useUiMessages } from '../i18n'
import {
  findAssignedLabelForObject,
  type City,
  type Country,
  type LabelGroup,
  type Province,
} from '../domain/world'
import { ColorPopoverPicker } from './ColorPopoverPicker'
import { EditorHeader } from './EditorHeader'
import { ControlCard, FieldUnit } from './ToolControlPrimitives'
import { useWorldContext } from '../state/WorldContext'

interface ProvinceEditorFormProps {
  title: string
  editingProvinceId: string | null
  editingProvince: Province | null
  name: string
  countryId: string
  capitalCityId: string
  color: string
  description: string
  activeThemeId: string
  countries: Country[]
  capitalCandidates: City[]
  assignedLabelGroups: LabelGroup[]
  assignedLabelDrafts: Record<string, boolean>
  onClose: () => void
  onNameChange: (value: string) => void
  onCountryChange: (value: string) => void
  onCapitalCityChange: (value: string) => void
  onColorApply: (value: string) => void
  onDescriptionChange: (value: string) => void
  onExistingAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  onDraftAssignedLabelToggle: (group: LabelGroup, checked: boolean) => void
  onOpenCapitalCity: () => void
  onDelete: () => void
  onSave: () => void
}

export function ProvinceEditorForm({ title,
  editingProvinceId,
  editingProvince,
  name,
  countryId,
  capitalCityId,
  color,
  description,
  activeThemeId,
  countries,
  capitalCandidates,
  assignedLabelGroups,
  assignedLabelDrafts,
  onClose,
  onNameChange,
  onCountryChange,
  onCapitalCityChange,
  onColorApply,
  onDescriptionChange,
  onExistingAssignedLabelToggle,
  onDraftAssignedLabelToggle,
  onOpenCapitalCity,
  onDelete,
  onSave,
}: ProvinceEditorFormProps) {
  const { world } = useWorldContext()
  const ui = useUiMessages()
  const capitalCity = capitalCityId !== 'none' ? world.cities[capitalCityId] ?? null : null

  return (
    <>
      <EditorHeader title={title} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.provinceEditor.name} stacked>
            <input
              className="deferred-text-input"
              type="text"
              value={name}
              onChange={(event) => {
                onNameChange(event.target.value)
              }}
            />
          </FieldUnit>
          <FieldUnit fieldKey={ui.provinceEditor.country} stacked>
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
          <FieldUnit fieldKey={ui.provinceEditor.capitalCity} stacked>
            <select
              value={capitalCityId}
              disabled={capitalCandidates.length === 0}
              onChange={(event) => {
                onCapitalCityChange(event.target.value)
              }}
            >
              <option value="none">{ui.common.none}</option>
              {capitalCandidates.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </FieldUnit>
          {capitalCandidates.length === 0 ? (
            <span className="control-unit-note">{ui.provinceEditor.capitalHint}</span>
          ) : null}
        </ControlCard>
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.provinceEditor.color} stacked>
            <ColorPopoverPicker
              value={color}
              pickerKey="province-color"
              themeId={activeThemeId}
              onApply={onColorApply}
            />
          </FieldUnit>
        </ControlCard>
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.provinceEditor.description} stacked>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => {
                onDescriptionChange(event.target.value)
              }}
            />
          </FieldUnit>
        </ControlCard>
        {editingProvinceId && assignedLabelGroups.length > 0 ? (
          <>
            <h3 className="editor-section-title">{ui.label.groups}</h3>
            <div className="editor-form-card editor-assigned-label-groups">
              {assignedLabelGroups.map((group) => {
                const existingLabel = findAssignedLabelForObject(world, group.id, editingProvinceId)
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
        {!editingProvinceId && assignedLabelGroups.length > 0 ? (
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
        {editingProvince && capitalCity ? (
          <button className="ghost-button" type="button" onClick={onOpenCapitalCity}>
            {ui.provinceEditor.openCapitalCity}
          </button>
        ) : null}
        {editingProvinceId ? (
          <button
            className="ghost-button danger-button editor-delete-button"
            type="button"
            onClick={onDelete}
          >
            {ui.common.delete}
          </button>
        ) : null}
        <button className="ghost-button modal-primary editor-save-button" type="button" onClick={onSave}>
          {ui.common.save}
        </button>
      </div>
    </>
  )
}
