import type { AppMessages } from '../../i18n'
import type {
  CellSurfaceState,
  City,
  Label,
  Province,
  WorldDocument,
} from '../../domain/world'

interface PaintRecordPatchValue<T> {
  exists: boolean
  value?: T
}

type PaintRecordPatch<T> = Record<string, PaintRecordPatchValue<T>>

export interface PaintWorldPatch {
  cellSurfaces: PaintRecordPatch<CellSurfaceState>
  countryAssignments: PaintRecordPatch<string | null>
  provinceAssignments: PaintRecordPatch<string | null>
  provinces: PaintRecordPatch<Province>
  cities: PaintRecordPatch<City>
  labels: PaintRecordPatch<Label>
}

export interface PaintHistoryEntry {
  undoPatch: PaintWorldPatch
  redoPatch: PaintWorldPatch
  actionKind: PaintActionKind | null
  changedCellCount: number
  timestamp: number
}

export interface PendingPaintHistoryCapture {
  undoPatch: PaintWorldPatch
  redoPatch: PaintWorldPatch
  actionKind: PaintActionKind | null
}

export type PaintActionKind =
  | 'surface-brush'
  | 'surface-fill-type'
  | 'surface-fill-height'
  | 'country-paint'
  | 'country-erase'
  | 'country-fill-type'
  | 'country-fill-height'
  | 'province-paint'
  | 'province-erase'
  | 'province-fill-type'
  | 'province-fill-height'

export interface PaintActionLogEntry {
  id: number
  kind: PaintActionKind | null
  operation: 'paint' | 'undo' | 'redo'
  changedCellCount: number
  timestamp: number
  undoDepth: number
  redoDepth: number
}

export function getPaintHistoryTimestamp() {
  return Date.now()
}

export function createEmptyPaintWorldPatch(): PaintWorldPatch {
  return {
    cellSurfaces: {},
    countryAssignments: {},
    provinceAssignments: {},
    provinces: {},
    cities: {},
    labels: {},
  }
}

function clonePatchValue<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value
  }

  return structuredClone(value)
}

export function isPaintWorldPatchEmpty(patch: PaintWorldPatch) {
  return (
    Object.keys(patch.cellSurfaces).length === 0 &&
    Object.keys(patch.countryAssignments).length === 0 &&
    Object.keys(patch.provinceAssignments).length === 0 &&
    Object.keys(patch.provinces).length === 0 &&
    Object.keys(patch.cities).length === 0 &&
    Object.keys(patch.labels).length === 0
  )
}

export function getChangedCellCountFromPaintPatch(patch: PaintWorldPatch) {
  const changedCellIds = new Set<string>([
    ...Object.keys(patch.cellSurfaces),
    ...Object.keys(patch.countryAssignments),
    ...Object.keys(patch.provinceAssignments),
  ])
  return changedCellIds.size
}

export function getPaintActionLabel(ui: AppMessages, kind: PaintActionKind | null) {
  switch (kind) {
    case 'surface-brush':
      return `${ui.editorMode.surface} · ${ui.common.paintMode}`
    case 'surface-fill-type':
      return `${ui.editorMode.surface} · ${ui.common.fill} ${ui.common.kind}`
    case 'surface-fill-height':
      return `${ui.editorMode.surface} · ${ui.common.fill} ${ui.common.height}`
    case 'country-paint':
      return `${ui.common.country} · ${ui.politicalTool.paint}`
    case 'country-erase':
      return `${ui.common.country} · ${ui.politicalTool.erase}`
    case 'country-fill-type':
      return `${ui.common.country} · ${ui.common.fill} ${ui.common.kind}`
    case 'country-fill-height':
      return `${ui.common.country} · ${ui.common.fill} ${ui.common.height}`
    case 'province-paint':
      return `${ui.common.province} · ${ui.politicalTool.paint}`
    case 'province-erase':
      return `${ui.common.province} · ${ui.politicalTool.erase}`
    case 'province-fill-type':
      return `${ui.common.province} · ${ui.common.fill} ${ui.common.kind}`
    case 'province-fill-height':
      return `${ui.common.province} · ${ui.common.fill} ${ui.common.height}`
    default:
      return ui.common.paintMode
  }
}

