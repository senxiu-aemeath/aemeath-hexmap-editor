import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { HexCell } from '../../domain/grid'
import {
  assignCountryToCell,
  assignCountryToCells,
  assignProvinceToCell,
  assignProvinceToCells,
  isSurfaceEmpty,
  isSurfaceLand,
  setCellSurface,
  setCellSurfaces,
  type CellSurfaceState,
  type WorldDocument,
} from '../../domain/world'
import {
  getPoliticalFillCellIds,
  getTerrainFillCellIds,
} from './fillHelpers'
import {
  applyPaintWorldPatch,
  appendPaintWorldPatch,
  createEmptyPaintWorldPatch,
  getChangedCellCountFromPaintPatch,
  getPaintHistoryTimestamp,
  isPaintWorldPatchEmpty,
  type PaintActionKind,
  type PaintActionLogEntry,
  type PaintHistoryEntry,
  type PendingPaintHistoryCapture,
} from './paintHistory'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { TerrainBrushContextValue } from '../../state/TerrainBrushContext'

interface UsePaintControllerParams {
  world: WorldDocument
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  cellById: Map<string, HexCell>
  cellsByCoordinates: Map<string, HexCell>
  surfaceBrush: CellSurfaceState
  editorMode: EditorModeContextValue['editorMode']
  politicalSubMode: EditorModeContextValue['politicalSubMode']
  countryToolMode: EditorModeContextValue['countryToolMode']
  provinceToolMode: EditorModeContextValue['provinceToolMode']
  politicalPaintMode: EditorModeContextValue['politicalPaintMode']
  restrictProvinceBrushToOwnerCountry: EditorModeContextValue['restrictProvinceBrushToOwnerCountry']
  terrainPaintMode: TerrainBrushContextValue['terrainPaintMode']
  activeCountryId: string | null
  setActiveCountryId: (countryId: string | null) => void
  defaultPaintCountryId: string | null
  activeProvinceId: string | null
  setActiveProvinceId: (provinceId: string | null) => void
  defaultPaintProvinceId: string | null
  historyLimit: number
}

