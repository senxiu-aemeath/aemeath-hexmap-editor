import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import {
  createMissingAssignedLabelsForGroup,
  removeLabel,
  removeLabelGroup,
  resolveLabelText,
  upsertLabel,
} from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { LabelModePanel } from './LabelModePanel'
import { useWorldContext } from '../../state/WorldContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type LabelModePanelProps = ComponentProps<typeof LabelModePanel>

interface LabelModePanelContainerProps {
  isLabelGroupsSectionExpanded: boolean
  setIsLabelGroupsSectionExpanded: Dispatch<SetStateAction<boolean>>
  isLabelGroupInfoExpanded: boolean
  setIsLabelGroupInfoExpanded: Dispatch<SetStateAction<boolean>>
  activeManagedLabelGroup: LabelModePanelProps['activeManagedLabelGroup']
  labelCountByGroupId: LabelModePanelProps['labelCountByGroupId']
  describeAssignedLabelGroup: LabelModePanelProps['describeAssignedLabelGroup']
  createAndEditLabelGroup: (kind: 'free' | 'assigned') => void
  openLabelGroupEditor: (groupId: string) => void
  openSidebarDeleteConfirmation: (title: string, onConfirm: () => void) => void
  onOpenLabelGroupsFullTable: () => void
  isLabelGroupsListExpanded: boolean
  setIsLabelGroupsListExpanded: Dispatch<SetStateAction<boolean>>
  labelGroups: LabelModePanelProps['labelGroups']
  labelGroupColumnOrder: LabelModePanelProps['labelGroupColumnOrder']
  labelGroupCompactColumns: LabelModePanelProps['labelGroupCompactColumns']
  isLabelsSectionExpanded: boolean
  setIsLabelsSectionExpanded: Dispatch<SetStateAction<boolean>>
  isLabelInfoExpanded: boolean
  setIsLabelInfoExpanded: Dispatch<SetStateAction<boolean>>
  activeLabel: LabelModePanelProps['activeLabel']
  activeLabelText: string
  activeLabelGroup: LabelModePanelProps['activeLabelGroup']
  describeLabelAnchor: LabelModePanelProps['describeLabelAnchor']
  openLabelEditor: (labelId: string) => void
  labelAnchorDisplayMode: LabelModePanelProps['labelAnchorDisplayMode']
  setLabelAnchorDisplayMode: Dispatch<SetStateAction<LabelModePanelProps['labelAnchorDisplayMode']>>
  canCreateCityNameLabel: boolean
  canCreateCountryNameLabel: boolean
  canCreateProvinceNameLabel: boolean
  canCreateCountryIconLabel: boolean
  onCreateCityNameLabel: () => void
  onCreateCountryNameLabel: () => void
  onCreateProvinceNameLabel: () => void
  onCreateCountryIconLabel: () => void
  onCreateFreeLabel: () => void
  onOpenTextLabelsFullTable: () => void
  onOpenIconLabelsFullTable: () => void
  isLabelsListExpanded: boolean
  setIsLabelsListExpanded: Dispatch<SetStateAction<boolean>>
  labelGroupFilter: string
  setLabelGroupFilter: Dispatch<SetStateAction<string>>
  filteredLabels: LabelModePanelProps['filteredLabels']
  splitFilteredLabels: LabelModePanelProps['splitFilteredLabels']
  worldLabelGroups: LabelModePanelProps['worldLabelGroups']
}

