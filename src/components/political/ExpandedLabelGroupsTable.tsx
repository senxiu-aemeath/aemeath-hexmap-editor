import type { LabelGroup } from '../../domain/world'
import type { AppMessages } from '../../i18n'
import { useUiMessages } from '../../i18n'

interface ExpandedLabelGroupsTableProps {
  labelGroups: LabelGroup[]
  totalCount: number
  activeLabelGroupId: string | null
  labelCountByGroupId: Record<string, number>
  searchValue: string
  orderedColumnIds: Array<'kind' | 'count'>
  compactColumnIds: Array<'kind' | 'count'>
  onSearchChange: (value: string) => void
  onToggleCompactColumn: (columnId: 'kind' | 'count') => void
  onMoveColumn: (columnId: 'kind' | 'count', direction: 'left' | 'right') => void
  onSelectLabelGroup: (groupId: string) => void
  onEditLabelGroup: (groupId: string) => void
}

function describeGroupKind(ui: AppMessages, group: LabelGroup) {
  if (group.kind === 'free') {
    return ui.label.free
  }

  if (!group.assignment) {
    return ui.label.assigned
  }

  return group.assignment.kind === 'city'
    ? ui.label.cityTarget
    : group.assignment.kind === 'country'
      ? ui.label.countryTarget
      : ui.label.provinceTarget
}

function describeGroupKindAbbr(group: LabelGroup) {
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

export function ExpandedLabelGroupsTable({ labelGroups,
  totalCount,
  activeLabelGroupId,
  labelCountByGroupId,
  searchValue,
  orderedColumnIds,
  compactColumnIds,
  onSearchChange,
  onToggleCompactColumn,
  onMoveColumn,
  onSelectLabelGroup,
  onEditLabelGroup,
}: ExpandedLabelGroupsTableProps) {
  const ui = useUiMessages()
  const normalizedSearch = searchValue.trim().toLowerCase()
  const visibleGroups = normalizedSearch
    ? labelGroups.filter((group) =>
        [group.name, describeGroupKind(ui, group)]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : labelGroups
  const hasSearchValue = searchValue.trim().length > 0

  return (
    <div className="expanded-cities-table">
      <div className="floating-table-toolbar-row">
        <div className="floating-table-search-group">
          <button
            className="ghost-button floating-table-search-clear"
            type="button"
            disabled={!hasSearchValue}
            onClick={() => {
              onSearchChange('')
            }}
            aria-label={ui.common.clear}
          >
            ×
          </button>
          <input
            className="floating-table-search-input"
            type="text"
            value={searchValue}
            placeholder={`${ui.common.search} ${ui.label.group.toLowerCase()} ${ui.common.name.toLowerCase()} / ${ui.label.groupKind.toLowerCase()}`}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="floating-table-grid">
        <table className="floating-table floating-table--label-groups">
            <colgroup>
              <col className="floating-table-col-name" />
              <col className="floating-table-col-country" />
              <col className="floating-table-col-type" />
            </colgroup>
            <thead>
              <tr className="floating-table-meta-row">
                <th className="floating-table-meta-label-cell">{ui.label.groups}</th>
                {orderedColumnIds.map((columnId) => {
                  const columnIndex = orderedColumnIds.indexOf(columnId)
                  const canMoveLeft = columnIndex > 0
                const canMoveRight = columnIndex < orderedColumnIds.length - 1
                return (
                  <th key={columnId} className="floating-table-meta-cell">
                    <div className="floating-table-column-organizer">
                      <input type="checkbox" checked={compactColumnIds.includes(columnId)} onChange={() => onToggleCompactColumn(columnId)} />
                      <div className="floating-table-column-move-group">
                        <button className="mini-icon-button" type="button" disabled={!canMoveLeft} onClick={() => onMoveColumn(columnId, 'left')}>‹</button>
                        <button className="mini-icon-button" type="button" disabled={!canMoveRight} onClick={() => onMoveColumn(columnId, 'right')}>›</button>
                      </div>
                    </div>
                  </th>
                )
              })}
            </tr>
            <tr className="floating-table-meta-row floating-table-summary-row">
                <th className="floating-table-meta-cell">
                  <span className="floating-table-summary-text">
                    {`${visibleGroups.length} ${ui.common.shown} / ${totalCount} ${ui.common.total}`}
                  </span>
                </th>
                {orderedColumnIds.map((columnId) => {
                  if (columnId === 'kind') {
                    return <th key={columnId} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleGroups.filter((group) => group.kind === 'assigned').length}</span></th>
                  }
                  return <th key={columnId} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleGroups.reduce((sum, group) => sum + (labelCountByGroupId[group.id] ?? 0), 0)}</span></th>
                })}
              </tr>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">
                <div className="floating-table-meta-inline">
                  <button className="table-filter-clear-button" type="button" onClick={() => onSearchChange('')}>
                    {ui.common.clearFilter}
                  </button>
                </div>
              </th>
              {orderedColumnIds.map((columnId, index) =>
                index === 0 ? (
                  <th key={columnId} className="floating-table-meta-cell">
                    <span className={`floating-table-filter-text${hasSearchValue ? '' : ' is-empty'}`}>
                      {hasSearchValue ? searchValue : ui.common.none}
                    </span>
                  </th>
                ) : (
                  <th key={columnId} className="floating-table-meta-cell">
                    <span className="floating-table-filter-spacer" aria-hidden="true" />
                  </th>
                ),
              )}
            </tr>
            <tr className="floating-table-header-row">
              <th>{ui.label.group}</th>
              {orderedColumnIds.map((columnId) => {
                if (columnId === 'kind') return <th key={columnId}>{ui.label.groupKind}</th>
                return <th key={columnId}>{ui.label.labels}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {visibleGroups.length === 0 ? (
              <tr>
                <td colSpan={3} className="floating-table-empty">
                  {ui.label.noSelectedGroup}
                </td>
              </tr>
            ) : (
              visibleGroups.map((group) => (
                <tr
                  key={group.id}
                  className={group.id === activeLabelGroupId ? ' is-active' : ''}
                  onClick={() => {
                    onSelectLabelGroup(group.id)
                  }}
                  onDoubleClick={() => {
                    onEditLabelGroup(group.id)
                  }}
                >
                  <td className="floating-table-text-cell">{group.name}</td>
                  {orderedColumnIds.map((columnId) => {
                    if (columnId === 'kind') {
                      return (
                        <td
                          key={columnId}
                          className="floating-table-text-cell"
                          title={describeGroupKind(ui, group)}
                        >
                          {describeGroupKindAbbr(group)}
                        </td>
                      )
                    }
                    return <td key={columnId} className="floating-table-text-cell">{labelCountByGroupId[group.id] ?? 0}</td>
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
