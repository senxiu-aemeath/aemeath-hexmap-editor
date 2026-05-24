import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import { clampSurfaceElevation } from '../../domain/world'
import type { HexCell } from '../../domain/grid'
import { useUiMessages } from '../../i18n'
import { MoveModePanel } from './MoveModePanel'

type MoveModePanelProps = ComponentProps<typeof MoveModePanel>

interface MoveModePanelContainerProps {
  moveOperation: MoveModePanelProps['moveOperation']
  setMoveOperation: Dispatch<SetStateAction<MoveModePanelProps['moveOperation']>>
  movePayload: MoveModePanelProps['movePayload']
  setMovePayload: Dispatch<SetStateAction<MoveModePanelProps['movePayload']>>
  moveVacatedKind: MoveModePanelProps['moveVacatedKind']
  setMoveVacatedKind: Dispatch<SetStateAction<MoveModePanelProps['moveVacatedKind']>>
  moveVacatedElevation: number
  setMoveVacatedElevation: Dispatch<SetStateAction<number>>
  moveCities: boolean
  setMoveCities: Dispatch<SetStateAction<boolean>>
  labelGroups: Array<{
    id: string
    name: string
  }>
  moveLabelGroups: Record<string, boolean>
  setMoveLabelGroups: Dispatch<SetStateAction<Record<string, boolean>>>
  isMoveSelectionMode: boolean
  setIsMoveSelectionMode: Dispatch<SetStateAction<boolean>>
  onClearMoveSelection: () => void
  moveSelectionRestrictToView: boolean
  setMoveSelectionRestrictToView: Dispatch<SetStateAction<boolean>>
  moveRequireConfirm: boolean
  setMoveRequireConfirm: Dispatch<SetStateAction<boolean>>
  setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
  moveSourceCellIds: string[]
  movePreviewCellIds: string[]
  moveBlockedCellIds: string[]
  moveSourceAnchorCell: HexCell | null
  effectiveMoveTargetCell: HexCell | null
  moveDeltaGrid: { q: number; r: number } | null
  onApplyMoveOperation: (targetCell: HexCell | null) => void
}

export function MoveModePanelContainer({ moveOperation,
  setMoveOperation,
  movePayload,
  setMovePayload,
  moveVacatedKind,
  setMoveVacatedKind,
  moveVacatedElevation,
  setMoveVacatedElevation,
  moveCities,
  setMoveCities,
  labelGroups,
  moveLabelGroups,
  setMoveLabelGroups,
  isMoveSelectionMode,
  setIsMoveSelectionMode,
  onClearMoveSelection,
  moveSelectionRestrictToView,
  setMoveSelectionRestrictToView,
  moveRequireConfirm,
  setMoveRequireConfirm,
  setPendingMoveTargetCellId,
  moveSourceCellIds,
  movePreviewCellIds,
  moveBlockedCellIds,
  moveSourceAnchorCell,
  effectiveMoveTargetCell,
  moveDeltaGrid,
  onApplyMoveOperation,
}: MoveModePanelContainerProps) {
  const ui = useUiMessages()
  return (
    <MoveModePanel
      moveOperation={moveOperation}
      movePayload={movePayload}
      onSetMoveOperation={setMoveOperation}
      onSetMovePayload={(payload) => {
        setMovePayload(payload)
        if (payload === 'political') {
          setMoveOperation('move')
        }
      }}
      moveVacatedKind={moveVacatedKind}
      onSetMoveVacatedKind={(kind) => {
        setMoveVacatedKind(kind)
        if (kind === 'land' || kind === 'water') {
          setMoveVacatedElevation((current) => clampSurfaceElevation(kind, current))
        }
      }}
      moveVacatedElevation={moveVacatedElevation}
      onSetMoveVacatedElevation={(value) => {
        setMoveVacatedElevation(
          clampSurfaceElevation(moveVacatedKind === 'water' ? 'water' : 'land', value),
        )
      }}
      moveCities={moveCities}
      onSetMoveCities={setMoveCities}
      labelGroupToggles={labelGroups.map((group) => ({
        id: group.id,
        name: group.name,
        checked: moveLabelGroups[group.id] ?? true,
        onChange: (checked: boolean) => {
          setMoveLabelGroups((current) => ({
            ...current,
            [group.id]: checked,
          }))
        },
      }))}
      allLabelGroupsChecked={labelGroups.every((group) => moveLabelGroups[group.id] ?? true)}
      onSetAllLabelGroups={(checked) => {
        setMoveLabelGroups(Object.fromEntries(labelGroups.map((group) => [group.id, checked])))
      }}
      isMoveSelectionMode={isMoveSelectionMode}
      onToggleMoveSelectionMode={() => {
        setIsMoveSelectionMode((current) => !current)
      }}
      onClearMoveSelection={onClearMoveSelection}
      moveSelectionRestrictToView={moveSelectionRestrictToView}
      onSetMoveSelectionRestrictToView={setMoveSelectionRestrictToView}
      moveRequireConfirm={moveRequireConfirm}
      onSetMoveRequireConfirm={(checked) => {
        setMoveRequireConfirm(checked)
        if (!checked) {
          setPendingMoveTargetCellId(null)
        }
      }}
      selectedCellsText={ui.move.selectedCells(moveSourceCellIds.length)}
      previewCellsText={ui.move.previewCells(movePreviewCellIds.length)}
      blockedCellsText={ui.move.blockedCells(moveBlockedCellIds.length)}
      selectionScopeHint={ui.move.selectionScopeHint}
      sourceAnchorText={
        moveSourceAnchorCell
          ? `${moveSourceAnchorCell.id} · q=${moveSourceAnchorCell.q}, r=${moveSourceAnchorCell.r}`
          : ui.common.none
      }
      targetAnchorText={
        effectiveMoveTargetCell
          ? `${effectiveMoveTargetCell.id} · q=${effectiveMoveTargetCell.q}, r=${effectiveMoveTargetCell.r}`
          : ui.common.none
      }
      offsetText={moveDeltaGrid ? `dq=${moveDeltaGrid.q}, dr=${moveDeltaGrid.r}` : ui.common.none}
      canApply={
        moveSourceCellIds.length > 0 &&
        movePreviewCellIds.length > 0 &&
        Boolean(effectiveMoveTargetCell)
      }
      applyLabel={moveOperation === 'copy' ? ui.move.applyCopy : ui.move.applyMove}
      onApply={() => {
        onApplyMoveOperation(effectiveMoveTargetCell)
      }}
    />
  )
}
