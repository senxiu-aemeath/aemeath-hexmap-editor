import type { Dispatch, SetStateAction } from 'react'

import {
  BUILT_IN_LABEL_GROUP_IDS,
  createCityNameLabel,
  createCountryIconLabel,
  createCountryNameLabel,
  createDefaultLabelGroupAssignment,
  createFreeCountryIconLabel,
  createFreeLabel,
  createLabelGroup,
  createProvinceNameLabel,
  removeAssignedLabelForObject,
  updateLabelGroupAssignment,
  upsertLabel,
  upsertLabelGroup,
  type City,
  type Country,
  type LabelGroup,
  type LabelGroupAssignment,
  type Province,
  type WorldDocument,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'
import type { PendingAssignedLabelRemoval } from './useLabelDialogController'

function getDefaultFreeLabelPosition(
  world: WorldDocument,
  visibleCellIds: Set<string> | null,
  hoveredCellId: string | null,
) {
  if (hoveredCellId) {
    const hoveredCell = world.cells.find((cell) => cell.id === hoveredCellId)
    if (hoveredCell) {
      return { x: hoveredCell.centerX, y: hoveredCell.centerY }
    }
  }

  const candidateCells =
    visibleCellIds === null
      ? world.cells
      : world.cells.filter((cell) => visibleCellIds.has(cell.id))

  if (candidateCells.length === 0) {
    return { x: 0, y: 0 }
  }

  const total = candidateCells.reduce(
    (accumulator, cell) => ({
      x: accumulator.x + cell.centerX,
      y: accumulator.y + cell.centerY,
    }),
    { x: 0, y: 0 },
  )

  return {
    x: total.x / candidateCells.length,
    y: total.y / candidateCells.length,
  }
}

interface UseLabelManagementControllerArgs {
  state: {
    activeCity: City | null
    activeCountry: Country | null
    activeCountryId: string | null
    activeManagedLabelGroup: LabelGroup | null
    activeProvince: Province | null
    activeSubmapCellIdSet: Set<string> | null
    confirmAssignedLabelDelete: boolean
    gridHexSize: number
    hoveredCellId: string | null
    labelGroups: LabelGroup[]
    sortedCountries: Country[]
    ui: AppMessages
    world: WorldDocument
  }
  actions: {
    openLabelGroupEditor: (groupId: string) => void
    setActiveLabelId: Dispatch<SetStateAction<string | null>>
    setPendingAssignedLabelRemoval: Dispatch<
      SetStateAction<PendingAssignedLabelRemoval | null>
    >
    setSkipAssignedLabelRemovalConfirm: Dispatch<SetStateAction<boolean>>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
  }
}

export function useLabelManagementController({
  state,
  actions,
}: UseLabelManagementControllerArgs) {
  const {
    activeCity,
    activeCountry,
    activeCountryId,
    activeManagedLabelGroup,
    activeProvince,
    activeSubmapCellIdSet,
    confirmAssignedLabelDelete,
    gridHexSize,
    hoveredCellId,
    labelGroups,
    sortedCountries,
    ui,
    world,
  } = state
  const {
    openLabelGroupEditor,
    setActiveLabelId,
    setPendingAssignedLabelRemoval,
    setSkipAssignedLabelRemovalConfirm,
    setWorld,
  } = actions

  const updateAssignedLabelGroupAssignment = (
    groupId: string,
    updater: (assignment: LabelGroupAssignment) => LabelGroupAssignment,
  ) => {
    setWorld((current) => {
      const group = current.labelGroups[groupId]
      if (!group || group.kind !== 'assigned' || !group.assignment) {
        return current
      }

      return updateLabelGroupAssignment(current, groupId, updater(group.assignment))
    })
  }

  const syncDraftDefaultIfNeeded = (group: LabelGroup, checked: boolean) => {
    if (group.kind !== 'assigned' || !group.assignment) {
      return
    }

    if (group.assignment.autoCreateMode !== 'default') {
      return
    }

    updateAssignedLabelGroupAssignment(group.id, (assignment) => ({
      ...assignment,
      autoCreateDefault: checked,
    }))
  }

  const requestAssignedLabelRemoval = (
    targetKind: 'city' | 'country' | 'province',
    targetId: string,
    group: LabelGroup,
  ) => {
    if (group.kind !== 'assigned' || !group.assignment) {
      return
    }

    if (!confirmAssignedLabelDelete || !group.assignment.confirmOnRemove) {
      setWorld((current) => removeAssignedLabelForObject(current, group.id, targetId))
      return
    }

    setSkipAssignedLabelRemovalConfirm(false)
    setPendingAssignedLabelRemoval({
      targetKind,
      targetId,
      groupId: group.id,
      groupName: group.name,
    })
  }

  const createOrSelectCityLabel = () => {
    if (!activeCity) {
      return
    }

    const existing = Object.values(world.labels).find(
      (label) =>
        label.groupId === BUILT_IN_LABEL_GROUP_IDS.cityName &&
        label.source.kind === 'city' &&
        label.source.cityId === activeCity.id,
    )
    if (existing) {
      setActiveLabelId(existing.id)
      return
    }

    const nextLabel = createCityNameLabel(activeCity.id, 0, gridHexSize * 0.92)
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createOrSelectCountryLabel = () => {
    if (!activeCountry) {
      return
    }

    const existing = Object.values(world.labels).find(
      (label) =>
        label.groupId === BUILT_IN_LABEL_GROUP_IDS.countryName &&
        label.source.kind === 'country' &&
        label.source.countryId === activeCountry.id,
    )
    if (existing) {
      setActiveLabelId(existing.id)
      return
    }

    const nextLabel = createCountryNameLabel(activeCountry.id)
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createOrSelectCountryIconLabel = () => {
    if (!activeCountry) {
      return
    }

    const existing = Object.values(world.labels).find(
      (label) =>
        label.groupId === BUILT_IN_LABEL_GROUP_IDS.countryIcon &&
        label.renderKind === 'country-icon' &&
        label.source.kind === 'country' &&
        label.source.countryId === activeCountry.id,
    )
    if (existing) {
      setActiveLabelId(existing.id)
      return
    }

    const nextLabel = createCountryIconLabel(activeCountry.id)
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createOrSelectProvinceLabel = () => {
    if (!activeProvince) {
      return
    }

    const existing = Object.values(world.labels).find(
      (label) =>
        label.groupId === BUILT_IN_LABEL_GROUP_IDS.provinceName &&
        label.source.kind === 'province' &&
        label.source.provinceId === activeProvince.id,
    )
    if (existing) {
      setActiveLabelId(existing.id)
      return
    }

    const nextLabel = createProvinceNameLabel(activeProvince.id)
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createNewFreeLabel = () => {
    const position = getDefaultFreeLabelPosition(world, activeSubmapCellIdSet, hoveredCellId)
    const targetFreeGroupId =
      activeManagedLabelGroup?.kind === 'free'
        ? activeManagedLabelGroup.id
        : BUILT_IN_LABEL_GROUP_IDS.freeLabel
    const nextLabel = createFreeLabel(
      `${ui.common.labelItem} ${Object.keys(world.labels).length + 1}`,
      position.x,
      position.y,
      targetFreeGroupId,
    )
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createNewFreeIconLabel = () => {
    const targetCountryId = activeCountryId ?? sortedCountries[0]?.id ?? null
    if (!targetCountryId || !world.countries[targetCountryId]) {
      return
    }

    const position = getDefaultFreeLabelPosition(world, activeSubmapCellIdSet, hoveredCellId)
    const targetFreeIconGroupId =
      activeManagedLabelGroup?.id === BUILT_IN_LABEL_GROUP_IDS.freeIcon
        ? activeManagedLabelGroup.id
        : BUILT_IN_LABEL_GROUP_IDS.freeIcon
    const nextLabel = createFreeCountryIconLabel(
      targetCountryId,
      position.x,
      position.y,
      targetFreeIconGroupId,
    )
    setWorld((current) => upsertLabel(current, nextLabel))
    setActiveLabelId(nextLabel.id)
  }

  const createAndEditLabelGroup = (kind: 'free' | 'assigned') => {
    const nextGroup = createLabelGroup(
      kind === 'free'
        ? `${ui.common.free} ${ui.label.group} ${labelGroups.length + 1}`
        : `${ui.label.assigned} ${ui.label.group} ${labelGroups.length + 1}`,
      labelGroups.length,
      kind,
      {},
      kind === 'assigned' ? createDefaultLabelGroupAssignment('city') : null,
    )
    setWorld((current) => upsertLabelGroup(current, nextGroup))
    openLabelGroupEditor(nextGroup.id)
  }

  return {
    updateAssignedLabelGroupAssignment,
    syncDraftDefaultIfNeeded,
    requestAssignedLabelRemoval,
    createOrSelectCityLabel,
    createOrSelectCountryLabel,
    createOrSelectCountryIconLabel,
    createOrSelectProvinceLabel,
    createNewFreeLabel,
    createNewFreeIconLabel,
    createAndEditLabelGroup,
  }
}
