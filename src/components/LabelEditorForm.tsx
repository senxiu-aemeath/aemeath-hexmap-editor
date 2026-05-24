import { useEffect, useMemo, type Dispatch, type RefObject, type SetStateAction } from 'react'
import {
  DEFAULT_LABEL_STYLE,
  createAssignedLabelForGroup,
  getEffectiveLabelStyle,
  getLabelAnchorOffsetState,
  getLabelGroupAssignmentDefaultOffset,
  nudgeLabelAnchor,
  resolveLabelText,
  restoreAllLabelStyleOverrides,
  setLabelStyleOverrides,
  updateLabelGroupDefaults,
  upsertLabel,
  type City,
  type Country,
  type Label,
  type LabelGroup,
  type LabelOffsetAnchor,
  type LabelStyle,
  type Province,
  type WorldDocument,
} from '../domain/world'
import { useUiMessages } from '../i18n'
import { DeferredTextInput } from './DeferredTextInput'
import { EditorHeader } from './EditorHeader'
import { LabelStyleControls } from './labels/LabelStyleControls'
import { useWorldContext } from '../state/WorldContext'

const LABEL_OFFSET_SLIDER_MIN_RANGE = 60

interface LabelEditorOpenSnapshot {
  label: Label
  labelGroups: Record<string, LabelGroup>
}

