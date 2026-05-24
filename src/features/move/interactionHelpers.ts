import type { Dispatch, SetStateAction } from 'react'

import { findCellAtPoint, type HexCell } from '../../domain/grid'
import {
  DEFAULT_SURFACE_STATE,
  assignCountryToCells,
  assignProvinceToCells,
  createCity,
  createSubmap,
  findExistingUniqueLevelCity,
  isSurfaceLand,
  setCellSurfaces,
  upsertCity,
  upsertLabel,
  upsertSubmap,
  type CellSurfaceState,
  type City,
  type LabelGroupAssignment,
  type Submap,
  type WorldDocument,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'
import { getAssignedLabelDrafts } from '../labels/labelHelpers'
import { getMoveTargetEntries } from './moveHelpers'
import { getCityLevelName } from '../../political/display'
import type { CityToolMode, PoliticalSubMode } from '../../political/types'
import { getNextSubmapName } from '../political/creationHelpers'
import type { UniqueLevelConflict } from '../labels/useLabelDialogController'
import { getNextCityName } from '../political/editors/cityEditorLifecycle'
import { openCityEditor } from '../political/editors/objectEditorOpeners'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type MovePayload = 'terrain' | 'political'
type MoveOperation = 'move' | 'copy'
type MoveTargetEntry = {
  sourceCellId: string
  targetCellId: string
  blocked: boolean
}

type CellInteractionPreview = {
  surface?: CellSurfaceState
  countryId?: string | null
  provinceId?: string | null
} | null

interface CityEditorActions {
  setActiveCityId: Dispatch<SetStateAction<string | null>>
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setCityDraftCountryId: Dispatch<SetStateAction<string>>
  setCityDraftDescription: Dispatch<SetStateAction<string>>
  setCityDraftLevelId: Dispatch<SetStateAction<string>>
  setCityDraftName: Dispatch<SetStateAction<string>>
  setCityDraftSecondName: Dispatch<SetStateAction<string>>
  setEditingCityId: Dispatch<SetStateAction<string | null>>
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>
}

export function handleCellInteractState(args: {
  actions: CityEditorActions & {
    setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
    setUniqueLevelConflict: Dispatch<SetStateAction<UniqueLevelConflict | null>>
  }
  applyMoveOperation: (targetCellOverride?: HexCell | null) => void
  cellById: Map<string, HexCell>
  cellId: string
  cityAssignedLabelGroups: Array<{
    id: string
    assignment: LabelGroupAssignment | null
  }>
  cityByCellId: Map<string, City>
  cityToolMode: CityToolMode
  cities: City[]
  closeObjectEditors: () => void
  editorMode: EditorMode
  effectiveCityBrushLevelId: string | null
  handlePaintCellInteract: (cellId: string) => void
  moveRequireConfirm: boolean
  moveSourceCellIds: string[]
  politicalSubMode: PoliticalSubMode
  ui: AppMessages
  world: WorldDocument
}) {
  const {
    actions,
    applyMoveOperation,
    cellById,
    cellId,
    cityAssignedLabelGroups,
    cityByCellId,
    cityToolMode,
    cities,
    closeObjectEditors,
    editorMode,
    effectiveCityBrushLevelId,
    handlePaintCellInteract,
    moveRequireConfirm,
    moveSourceCellIds,
    politicalSubMode,
    ui,
    world,
  } = args

  if (editorMode === 'move') {
    if (moveSourceCellIds.length > 0) {
      if (moveRequireConfirm) {
        actions.setPendingMoveTargetCellId(cellId)
      } else {
        applyMoveOperation(cellById.get(cellId) ?? null)
      }
    }
    return
  }

  if (editorMode !== 'political' || politicalSubMode !== 'city') {
    handlePaintCellInteract(cellId)
    return
  }

  if (cityToolMode !== 'place_city' || !effectiveCityBrushLevelId) {
    return
  }

  if (!isSurfaceLand(world.cellSurfaces[cellId])) {
    return
  }

  const existingCity = cityByCellId.get(cellId)
  if (existingCity) {
    actions.setActiveCityId(existingCity.id)
    closeObjectEditors()
    openCityEditor(
      existingCity,
      actions.setIsCityEditorOpen,
      actions.setEditingCityId,
      actions.setPendingCityCellId,
      actions.setCityDraftName,
      actions.setCityDraftSecondName,
      actions.setCityDraftCountryId,
      actions.setCityDraftLevelId,
      actions.setCityDraftDescription,
      actions.setCityAssignedLabelDrafts,
    )
    return
  }

  const countryId = world.countryAssignments[cellId] ?? null
  const level = world.cityLevels[effectiveCityBrushLevelId]
  if (!level) {
    return
  }

  if (level.uniquePerCountry) {
    const existingUniqueCity = findExistingUniqueLevelCity(
      world,
      countryId,
      effectiveCityBrushLevelId,
    )
    if (existingUniqueCity) {
      const cityName = getNextCityName(
        getCityLevelName(effectiveCityBrushLevelId, world.cityLevels, ui),
        cities,
        ui,
      )
      actions.setUniqueLevelConflict({
        levelId: effectiveCityBrushLevelId,
        countryId,
        existingCityId: existingUniqueCity.id,
        actionType: 'place',
        cityData: { name: cityName, cellId, levelId: effectiveCityBrushLevelId },
      })
      return
    }
  }

  const newCity = createCity(
    getNextCityName(getCityLevelName(level.id, world.cityLevels, ui), cities, ui),
    cellId,
    countryId,
    effectiveCityBrushLevelId,
  )
  closeObjectEditors()
  actions.setPendingCityCellId(cellId)
  actions.setIsCityEditorOpen(true)
  actions.setEditingCityId(null)
  actions.setCityDraftName(newCity.name)
  actions.setCityDraftSecondName('')
  actions.setCityDraftCountryId(countryId ?? 'unassigned')
  actions.setCityDraftLevelId(effectiveCityBrushLevelId)
  actions.setCityDraftDescription('')
  actions.setCityAssignedLabelDrafts(getAssignedLabelDrafts(cityAssignedLabelGroups))
}

export function getCellInteractionPreviewState(args: {
  cellId: string
  editorMode: EditorMode
  getPaintCellInteractionPreview: (cellId: string) => CellInteractionPreview
  politicalSubMode: PoliticalSubMode
}): CellInteractionPreview {
  if (args.editorMode === 'move') {
    return null
  }

  if (args.editorMode === 'political' && args.politicalSubMode === 'city') {
    return null
  }

  return args.getPaintCellInteractionPreview(args.cellId)
}

export function handleCellsInteractBatchState(args: {
  applyMoveOperation: (targetCellOverride?: HexCell | null) => void
  cellById: Map<string, HexCell>
  cellIds: string[]
  editorMode: EditorMode
  handleCellInteract: (cellId: string) => void
  handlePaintCellsInteractBatch: (cellIds: string[]) => void
  moveRequireConfirm: boolean
  moveSourceCellIds: string[]
  politicalSubMode: PoliticalSubMode
  setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
}) {
  if (args.cellIds.length === 0) {
    return
  }

  if (args.editorMode === 'move') {
    if (args.moveSourceCellIds.length > 0) {
      const targetCellId = args.cellIds[0] ?? ''
      const targetCell = args.cellById.get(targetCellId)
      if (targetCell) {
        if (args.moveRequireConfirm) {
          args.setPendingMoveTargetCellId(targetCellId)
        } else {
          args.applyMoveOperation(targetCell)
        }
      }
    }
    return
  }

  if (args.editorMode === 'political' && args.politicalSubMode === 'city') {
    for (const cellId of args.cellIds) {
      args.handleCellInteract(cellId)
    }
    return
  }

  args.handlePaintCellsInteractBatch(args.cellIds)
}

export function handleSubmapSelectionCompleteState(args: {
  cellIds: string[]
  setActiveSubmapId: Dispatch<SetStateAction<string | null>>
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setIsSubmapSelectionMode: Dispatch<SetStateAction<boolean>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  submaps: Submap[]
  ui: AppMessages
}) {
  args.setIsSubmapSelectionMode(false)

  const uniqueCellIds = [...new Set(args.cellIds)]
  if (uniqueCellIds.length === 0) {
    return
  }

  const submap = createSubmap(getNextSubmapName(args.submaps, args.ui), uniqueCellIds)
  args.setWorld((current) => upsertSubmap(current, submap))
  args.setActiveSubmapId(submap.id)
  args.setEditingSubmapId(null)
  args.setSubmapDraftName('')
}

export function handleMoveSelectionCompleteState(args: {
  cellIds: string[]
  setIsMoveSelectionMode: Dispatch<SetStateAction<boolean>>
  setMoveSourceCellIds: Dispatch<SetStateAction<string[]>>
  setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
}) {
  args.setIsMoveSelectionMode(false)
  args.setPendingMoveTargetCellId(null)
  args.setMoveSourceCellIds([...new Set(args.cellIds)])
}

function clearMoveInteractionState(args: {
  setIsMoveSelectionMode: Dispatch<SetStateAction<boolean>>
  setMoveSourceCellIds: Dispatch<SetStateAction<string[]>>
  setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
}) {
  args.setMoveSourceCellIds([])
  args.setIsMoveSelectionMode(false)
  args.setPendingMoveTargetCellId(null)
}

function applyTerrainMoveOperationState(args: {
  baseGridHexSize: number
  cellsByCoordinates: Map<string, HexCell>
  effectiveMoveTargetCells: MoveTargetEntry[]
  moveDeltaWorld: { x: number; y: number }
  moveLabelGroups: Record<string, boolean>
  moveOperation: MoveOperation
  moveSourceCellIds: string[]
  moveSourceCellIdSet: Set<string>
  moveVacatedSurface: CellSurfaceState
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const sourceSurfaceByCellId = Object.fromEntries(
    args.moveSourceCellIds.map((cellId) => [
      cellId,
      args.world.cellSurfaces[cellId] ?? DEFAULT_SURFACE_STATE,
    ]),
  ) as Record<string, CellSurfaceState>

  const updates: Array<{ cellId: string; surface: CellSurfaceState }> = []

  if (args.moveOperation === 'move') {
    for (const cellId of args.moveSourceCellIds) {
      updates.push({ cellId, surface: args.moveVacatedSurface })
    }
  }

  for (const entry of args.effectiveMoveTargetCells) {
    if (entry.blocked || !entry.targetCellId) {
      continue
    }

    updates.push({
      cellId: entry.targetCellId,
      surface: sourceSurfaceByCellId[entry.sourceCellId] ?? DEFAULT_SURFACE_STATE,
    })
  }

  args.setWorld((current) => setCellSurfaces(current, updates))

  if (!Object.values(args.moveLabelGroups).some(Boolean)) {
    return
  }

  args.setWorld((current) => {
    let nextWorld = current
    const targetBySourceCellId = new Map<string, string>()

    for (const entry of args.effectiveMoveTargetCells) {
      if (entry.blocked || !entry.targetCellId) {
        continue
      }
      targetBySourceCellId.set(entry.sourceCellId, entry.targetCellId)
    }

    for (const label of Object.values(current.labels)) {
      const group = current.labelGroups[label.groupId]
      if (!group || !args.moveLabelGroups[label.groupId]) {
        continue
      }

      if (label.anchor.kind === 'cell') {
        const nextCellId = targetBySourceCellId.get(label.anchor.cellId)
        if (!nextCellId) {
          continue
        }

        nextWorld = upsertLabel(nextWorld, {
          ...label,
          anchor: {
            ...label.anchor,
            cellId: nextCellId,
          },
        })
        continue
      }

      if (label.anchor.kind !== 'world') {
        continue
      }

      const sourceCell = findCellAtPoint(
        args.cellsByCoordinates,
        args.baseGridHexSize,
        label.anchor.x,
        label.anchor.y,
      )

      if (!sourceCell || !args.moveSourceCellIdSet.has(sourceCell.id)) {
        continue
      }

      nextWorld = upsertLabel(nextWorld, {
        ...label,
        anchor: {
          ...label.anchor,
          x: label.anchor.x + args.moveDeltaWorld.x,
          y: label.anchor.y + args.moveDeltaWorld.y,
        },
      })
    }

    return nextWorld
  })
}

function applyPoliticalMoveOperationState(args: {
  baseGridHexSize: number
  cellsByCoordinates: Map<string, HexCell>
  effectiveMoveTargetCells: MoveTargetEntry[]
  moveCities: boolean
  moveDeltaWorld: { x: number; y: number }
  moveLabelGroups: Record<string, boolean>
  moveSourceCellIds: string[]
  moveSourceCellIdSet: Set<string>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const destinationByCountry = new Map<string, string[]>()
  const destinationByProvince = new Map<string, string[]>()
  const targetBySourceCellId = new Map<string, string>()

  for (const entry of args.effectiveMoveTargetCells) {
    if (entry.blocked || !entry.targetCellId) {
      continue
    }

    targetBySourceCellId.set(entry.sourceCellId, entry.targetCellId)

    const countryId = args.world.countryAssignments[entry.sourceCellId] ?? null
    const provinceId = args.world.provinceAssignments[entry.sourceCellId] ?? null

    if (countryId) {
      destinationByCountry.set(countryId, [
        ...(destinationByCountry.get(countryId) ?? []),
        entry.targetCellId,
      ])
    }

    if (provinceId) {
      destinationByProvince.set(provinceId, [
        ...(destinationByProvince.get(provinceId) ?? []),
        entry.targetCellId,
      ])
    }
  }

  args.setWorld((current) => {
    let nextWorld = current
    nextWorld = assignProvinceToCells(nextWorld, args.moveSourceCellIds, null)
    nextWorld = assignCountryToCells(nextWorld, args.moveSourceCellIds, null)

    for (const [countryId, cellIds] of destinationByCountry) {
      nextWorld = assignCountryToCells(nextWorld, cellIds, countryId)
    }

    for (const [provinceId, cellIds] of destinationByProvince) {
      nextWorld = assignProvinceToCells(nextWorld, cellIds, provinceId)
    }

    if (args.moveCities) {
      for (const city of Object.values(current.cities)) {
        const nextCellId = targetBySourceCellId.get(city.cellId)
        if (!nextCellId) {
          continue
        }

        nextWorld = upsertCity(nextWorld, {
          ...city,
          cellId: nextCellId,
          countryId: nextWorld.countryAssignments[nextCellId] ?? null,
        })
      }
    }

    for (const label of Object.values(current.labels)) {
      const group = current.labelGroups[label.groupId]
      if (!group || !args.moveLabelGroups[label.groupId]) {
        continue
      }

      const relatedMovedCity =
        label.source.kind === 'city'
          ? current.cities[label.source.cityId]
          : label.anchor.kind === 'city'
            ? current.cities[label.anchor.cityId]
            : null

      if (group.kind === 'assigned' && relatedMovedCity && args.moveCities) {
        const nextCellId = targetBySourceCellId.get(relatedMovedCity.cellId)
        if (!nextCellId) {
          continue
        }
      }

      if (label.anchor.kind === 'cell') {
        const nextCellId = targetBySourceCellId.get(label.anchor.cellId)
        if (!nextCellId) {
          continue
        }

        nextWorld = upsertLabel(nextWorld, {
          ...label,
          anchor: {
            ...label.anchor,
            cellId: nextCellId,
          },
        })
        continue
      }

      if (label.anchor.kind !== 'world') {
        continue
      }

      const sourceCell = findCellAtPoint(
        args.cellsByCoordinates,
        args.baseGridHexSize,
        label.anchor.x,
        label.anchor.y,
      )

      let shouldShiftWorldAnchor = sourceCell
        ? args.moveSourceCellIdSet.has(sourceCell.id)
        : false
      if (!shouldShiftWorldAnchor && group.kind === 'assigned') {
        shouldShiftWorldAnchor =
          (label.source.kind === 'city' &&
            args.moveCities &&
            current.cities[label.source.cityId] !== undefined &&
            args.moveSourceCellIdSet.has(current.cities[label.source.cityId].cellId)) ||
          (label.source.kind === 'country' && sourceCell
            ? args.moveSourceCellIdSet.has(sourceCell.id)
            : false)
      }

      if (!shouldShiftWorldAnchor) {
        continue
      }

      nextWorld = upsertLabel(nextWorld, {
        ...label,
        anchor: {
          ...label.anchor,
          x: label.anchor.x + args.moveDeltaWorld.x,
          y: label.anchor.y + args.moveDeltaWorld.y,
        },
      })
    }

    return nextWorld
  })
}

export function applyMoveOperationState(args: {
  baseGridHexSize: number
  cellsByCoordinates: Map<string, HexCell>
  editorMode: EditorMode
  moveCities: boolean
  moveDeltaWorld: { x: number; y: number }
  moveLabelGroups: Record<string, boolean>
  moveOperation: MoveOperation
  movePayload: MovePayload
  moveSourceAnchorCell: HexCell | null
  moveSourceCellIdSet: Set<string>
  moveSourceCellIds: string[]
  moveSourceCells: HexCell[]
  moveTargetCells: MoveTargetEntry[]
  moveVacatedSurface: CellSurfaceState
  setIsMoveSelectionMode: Dispatch<SetStateAction<boolean>>
  setMoveSourceCellIds: Dispatch<SetStateAction<string[]>>
  setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  targetCellOverride?: HexCell | null
  world: WorldDocument
}) {
  if (args.editorMode !== 'move' || args.moveSourceCellIds.length === 0) {
    return
  }

  const effectiveMoveTargetCells = args.targetCellOverride
    ? getMoveTargetEntries(
        args.moveSourceCells,
        args.moveSourceAnchorCell,
        args.targetCellOverride,
        args.cellsByCoordinates,
        args.movePayload,
        args.world.cellSurfaces,
      )
    : args.moveTargetCells

  if (effectiveMoveTargetCells.length === 0) {
    return
  }

  if (args.movePayload === 'terrain') {
    applyTerrainMoveOperationState({
      baseGridHexSize: args.baseGridHexSize,
      cellsByCoordinates: args.cellsByCoordinates,
      effectiveMoveTargetCells,
      moveDeltaWorld: args.moveDeltaWorld,
      moveLabelGroups: args.moveLabelGroups,
      moveOperation: args.moveOperation,
      moveSourceCellIds: args.moveSourceCellIds,
      moveSourceCellIdSet: args.moveSourceCellIdSet,
      moveVacatedSurface: args.moveVacatedSurface,
      setWorld: args.setWorld,
      world: args.world,
    })
    clearMoveInteractionState(args)
    return
  }

  applyPoliticalMoveOperationState({
    baseGridHexSize: args.baseGridHexSize,
    cellsByCoordinates: args.cellsByCoordinates,
    effectiveMoveTargetCells,
    moveCities: args.moveCities,
    moveDeltaWorld: args.moveDeltaWorld,
    moveLabelGroups: args.moveLabelGroups,
    moveSourceCellIds: args.moveSourceCellIds,
    moveSourceCellIdSet: args.moveSourceCellIdSet,
    setWorld: args.setWorld,
    world: args.world,
  })
  clearMoveInteractionState(args)
}
