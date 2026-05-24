import { useUiMessages } from '../i18n'
import {
  findAssignedLabelForObject,
  type GovernmentType,
  type LabelGroup,
} from '../domain/world'
import { ColorPopoverPicker } from './ColorPopoverPicker'
import { EditorHeader } from './EditorHeader'
import { IconPicker } from './IconPicker'
import { ControlCard, FieldUnit } from './ToolControlPrimitives'
import { useWorldContext } from '../state/WorldContext'

interface CountryEditorFormProps {
  title: string
  editingCountryId: string | null
  name: string
  secondName: string
  iconKey: string | null
  color: string
  borderColor: string
  provinceDefaultColor: string
  provinceBorderColor: string
  governmentTypeId: string
  isCityState: boolean
  description: string
  activeThemeId: string
  governmentTypes: GovernmentType[]
  assignedLabelGroups: LabelGroup[]
  assignedLabelDrafts: Record<string, boolean>
  onClose: () => void
  onNameChange: (value: string) => void
  onSecondNameChange: (value: string) => void
  onIconChange: (value: string | null) => void
  onAutoComputeColors: () => void
  onColorChange: (value: string) => void
  onBorderColorChange: (value: string) => void
  onProvinceDefaultColorChange: (value: string) => void
  onProvinceBorderColorChange: (value: string) => void
  onGovernmentTypeChange: (value: string) => void
  onIsCityStateChange: (value: boolean) => void
  onDescriptionChange: (value: string) => void
  onSelectAssignedLabel: (labelId: string) => void
  onOpenAssignedLabel: (labelId: string) => void
  onToggleExistingAssignedLabelVisibility: (labelId: string) => void
  onToggleExistingAssignedLabel: (group: LabelGroup, checked: boolean) => void
  onToggleDraftAssignedLabel: (group: LabelGroup, checked: boolean) => void
  onDelete: () => void
  onSave: () => void
}