export function LabelModePanelContainer({
  isLabelGroupsSectionExpanded,
  setIsLabelGroupsSectionExpanded,
  isLabelGroupInfoExpanded,
  setIsLabelGroupInfoExpanded,
  activeManagedLabelGroup,
  labelCountByGroupId,
  describeAssignedLabelGroup,
  createAndEditLabelGroup,
  openLabelGroupEditor,
  openSidebarDeleteConfirmation,
  onOpenLabelGroupsFullTable,
  isLabelGroupsListExpanded,
  setIsLabelGroupsListExpanded,
  labelGroups,
  labelGroupColumnOrder,
  labelGroupCompactColumns,
  isLabelsSectionExpanded,
  setIsLabelsSectionExpanded,
  isLabelInfoExpanded,
  setIsLabelInfoExpanded,
  activeLabel,
  activeLabelText,
  activeLabelGroup,
  describeLabelAnchor,
  openLabelEditor,
  labelAnchorDisplayMode,
  setLabelAnchorDisplayMode,
  canCreateCityNameLabel,
  canCreateCountryNameLabel,
  canCreateProvinceNameLabel,
  canCreateCountryIconLabel,
  onCreateCityNameLabel,
  onCreateCountryNameLabel,
  onCreateProvinceNameLabel,
  onCreateCountryIconLabel,
  onCreateFreeLabel,
  onOpenTextLabelsFullTable,
  onOpenIconLabelsFullTable,
  isLabelsListExpanded,
  setIsLabelsListExpanded,
  labelGroupFilter,
  setLabelGroupFilter,
  filteredLabels,
  splitFilteredLabels,
  worldLabelGroups,
}: LabelModePanelContainerProps) {
  const { world, setWorld, iconSourceMap } = useWorldContext()
  const { activeLabelId, setActiveLabelId, activeManagedLabelGroupId, setActiveManagedLabelGroupId } = useActiveEntityContext()
  const ui = useUiMessages()
  return (
    <LabelModePanel
      isLabelGroupsSectionExpanded={isLabelGroupsSectionExpanded}
      onToggleLabelGroupsSection={() => {
        setIsLabelGroupsSectionExpanded((current) => !current)
      }}
      isLabelGroupInfoExpanded={isLabelGroupInfoExpanded}
      onToggleLabelGroupInfo={() => {
        setIsLabelGroupInfoExpanded((current) => !current)
      }}
      activeManagedLabelGroup={activeManagedLabelGroup}
      activeManagedLabelGroupId={activeManagedLabelGroupId}
      labelCountByGroupId={labelCountByGroupId}
      describeAssignedLabelGroup={describeAssignedLabelGroup}
      onCreateFreeGroup={() => {
        createAndEditLabelGroup('free')
      }}
      onCreateAssignedGroup={() => {
        createAndEditLabelGroup('assigned')
      }}
      onCreateCurrentKindGroup={() => {
        createAndEditLabelGroup(
          activeManagedLabelGroup?.kind === 'assigned' ? 'assigned' : 'free',
        )
      }}
      onOpenActiveLabelGroupEditor={() => {
        if (!activeManagedLabelGroup) {
          return
        }
        openLabelGroupEditor(activeManagedLabelGroup.id)
      }}
      onDeleteActiveLabelGroup={() => {
        if (!activeManagedLabelGroup || activeManagedLabelGroup.builtIn) {
          return
        }
        const groupId = activeManagedLabelGroup.id
        const groupName = activeManagedLabelGroup.name || groupId
        openSidebarDeleteConfirmation(`${ui.common.delete} ${groupName}?`, () => {
          setWorld((current) => removeLabelGroup(current, groupId))
          if (activeManagedLabelGroupId === groupId) {
            setActiveManagedLabelGroupId(null)
          }
        })
      }}
      onCreateMissingAssignedLabels={() => {
        if (!activeManagedLabelGroup) {
          return
        }
        setWorld((current) =>
          createMissingAssignedLabelsForGroup(current, activeManagedLabelGroup.id),
        )
      }}
      onOpenLabelGroupsFullTable={onOpenLabelGroupsFullTable}
      isLabelGroupsListExpanded={isLabelGroupsListExpanded}
      onToggleLabelGroupsList={() => {
        setIsLabelGroupsListExpanded((current) => !current)
      }}
      labelGroups={labelGroups}
      labelGroupColumnOrder={labelGroupColumnOrder}
      labelGroupCompactColumns={labelGroupCompactColumns}
      onSelectLabelGroup={setActiveManagedLabelGroupId}
      onEditLabelGroup={openLabelGroupEditor}
      isLabelsSectionExpanded={isLabelsSectionExpanded}
      onToggleLabelsSection={() => {
        setIsLabelsSectionExpanded((current) => !current)
      }}
      isLabelInfoExpanded={isLabelInfoExpanded}
      onToggleLabelInfo={() => {
        setIsLabelInfoExpanded((current) => !current)
      }}
      activeLabel={activeLabel}
      activeLabelId={activeLabelId}
      activeLabelText={activeLabelText}
      activeLabelGroup={activeLabelGroup}
      describeLabelAnchor={describeLabelAnchor}
      onOpenActiveLabelEditor={() => {
        if (!activeLabel) {
          return
        }
        openLabelEditor(activeLabel.id)
      }}
      labelAnchorDisplayMode={labelAnchorDisplayMode}
      onSetLabelAnchorDisplayMode={setLabelAnchorDisplayMode}
      canCreateCityNameLabel={canCreateCityNameLabel}
      canCreateCountryNameLabel={canCreateCountryNameLabel}
      canCreateProvinceNameLabel={canCreateProvinceNameLabel}
      canCreateCountryIconLabel={canCreateCountryIconLabel}
      onCreateCityNameLabel={onCreateCityNameLabel}
      onCreateCountryNameLabel={onCreateCountryNameLabel}
      onCreateProvinceNameLabel={onCreateProvinceNameLabel}
      onCreateCountryIconLabel={onCreateCountryIconLabel}
      onCreateFreeLabel={onCreateFreeLabel}
      onDeleteActiveLabel={() => {
        if (!activeLabel) {
          return
        }
        const labelId = activeLabel.id
        const labelName = resolveLabelText(world, activeLabel) || labelId
        openSidebarDeleteConfirmation(`${ui.common.delete} ${labelName}?`, () => {
          setWorld((current) => removeLabel(current, labelId))
          if (activeLabelId === labelId) {
            setActiveLabelId(null)
          }
        })
      }}
      onOpenTextLabelsFullTable={onOpenTextLabelsFullTable}
      onOpenIconLabelsFullTable={onOpenIconLabelsFullTable}
      isLabelsListExpanded={isLabelsListExpanded}
      onToggleLabelsList={() => {
        setIsLabelsListExpanded((current) => !current)
      }}
      labelGroupFilter={labelGroupFilter}
      onClearLabelGroupFilter={() => {
        setLabelGroupFilter('all')
      }}
      onToggleLabelGroupFilter={(groupId) => {
        setLabelGroupFilter((current) => (current === groupId ? 'all' : groupId))
      }}
      filteredLabels={filteredLabels}
      splitFilteredLabels={splitFilteredLabels}
      worldLabelGroups={worldLabelGroups}
      countriesById={world.countries}
      iconSourceMap={iconSourceMap}
      resolveLabelText={(label) => resolveLabelText(world, label)}
      onSelectLabel={setActiveLabelId}
      onEditLabel={openLabelEditor}
      onSetLabelVisible={(label, visible) => {
        setWorld((current) =>
          upsertLabel(current, {
            ...label,
            visible,
          }),
        )
      }}
      onSetLabelLocked={(label, locked) => {
        setWorld((current) =>
          upsertLabel(current, {
            ...label,
            locked,
          }),
        )
      }}
    />
  )
}
