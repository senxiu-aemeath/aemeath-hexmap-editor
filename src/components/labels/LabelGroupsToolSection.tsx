import type { CSSProperties } from 'react'

import type { LabelGroup } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { ActionUnit, CardTitle, ControlCard, ControlRow } from '../ToolControlPrimitives'

export type LabelGroupCompactColumnId = 'kind' | 'count'

interface LabelGroupsToolSectionProps {
  expanded: boolean
  onToggleSection: () => void
  infoExpanded: boolean
  onToggleInfo: () => void
  activeGroup: LabelGroup | null
  activeGroupId: string | null
  labelCountByGroupId: Record<string, number>
  describeAssignedLabelGroup: (group: LabelGroup) => string
  onCreateFreeGroup: () => void
  onCreateAssignedGroup: () => void
  onCreateCurrentKindGroup: () => void
  onOpenActiveGroupEditor: () => void
  onDeleteActiveGroup: () => void
  onCreateMissingAssignedLabels: () => void
  onOpenFullTable: () => void
  listExpanded: boolean
  onToggleList: () => void
  labelGroups: LabelGroup[]
  columnOrder: LabelGroupCompactColumnId[]
  compactColumns: LabelGroupCompactColumnId[]
  onSelectGroup: (groupId: string) => void
  onEditGroup: (groupId: string) => void
}

