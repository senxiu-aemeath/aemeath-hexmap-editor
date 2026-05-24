import { useState } from 'react'

import type { SurfaceKind } from '../../domain/world'

type MovePayload = 'terrain' | 'political'
type MoveOperation = 'move' | 'copy'

export function useMoveMode() {
  const [movePayload, setMovePayload] = useState<MovePayload>('terrain')
  const [moveOperation, setMoveOperation] = useState<MoveOperation>('move')
  const [isMoveSelectionMode, setIsMoveSelectionMode] = useState(false)
  const [moveSourceCellIds, setMoveSourceCellIds] = useState<string[]>([])
  const [moveSelectionRestrictToView, setMoveSelectionRestrictToView] = useState(true)
  const [moveRequireConfirm, setMoveRequireConfirm] = useState(false)
  const [pendingMoveTargetCellId, setPendingMoveTargetCellId] = useState<string | null>(null)
  const [moveVacatedKind, setMoveVacatedKind] = useState<SurfaceKind>('land')
  const [moveVacatedElevation, setMoveVacatedElevation] = useState(0)
  const [moveCities, setMoveCities] = useState(true)
  const [moveLabelGroups, setMoveLabelGroups] = useState<Record<string, boolean>>({})

  return {
    movePayload, setMovePayload,
    moveOperation, setMoveOperation,
    isMoveSelectionMode, setIsMoveSelectionMode,
    moveSourceCellIds, setMoveSourceCellIds,
    moveSelectionRestrictToView, setMoveSelectionRestrictToView,
    moveRequireConfirm, setMoveRequireConfirm,
    pendingMoveTargetCellId, setPendingMoveTargetCellId,
    moveVacatedKind, setMoveVacatedKind,
    moveVacatedElevation, setMoveVacatedElevation,
    moveCities, setMoveCities,
    moveLabelGroups, setMoveLabelGroups,
  }
}

export type MoveModeState = ReturnType<typeof useMoveMode>
