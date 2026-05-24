import { MoveContentSection } from './MoveContentSection'
import { MoveSelectionSection } from './MoveSelectionSection'
import { MoveSetupSection } from './MoveSetupSection'

interface MoveModePanelProps {
  moveOperation: 'move' | 'copy'
  movePayload: 'terrain' | 'political'
  onSetMoveOperation: (operation: 'move' | 'copy') => void
  onSetMovePayload: (payload: 'terrain' | 'political') => void
  moveVacatedKind: 'land' | 'water' | 'empty'
  onSetMoveVacatedKind: (kind: 'land' | 'water' | 'empty') => void
  moveVacatedElevation: number
  onSetMoveVacatedElevation: (value: number) => void
  moveCities: boolean
  onSetMoveCities: (value: boolean) => void
  labelGroupToggles: Array<{
    id: string
    name: string
    checked: boolean
    onChange: (checked: boolean) => void
  }>
  allLabelGroupsChecked: boolean
  onSetAllLabelGroups: (checked: boolean) => void
  isMoveSelectionMode: boolean
  onToggleMoveSelectionMode: () => void
  onClearMoveSelection: () => void
  moveSelectionRestrictToView: boolean
  onSetMoveSelectionRestrictToView: (value: boolean) => void
  moveRequireConfirm: boolean
  onSetMoveRequireConfirm: (value: boolean) => void
  selectedCellsText: string
  previewCellsText: string
  blockedCellsText: string
  selectionScopeHint: string
  sourceAnchorText: string
  targetAnchorText: string
  offsetText: string
  canApply: boolean
  applyLabel: string
  onApply: () => void
}

export function MoveModePanel(props: MoveModePanelProps) {
  return (
    <section className="move-panel section-gap">
      <MoveSetupSection
        moveOperation={props.moveOperation}
        movePayload={props.movePayload}
        onSetMoveOperation={props.onSetMoveOperation}
        onSetMovePayload={props.onSetMovePayload}
      />
      <MoveContentSection
        movePayload={props.movePayload}
        moveVacatedKind={props.moveVacatedKind}
        onSetMoveVacatedKind={props.onSetMoveVacatedKind}
        moveVacatedElevation={props.moveVacatedElevation}
        onSetMoveVacatedElevation={props.onSetMoveVacatedElevation}
        moveCities={props.moveCities}
        onSetMoveCities={props.onSetMoveCities}
        labelGroupToggles={props.labelGroupToggles}
        allLabelGroupsChecked={props.allLabelGroupsChecked}
        onSetAllLabelGroups={props.onSetAllLabelGroups}
      />
      <MoveSelectionSection
        isMoveSelectionMode={props.isMoveSelectionMode}
        onToggleMoveSelectionMode={props.onToggleMoveSelectionMode}
        onClearMoveSelection={props.onClearMoveSelection}
        moveSelectionRestrictToView={props.moveSelectionRestrictToView}
        onSetMoveSelectionRestrictToView={props.onSetMoveSelectionRestrictToView}
        moveRequireConfirm={props.moveRequireConfirm}
        onSetMoveRequireConfirm={props.onSetMoveRequireConfirm}
        selectedCellsText={props.selectedCellsText}
        previewCellsText={props.previewCellsText}
        blockedCellsText={props.blockedCellsText}
        selectionScopeHint={props.selectionScopeHint}
        sourceAnchorText={props.sourceAnchorText}
        targetAnchorText={props.targetAnchorText}
        offsetText={props.offsetText}
        applyLabel={props.applyLabel}
        canApply={props.canApply}
        onApply={props.onApply}
      />
    </section>
  )
}