export function usePaintController({
  world,
  setWorld,
  cellById,
  cellsByCoordinates,
  surfaceBrush,
  editorMode,
  politicalSubMode,
  countryToolMode,
  provinceToolMode,
  politicalPaintMode,
  restrictProvinceBrushToOwnerCountry,
  terrainPaintMode,
  activeCountryId,
  setActiveCountryId,
  defaultPaintCountryId,
  activeProvinceId,
  setActiveProvinceId,
  defaultPaintProvinceId,
  historyLimit,
}: UsePaintControllerParams) {
  const [paintHistoryRevision, setPaintHistoryRevision] = useState(0)
  const [paintActionLog, setPaintActionLog] = useState<PaintActionLogEntry[]>([])
  const worldRef = useRef(world)
  const paintActionLogSequenceRef = useRef(0)
  const paintUndoStackRef = useRef<PaintHistoryEntry[]>([])
  const paintRedoStackRef = useRef<PaintHistoryEntry[]>([])
  const pendingPaintHistoryCaptureRef = useRef<PendingPaintHistoryCapture | null>(null)
  const paintInteractionChangedRef = useRef(false)
  const worldChangeOriginRef = useRef<'other' | 'paint' | 'paint-history'>('other')
  const pendingSurfaceStrokeRef = useRef<Map<string, CellSurfaceState>>(new Map())
  const pendingSurfaceFillHandledRef = useRef(false)
  const pendingCountryFillHandledRef = useRef(false)
  const pendingCountryStrokeRef = useRef<Set<string>>(new Set())
  const pendingCountryStrokeModeRef = useRef<'paint' | 'erase' | null>(null)
  const pendingCountryStrokeValueRef = useRef<string | null>(null)
  const pendingProvinceFillHandledRef = useRef(false)
  const pendingProvinceStrokeRef = useRef<Set<string>>(new Set())
  const pendingProvinceStrokeModeRef = useRef<'paint' | 'erase' | null>(null)
  const pendingProvinceStrokeValueRef = useRef<string | null>(null)

  const isProvinceBrushCellAllowed = (cellId: string, provinceId: string | null) => {
    if (!provinceId) {
      return true
    }

    if (!restrictProvinceBrushToOwnerCountry) {
      return true
    }

    const province = world.provinces[provinceId]
    if (!province) {
      return false
    }

    return province.countryId === (world.countryAssignments[cellId] ?? null)
  }

  function clearPaintHistory() {
    paintUndoStackRef.current = []
    paintRedoStackRef.current = []
    pendingPaintHistoryCaptureRef.current = null
    paintInteractionChangedRef.current = false
    paintActionLogSequenceRef.current = 0
  }

  useEffect(() => {
    const previousWorld = worldRef.current
    worldRef.current = world

    if (previousWorld === world) {
      return
    }

    if (worldChangeOriginRef.current === 'other') {
      clearPaintHistory()
      queueMicrotask(() => {
        setPaintActionLog([])
      })
      return
    }

    worldChangeOriginRef.current = 'other'
  }, [world])

  const appendPaintActionLog = (
    operation: PaintActionLogEntry['operation'],
    kind: PaintActionKind | null,
    changedCellCount: number,
  ) => {
    const entry: PaintActionLogEntry = {
      id: paintActionLogSequenceRef.current + 1,
      operation,
      kind,
      changedCellCount,
      timestamp: getPaintHistoryTimestamp(),
      undoDepth: paintUndoStackRef.current.length,
      redoDepth: paintRedoStackRef.current.length,
    }
    paintActionLogSequenceRef.current = entry.id
    setPaintActionLog((current) => [entry, ...current].slice(0, historyLimit))
  }

  const beginPaintHistoryCapture = () => {
    if (pendingPaintHistoryCaptureRef.current) {
      return
    }

    pendingPaintHistoryCaptureRef.current = {
      undoPatch: createEmptyPaintWorldPatch(),
      redoPatch: createEmptyPaintWorldPatch(),
      actionKind: null,
    }
    paintInteractionChangedRef.current = false
  }

  const pushPaintUndoEntry = (entry: PaintHistoryEntry) => {
    paintUndoStackRef.current.push(entry)
    if (paintUndoStackRef.current.length > historyLimit) {
      paintUndoStackRef.current.splice(
        0,
        paintUndoStackRef.current.length - historyLimit,
      )
    }
  }

  const applyPaintWorldUpdate = (
    updater: (current: WorldDocument) => WorldDocument,
    actionKind: PaintActionKind | null,
  ) => {
    beginPaintHistoryCapture()
    worldChangeOriginRef.current = 'paint'
    setWorld((current) => {
      const next = updater(current)
      if (next !== current) {
        paintInteractionChangedRef.current = true
        const capture = pendingPaintHistoryCaptureRef.current
        if (capture) {
          appendPaintWorldPatch(capture.undoPatch, capture.redoPatch, current, next)
          if (!capture.actionKind && actionKind) {
            capture.actionKind = actionKind
          }
        }
      }
      return next
    })
  }

  const undoPaintHistory = () => {
    const entry = paintUndoStackRef.current.pop()
    if (!entry) {
      return false
    }

    paintRedoStackRef.current.push(entry)
    worldChangeOriginRef.current = 'paint-history'
    pendingPaintHistoryCaptureRef.current = null
    paintInteractionChangedRef.current = false
    setWorld((current) => applyPaintWorldPatch(current, entry.undoPatch))
    appendPaintActionLog('undo', entry.actionKind, entry.changedCellCount)
    setPaintHistoryRevision((current) => current + 1)
    return true
  }

  const redoPaintHistory = () => {
    const entry = paintRedoStackRef.current.pop()
    if (!entry) {
      return false
    }

    pushPaintUndoEntry(entry)
    worldChangeOriginRef.current = 'paint-history'
    pendingPaintHistoryCaptureRef.current = null
    paintInteractionChangedRef.current = false
    setWorld((current) => applyPaintWorldPatch(current, entry.redoPatch))
    appendPaintActionLog('redo', entry.actionKind, entry.changedCellCount)
    setPaintHistoryRevision((current) => current + 1)
    return true
  }

  const handlePaintCellInteract = (cellId: string) => {
    if (editorMode === 'surface') {
      if (terrainPaintMode === 'fill_type' || terrainPaintMode === 'fill_height') {
        applyPaintWorldUpdate(
          (current) => {
            const fillCellIds = getTerrainFillCellIds(
              current,
              cellById,
              cellsByCoordinates,
              cellId,
              terrainPaintMode,
            )
            if (fillCellIds.length === 0) {
              return current
            }
            return setCellSurfaces(
              current,
              fillCellIds.map((fillCellId) => ({
                cellId: fillCellId,
                surface: surfaceBrush,
              })),
            )
          },
          terrainPaintMode === 'fill_type'
            ? 'surface-fill-type'
            : 'surface-fill-height',
        )
        return
      }

      applyPaintWorldUpdate(
        (current) => setCellSurface(current, cellId, surfaceBrush),
        'surface-brush',
      )
      return
    }

    if (editorMode !== 'political') {
      return
    }

    if (politicalSubMode === 'country') {
      if (countryToolMode === 'view') {
        return
      }

      if (countryToolMode === 'erase') {
        if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
          applyPaintWorldUpdate(
            (current) => {
              const fillCellIds = getPoliticalFillCellIds(
                current,
                cellById,
                cellsByCoordinates,
                cellId,
                'country',
                politicalPaintMode,
              )
              if (fillCellIds.length === 0) {
                return current
              }
              return assignCountryToCells(current, fillCellIds, null)
            },
            politicalPaintMode === 'fill_type'
              ? 'country-fill-type'
              : 'country-fill-height',
          )
          return
        }

        applyPaintWorldUpdate(
          (current) => assignCountryToCell(current, cellId, null),
          'country-erase',
        )
        return
      }

      if (countryToolMode === 'paint') {
        if (isSurfaceEmpty(world.cellSurfaces[cellId])) {
          return
        }

        const fallbackCountryId = activeCountryId ?? defaultPaintCountryId
        if (!fallbackCountryId) {
          return
        }

        if (activeCountryId === null) {
          setActiveCountryId(fallbackCountryId)
        }

        if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
          applyPaintWorldUpdate(
            (current) => {
              const fillCellIds = getPoliticalFillCellIds(
                current,
                cellById,
                cellsByCoordinates,
                cellId,
                'country',
                politicalPaintMode,
              )
              if (fillCellIds.length === 0) {
                return current
              }
              return assignCountryToCells(current, fillCellIds, fallbackCountryId)
            },
            politicalPaintMode === 'fill_type'
              ? 'country-fill-type'
              : 'country-fill-height',
          )
          return
        }

        applyPaintWorldUpdate(
          (current) => assignCountryToCell(current, cellId, fallbackCountryId),
          'country-paint',
        )
      }
      return
    }

    if (politicalSubMode !== 'province') {
      return
    }

    if (provinceToolMode === 'view') {
      return
    }

    if (provinceToolMode === 'erase') {
      const targetProvinceId = world.provinceAssignments[cellId] ?? activeProvinceId ?? null
      if (!isProvinceBrushCellAllowed(cellId, targetProvinceId)) {
        return
      }

      if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
        applyPaintWorldUpdate(
          (current) => {
            const targetProvince = targetProvinceId
              ? current.provinces[targetProvinceId]
              : null
            const fillCellIds = getPoliticalFillCellIds(
              current,
              cellById,
              cellsByCoordinates,
              cellId,
              'province',
              politicalPaintMode,
              targetProvince?.countryId ?? null,
            )
            if (fillCellIds.length === 0) {
              return current
            }
            return assignProvinceToCells(current, fillCellIds, null)
          },
          politicalPaintMode === 'fill_type'
            ? 'province-fill-type'
            : 'province-fill-height',
        )
        return
      }

      applyPaintWorldUpdate(
        (current) => assignProvinceToCell(current, cellId, null),
        'province-erase',
      )
      return
    }

    if (!isSurfaceLand(world.cellSurfaces[cellId])) {
      return
    }

    const fallbackProvinceId = activeProvinceId ?? defaultPaintProvinceId
    if (!fallbackProvinceId) {
      return
    }

    if (!isProvinceBrushCellAllowed(cellId, fallbackProvinceId)) {
      return
    }

    if (activeProvinceId === null) {
      setActiveProvinceId(fallbackProvinceId)
    }

    if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
      applyPaintWorldUpdate(
        (current) => {
          const province = current.provinces[fallbackProvinceId]
          const fillCellIds = getPoliticalFillCellIds(
            current,
            cellById,
            cellsByCoordinates,
            cellId,
            'province',
            politicalPaintMode,
            province?.countryId ?? null,
          )
          if (fillCellIds.length === 0) {
            return current
          }
          return assignProvinceToCells(current, fillCellIds, fallbackProvinceId)
        },
        politicalPaintMode === 'fill_type'
          ? 'province-fill-type'
          : 'province-fill-height',
      )
      return
    }

    applyPaintWorldUpdate(
      (current) => assignProvinceToCell(current, cellId, fallbackProvinceId),
      'province-paint',
    )
  }

  const getPaintCellInteractionPreview = (cellId: string) => {
    if (editorMode === 'surface') {
      if (terrainPaintMode === 'fill_type' || terrainPaintMode === 'fill_height') {
        return null
      }
      return { surface: surfaceBrush }
    }

    if (editorMode !== 'political' || politicalSubMode !== 'country') {
      if (editorMode === 'political' && politicalSubMode === 'province') {
        if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
          return null
        }

        if (provinceToolMode === 'erase') {
          const targetProvinceId = world.provinceAssignments[cellId] ?? activeProvinceId ?? null
          if (!isProvinceBrushCellAllowed(cellId, targetProvinceId)) {
            return null
          }
          return { provinceId: null }
        }

        if (provinceToolMode === 'paint') {
          if (!isSurfaceLand(world.cellSurfaces[cellId])) {
            return null
          }

          const fallbackProvinceId = activeProvinceId ?? defaultPaintProvinceId
          if (fallbackProvinceId && !isProvinceBrushCellAllowed(cellId, fallbackProvinceId)) {
            return null
          }
          return fallbackProvinceId ? { provinceId: fallbackProvinceId } : null
        }
      }

      return null
    }

    if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
      return null
    }

    if (countryToolMode === 'erase') {
      return { countryId: null }
    }

    if (countryToolMode === 'paint') {
      if (isSurfaceEmpty(world.cellSurfaces[cellId])) {
        return null
      }
      const fallbackCountryId = activeCountryId ?? defaultPaintCountryId
      return fallbackCountryId ? { countryId: fallbackCountryId } : null
    }

    return null
  }

  const handlePaintCellsInteractBatch = (cellIds: string[]) => {
    if (cellIds.length === 0) {
      return
    }

    if (editorMode === 'surface') {
      if (terrainPaintMode === 'fill_type' || terrainPaintMode === 'fill_height') {
        if (pendingSurfaceFillHandledRef.current) {
          return
        }
        pendingSurfaceFillHandledRef.current = true
        const targetCellId = cellIds[0]
        if (!targetCellId) {
          return
        }
        applyPaintWorldUpdate(
          (current) => {
            const fillCellIds = getTerrainFillCellIds(
              current,
              cellById,
              cellsByCoordinates,
              targetCellId,
              terrainPaintMode,
            )
            if (fillCellIds.length === 0) {
              return current
            }
            return setCellSurfaces(
              current,
              fillCellIds.map((fillCellId) => ({
                cellId: fillCellId,
                surface: surfaceBrush,
              })),
            )
          },
          terrainPaintMode === 'fill_type'
            ? 'surface-fill-type'
            : 'surface-fill-height',
        )
        return
      }

      for (const cellId of cellIds) {
        pendingSurfaceStrokeRef.current.set(cellId, surfaceBrush)
      }
      return
    }

    if (editorMode === 'political' && politicalSubMode === 'country') {
      if (countryToolMode === 'view') {
        return
      }

      if (countryToolMode === 'erase') {
        if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
          if (pendingCountryFillHandledRef.current) {
            return
          }
          pendingCountryFillHandledRef.current = true
          const targetCellId = cellIds[0]
          if (!targetCellId) {
            return
          }
          applyPaintWorldUpdate(
            (current) => {
              const fillCellIds = getPoliticalFillCellIds(
                current,
                cellById,
                cellsByCoordinates,
                targetCellId,
                'country',
                politicalPaintMode,
              )
              if (fillCellIds.length === 0) {
                return current
              }
              return assignCountryToCells(current, fillCellIds, null)
            },
            politicalPaintMode === 'fill_type'
              ? 'country-fill-type'
              : 'country-fill-height',
          )
          return
        }

        pendingCountryStrokeModeRef.current = 'erase'
        pendingCountryStrokeValueRef.current = null
        for (const cellId of cellIds) {
          pendingCountryStrokeRef.current.add(cellId)
        }
        return
      }

      if (countryToolMode === 'paint') {
        const fallbackCountryId = activeCountryId ?? defaultPaintCountryId
        if (!fallbackCountryId) {
          return
        }

        if (activeCountryId === null) {
          setActiveCountryId(fallbackCountryId)
        }

        if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
          if (pendingCountryFillHandledRef.current) {
            return
          }
          pendingCountryFillHandledRef.current = true
          const targetCellId = cellIds[0]
          if (!targetCellId) {
            return
          }
          applyPaintWorldUpdate(
            (current) => {
              const fillCellIds = getPoliticalFillCellIds(
                current,
                cellById,
                cellsByCoordinates,
                targetCellId,
                'country',
                politicalPaintMode,
              )
              if (fillCellIds.length === 0) {
                return current
              }
              return assignCountryToCells(current, fillCellIds, fallbackCountryId)
            },
            politicalPaintMode === 'fill_type'
              ? 'country-fill-type'
              : 'country-fill-height',
          )
          return
        }

        pendingCountryStrokeModeRef.current = 'paint'
        pendingCountryStrokeValueRef.current = fallbackCountryId
        for (const cellId of cellIds) {
          pendingCountryStrokeRef.current.add(cellId)
        }
      }
      return
    }

    if (editorMode !== 'political' || politicalSubMode !== 'province') {
      return
    }

    if (provinceToolMode === 'view') {
      return
    }

    if (provinceToolMode === 'erase') {
      if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
        if (pendingProvinceFillHandledRef.current) {
          return
        }
        pendingProvinceFillHandledRef.current = true
        const targetCellId = cellIds[0]
        if (!targetCellId) {
          return
        }
        const targetProvinceId = world.provinceAssignments[targetCellId] ?? activeProvinceId ?? null
        if (!isProvinceBrushCellAllowed(targetCellId, targetProvinceId)) {
          return
        }
        applyPaintWorldUpdate(
          (current) => {
            const targetProvince = targetProvinceId
              ? current.provinces[targetProvinceId]
              : null
            const fillCellIds = getPoliticalFillCellIds(
              current,
              cellById,
              cellsByCoordinates,
              targetCellId,
              'province',
              politicalPaintMode,
              targetProvince?.countryId ?? null,
            )
            if (fillCellIds.length === 0) {
              return current
            }
            return assignProvinceToCells(current, fillCellIds, null)
          },
          politicalPaintMode === 'fill_type'
            ? 'province-fill-type'
            : 'province-fill-height',
        )
        return
      }

      pendingProvinceStrokeModeRef.current = 'erase'
      pendingProvinceStrokeValueRef.current = null
      for (const cellId of cellIds) {
        const targetProvinceId = world.provinceAssignments[cellId] ?? activeProvinceId ?? null
        if (!isProvinceBrushCellAllowed(cellId, targetProvinceId)) {
          continue
        }
        pendingProvinceStrokeRef.current.add(cellId)
      }
      return
    }

    const fallbackProvinceId = activeProvinceId ?? defaultPaintProvinceId
    if (!fallbackProvinceId) {
      return
    }

    if (activeProvinceId === null) {
      setActiveProvinceId(fallbackProvinceId)
    }

    if (politicalPaintMode === 'fill_type' || politicalPaintMode === 'fill_height') {
      if (pendingProvinceFillHandledRef.current) {
        return
      }
      pendingProvinceFillHandledRef.current = true
      const targetCellId = cellIds[0]
      if (!targetCellId || !isProvinceBrushCellAllowed(targetCellId, fallbackProvinceId)) {
        return
      }
      applyPaintWorldUpdate(
        (current) => {
          const province = current.provinces[fallbackProvinceId]
          const fillCellIds = getPoliticalFillCellIds(
            current,
            cellById,
            cellsByCoordinates,
            targetCellId,
            'province',
            politicalPaintMode,
            province?.countryId ?? null,
          )
          if (fillCellIds.length === 0) {
            return current
          }
          return assignProvinceToCells(current, fillCellIds, fallbackProvinceId)
        },
        politicalPaintMode === 'fill_type'
          ? 'province-fill-type'
          : 'province-fill-height',
      )
      return
    }

    pendingProvinceStrokeModeRef.current = 'paint'
    pendingProvinceStrokeValueRef.current = fallbackProvinceId
    for (const cellId of cellIds) {
      if (!isProvinceBrushCellAllowed(cellId, fallbackProvinceId)) {
        continue
      }
      pendingProvinceStrokeRef.current.add(cellId)
    }
  }

  const handlePaintInteractionEnd = () => {
    pendingSurfaceFillHandledRef.current = false
    pendingCountryFillHandledRef.current = false
    pendingProvinceFillHandledRef.current = false

    if (pendingSurfaceStrokeRef.current.size > 0) {
      const updates = [...pendingSurfaceStrokeRef.current.entries()].map(([cellId, surface]) => ({
        cellId,
        surface,
      }))
      pendingSurfaceStrokeRef.current.clear()
      applyPaintWorldUpdate((current) => setCellSurfaces(current, updates), 'surface-brush')
    }

    if (pendingCountryStrokeRef.current.size > 0) {
      const cellIds = [...pendingCountryStrokeRef.current]
      pendingCountryStrokeRef.current.clear()

      if (pendingCountryStrokeModeRef.current === 'erase') {
        applyPaintWorldUpdate(
          (current) => assignCountryToCells(current, cellIds, null),
          'country-erase',
        )
      } else if (
        pendingCountryStrokeModeRef.current === 'paint' &&
        pendingCountryStrokeValueRef.current
      ) {
        const countryId = pendingCountryStrokeValueRef.current
        applyPaintWorldUpdate(
          (current) => assignCountryToCells(current, cellIds, countryId),
          'country-paint',
        )
      }
    }

    pendingCountryStrokeModeRef.current = null
    pendingCountryStrokeValueRef.current = null

    if (pendingProvinceStrokeRef.current.size > 0) {
      const cellIds = [...pendingProvinceStrokeRef.current]
      pendingProvinceStrokeRef.current.clear()

      if (pendingProvinceStrokeModeRef.current === 'erase') {
        applyPaintWorldUpdate(
          (current) => assignProvinceToCells(current, cellIds, null),
          'province-erase',
        )
      } else if (
        pendingProvinceStrokeModeRef.current === 'paint' &&
        pendingProvinceStrokeValueRef.current
      ) {
        const provinceId = pendingProvinceStrokeValueRef.current
        applyPaintWorldUpdate(
          (current) => assignProvinceToCells(current, cellIds, provinceId),
          'province-paint',
        )
      }
    }

    pendingProvinceStrokeModeRef.current = null
    pendingProvinceStrokeValueRef.current = null

    if (!paintInteractionChangedRef.current) {
      pendingPaintHistoryCaptureRef.current = null
      return
    }

    const capture = pendingPaintHistoryCaptureRef.current
    pendingPaintHistoryCaptureRef.current = null
    paintInteractionChangedRef.current = false

    if (!capture || isPaintWorldPatchEmpty(capture.undoPatch)) {
      return
    }

    const changedCellCount = getChangedCellCountFromPaintPatch(capture.redoPatch)
    pushPaintUndoEntry({
      undoPatch: capture.undoPatch,
      redoPatch: capture.redoPatch,
      actionKind: capture.actionKind,
      changedCellCount,
      timestamp: getPaintHistoryTimestamp(),
    })
    paintRedoStackRef.current = []
    appendPaintActionLog('paint', capture.actionKind, changedCellCount)
  }

  return {
    paintActionLog,
    paintHistoryRevision,
    undoPaintHistory,
    redoPaintHistory,
    handlePaintCellInteract,
    getPaintCellInteractionPreview,
    handlePaintCellsInteractBatch,
    handlePaintInteractionEnd,
  }
}