export function CountryEditorForm({ title,
  editingCountryId,
  name,
  secondName,
  iconKey,
  color,
  borderColor,
  provinceDefaultColor,
  provinceBorderColor,
  governmentTypeId,
  isCityState,
  description,
  activeThemeId,
  governmentTypes,
  assignedLabelGroups,
  assignedLabelDrafts,
  onClose,
  onNameChange,
  onSecondNameChange,
  onIconChange,
  onAutoComputeColors,
  onColorChange,
  onBorderColorChange,
  onProvinceDefaultColorChange,
  onProvinceBorderColorChange,
  onGovernmentTypeChange,
  onIsCityStateChange,
  onDescriptionChange,
  onSelectAssignedLabel,
  onOpenAssignedLabel,
  onToggleExistingAssignedLabelVisibility,
  onToggleExistingAssignedLabel,
  onToggleDraftAssignedLabel,
  onDelete,
  onSave,
}: CountryEditorFormProps) {
  const { world, iconRegistryEntries } = useWorldContext()
  const ui = useUiMessages()
  return (
    <>
      <EditorHeader title={title} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.countryEditor.name} stacked>
            <input
              className="deferred-text-input"
              type="text"
              value={name}
              onChange={(event) => {
                onNameChange(event.target.value)
              }}
            />
          </FieldUnit>
          <FieldUnit fieldKey={ui.countryEditor.secondName} stacked>
            <input
              className="deferred-text-input"
              type="text"
              value={secondName}
              onChange={(event) => {
                onSecondNameChange(event.target.value)
              }}
            />
          </FieldUnit>
          <FieldUnit fieldKey={ui.countryEditor.icon} stacked>
            <IconPicker value={iconKey} entries={iconRegistryEntries} allowEmpty onApply={onIconChange} />
          </FieldUnit>
        </ControlCard>
        <ControlCard variant="framed">
          <div className="country-editor-color-grid">
            <FieldUnit
              fieldKey={(
                <div className="country-editor-color-field-key">
                  <span>{ui.countryEditor.paletteCountry}</span>
                  <button
                    className="mini-icon-button editor-action-button country-editor-auto-button"
                    type="button"
                    onClick={onAutoComputeColors}
                  >
                    {ui.countryEditor.autoCompute}
                  </button>
                </div>
              )}
              stacked
            >
              <ColorPopoverPicker
                value={color}
                pickerKey="country-color"
                themeId={activeThemeId}
                onApply={onColorChange}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.countryEditor.paletteBorder} stacked>
              <ColorPopoverPicker
                value={borderColor}
                pickerKey="country-border-color"
                themeId={activeThemeId}
                onApply={onBorderColorChange}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.countryEditor.paletteProvinceDefault} stacked>
              <ColorPopoverPicker
                value={provinceDefaultColor}
                pickerKey="country-province-default-color"
                themeId={activeThemeId}
                onApply={onProvinceDefaultColorChange}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.countryEditor.paletteProvinceBorder} stacked>
              <ColorPopoverPicker
                value={provinceBorderColor}
                pickerKey="country-province-border-color"
                themeId={activeThemeId}
                onApply={onProvinceBorderColorChange}
              />
            </FieldUnit>
          </div>
        </ControlCard>
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.countryEditor.governmentType} stacked>
            <select
              value={governmentTypeId}
              onChange={(event) => {
                onGovernmentTypeChange(event.target.value)
              }}
            >
              <option value="none">{ui.countryEditor.noGovernmentType}</option>
              {governmentTypes.map((governmentType) => (
                <option key={governmentType.id} value={governmentType.id}>
                  {governmentType.name}
                </option>
              ))}
            </select>
          </FieldUnit>
          <label className="toggle-row compact-toggle-row">
            <span>{ui.countryEditor.isCityState}</span>
            <input
              type="checkbox"
              checked={isCityState}
              onChange={(event) => {
                onIsCityStateChange(event.target.checked)
              }}
            />
          </label>
        </ControlCard>
        <ControlCard variant="framed">
          <FieldUnit fieldKey={ui.countryEditor.description} stacked>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => {
                onDescriptionChange(event.target.value)
              }}
            />
          </FieldUnit>
        </ControlCard>
        {editingCountryId && assignedLabelGroups.length > 0 ? (
          <>
            <h3 className="editor-section-title">{ui.label.groups}</h3>
            <div className="editor-form-card editor-assigned-label-groups">
              {assignedLabelGroups.map((group) => {
                const existingLabel = findAssignedLabelForObject(world, group.id, editingCountryId)
                return (
                  <div key={group.id} className="editor-assigned-label-row">
                    <button
                      className={`editor-assigned-label-link${existingLabel ? ' is-available' : ''}`}
                      type="button"
                      title={existingLabel ? ui.label.editLabel : ui.common.none}
                      disabled={!existingLabel}
                      onClick={() => {
                        if (existingLabel) {
                          onSelectAssignedLabel(existingLabel.id)
                        }
                      }}
                      onDoubleClick={() => {
                        if (existingLabel) {
                          onOpenAssignedLabel(existingLabel.id)
                        }
                      }}
                    >
                      {group.name}
                    </button>
                    <div className="editor-assigned-label-actions">
                      <button
                        className="mode-button editor-assigned-label-visibility"
                        type="button"
                        disabled={!existingLabel}
                        onClick={() => {
                          if (existingLabel) {
                            onToggleExistingAssignedLabelVisibility(existingLabel.id)
                          }
                        }}
                      >
                        {existingLabel?.visible ? ui.common.shownLabel : ui.common.hiddenLabel}
                      </button>
                      <input
                        type="checkbox"
                        checked={Boolean(existingLabel)}
                        onDoubleClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                        }}
                        onChange={(event) => {
                          onToggleExistingAssignedLabel(group, event.target.checked)
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
        {!editingCountryId && assignedLabelGroups.length > 0 ? (
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
                      onToggleDraftAssignedLabel(group, event.target.checked)
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
        {editingCountryId ? (
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
