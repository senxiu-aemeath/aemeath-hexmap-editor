import type { RefObject } from 'react'
import {
  createDefaultLabelGroupAssignment,
  getLabelGroupPresetDefaults,
  updateLabelGroupAssignment,
  updateLabelGroupDefaults,
  upsertLabelGroup,
  type LabelGroup,
  type LabelStyle,
} from '../domain/world'
import { useUiMessages } from '../i18n'
import { DeferredTextInput } from './DeferredTextInput'
import { EditorHeader } from './EditorHeader'
import { LabelStyleControls } from './labels/LabelStyleControls'
import { useWorldContext } from '../state/WorldContext'

const LABEL_OFFSET_SLIDER_MIN_RANGE = 60

interface LabelGroupEditorFormProps {
  group: LabelGroup
  openingSnapshotRef: RefObject<LabelGroup | null>
  labelCount: number
  assignmentDescription: string
  onClose: () => void
  onDelete: () => void
}

function sanitizeFloatValue(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseFloat(rawValue)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export function LabelGroupEditorForm({
  group,
  openingSnapshotRef,
  labelCount,
  assignmentDescription,
  onClose,
  onDelete,
}: LabelGroupEditorFormProps) {
  const { setWorld } = useWorldContext()
  const ui = useUiMessages()
  const preset = getLabelGroupPresetDefaults(group.id)
  const overriddenKeys = new Set(
    (Object.keys(group.defaults) as Array<keyof LabelStyle>).filter(
      (key) => group.defaults[key] !== preset[key],
    ),
  )
  const offsetSliderRange =
    group.kind === 'assigned' && group.assignment
      ? {
          x: Math.max(
            LABEL_OFFSET_SLIDER_MIN_RANGE,
            Math.ceil(Math.abs(group.assignment.defaultOffsetX) / 10) * 10,
          ),
          y: Math.max(
            LABEL_OFFSET_SLIDER_MIN_RANGE,
            Math.ceil(Math.abs(group.assignment.defaultOffsetY) / 10) * 10,
          ),
        }
      : null

  const updateGroupDefaultsPartial = (patch: Partial<LabelStyle>) => {
    setWorld((current) => {
      const currentGroup = current.labelGroups[group.id]
      if (!currentGroup) {
        return current
      }
      return updateLabelGroupDefaults(current, currentGroup.id, patch)
    })
  }

  const updateAssignment = (
    updater: (assignment: NonNullable<LabelGroup['assignment']>) => NonNullable<LabelGroup['assignment']>,
  ) => {
    setWorld((current) => {
      const currentGroup = current.labelGroups[group.id]
      if (!currentGroup || currentGroup.kind !== 'assigned' || !currentGroup.assignment) {
        return current
      }
      return updateLabelGroupAssignment(current, currentGroup.id, updater(currentGroup.assignment))
    })
  }

  const restoreStyleKeyToOpenState = (key: keyof LabelStyle) => {
    const openingSnapshot = openingSnapshotRef.current
    if (!openingSnapshot || openingSnapshot.id !== group.id) {
      return
    }
    updateGroupDefaultsPartial({
      [key]: openingSnapshot.defaults[key],
    } as Partial<LabelStyle>)
  }

  const applySystemDefaultStyleKey = (key: keyof LabelStyle) => {
    const nextPreset = getLabelGroupPresetDefaults(group.id)
    updateGroupDefaultsPartial({
      [key]: nextPreset[key],
    } as Partial<LabelStyle>)
  }

  return (
    <>
      <EditorHeader
        title={`${group.name} Defaults`}
        closeLabel={ui.common.close}
        onClose={onClose}
      />
      <div className="detail-card">
        <strong>{group.name}</strong>
        <span>{`${labelCount} labels`}</span>
        <span>{assignmentDescription}</span>
      </div>
      <div className="control-list">
        <h3 className="editor-group-title">{ui.label.text}</h3>
        <label className="control-field">
          <span>{ui.common.name}</span>
          <DeferredTextInput
            value={group.name}
            onCommit={(nextValue) => {
              setWorld((current) => {
                const currentGroup = current.labelGroups[group.id]
                if (!currentGroup) {
                  return current
                }
                return upsertLabelGroup(current, {
                  ...currentGroup,
                  name: nextValue,
                })
              })
            }}
          />
        </label>
        <label className="control-field compact-control-field">
          <span>{ui.label.groupKind}</span>
          <select
            value={group.kind}
            disabled={group.builtIn}
            onChange={(event) => {
              const nextKind = event.target.value as 'free' | 'assigned'
              setWorld((current) => {
                const currentGroup = current.labelGroups[group.id]
                if (!currentGroup) {
                  return current
                }
                return updateLabelGroupAssignment(
                  current,
                  currentGroup.id,
                  nextKind === 'assigned'
                    ? currentGroup.assignment ?? createDefaultLabelGroupAssignment('city')
                    : null,
                )
              })
            }}
          >
            <option value="free">{ui.label.free}</option>
            <option value="assigned">{ui.label.assigned}</option>
          </select>
        </label>
        {group.kind === 'assigned' && group.assignment ? (
          <>
            <label className="control-field compact-control-field">
              <span>{ui.label.assignTarget}</span>
              <select
                value={group.assignment.kind}
                disabled={group.builtIn}
                onChange={(event) => {
                  const nextTarget = event.target.value as 'city' | 'country' | 'province'
                  updateAssignment((assignment) => ({
                    ...assignment,
                    kind: nextTarget,
                  }))
                }}
              >
                <option value="city">{ui.label.cityTarget}</option>
                <option value="country">{ui.label.countryTarget}</option>
                <option value="province">{ui.label.provinceTarget}</option>
              </select>
            </label>
            <label className="control-field compact-control-field">
              <span>{ui.label.sourceName}</span>
              <select
                value={group.assignment.sourceNameMode}
                onChange={(event) => {
                  updateAssignment((assignment) => ({
                    ...assignment,
                    sourceNameMode: event.target.value as 'primary' | 'secondary',
                  }))
                }}
              >
                <option value="primary">{ui.label.primaryName}</option>
                <option value="secondary">{ui.label.secondaryName}</option>
              </select>
            </label>
            <label className="control-field">
              <span>{ui.label.generatedPrefix}</span>
              <DeferredTextInput
                value={group.assignment.generatedTextPrefix}
                onCommit={(nextValue) => {
                  updateAssignment((assignment) => ({
                    ...assignment,
                    generatedTextPrefix: nextValue,
                  }))
                }}
              />
            </label>
            <label className="control-field">
              <span>{ui.label.generatedSuffix}</span>
              <DeferredTextInput
                value={group.assignment.generatedTextSuffix}
                onCommit={(nextValue) => {
                  updateAssignment((assignment) => ({
                    ...assignment,
                    generatedTextSuffix: nextValue,
                  }))
                }}
              />
            </label>
            <h3 className="editor-group-title">{ui.common.position}</h3>
            <label className="control-field compact-control-field">
              <span>{ui.common.defaultAnchor}</span>
              <select
                value={group.defaults.textAlign}
                onChange={(event) => {
                  updateGroupDefaultsPartial({
                    textAlign: event.target.value as LabelStyle['textAlign'],
                  })
                }}
              >
                <option value="left">{ui.common.leftAlign}</option>
                <option value="center">{ui.common.centerAlign}</option>
                <option value="right">{ui.common.rightAlign}</option>
              </select>
            </label>
            <h3 className="editor-group-title">{ui.common.automation}</h3>
            <label className="control-field compact-control-field">
              <span>{ui.automation.autoCreateMode}</span>
              <select
                value={
                  group.assignment.autoCreateMode === 'always'
                    ? 'always'
                    : group.assignment.autoCreateMode === 'never'
                      ? 'never'
                      : group.assignment.autoCreateDefault
                        ? 'default_on'
                        : 'default_off'
                }
                onChange={(event) => {
                  const nextValue = event.target.value as
                    | 'always'
                    | 'never'
                    | 'default_on'
                    | 'default_off'
                  updateAssignment((assignment) => ({
                    ...assignment,
                    autoCreateMode:
                      nextValue === 'always' || nextValue === 'never'
                        ? nextValue
                        : 'default',
                    autoCreateDefault:
                      nextValue === 'default_on'
                        ? true
                        : nextValue === 'default_off'
                          ? false
                          : assignment.autoCreateDefault,
                  }))
                }}
              >
                <option value="always">{ui.automation.modeAlways}</option>
                <option value="never">{ui.automation.modeNever}</option>
                <option value="default_on">{ui.automation.modeDefaultOn}</option>
                <option value="default_off">{ui.automation.modeDefaultOff}</option>
              </select>
            </label>
            <label className="toggle-row">
              <span>{ui.automation.confirmOnRemove}</span>
              <input
                type="checkbox"
                checked={group.assignment.confirmOnRemove}
                onChange={(event) => {
                  updateAssignment((assignment) => ({
                    ...assignment,
                    confirmOnRemove: event.target.checked,
                  }))
                }}
              />
            </label>
          </>
        ) : null}
      </div>
      <h3 className="editor-group-title editor-chapter-title">{ui.label.groupDefaultStyle}</h3>
      <LabelStyleControls
        title={ui.label.groupDefaults}
        style={group.defaults}
        disabled={group.locked}
        overriddenKeys={overriddenKeys}
        onChange={(key, value) => {
          updateGroupDefaultsPartial({
            [key]: value,
          } as Partial<LabelStyle>)
        }}
        onResetKey={restoreStyleKeyToOpenState}
        onDefaultKey={applySystemDefaultStyleKey}
        onRestoreKey={applySystemDefaultStyleKey}
      />
      {group.kind === 'assigned' && group.assignment ? (
        <div className="detail-card compact-detail-card">
          <div className="editor-subsection">
            <div className="editor-section-header">
              <h3 className="editor-group-title">{ui.common.offset}</h3>
              <span className="editor-section-meta">
                {`${group.assignment.defaultOffsetX.toFixed(2)}, ${group.assignment.defaultOffsetY.toFixed(2)}`}
              </span>
            </div>
            <div className="xy-control-grid">
              <div className="xy-axis-group">
                <div className="xy-axis-header-row">
                  <span className="xy-axis-label">{ui.common.xAxis}</span>
                </div>
                <div className="xy-axis-input-row">
                  <label className="xy-slider-field">
                    <span className="xy-slider-zero">0</span>
                    <input
                      type="range"
                      min={offsetSliderRange ? -offsetSliderRange.x : -LABEL_OFFSET_SLIDER_MIN_RANGE}
                      max={offsetSliderRange ? offsetSliderRange.x : LABEL_OFFSET_SLIDER_MIN_RANGE}
                      step={1}
                      value={Math.max(
                        offsetSliderRange ? -offsetSliderRange.x : -LABEL_OFFSET_SLIDER_MIN_RANGE,
                        Math.min(
                          offsetSliderRange ? offsetSliderRange.x : LABEL_OFFSET_SLIDER_MIN_RANGE,
                          group.assignment.defaultOffsetX,
                        ),
                      )}
                      onChange={(event) => {
                        updateAssignment((assignment) => ({
                          ...assignment,
                          defaultOffsetX: sanitizeFloatValue(
                            event.target.value,
                            assignment.defaultOffsetX,
                            -9999,
                            9999,
                          ),
                        }))
                      }}
                    />
                  </label>
                  <div className="xy-input-field">
                    <input
                      type="number"
                      step={1}
                      aria-label={ui.common.xAxis}
                      value={group.assignment.defaultOffsetX}
                      onChange={(event) => {
                        updateAssignment((assignment) => ({
                          ...assignment,
                          defaultOffsetX: sanitizeFloatValue(
                            event.target.value,
                            assignment.defaultOffsetX,
                            -9999,
                            9999,
                          ),
                        }))
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="xy-axis-group">
                <div className="xy-axis-header-row">
                  <span className="xy-axis-label">{ui.common.yAxis}</span>
                </div>
                <div className="xy-axis-input-row">
                  <label className="xy-slider-field">
                    <span className="xy-slider-zero">0</span>
                    <input
                      type="range"
                      min={offsetSliderRange ? -offsetSliderRange.y : -LABEL_OFFSET_SLIDER_MIN_RANGE}
                      max={offsetSliderRange ? offsetSliderRange.y : LABEL_OFFSET_SLIDER_MIN_RANGE}
                      step={1}
                      value={Math.max(
                        offsetSliderRange ? -offsetSliderRange.y : -LABEL_OFFSET_SLIDER_MIN_RANGE,
                        Math.min(
                          offsetSliderRange ? offsetSliderRange.y : LABEL_OFFSET_SLIDER_MIN_RANGE,
                          group.assignment.defaultOffsetY,
                        ),
                      )}
                      onChange={(event) => {
                        updateAssignment((assignment) => ({
                          ...assignment,
                          defaultOffsetY: sanitizeFloatValue(
                            event.target.value,
                            assignment.defaultOffsetY,
                            -9999,
                            9999,
                          ),
                        }))
                      }}
                    />
                  </label>
                  <div className="xy-input-field">
                    <input
                      type="number"
                      step={1}
                      aria-label={ui.common.yAxis}
                      value={group.assignment.defaultOffsetY}
                      onChange={(event) => {
                        updateAssignment((assignment) => ({
                          ...assignment,
                          defaultOffsetY: sanitizeFloatValue(
                            event.target.value,
                            assignment.defaultOffsetY,
                            -9999,
                            9999,
                          ),
                        }))
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="modal-actions">
        {!group.builtIn ? (
          <button className="ghost-button danger-button" type="button" onClick={onDelete}>
            {ui.common.delete}
          </button>
        ) : null}
        <button className="apply-button modal-primary" type="button" onClick={onClose}>
          {ui.common.close}
        </button>
      </div>
    </>
  )
}
