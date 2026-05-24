import { useUiMessages } from '../../i18n'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

export interface ExpandedTextLabelRow {
  id: string
  primaryText: string
  groupName: string
  sourceText: string
  anchorText: string
  visible: boolean
  locked: boolean
}

interface ExpandedTextLabelsTableProps {
  rows: ExpandedTextLabelRow[]
  totalCount: number
  searchValue: string
  activeGroupLabel: string | null
  onSearchChange: (value: string) => void
  onClearFilter: () => void
  onSelectLabel: (labelId: string) => void
  onEditLabel: (labelId: string) => void
}

export function ExpandedTextLabelsTable({ rows,
  totalCount,
  searchValue,
  activeGroupLabel,
  onSearchChange,
  onClearFilter,
  onSelectLabel,
  onEditLabel,
}: ExpandedTextLabelsTableProps) {
  const { activeLabelId } = useActiveEntityContext()
  const ui = useUiMessages()
  const normalizedSearch = searchValue.trim().toLowerCase()
  const visibleRows = normalizedSearch
    ? rows.filter((row) =>
        [row.primaryText, row.groupName, row.sourceText, row.anchorText]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : rows
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
            placeholder={`${ui.common.search} ${ui.label.text.toLowerCase()} / ${ui.label.group.toLowerCase()} / ${ui.label.source.toLowerCase()}`}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="floating-table-grid">
        <table className="floating-table floating-table--labels">
          <colgroup>
            <col className="floating-table-col-name" />
            <col className="floating-table-col-country" />
            <col className="floating-table-col-type" />
            <col className="floating-table-col-second" />
          </colgroup>
          <thead>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">{ui.label.textLabels}</th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">{ui.label.group}</span>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">{ui.label.source}</span>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">{ui.label.anchor}</span>
              </th>
            </tr>
            <tr className="floating-table-meta-row floating-table-summary-row">
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">
                  {`${visibleRows.length} ${ui.common.shown} / ${totalCount} ${ui.common.total}`}
                </span>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">{activeGroupLabel ?? ui.common.none}</span>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">
                  {visibleRows.filter((row) => row.visible).length}
                </span>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">
                  {visibleRows.filter((row) => row.locked).length}
                </span>
              </th>
            </tr>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">
                <div className="floating-table-meta-inline">
                  <button className="table-filter-clear-button" type="button" onClick={onClearFilter}>
                    {ui.common.clearFilter}
                  </button>
                </div>
              </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-filter-text">{activeGroupLabel ?? ui.common.none}</span>
              </th>
              <th className="floating-table-meta-cell">
                    <span className={`floating-table-filter-text${hasSearchValue ? '' : ' is-empty'}`}>
                      {hasSearchValue ? searchValue : ui.common.none}
                    </span>
                  </th>
              <th className="floating-table-meta-cell">
                <span className="floating-table-filter-spacer" aria-hidden="true" />
              </th>
            </tr>
            <tr className="floating-table-header-row">
              <th>{ui.label.text}</th>
              <th>{ui.label.group}</th>
              <th>{ui.label.source}</th>
              <th>{ui.label.anchor}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="floating-table-empty">
                  {ui.label.noLabels}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={row.id}
                  className={row.id === activeLabelId ? ' is-active' : ''}
                  onClick={() => {
                    onSelectLabel(row.id)
                  }}
                  onDoubleClick={() => {
                    onEditLabel(row.id)
                  }}
                >
                  <td>
                    <span className="floating-city-primary">
                      <span className="city-name">{row.primaryText}</span>
                      <span className="floating-label-status">
                        {row.visible ? ui.label.visible : ui.common.hidden}
                        {row.locked ? ` / ${ui.label.offsetLocked}` : ''}
                      </span>
                    </span>
                  </td>
                  <td className="floating-table-text-cell">{row.groupName}</td>
                  <td className="floating-table-text-cell">{row.sourceText}</td>
                  <td className="floating-table-text-cell">{row.anchorText}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
