import {
  getSortedLabelGroups,
  upsertLabelGroup,
  type Label,
  type LabelGroup,
  type LabelGroupAssignment,
  type WorldDocument,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'

export function getAssignedLabelDraftDefault(
  assignment: LabelGroupAssignment | null | undefined,
) {
  if (!assignment) {
    return false
  }

  switch (assignment.autoCreateMode) {
    case 'always':
      return true
    case 'never':
      return false
    case 'default':
      return assignment.autoCreateDefault
  }
}

export function getAssignedLabelDrafts(
  groups: Array<{ id: string; assignment: LabelGroupAssignment | null }>,
) {
  return Object.fromEntries(
    groups.map((group) => [group.id, getAssignedLabelDraftDefault(group.assignment)]),
  ) as Record<string, boolean>
}

export function describeLabelAnchor(anchor: Label['anchor']) {
  switch (anchor.kind) {
    case 'world':
      return `world (${anchor.x.toFixed(1)}, ${anchor.y.toFixed(1)})`
    case 'cell':
      return `cell ${anchor.cellId}`
    case 'city':
      return `city ${anchor.cityId}`
    case 'country':
      return `country ${anchor.countryId}`
    case 'province':
      return `province ${anchor.provinceId}`
    case 'path':
      return `path ${anchor.pathId}`
  }
}

export function describeLabelSource(label: Label) {
  switch (label.source.kind) {
    case 'manual':
      return 'manual'
    case 'city':
      return `city ${label.source.cityId}`
    case 'country':
      return `country ${label.source.countryId}`
    case 'province':
      return `province ${label.source.provinceId}`
  }
}

export function describeAssignedLabelGroup(
  ui: AppMessages,
  group: LabelGroup,
) {
  if (group.kind !== 'assigned' || !group.assignment) {
    return ui.label.free
  }

  return [
    ui.label.assigned,
    group.assignment.kind === 'city'
      ? ui.label.cityTarget
      : group.assignment.kind === 'country'
        ? ui.label.countryTarget
        : ui.label.provinceTarget,
    group.assignment.sourceNameMode === 'secondary'
      ? ui.label.secondaryName
      : ui.label.primaryName,
    group.assignment.autoCreateMode === 'always'
      ? ui.automation.modeAlways
      : group.assignment.autoCreateMode === 'never'
        ? ui.automation.modeNever
        : group.assignment.autoCreateDefault
          ? ui.automation.modeDefaultOn
          : ui.automation.modeDefaultOff,
  ].join(' / ')
}

export function reorderLabelGroupsState(
  currentWorld: WorldDocument,
  sourceGroupId: string,
  targetGroupId: string,
) {
  const labelGroups = getSortedLabelGroups(currentWorld.labelGroups)

  if (!sourceGroupId || sourceGroupId === targetGroupId) {
    return currentWorld
  }

  const sourceIndex = labelGroups.findIndex((entry) => entry.id === sourceGroupId)
  const targetIndex = labelGroups.findIndex((entry) => entry.id === targetGroupId)
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return currentWorld
  }

  const reordered = [...labelGroups]
  const [moved] = reordered.splice(sourceIndex, 1)
  reordered.splice(targetIndex, 0, moved)

  let nextWorld = currentWorld
  reordered.forEach((entry, index) => {
    nextWorld = upsertLabelGroup(nextWorld, {
      ...currentWorld.labelGroups[entry.id],
      order: index,
    })
  })

  return nextWorld
}