export function LabelGroupsToolSection({ expanded,
  onToggleSection,
  infoExpanded,
  onToggleInfo,
  activeGroup,
  activeGroupId,
  labelCountByGroupId,
  describeAssignedLabelGroup,
  onCreateFreeGroup,
  onCreateAssignedGroup,
  onCreateCurrentKindGroup,
  onOpenActiveGroupEditor,
  onDeleteActiveGroup,
  onCreateMissingAssignedLabels,
  onOpenFullTable,
  listExpanded,
  onToggleList,
  labelGroups,
  columnOrder,
  compactColumns,
  onSelectGroup,
  onEditGroup,
}: LabelGroupsToolSectionProps) {
  const ui = useUiMessages()
  const describeGroupKindAbbr = (group: LabelGroup) => {
    if (group.kind === 'free' || !group.assignment) {
      return 'F'
    }

    const target =
      group.assignment.kind === 'city'
        ? 'c'
        : group.assignment.kind === 'country'
          ? 'C'
          : 'P'
    const sourceMode = group.assignment.sourceNameMode === 'primary' ? '1' : '2'
    const autoCreate =
      group.assignment.autoCreateMode === 'always'
        ? 'Y'
        : group.assignment.autoCreateMode === 'never'
          ? 'N'
          : group.assignment.autoCreateDefault
            ? '*Y'
            : '*N'

    return `A-${target}-${sourceMode}-${autoCreate}`
  }

  return (
    <section className="data-table-section">
      <SectionToggleHeader title={ui.label.groups} expanded={expanded} onToggle={onToggleSection} />
      {expanded && (
        <div className="mode-tool-card-list">
          <SelectedInfoShell
            title={ui.common.details}
            expanded={infoExpanded}
            onToggleExpanded={onToggleInfo}
          >
            <div className={`detail-card details-card selected-info-card active-city-card${infoExpanded ? ' is-expanded' : ''}`}>
              {activeGroup ? (
                <>
                  <div className="selected-info-pair">
                    <strong>{ui.common.name}</strong>
                    <span>{activeGroup.name}</span>
                  </div>
                  <div className="selected-info-pair">
                    <strong>{ui.label.labels}</strong>
                    <span>{labelCountByGroupId[activeGroup.id] ?? 0}</span>
                  </div>
                  <div className="selected-info-pair">
                    <strong>{ui.common.kind}</strong>
                    <span>{describeAssignedLabelGroup(activeGroup)}</span>
                  </div>
                  {activeGroup.kind === 'assigned' && activeGroup.assignment && (
                    <div className="selected-info-pair">
                      <strong>{ui.common.generated}</strong>
                      <span>{ui.label.generatedPrefixSuffix(activeGroup.assignment.generatedTextPrefix, activeGroup.assignment.generatedTextSuffix)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="selected-info-empty">
                  <strong>{ui.label.noSelectedGroup}</strong>
                  <span>{ui.label.noSelectedGroupHint}</span>
                </div>
              )}
            </div>
          </SelectedInfoShell>

          <CardTitle>{ui.common.tool}</CardTitle>
          <ControlCard className="label-control-card" variant="frameless">
            <ActionUnit>
              <ControlRow columns={2}>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateFreeGroup}>
                  {ui.common.free}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateAssignedGroup}>
                  {ui.common.assigned}
                </button>
              </ControlRow>
            </ActionUnit>
            {activeGroup?.kind === 'assigned' && (
              <ActionUnit>
                <ControlRow>
                  <button
                    className="toolbar-action-button toolbar-action-button--secondary toolbar-action-button--fullwidth"
                    type="button"
                    onClick={onCreateMissingAssignedLabels}
                  >
                    {ui.label.createMissing}
                  </button>
                </ControlRow>
              </ActionUnit>
            )}
            <ActionUnit>
              <ControlRow columns={3}>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCurrentKindGroup}>
                  {ui.common.create}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--secondary"
                  type="button"
                  disabled={!activeGroup}
                  onClick={onOpenActiveGroupEditor}
                >
                  {ui.common.edit}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--secondary"
                  type="button"
                  disabled={!activeGroup || activeGroup.builtIn}
                  onClick={onDeleteActiveGroup}
                >
                  {ui.common.delete}
                </button>
              </ControlRow>
            </ActionUnit>
            <ActionUnit>
              <ControlRow>
                <button
                  className="toolbar-action-button toolbar-action-button--secondary toolbar-action-button--fullwidth"
                  type="button"
                  onClick={onOpenFullTable}
                >
                  {ui.common.fullTable}
                </button>
              </ControlRow>
            </ActionUnit>
          </ControlCard>

          <DataTableShell
            expanded={listExpanded}
            onToggleExpanded={onToggleList}
            toggleLabel={`Toggle ${ui.label.groups} list`}
            headerRow={
              <div
                className="label-table-row label-table-head label-group-table-row"
                style={{
                  '--table-columns': [
                    'minmax(0, var(--side-table-label-group-name-col-fr, 1.08fr))',
                    ...columnOrder.flatMap((columnId) => {
                      if (!compactColumns.includes(columnId)) return []
                      if (columnId === 'kind') return ['minmax(156px, 0.92fr)']
                      if (columnId === 'count') return ['68px']
                      return []
                    }),
                  ].join(' '),
                } as CSSProperties}
              >
                <span>{ui.label.group}</span>
                {columnOrder.map((columnId) => {
                  if (!compactColumns.includes(columnId)) return null
                  if (columnId === 'kind') return <span key={columnId} className="label-table-group">{ui.label.groupKind}</span>
                  if (columnId === 'count') return <span key={columnId} className="label-table-count">{ui.label.labels}</span>
                  return null
                })}
              </div>
            }
          >
            {labelGroups.map((group) => (
              <div
                key={group.id}
                className={`label-table-row label-group-table-row label-group-table-body-row${group.id === activeGroupId ? ' is-active' : ''}`}
                style={{
                  '--table-columns': [
                    'minmax(0, var(--side-table-label-group-name-col-fr, 1.08fr))',
                    ...columnOrder.flatMap((columnId) => {
                      if (!compactColumns.includes(columnId)) return []
                      if (columnId === 'kind') return ['minmax(156px, 0.92fr)']
                      if (columnId === 'count') return ['68px']
                      return []
                    }),
                  ].join(' '),
                } as CSSProperties}
              >
                <button
                  className="label-table-name"
                  type="button"
                  onClick={() => onSelectGroup(group.id)}
                  onDoubleClick={() => onEditGroup(group.id)}
                >
                  <span>{group.name}</span>
                </button>
                {columnOrder.map((columnId) => {
                  if (!compactColumns.includes(columnId)) return null
                  if (columnId === 'kind') {
                    return (
                      <span
                        key={columnId}
                        className="label-table-group"
                        title={describeAssignedLabelGroup(group)}
                      >
                        {describeGroupKindAbbr(group)}
                      </span>
                    )
                  }
                  if (columnId === 'count') {
                    return <span key={columnId} className="label-table-count">{labelCountByGroupId[group.id] ?? 0}</span>
                  }
                  return null
                })}
                <span className="table-slot-cell" aria-hidden="true" />
              </div>
            ))}
          </DataTableShell>
        </div>
      )}
    </section>
  )
}
