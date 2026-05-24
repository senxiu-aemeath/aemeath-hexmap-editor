import type { City, Country, Province } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { renderSortLabel } from '../../political/display'
import type { ProvinceSortKey, SortDirection } from '../../political/types'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

import type { ProvinceColumnId } from './ProvinceSection'

interface ExpandedProvincesTableProps {
  provinces: Province[]
  totalCount: number
  countries: Record<string, Country>
  cities: Record<string, City>
  provinceCellCounts: Record<string, number>
  provinceSortKey: ProvinceSortKey
  provinceSortDirection: SortDirection
  effectiveCountryFilter?: string
  searchValue: string
  orderedColumnIds: ProvinceColumnId[]
  compactColumnIds: ProvinceColumnId[]
  onSearchChange: (value: string) => void
  onToggleCompactColumn: (columnId: ProvinceColumnId) => void
  onMoveColumn: (columnId: ProvinceColumnId, direction: 'left' | 'right') => void
  onClearFilter?: () => void
  onToggleCountryFilter?: (countryId: string | null) => void
  onChangeSort: (nextKey: ProvinceSortKey) => void
  onSelectProvince: (provinceId: string) => void
  onEditProvince: (provinceId: string) => void
}

export function ExpandedProvincesTable({ provinces,
  totalCount,
  countries,
  cities,
  provinceCellCounts,
  provinceSortKey,
  provinceSortDirection,
  effectiveCountryFilter = 'all',
  searchValue,
  orderedColumnIds,
  compactColumnIds,
  onSearchChange,
  onToggleCompactColumn,
  onMoveColumn,
  onClearFilter,
  onToggleCountryFilter,
  onChangeSort,
  onSelectProvince,
  onEditProvince,
}: ExpandedProvincesTableProps) {
  const { activeProvinceId } = useActiveEntityContext()
  const ui = useUiMessages()
  const normalizedSearch = searchValue.trim().toLowerCase()
  const visibleProvinces = normalizedSearch
    ? provinces.filter((province) => {
        const countryName = province.countryId
          ? countries[province.countryId]?.name ?? ''
          : ui.common.unassigned
        const capitalName = province.capitalCityId ? cities[province.capitalCityId]?.name ?? '' : ui.common.none
        return [province.name, countryName, capitalName, province.color]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
    : provinces
  const hasSearchValue = searchValue.trim().length > 0
  const activeFilterLabel =
    effectiveCountryFilter === 'all'
      ? null
      : effectiveCountryFilter === 'unassigned'
        ? ui.common.unassigned
        : countries[effectiveCountryFilter]?.name ?? ui.common.unassigned
  const orderedColumns = orderedColumnIds.map((columnId) => {
    if (columnId === 'country') return { id: columnId, label: ui.cityTable.country }
    if (columnId === 'capital') return { id: columnId, label: ui.provinceEditor.capitalCity }
    return { id: columnId, label: ui.common.cells }
  })

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
            placeholder={`${ui.common.search} ${ui.common.name.toLowerCase()}, ${ui.cityTable.country.toLowerCase()}, ${ui.provinceEditor.capitalCity.toLowerCase()}`}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="floating-table-grid">
        <table className="floating-table floating-table--provinces">
          <colgroup>
            <col className="floating-table-col-name" />
            <col className="floating-table-col-country" />
            <col className="floating-table-col-province" />
            <col className="floating-table-col-second" />
          </colgroup>
          <thead>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">{ui.common.organization}</th>
              {orderedColumns.map((column) => {
                const columnIndex = orderedColumnIds.indexOf(column.id)
                const canMoveLeft = columnIndex > 0
                const canMoveRight = columnIndex < orderedColumnIds.length - 1
                return (
                  <th key={column.id} className="floating-table-meta-cell">
                    <div className="floating-table-column-organizer">
                      <input type="checkbox" checked={compactColumnIds.includes(column.id)} onChange={() => onToggleCompactColumn(column.id)} />
                      <div className="floating-table-column-move-group">
                        <button className="mini-icon-button" type="button" disabled={!canMoveLeft} onClick={() => onMoveColumn(column.id, 'left')}>‹</button>
                        <button className="mini-icon-button" type="button" disabled={!canMoveRight} onClick={() => onMoveColumn(column.id, 'right')}>›</button>
                      </div>
                    </div>
                  </th>
                )
              })}
            </tr>
            <tr className="floating-table-meta-row floating-table-summary-row">
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">
                  {`${visibleProvinces.length} ${ui.common.shown} / ${totalCount} ${ui.common.total}`}
                </span>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'country') {
                  return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{new Set(visibleProvinces.map((province) => province.countryId ?? '__unassigned__')).size}</span></th>
                }
                if (column.id === 'capital') {
                  return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleProvinces.filter((province) => province.capitalCityId).length}</span></th>
                }
                return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleProvinces.reduce((sum, province) => sum + (provinceCellCounts[province.id] ?? 0), 0)}</span></th>
              })}
            </tr>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">
                <div className="floating-table-meta-inline">
                  <button className="table-filter-clear-button" type="button" onClick={() => onClearFilter?.()}>
                    {ui.common.clearFilter}
                  </button>
                </div>
              </th>
              {orderedColumns.map((column) =>
                column.id === 'country' ? (
                  <th key={column.id} className="floating-table-meta-cell">
                    <button
                      className={`floating-table-filter-button${activeFilterLabel ? '' : ' is-empty'}`}
                      type="button"
                      disabled={!activeFilterLabel}
                      onClick={() => {
                        onClearFilter?.()
                      }}
                    >
                      {activeFilterLabel ?? ui.common.none}
                    </button>
                  </th>
                ) : (
                  <th key={column.id} className="floating-table-meta-cell">
                    <span className="floating-table-filter-spacer" aria-hidden="true" />
                  </th>
                ),
              )}
            </tr>
            <tr className="floating-table-header-row">
              <th>
                <button className="table-sort-button" type="button" onClick={() => onChangeSort('name')}>
                  {renderSortLabel(ui.cityTable.name, provinceSortKey === 'name', provinceSortDirection)}
                </button>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'country') {
                  return (
                    <th key={column.id}>
                      <button
                        className="table-sort-button"
                        type="button"
                        onClick={() => onChangeSort('country')}
                      >
                        {renderSortLabel(ui.cityTable.country, provinceSortKey === 'country', provinceSortDirection)}
                      </button>
                    </th>
                  )
                }
                return <th key={column.id}>{column.label}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {visibleProvinces.length === 0 ? (
              <tr>
                <td colSpan={4} className="floating-table-empty">
                  {ui.political.noProvinces}
                </td>
              </tr>
            ) : (
              visibleProvinces.map((province) => (
                <tr
                  key={province.id}
                  className={province.id === activeProvinceId ? ' is-active' : ''}
                  onClick={() => {
                    onSelectProvince(province.id)
                  }}
                  onDoubleClick={() => {
                    onEditProvince(province.id)
                  }}
                >
                  <td>
                    <span className="floating-city-primary">
                      <span className="country-swatch" style={{ backgroundColor: province.color }} />
                      <span className="city-name">{province.name}</span>
                    </span>
                  </td>
                  {orderedColumns.map((column) => {
                    if (column.id === 'country') {
                      return (
                        <td key={column.id} className="floating-table-text-cell">
                          <button
                            className="floating-table-cell-button city-country"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onToggleCountryFilter?.(province.countryId)
                            }}
                          >
                            {province.countryId
                              ? countries[province.countryId]?.name ?? ui.common.unassigned
                              : ui.common.unassigned}
                          </button>
                        </td>
                      )
                    }
                    if (column.id === 'capital') {
                      return (
                        <td key={column.id} className="floating-table-text-cell">
                          {province.capitalCityId ? cities[province.capitalCityId]?.name ?? ui.common.none : ui.common.none}
                        </td>
                      )
                    }
                    return (
                      <td key={column.id} className="floating-table-text-cell">
                        {provinceCellCounts[province.id] ?? 0}
                      </td>
                    )
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