interface LabelEditorFormProps {
  label: Label
  labelGroup: LabelGroup | null
  labelGroups: LabelGroup[]
  sortedCountries: Country[]
  sortedProvinces: Province[]
  sortedCities: City[]
  activeCityId: string | null
  activeCountryId: string | null
  activeProvinceId: string | null
  activeCanvasZoom: number
  editingAssignedLabelCountryFilter: string
  setEditingAssignedLabelCountryFilter: Dispatch<SetStateAction<string>>
  openingSnapshotRef: RefObject<LabelEditorOpenSnapshot | null>
  sourceDescription: string
  anchorDescription: string
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

function flipHorizontalAlign(align: LabelStyle['textAlign']): LabelStyle['textAlign'] {
  if (align === 'left') {
    return 'right'
  }
  if (align === 'right') {
    return 'left'
  }
  return 'center'
}

function syncLabelToAssignedGroupTarget(
  world: WorldDocument,
  label: Label,
  groupId: string,
  targetId: string,
): Label | null {
  const assignedPrototype = createAssignedLabelForGroup(world, groupId, targetId)
  if (!assignedPrototype) {
    return null
  }

  return {
    ...label,
    groupId,
    source: assignedPrototype.source,
    anchor: assignedPrototype.anchor,
    textMode: assignedPrototype.textMode,
    customText: assignedPrototype.customText,
  }
}

export function LabelEditorForm({
  label,
  labelGroup,
  labelGroups,
  sortedCountries,
  sortedProvinces,
  sortedCities,
  activeCityId,
  activeCountryId,
  activeProvinceId,
  activeCanvasZoom,
  editingAssignedLabelCountryFilter,
  setEditingAssignedLabelCountryFilter,
  openingSnapshotRef,
  sourceDescription,
  anchorDescription,
  onClose,
  onDelete,
}: LabelEditorFormProps) {
  const { world, setWorld } = useWorldContext()
  const ui = useUiMessages()
  const labelStyle = getEffectiveLabelStyle(labelGroup ?? undefined, label)
  const labelText = resolveLabelText(world, label)
  const editingDefaultAnchorAlign = labelGroup?.defaults.textAlign ?? DEFAULT_LABEL_STYLE.textAlign
  const editingEffectiveAnchorAlign = labelStyle.textAlign ?? editingDefaultAnchorAlign
  const editingUsesDefaultAnchorAlign = label.styleOverrides.textAlign === undefined
  const editingLabelOverrideKeys = new Set(
    Object.keys(label.styleOverrides) as Array<keyof LabelStyle>,
  )
  const editingLabelInteractionLocked = false
  const editingLabelOffsetDragLocked = Boolean(label.locked || labelGroup?.locked)
  const editingLabelOffsetLockToggleDisabled =
    editingLabelInteractionLocked || Boolean(labelGroup?.locked)
  const editingOffsetAnchor: LabelOffsetAnchor | null =
    label.anchor.kind !== 'world' && label.anchor.kind !== 'path' ? label.anchor : null
  const editingAssignmentDefaultOffset = getLabelGroupAssignmentDefaultOffset(labelGroup)
  const editingOffsetState = getLabelAnchorOffsetState(labelGroup, editingOffsetAnchor)
  const editingEffectiveOffset = editingOffsetState
    ? {
        x: editingOffsetState.effectiveX,
        y: editingOffsetState.effectiveY,
      }
    : null
  const editingOffsetSliderRange = editingOffsetAnchor
    ? {
        x: Math.max(
          LABEL_OFFSET_SLIDER_MIN_RANGE,
          Math.ceil(
            Math.max(
              Math.abs(editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX),
              Math.abs(editingAssignmentDefaultOffset?.x ?? 0),
            ) / 10,
          ) * 10,
        ),
        y: Math.max(
          LABEL_OFFSET_SLIDER_MIN_RANGE,
          Math.ceil(
            Math.max(
              Math.abs(editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY),
              Math.abs(editingAssignmentDefaultOffset?.y ?? 0),
            ) / 10,
          ) * 10,
        ),
      }
    : null

  const editingAssignedCityOptions = useMemo(() => {
    if (!labelGroup || labelGroup.kind !== 'assigned' || labelGroup.assignment?.kind !== 'city') {
      return []
    }

    return sortedCities.filter((city) => {
      if (editingAssignedLabelCountryFilter === 'all') {
        return true
      }
      if (editingAssignedLabelCountryFilter === 'unassigned') {
        return city.countryId === null
      }
      return city.countryId === editingAssignedLabelCountryFilter
    })
  }, [editingAssignedLabelCountryFilter, labelGroup, sortedCities])

  useEffect(() => {
    if (!labelGroup || labelGroup.kind !== 'assigned' || labelGroup.assignment?.kind !== 'city') {
      setEditingAssignedLabelCountryFilter('all')
      return
    }

    if (label.source.kind === 'city') {
      const sourceCity = world.cities[label.source.cityId]
      if (sourceCity) {
        setEditingAssignedLabelCountryFilter(sourceCity.countryId ?? 'unassigned')
        return
      }
    }

    if (activeCountryId && world.countries[activeCountryId]) {
      setEditingAssignedLabelCountryFilter(activeCountryId)
      return
    }

    setEditingAssignedLabelCountryFilter('all')
  }, [
    activeCountryId,
    label,
    labelGroup,
    setEditingAssignedLabelCountryFilter,
    world.cities,
    world.countries,
  ])

  const updateCurrentLabel = (
    updater: (currentLabel: Label, currentWorld: WorldDocument) => WorldDocument,
  ) => {
    setWorld((current) => {
      const currentLabel = current.labels[label.id]
      if (!currentLabel) {
        return current
      }
      return updater(currentLabel, current)
    })
  }

  const setEditingLabelOffsetDragLocked = (locked: boolean) => {
    updateCurrentLabel((currentLabel, current) =>
      upsertLabel(current, {
        ...currentLabel,
        locked,
      }),
    )
  }

  const restoreStyleKeyToOpenState = (key: keyof LabelStyle) => {
    const openingSnapshot = openingSnapshotRef.current
    if (!openingSnapshot || openingSnapshot.label.id !== label.id) {
      return
    }

    setWorld((current) => {
      const currentLabel = current.labels[label.id]
      if (!currentLabel) {
        return current
      }

      const openingLabel = openingSnapshot.label
      const openingGroup = openingSnapshot.labelGroups[currentLabel.groupId]
      let nextWorld = current
      if (openingGroup) {
        nextWorld = updateLabelGroupDefaults(nextWorld, currentLabel.groupId, {
          [key]: openingGroup.defaults[key],
        } as Partial<LabelStyle>)
      }

      const openingOverride = openingLabel.styleOverrides[key]
      const nextLabel = nextWorld.labels[currentLabel.id]
      if (!nextLabel) {
        return nextWorld
      }

      const nextStyleOverrides = {
        ...nextLabel.styleOverrides,
      } as Record<keyof LabelStyle, LabelStyle[keyof LabelStyle] | undefined>

      if (openingOverride === undefined) {
        delete nextStyleOverrides[key]
      } else {
        nextStyleOverrides[key] = openingOverride
      }

      return upsertLabel(nextWorld, {
        ...nextLabel,
        useGroupDefaults: openingLabel.useGroupDefaults,
        styleOverrides: nextStyleOverrides as Partial<LabelStyle>,
      })
    })
  }

  const restoreAnchorToOpenState = () => {
    const openingSnapshot = openingSnapshotRef.current
    if (!openingSnapshot || openingSnapshot.label.id !== label.id) {
      return
    }

    setWorld((current) => {
      const currentLabel = current.labels[label.id]
      if (!currentLabel) {
        return current
      }

      const openingTextAlign = openingSnapshot.label.styleOverrides.textAlign
      const nextStyleOverrides = { ...currentLabel.styleOverrides }
      if (openingTextAlign === undefined) {
        delete nextStyleOverrides.textAlign
      } else {
        nextStyleOverrides.textAlign = openingTextAlign
      }

      return upsertLabel(current, {
        ...currentLabel,
        styleOverrides: nextStyleOverrides,
      })
    })
  }

  const restoreOffsetToOpenState = () => {
    const openingSnapshot = openingSnapshotRef.current
    if (!openingSnapshot || openingSnapshot.label.id !== label.id) {
      return
    }

    setWorld((current) => {
      const currentLabel = current.labels[label.id]
      if (!currentLabel) {
        return current
      }
      if (currentLabel.anchor.kind === 'world' || currentLabel.anchor.kind === 'path') {
        return current
      }

      const openingAnchor = openingSnapshot.label.anchor
      if (openingAnchor.kind === 'world' || openingAnchor.kind === 'path') {
        return current
      }

      return upsertLabel(current, {
        ...currentLabel,
        anchor: structuredClone(openingAnchor),
      })
    })
  }

  const applyFontSize = (rawValue: string) => {
    updateCurrentLabel((currentLabel, current) => {
      const effectiveStyle = getEffectiveLabelStyle(
        current.labelGroups[currentLabel.groupId],
        currentLabel,
      )
      const nextValue = sanitizeFloatValue(rawValue, effectiveStyle.fontSize, 8, 240)

      if (currentLabel.useGroupDefaults && current.labelGroups[currentLabel.groupId]) {
        return updateLabelGroupDefaults(current, currentLabel.groupId, {
          fontSize: nextValue,
        })
      }

      return setLabelStyleOverrides(
        upsertLabel(current, {
          ...currentLabel,
          useGroupDefaults: false,
        }),
        currentLabel.id,
        {
          fontSize: nextValue,
        },
      )
    })
  }

  return (
    <>
      <EditorHeader title={ui.label.editLabel} closeLabel={ui.common.close} onClose={onClose} />
      <div className="control-list">
        <h3 className="editor-group-title">{ui.label.text}</h3>
        <label className="control-field compact-control-field">
          <span>{ui.label.group}</span>
          <select
            value={label.groupId}
            disabled={editingLabelInteractionLocked}
            onChange={(event) => {
              const nextGroupId = event.target.value
              updateCurrentLabel((currentLabel, current) => {
                const nextGroup = current.labelGroups[nextGroupId]
                let nextLabel: Label = {
                  ...currentLabel,
                  groupId: nextGroupId,
                }

                if (nextGroup?.kind === 'assigned' && nextGroup.assignment) {
                  const targetId =
                    nextGroup.assignment.kind === 'city'
                      ? currentLabel.source.kind === 'city' &&
                          current.cities[currentLabel.source.cityId]
                        ? currentLabel.source.cityId
                        : activeCityId ?? sortedCities[0]?.id ?? null
                      : nextGroup.assignment.kind === 'country'
                        ? currentLabel.source.kind === 'country' &&
                            current.countries[currentLabel.source.countryId]
                          ? currentLabel.source.countryId
                          : activeCountryId ?? sortedCountries[0]?.id ?? null
                        : currentLabel.source.kind === 'province' &&
                            current.provinces[currentLabel.source.provinceId]
                          ? currentLabel.source.provinceId
                          : activeProvinceId ?? sortedProvinces[0]?.id ?? null

                  if (targetId) {
                    nextLabel =
                      syncLabelToAssignedGroupTarget(current, nextLabel, nextGroupId, targetId) ??
                      nextLabel
                  }
                }

                return upsertLabel(current, nextLabel)
              })
            }}
          >
            {labelGroups.map((groupOption) => (
              <option key={groupOption.id} value={groupOption.id}>
                {groupOption.name}
              </option>
            ))}
          </select>
        </label>

        {label.renderKind === 'country-icon' ? (
          <label className="control-field compact-control-field">
            <span>{ui.label.countryTarget}</span>
            <select
              value={label.source.kind === 'country' ? label.source.countryId : ''}
              disabled={editingLabelInteractionLocked}
              onChange={(event) => {
                const nextCountryId = event.target.value
                if (!nextCountryId || !world.countries[nextCountryId]) {
                  return
                }
                updateCurrentLabel((currentLabel, current) => {
                  if (currentLabel.renderKind !== 'country-icon') {
                    return current
                  }
                  return upsertLabel(current, {
                    ...currentLabel,
                    source: { kind: 'country', countryId: nextCountryId },
                    anchor:
                      currentLabel.anchor.kind === 'country'
                        ? { ...currentLabel.anchor, countryId: nextCountryId }
                        : currentLabel.anchor,
                  })
                })
              }}
            >
              <option value="">{ui.common.none}</option>
              {sortedCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {label.renderKind !== 'country-icon' &&
        labelGroup?.kind === 'assigned' &&
        labelGroup.assignment?.kind === 'country' ? (
          <label className="control-field compact-control-field">
            <span>{ui.label.countryTarget}</span>
            <select
              value={label.source.kind === 'country' ? label.source.countryId : ''}
              disabled={editingLabelInteractionLocked}
              onChange={(event) => {
                const nextLabel = syncLabelToAssignedGroupTarget(
                  world,
                  label,
                  label.groupId,
                  event.target.value,
                )
                if (!nextLabel) {
                  return
                }
                setWorld((current) => upsertLabel(current, nextLabel))
              }}
            >
              <option value="">{ui.common.none}</option>
              {sortedCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {labelGroup?.kind === 'assigned' && labelGroup.assignment?.kind === 'province' ? (
          <label className="control-field compact-control-field">
            <span>{ui.label.provinceTarget}</span>
            <select
              value={label.source.kind === 'province' ? label.source.provinceId : ''}
              disabled={editingLabelInteractionLocked}
              onChange={(event) => {
                const nextLabel = syncLabelToAssignedGroupTarget(
                  world,
                  label,
                  label.groupId,
                  event.target.value,
                )
                if (!nextLabel) {
                  return
                }
                setWorld((current) => upsertLabel(current, nextLabel))
              }}
            >
              <option value="">{ui.common.none}</option>
              {sortedProvinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.countryId
                    ? `${province.name} · ${world.countries[province.countryId]?.name ?? ui.common.unassigned}`
                    : `${province.name} · ${ui.common.unassigned}`}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {labelGroup?.kind === 'assigned' && labelGroup.assignment?.kind === 'city' ? (
          <>
            <label className="control-field compact-control-field">
              <span>{ui.cityTable.country}</span>
              <select
                value={editingAssignedLabelCountryFilter}
                disabled={editingLabelInteractionLocked}
                onChange={(event) => {
                  const nextFilter = event.target.value
                  setEditingAssignedLabelCountryFilter(nextFilter)
                  const nextCity =
                    sortedCities.find((city) => {
                      if (nextFilter === 'all') {
                        return true
                      }
                      if (nextFilter === 'unassigned') {
                        return city.countryId === null
                      }
                      return city.countryId === nextFilter
                    }) ?? null
                  if (!nextCity) {
                    return
                  }
                  const nextLabel = syncLabelToAssignedGroupTarget(
                    world,
                    label,
                    label.groupId,
                    nextCity.id,
                  )
                  if (!nextLabel) {
                    return
                  }
                  setWorld((current) => upsertLabel(current, nextLabel))
                }}
              >
                <option value="">{ui.common.none}</option>
                <option value="all">{ui.label.all}</option>
                <option value="unassigned">{ui.common.unassigned}</option>
                {sortedCountries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="control-field compact-control-field">
              <span>{ui.label.cityTarget}</span>
              <select
                value={label.source.kind === 'city' ? label.source.cityId : ''}
                disabled={editingLabelInteractionLocked || editingAssignedCityOptions.length === 0}
                onChange={(event) => {
                  const nextLabel = syncLabelToAssignedGroupTarget(
                    world,
                    label,
                    label.groupId,
                    event.target.value,
                  )
                  if (!nextLabel) {
                    return
                  }
                  setWorld((current) => upsertLabel(current, nextLabel))
                }}
              >
                <option value="">{ui.common.none}</option>
                {editingAssignedCityOptions.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.countryId
                      ? `${city.name} · ${world.countries[city.countryId]?.name ?? ui.common.unassigned}`
                      : `${city.name} · ${ui.common.unassigned}`}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}

        <div className="compact-toggle-grid">
          <label className="toggle-row compact-toggle-row">
            <span>{ui.label.visible}</span>
            <input
              type="checkbox"
              checked={label.visible}
              disabled={editingLabelInteractionLocked}
              onChange={(event) => {
                updateCurrentLabel((currentLabel, current) =>
                  upsertLabel(current, {
                    ...currentLabel,
                    visible: event.target.checked,
                  }),
                )
              }}
            />
          </label>
          <label className="toggle-row compact-toggle-row">
            <span>{ui.common.lockedLabel}</span>
            <input
              type="checkbox"
              checked={editingLabelOffsetDragLocked}
              disabled={editingLabelOffsetLockToggleDisabled}
              onChange={(event) => {
                setEditingLabelOffsetDragLocked(event.target.checked)
              }}
            />
          </label>
        </div>

        {label.renderKind === 'country-icon' ? (
          <div className="detail-card compact-detail-card">
            <div className="editor-section-header">
              <h3 className="editor-group-title">{ui.label.iconSize}</h3>
              <div className="editor-section-actions">
                <span className="editor-section-meta">{`${Math.round(labelStyle.fontSize)} px`}</span>
                <button
                  className="mini-icon-button editor-action-button"
                  type="button"
                  disabled={editingLabelInteractionLocked}
                  onClick={() => {
                    restoreStyleKeyToOpenState('fontSize')
                  }}
                >
                  {ui.common.reset}
                </button>
              </div>
            </div>
            <div className="icon-size-control-row">
              <input
                className="icon-size-slider"
                type="range"
                min={8}
                max={240}
                step={1}
                value={labelStyle.fontSize}
                disabled={editingLabelInteractionLocked}
                onChange={(event) => {
                  applyFontSize(event.target.value)
                }}
              />
              <input
                className="icon-size-number"
                type="number"
                min={8}
                max={240}
                step={1}
                value={labelStyle.fontSize}
                disabled={editingLabelInteractionLocked}
                onChange={(event) => {
                  applyFontSize(event.target.value)
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <label className="control-field compact-control-field">
              <span>{ui.label.textMode}</span>
              <select
                value={label.textMode}
                disabled={editingLabelInteractionLocked}
                onChange={(event) => {
                  const nextMode = event.target.value as Label['textMode']
                  updateCurrentLabel((currentLabel, current) =>
                    upsertLabel(current, {
                      ...currentLabel,
                      textMode: nextMode,
                    }),
                  )
                }}
              >
                <option value="source">{ui.label.source}</option>
                <option value="custom">{ui.label.custom}</option>
              </select>
            </label>
            {label.textMode === 'custom' ? (
              <label className="control-field">
                <span>{ui.label.text}</span>
                <DeferredTextInput
                  value={label.customText}
                  disabled={editingLabelInteractionLocked}
                  onCommit={(nextValue) => {
                    updateCurrentLabel((currentLabel, current) =>
                      upsertLabel(current, {
                        ...currentLabel,
                        customText: nextValue,
                      }),
                    )
                  }}
                />
              </label>
            ) : null}
          </>
        )}

        <h3 className="editor-group-title">{ui.common.position}</h3>
        {editingOffsetAnchor ? (
          <div className="detail-card compact-detail-card">
            <div className="editor-subsection">
              <div className="editor-section-header">
                <h3 className="editor-group-title">{ui.common.anchor}</h3>
                <div className="editor-section-actions">
                  <span className="editor-section-meta">{editingEffectiveAnchorAlign}</span>
                  <button
                    className="mini-icon-button editor-action-button"
                    type="button"
                    disabled={editingLabelInteractionLocked}
                    onClick={restoreAnchorToOpenState}
                  >
                    {ui.common.reset}
                  </button>
                </div>
              </div>
              <div className="editor-anchor-row">
                <select
                  className="editor-plain-select"
                  value={editingEffectiveAnchorAlign}
                  disabled={editingLabelInteractionLocked}
                  onChange={(event) => {
                    updateCurrentLabel((currentLabel, current) =>
                      upsertLabel(current, {
                        ...currentLabel,
                        styleOverrides: {
                          ...currentLabel.styleOverrides,
                          textAlign: event.target.value as LabelStyle['textAlign'],
                        },
                      }),
                    )
                  }}
                >
                  <option value="left">{ui.common.leftAlign}</option>
                  <option value="center">{ui.common.centerAlign}</option>
                  <option value="right">{ui.common.rightAlign}</option>
                </select>
                <label className="editor-action-toggle">
                  <span>{ui.common.defaultValue}</span>
                  <input
                    type="checkbox"
                    checked={editingUsesDefaultAnchorAlign}
                    disabled={editingLabelInteractionLocked}
                    onChange={(event) => {
                      if (event.target.checked) {
                        updateCurrentLabel((currentLabel, current) => {
                          const restOverrides = { ...currentLabel.styleOverrides }
                          delete restOverrides.textAlign
                          return upsertLabel(current, {
                            ...currentLabel,
                            styleOverrides: restOverrides,
                          })
                        })
                        return
                      }

                      updateCurrentLabel((currentLabel, current) =>
                        upsertLabel(current, {
                          ...currentLabel,
                          styleOverrides: {
                            ...currentLabel.styleOverrides,
                            textAlign: editingEffectiveAnchorAlign,
                          },
                        }),
                      )
                    }}
                  />
                </label>
                <label className="editor-action-toggle">
                  <span>{ui.common.flip}</span>
                  <input
                    type="checkbox"
                    checked={
                      editingDefaultAnchorAlign !== 'center' &&
                      editingEffectiveAnchorAlign === flipHorizontalAlign(editingDefaultAnchorAlign)
                    }
                    disabled={editingLabelInteractionLocked || editingDefaultAnchorAlign === 'center'}
                    onChange={(event) => {
                      if (editingDefaultAnchorAlign === 'center') {
                        return
                      }

                      const nextAlign = event.target.checked
                        ? flipHorizontalAlign(editingDefaultAnchorAlign)
                        : editingDefaultAnchorAlign

                      if (nextAlign === editingDefaultAnchorAlign) {
                        updateCurrentLabel((currentLabel, current) => {
                          const restOverrides = { ...currentLabel.styleOverrides }
                          delete restOverrides.textAlign
                          return upsertLabel(current, {
                            ...currentLabel,
                            styleOverrides: restOverrides,
                          })
                        })
                        return
                      }

                      updateCurrentLabel((currentLabel, current) =>
                        upsertLabel(current, {
                          ...currentLabel,
                          styleOverrides: {
                            ...currentLabel.styleOverrides,
                            textAlign: nextAlign,
                          },
                        }),
                      )
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ) : null}

        {editingOffsetAnchor ? (
          <div className="detail-card compact-detail-card">
            <div className="editor-subsection">
              <div className="editor-section-header">
                <h3 className="editor-group-title">{ui.common.offset}</h3>
                <div className="editor-section-actions">
                  <span className="editor-section-meta">
                    {`${(
                      editingEffectiveOffset?.x ??
                      editingOffsetState?.rawX ??
                      editingOffsetAnchor.offsetX
                    ).toFixed(2)}, ${(
                      editingEffectiveOffset?.y ??
                      editingOffsetState?.rawY ??
                      editingOffsetAnchor.offsetY
                    ).toFixed(2)}`}
                  </span>
                  <label className="editor-action-toggle">
                    <span>{ui.common.lockedLabel}</span>
                    <input
                      type="checkbox"
                      checked={editingLabelOffsetDragLocked}
                      disabled={editingLabelOffsetLockToggleDisabled}
                      onChange={(event) => {
                        setEditingLabelOffsetDragLocked(event.target.checked)
                      }}
                    />
                  </label>
                  <button
                    className="mini-icon-button editor-action-button"
                    type="button"
                    disabled={editingLabelInteractionLocked}
                    onClick={restoreOffsetToOpenState}
                  >
                    {ui.common.reset}
                  </button>
                </div>
              </div>
              <div className="xy-control-grid">
                <div className="xy-axis-group">
                  <div className="xy-axis-header-row">
                    <span className="xy-axis-label">{ui.common.xAxis}</span>
                    <div className="xy-axis-actions">
                      {editingAssignmentDefaultOffset ? (
                        <label className="editor-action-toggle">
                          <span>{ui.common.defaultValue}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(editingOffsetState?.usesDefaultX)}
                            disabled={editingLabelInteractionLocked}
                            onChange={(event) => {
                              const checked = event.target.checked
                              updateCurrentLabel((currentLabel, current) =>
                                upsertLabel(current, {
                                  ...currentLabel,
                                  anchor: {
                                    ...editingOffsetAnchor,
                                    offsetX:
                                      editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX,
                                    useDefaultOffsetX: checked,
                                  },
                                }),
                              )
                            }}
                          />
                        </label>
                      ) : null}
                      <label className="editor-action-toggle">
                        <span>{ui.common.flip}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(editingOffsetAnchor.flipX)}
                          disabled={editingLabelInteractionLocked}
                          onChange={(event) => {
                            updateCurrentLabel((currentLabel, current) =>
                              upsertLabel(current, {
                                ...currentLabel,
                                anchor: {
                                  ...editingOffsetAnchor,
                                  flipX: event.target.checked,
                                },
                              }),
                            )
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="xy-axis-input-row">
                    <label className="xy-slider-field">
                      <span className="xy-slider-zero">0</span>
                      <input
                        type="range"
                        min={
                          editingOffsetSliderRange
                            ? -editingOffsetSliderRange.x
                            : -LABEL_OFFSET_SLIDER_MIN_RANGE
                        }
                        max={
                          editingOffsetSliderRange
                            ? editingOffsetSliderRange.x
                            : LABEL_OFFSET_SLIDER_MIN_RANGE
                        }
                        step={1}
                        value={Math.max(
                          editingOffsetSliderRange
                            ? -editingOffsetSliderRange.x
                            : -LABEL_OFFSET_SLIDER_MIN_RANGE,
                          Math.min(
                            editingOffsetSliderRange
                              ? editingOffsetSliderRange.x
                              : LABEL_OFFSET_SLIDER_MIN_RANGE,
                            editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX,
                          ),
                        )}
                        disabled={editingLabelInteractionLocked}
                        onChange={(event) => {
                          const nextValue = Number.parseFloat(event.target.value)
                          const currentRawX =
                            editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX
                          setWorld((current) =>
                            nudgeLabelAnchor(
                              current,
                              label.id,
                              (Number.isFinite(nextValue) ? nextValue : currentRawX) - currentRawX,
                              0,
                            ),
                          )
                        }}
                      />
                    </label>
                    <div className="xy-input-field">
                      <input
                        type="number"
                        step={1}
                        value={editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX}
                        disabled={editingLabelInteractionLocked}
                        onChange={(event) => {
                          const nextValue = Number.parseFloat(event.target.value)
                          const currentRawX =
                            editingOffsetState?.rawX ?? editingOffsetAnchor.offsetX
                          setWorld((current) =>
                            nudgeLabelAnchor(
                              current,
                              label.id,
                              (Number.isFinite(nextValue) ? nextValue : currentRawX) - currentRawX,
                              0,
                            ),
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="xy-axis-group">
                  <div className="xy-axis-header-row">
                    <span className="xy-axis-label">{ui.common.yAxis}</span>
                    <div className="xy-axis-actions">
                      {editingAssignmentDefaultOffset ? (
                        <label className="editor-action-toggle">
                          <span>{ui.common.defaultValue}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(editingOffsetState?.usesDefaultY)}
                            disabled={editingLabelInteractionLocked}
                            onChange={(event) => {
                              const checked = event.target.checked
                              updateCurrentLabel((currentLabel, current) =>
                                upsertLabel(current, {
                                  ...currentLabel,
                                  anchor: {
                                    ...editingOffsetAnchor,
                                    offsetY:
                                      editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY,
                                    useDefaultOffsetY: checked,
                                  },
                                }),
                              )
                            }}
                          />
                        </label>
                      ) : null}
                      <label className="editor-action-toggle">
                        <span>{ui.common.flip}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(editingOffsetAnchor.flipY)}
                          disabled={editingLabelInteractionLocked}
                          onChange={(event) => {
                            updateCurrentLabel((currentLabel, current) =>
                              upsertLabel(current, {
                                ...currentLabel,
                                anchor: {
                                  ...editingOffsetAnchor,
                                  flipY: event.target.checked,
                                },
                              }),
                            )
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="xy-axis-input-row">
                    <label className="xy-slider-field">
                      <span className="xy-slider-zero">0</span>
                      <input
                        type="range"
                        min={
                          editingOffsetSliderRange
                            ? -editingOffsetSliderRange.y
                            : -LABEL_OFFSET_SLIDER_MIN_RANGE
                        }
                        max={
                          editingOffsetSliderRange
                            ? editingOffsetSliderRange.y
                            : LABEL_OFFSET_SLIDER_MIN_RANGE
                        }
                        step={1}
                        value={Math.max(
                          editingOffsetSliderRange
                            ? -editingOffsetSliderRange.y
                            : -LABEL_OFFSET_SLIDER_MIN_RANGE,
                          Math.min(
                            editingOffsetSliderRange
                              ? editingOffsetSliderRange.y
                              : LABEL_OFFSET_SLIDER_MIN_RANGE,
                            editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY,
                          ),
                        )}
                        disabled={editingLabelInteractionLocked}
                        onChange={(event) => {
                          const nextValue = Number.parseFloat(event.target.value)
                          const currentRawY =
                            editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY
                          setWorld((current) =>
                            nudgeLabelAnchor(
                              current,
                              label.id,
                              0,
                              (Number.isFinite(nextValue) ? nextValue : currentRawY) - currentRawY,
                            ),
                          )
                        }}
                      />
                    </label>
                    <div className="xy-input-field">
                      <input
                        type="number"
                        step={1}
                        value={editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY}
                        disabled={editingLabelInteractionLocked}
                        onChange={(event) => {
                          const nextValue = Number.parseFloat(event.target.value)
                          const currentRawY =
                            editingOffsetState?.rawY ?? editingOffsetAnchor.offsetY
                          setWorld((current) =>
                            nudgeLabelAnchor(
                              current,
                              label.id,
                              0,
                              (Number.isFinite(nextValue) ? nextValue : currentRawY) - currentRawY,
                            ),
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <h3 className="editor-group-title">{ui.common.style}</h3>
        <LabelStyleControls
          title={labelText || ui.common.empty}
          style={labelStyle}
          disabled={editingLabelInteractionLocked || label.useGroupDefaults}
          defaultToggle={{
            checked: label.useGroupDefaults,
            disabled: editingLabelInteractionLocked,
            onChange: (checked) => {
              updateCurrentLabel((currentLabel, current) => {
                const nextAnchor =
                  currentLabel.anchor.kind === 'world' || currentLabel.anchor.kind === 'path'
                    ? currentLabel.anchor
                    : checked
                      ? {
                          ...currentLabel.anchor,
                          useDefaultOffsetX: true,
                          useDefaultOffsetY: true,
                        }
                      : currentLabel.anchor
                let nextWorld = upsertLabel(current, {
                  ...currentLabel,
                  useGroupDefaults: checked,
                  anchor: nextAnchor,
                })

                if (checked) {
                  nextWorld = restoreAllLabelStyleOverrides(nextWorld, currentLabel.id)
                }

                return nextWorld
              })
            },
          }}
          onChange={(key, value) => {
            updateCurrentLabel((currentLabel, current) =>
              setLabelStyleOverrides(
                upsertLabel(current, {
                  ...currentLabel,
                  useGroupDefaults: false,
                }),
                currentLabel.id,
                {
                  [key]: value,
                },
              ),
            )
          }}
          overriddenKeys={editingLabelOverrideKeys}
          onResetKey={restoreStyleKeyToOpenState}
          onRestoreKey={restoreStyleKeyToOpenState}
        />

        <div className="compact-detail-grid">
          <div className="detail-card compact-detail-card">
            <div className="editor-subsection-row">
              <strong>{ui.label.zoomScale}</strong>
              <span>{`${activeCanvasZoom.toFixed(2)}x`}</span>
            </div>
          </div>
          <div className="detail-card compact-detail-card">
            <strong>{ui.label.source}</strong>
            <span>{sourceDescription}</span>
          </div>
          <div className="detail-card compact-detail-card">
            <strong>{ui.label.anchor}</strong>
            <span>{anchorDescription}</span>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="ghost-button" type="button" onClick={onClose}>
          {ui.common.close}
        </button>
        <button className="ghost-button danger-button" type="button" onClick={onDelete}>
          {ui.common.delete}
        </button>
      </div>
    </>
  )
}