function appendRecordDiff<T>(
  undoRecord: PaintRecordPatch<T>,
  redoRecord: PaintRecordPatch<T>,
  previousRecord: Record<string, T>,
  nextRecord: Record<string, T>,
) {
  const candidateKeys = new Set([...Object.keys(previousRecord), ...Object.keys(nextRecord)])

  for (const key of candidateKeys) {
    const previousHasKey = Object.prototype.hasOwnProperty.call(previousRecord, key)
    const nextHasKey = Object.prototype.hasOwnProperty.call(nextRecord, key)

    if (!previousHasKey && !nextHasKey) {
      continue
    }

    const previousValue = previousHasKey ? previousRecord[key] : undefined
    const nextValue = nextHasKey ? nextRecord[key] : undefined

    if (previousHasKey === nextHasKey && Object.is(previousValue, nextValue)) {
      continue
    }

    if (!Object.prototype.hasOwnProperty.call(undoRecord, key)) {
      undoRecord[key] = previousHasKey
        ? {
            exists: true,
            value: clonePatchValue(previousValue as T),
          }
        : {
            exists: false,
          }
    }

    redoRecord[key] = nextHasKey
      ? {
          exists: true,
          value: clonePatchValue(nextValue as T),
        }
      : {
          exists: false,
        }
  }
}

export function appendPaintWorldPatch(
  undoPatch: PaintWorldPatch,
  redoPatch: PaintWorldPatch,
  previousWorld: WorldDocument,
  nextWorld: WorldDocument,
) {
  appendRecordDiff(
    undoPatch.cellSurfaces,
    redoPatch.cellSurfaces,
    previousWorld.cellSurfaces,
    nextWorld.cellSurfaces,
  )
  appendRecordDiff(
    undoPatch.countryAssignments,
    redoPatch.countryAssignments,
    previousWorld.countryAssignments,
    nextWorld.countryAssignments,
  )
  appendRecordDiff(
    undoPatch.provinceAssignments,
    redoPatch.provinceAssignments,
    previousWorld.provinceAssignments,
    nextWorld.provinceAssignments,
  )
  appendRecordDiff(undoPatch.provinces, redoPatch.provinces, previousWorld.provinces, nextWorld.provinces)
  appendRecordDiff(undoPatch.cities, redoPatch.cities, previousWorld.cities, nextWorld.cities)
  appendRecordDiff(undoPatch.labels, redoPatch.labels, previousWorld.labels, nextWorld.labels)
}

function applyRecordPatch<T>(record: Record<string, T>, patch: PaintRecordPatch<T>) {
  const entries = Object.entries(patch)
  if (entries.length === 0) {
    return record
  }

  let nextRecord: Record<string, T> | null = null
  for (const [key, valuePatch] of entries) {
    if (!valuePatch.exists) {
      if (!Object.prototype.hasOwnProperty.call(record, key)) {
        continue
      }
      if (!nextRecord) {
        nextRecord = { ...record }
      }
      delete nextRecord[key]
      continue
    }

    const patchedValue = clonePatchValue(valuePatch.value as T)
    const hasKey = Object.prototype.hasOwnProperty.call(record, key)
    const currentValue = hasKey ? record[key] : undefined
    if (hasKey && Object.is(currentValue, patchedValue)) {
      continue
    }

    if (!nextRecord) {
      nextRecord = { ...record }
    }
    nextRecord[key] = patchedValue
  }

  return nextRecord ?? record
}

export function applyPaintWorldPatch(world: WorldDocument, patch: PaintWorldPatch): WorldDocument {
  if (isPaintWorldPatchEmpty(patch)) {
    return world
  }

  const nextCellSurfaces = applyRecordPatch(world.cellSurfaces, patch.cellSurfaces)
  const nextCountryAssignments = applyRecordPatch(
    world.countryAssignments,
    patch.countryAssignments,
  )
  const nextProvinceAssignments = applyRecordPatch(
    world.provinceAssignments,
    patch.provinceAssignments,
  )
  const nextProvinces = applyRecordPatch(world.provinces, patch.provinces)
  const nextCities = applyRecordPatch(world.cities, patch.cities)
  const nextLabels = applyRecordPatch(world.labels, patch.labels)

  if (
    nextCellSurfaces === world.cellSurfaces &&
    nextCountryAssignments === world.countryAssignments &&
    nextProvinceAssignments === world.provinceAssignments &&
    nextProvinces === world.provinces &&
    nextCities === world.cities &&
    nextLabels === world.labels
  ) {
    return world
  }

  return {
    ...world,
    cellSurfaces: nextCellSurfaces,
    countryAssignments: nextCountryAssignments,
    provinceAssignments: nextProvinceAssignments,
    provinces: nextProvinces,
    cities: nextCities,
    labels: nextLabels,
  }
}
