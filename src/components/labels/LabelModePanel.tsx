import type { Country, Label, LabelAnchor, LabelGroup } from '../../domain/world'
import { LabelGroupsToolSection, type LabelGroupCompactColumnId } from './LabelGroupsToolSection'
import { LabelsToolSection } from './LabelsToolSection'

interface LabelModePanelProps {
  isLabelGroupsSectionExpanded: boolean
  onToggleLabelGroupsSection: () => void
  isLabelGroupInfoExpanded: boolean
  onToggleLabelGroupInfo: () => void
  activeManagedLabelGroup: LabelGroup | null
  activeManagedLabelGroupId: string | null
  labelCountByGroupId: Record<string, number>
  describeAssignedLabelGroup: (group: LabelGroup) => string
  onCreateFreeGroup: () => void
  onCreateAssignedGroup: () => void
  onCreateCurrentKindGroup: () => void
  onOpenActiveLabelGroupEditor: () => void
  onDeleteActiveLabelGroup: () => void
  onCreateMissingAssignedLabels: () => void
  onOpenLabelGroupsFullTable: () => void
  isLabelGroupsListExpanded: boolean
  onToggleLabelGroupsList: () => void
  labelGroups: LabelGroup[]
  labelGroupColumnOrder: LabelGroupCompactColumnId[]
  labelGroupCompactColumns: LabelGroupCompactColumnId[]
  onSelectLabelGroup: (groupId: string) => void
  onEditLabelGroup: (groupId: string) => void
  isLabelsSectionExpanded: boolean
  onToggleLabelsSection: () => void
  isLabelInfoExpanded: boolean
  onToggleLabelInfo: () => void
  activeLabel: Label | null
  activeLabelId: string | null
  activeLabelText: string
  activeLabelGroup: LabelGroup | null
  describeLabelAnchor: (anchor: LabelAnchor) => string
  onOpenActiveLabelEditor: () => void
  labelAnchorDisplayMode: 'none' | 'all' | 'selected'
  onSetLabelAnchorDisplayMode: (mode: 'none' | 'all' | 'selected') => void
  canCreateCityNameLabel: boolean
  canCreateCountryNameLabel: boolean
  canCreateProvinceNameLabel: boolean
  canCreateCountryIconLabel: boolean
  onCreateCityNameLabel: () => void
  onCreateCountryNameLabel: () => void
  onCreateProvinceNameLabel: () => void
  onCreateCountryIconLabel: () => void
  onCreateFreeLabel: () => void
  onDeleteActiveLabel: () => void
  onOpenTextLabelsFullTable: () => void
  onOpenIconLabelsFullTable: () => void
  isLabelsListExpanded: boolean
  onToggleLabelsList: () => void
  labelGroupFilter: string
  onClearLabelGroupFilter: () => void
  onToggleLabelGroupFilter: (groupId: string) => void
  filteredLabels: Label[]
  splitFilteredLabels: {
    text: Label[]
    icons: Label[]
  }
  worldLabelGroups: Record<string, LabelGroup>
  countriesById: Record<string, Country>
  iconSourceMap: Record<string, string>
  resolveLabelText: (label: Label) => string
  onSelectLabel: (labelId: string) => void
  onEditLabel: (labelId: string) => void
  onSetLabelVisible: (label: Label, visible: boolean) => void
  onSetLabelLocked: (label: Label, locked: boolean) => void
}

export function LabelModePanel(props: LabelModePanelProps) {
  return (
    <div className="tool-section-stack label-panel section-gap">
      <LabelGroupsToolSection
        expanded={props.isLabelGroupsSectionExpanded}
        onToggleSection={props.onToggleLabelGroupsSection}
        infoExpanded={props.isLabelGroupInfoExpanded}
        onToggleInfo={props.onToggleLabelGroupInfo}
        activeGroup={props.activeManagedLabelGroup}
        activeGroupId={props.activeManagedLabelGroupId}
        labelCountByGroupId={props.labelCountByGroupId}
        describeAssignedLabelGroup={props.describeAssignedLabelGroup}
        onCreateFreeGroup={props.onCreateFreeGroup}
        onCreateAssignedGroup={props.onCreateAssignedGroup}
        onCreateCurrentKindGroup={props.onCreateCurrentKindGroup}
        onOpenActiveGroupEditor={props.onOpenActiveLabelGroupEditor}
        onDeleteActiveGroup={props.onDeleteActiveLabelGroup}
        onCreateMissingAssignedLabels={props.onCreateMissingAssignedLabels}
        onOpenFullTable={props.onOpenLabelGroupsFullTable}
        listExpanded={props.isLabelGroupsListExpanded}
        onToggleList={props.onToggleLabelGroupsList}
        labelGroups={props.labelGroups}
        columnOrder={props.labelGroupColumnOrder}
        compactColumns={props.labelGroupCompactColumns}
        onSelectGroup={props.onSelectLabelGroup}
        onEditGroup={props.onEditLabelGroup}
      />

      <LabelsToolSection
        expanded={props.isLabelsSectionExpanded}
        onToggleSection={props.onToggleLabelsSection}
        infoExpanded={props.isLabelInfoExpanded}
        onToggleInfo={props.onToggleLabelInfo}
        activeLabel={props.activeLabel}
        activeLabelId={props.activeLabelId}
        activeLabelText={props.activeLabelText}
        activeLabelGroup={props.activeLabelGroup}
        describeLabelAnchor={props.describeLabelAnchor}
        onOpenActiveLabelEditor={props.onOpenActiveLabelEditor}
        labelAnchorDisplayMode={props.labelAnchorDisplayMode}
        onSetLabelAnchorDisplayMode={props.onSetLabelAnchorDisplayMode}
        canCreateCityNameLabel={props.canCreateCityNameLabel}
        canCreateCountryNameLabel={props.canCreateCountryNameLabel}
        canCreateProvinceNameLabel={props.canCreateProvinceNameLabel}
        canCreateCountryIconLabel={props.canCreateCountryIconLabel}
        onCreateCityNameLabel={props.onCreateCityNameLabel}
        onCreateCountryNameLabel={props.onCreateCountryNameLabel}
        onCreateProvinceNameLabel={props.onCreateProvinceNameLabel}
        onCreateCountryIconLabel={props.onCreateCountryIconLabel}
        onCreateFreeLabel={props.onCreateFreeLabel}
        onDeleteActiveLabel={props.onDeleteActiveLabel}
        onOpenTextLabelsFullTable={props.onOpenTextLabelsFullTable}
        onOpenIconLabelsFullTable={props.onOpenIconLabelsFullTable}
        listExpanded={props.isLabelsListExpanded}
        onToggleList={props.onToggleLabelsList}
        labelGroupFilter={props.labelGroupFilter}
        onClearLabelGroupFilter={props.onClearLabelGroupFilter}
        onToggleLabelGroupFilter={props.onToggleLabelGroupFilter}
        filteredLabels={props.filteredLabels}
        splitFilteredLabels={props.splitFilteredLabels}
        worldLabelGroups={props.worldLabelGroups}
        countriesById={props.countriesById}
        iconSourceMap={props.iconSourceMap}
        resolveLabelText={props.resolveLabelText}
        onSelectLabel={props.onSelectLabel}
        onEditLabel={props.onEditLabel}
        onSetLabelVisible={props.onSetLabelVisible}
        onSetLabelLocked={props.onSetLabelLocked}
      />
    </div>
  )
}
