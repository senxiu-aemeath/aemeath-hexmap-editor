import type { Country, GovernmentType } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { renderSortLabel } from '../../political/display'
import type { CountrySortKey, SortDirection } from '../../political/types'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

import type { CountryColumnId } from './CountrySection'

interface ExpandedCountriesTableProps {
  countries: Country[]
  iconSourceMap: Record<string, string>
  totalCount: number
  governmentTypes: Record<string, GovernmentType>
  effectiveGovernmentTypeFilter: string
  assignmentCountById: Record<string, number>
  provinceCountById: Record<string, number>
  countrySortKey: CountrySortKey
  countrySortDirection: SortDirection
  searchValue: string
  orderedColumnIds: CountryColumnId[]
  compactColumnIds: CountryColumnId[]
  onSearchChange: (value: string) => void
  onToggleCompactColumn: (columnId: CountryColumnId) => void
  onMoveColumn: (columnId: CountryColumnId, direction: 'left' | 'right') => void
  onClearFilter: () => void
  onToggleGovernmentTypeFilter: (governmentTypeId: string | null) => void
  onChangeSort: (nextKey: CountrySortKey) => void
  onSelectCountry: (countryId: string) => void
  onEditCountry: (countryId: string) => void
}

export function ExpandedCountriesTable({ countries,
  iconSourceMap,
  totalCount,
  governmentTypes,
  effectiveGovernmentTypeFilter,
  assignmentCountById,
  provinceCountById,
  countrySortKey,
  countrySortDirection,
  searchValue,
  orderedColumnIds,
  compactColumnIds,
  onSearchChange,
  onToggleCompactColumn,
  onMoveColumn,
  onClearFilter,
  onToggleGovernmentTypeFilter,
  onChangeSort,
  onSelectCountry,
  onEditCountry,
}: ExpandedCountriesTableProps) {
  const { activeCountryId } = useActiveEntityContext()
  const ui = useUiMessages()
  const normalizedSearch = searchValue.trim().toLowerCase()
  const visibleCountries = normalizedSearch
    ? countries.filter((country) => {
        const governmentName = country.governmentTypeId
          ? governmentTypes[country.governmentTypeId]?.name ?? ''
          : ui.countryEditor.noGovernmentType
        return [country.name, country.secondName ?? '', governmentName, country.color]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
    : countries

  const allGovernmentTypeIds = new Set(countries.map((country) => country.governmentTypeId ?? '__none__'))
  const visibleGovernmentTypeIds = new Set(
    visibleCountries.map((country) => country.governmentTypeId ?? '__none__'),
  )
  const activeFilterLabel =
    effectiveGovernmentTypeFilter === 'all'
      ? null
      : effectiveGovernmentTypeFilter === 'none'
        ? ui.countryEditor.noGovernmentType
        : governmentTypes[effectiveGovernmentTypeFilter]?.name ?? ui.countryEditor.noGovernmentType
  const hasSearchValue = searchValue.trim().length > 0
  const orderedColumns = orderedColumnIds.map((columnId) => {
    if (columnId === 'government') return { id: columnId, label: ui.political.governmentType }
    if (columnId === 'city_state') return { id: columnId, label: ui.countryEditor.isCityState }
    if (columnId === 'provinces') return { id: columnId, label: ui.political.provinces }
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
            placeholder={`${ui.common.search} ${ui.common.name.toLowerCase()}, ${ui.political.governmentType.toLowerCase()}, ${ui.common.color.toLowerCase()}`}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="floating-table-grid">
        <table className="floating-table floating-table--countries">
          <colgroup>
            <col className="floating-table-col-name" />
            <col className="floating-table-col-country" />
            <col className="floating-table-col-type" />
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
                      <input
                        type="checkbox"
                        checked={compactColumnIds.includes(column.id)}
                        onChange={() => onToggleCompactColumn(column.id)}
                      />
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
                  {`${visibleCountries.length} ${ui.common.shown} / ${totalCount} ${ui.common.total}`}
                </span>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'government') {
                  return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{`${visibleGovernmentTypeIds.size} / ${allGovernmentTypeIds.size}`}</span></th>
                }
                if (column.id === 'city_state') {
                  return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleCountries.filter((country) => country.isCityState).length}</span></th>
                }
                if (column.id === 'provinces') {
                  return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleCountries.reduce((sum, country) => sum + (provinceCountById[country.id] ?? 0), 0)}</span></th>
                }
                return <th key={column.id} className="floating-table-meta-cell"><span className="floating-table-summary-text">{visibleCountries.reduce((sum, country) => sum + (assignmentCountById[country.id] ?? 0), 0)}</span></th>
              })}
            </tr>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">
                <div className="floating-table-meta-inline">
                  <button className="table-filter-clear-button" type="button" onClick={onClearFilter}>
                    {ui.common.clearFilter}
                  </button>
                </div>
              </th>
              {orderedColumns.map((column) =>
                column.id === 'government' ? (
                  <th key={column.id} className="floating-table-meta-cell">
                    <button
                      className={`floating-table-filter-button${activeFilterLabel ? '' : ' is-empty'}`}
                      type="button"
                      disabled={!activeFilterLabel}
                      onClick={() => {
                        onClearFilter()
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
                  {renderSortLabel(ui.cityTable.name, countrySortKey === 'name', countrySortDirection)}
                </button>
              </th>
              {orderedColumns.map((column) => (
                <th key={column.id}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleCountries.length === 0 ? (
              <tr>
                <td colSpan={5} className="floating-table-empty">
                  {ui.political.noCountries}
                </td>
              </tr>
            ) : (
              visibleCountries.map((country) => {
                const governmentLabel = country.governmentTypeId
                  ? governmentTypes[country.governmentTypeId]?.name ?? ui.countryEditor.noGovernmentType
                  : ui.countryEditor.noGovernmentType
                return (
                  <tr
                    key={country.id}
                    className={country.id === activeCountryId ? ' is-active' : ''}
                    onClick={() => {
                      onSelectCountry(country.id)
                    }}
                    onDoubleClick={() => {
                      onEditCountry(country.id)
                    }}
                  >
                    <td>
                      <span className="floating-city-primary">
                        {country.iconKey && iconSourceMap[country.iconKey] ? (
                          <span className="country-emblem__frame" aria-hidden="true">
                            <img
                              src={iconSourceMap[country.iconKey]}
                              className="country-emblem__image"
                              alt={country.iconKey}
                            />
                          </span>
                        ) : null}
                        <span className="country-swatch" style={{ backgroundColor: country.color }} />
                        <span className="city-name">{country.name}</span>
                      </span>
                    </td>
                    {orderedColumns.map((column) => {
                      if (column.id === 'government') {
                        return (
                          <td key={column.id}>
                            <button
                              className="floating-table-cell-button city-country"
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                onToggleGovernmentTypeFilter(country.governmentTypeId)
                              }}
                            >
                              {governmentLabel}
                            </button>
                          </td>
                        )
                      }
                      if (column.id === 'city_state') {
                        return <td key={column.id} className="floating-table-text-cell">{country.isCityState ? ui.common.yes : ui.common.no}</td>
                      }
                      if (column.id === 'provinces') {
                        return <td key={column.id} className="floating-table-text-cell">{provinceCountById[country.id] ?? 0}</td>
                      }
                      return <td key={column.id} className="floating-table-text-cell">{assignmentCountById[country.id] ?? 0}</td>
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
