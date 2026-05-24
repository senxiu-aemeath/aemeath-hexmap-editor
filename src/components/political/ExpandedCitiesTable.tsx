import type { City, CityLevel, Country, Province } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { getCityLevelName, renderCityTypeSortLabel, renderSortLabel } from '../../political/display'
import type { CitySortKey, CityTypeSortMode, SortDirection } from '../../political/types'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type CityColumnId = 'type' | 'country' | 'province' | 'second_name'

interface ExpandedCitiesTableProps {
  worldCityLevels: Record<string, CityLevel>
  iconSourceMap: Record<string, string>
  countries: Record<string, Country>
  provinces: Record<string, Province>
  cities: City[]
  totalCount: number
  activeCityProvinceNameById: Record<string, string | null>
  activeCityProvinceIdById: Record<string, string | null>
  orderedColumnIds: CityColumnId[]
  compactColumnIds: CityColumnId[]
  effectiveCityCountryFilter: string
  effectiveCityProvinceFilter: string
  effectiveCityLevelFilter: string
  citySortKey: CitySortKey
  citySortDirection: SortDirection
  cityTypeSortMode: CityTypeSortMode
  searchValue: string
  onSearchChange: (value: string) => void
  onToggleCompactColumn: (columnId: CityColumnId) => void
  onMoveColumn: (columnId: CityColumnId, direction: 'left' | 'right') => void
  onClearFilters: () => void
  onToggleCountryFilter: (countryId: string | null) => void
  onToggleProvinceFilter: (provinceId: string | null) => void
  onToggleLevelFilter: (levelId: string) => void
  onChangeSort: (nextKey: CitySortKey) => void
  onSelectCity: (cityId: string) => void
  onEditCity: (cityId: string) => void
}

export function ExpandedCitiesTable({ worldCityLevels,
  iconSourceMap,
  countries,
  provinces,
  cities,
  totalCount,
  activeCityProvinceNameById,
  activeCityProvinceIdById,
  orderedColumnIds,
  compactColumnIds,
  effectiveCityCountryFilter,
  effectiveCityProvinceFilter,
  effectiveCityLevelFilter,
  citySortKey,
  citySortDirection,
  cityTypeSortMode,
  searchValue,
  onSearchChange,
  onToggleCompactColumn,
  onMoveColumn,
  onClearFilters,
  onToggleCountryFilter,
  onToggleProvinceFilter,
  onToggleLevelFilter,
  onChangeSort,
  onSelectCity,
  onEditCity,
}: ExpandedCitiesTableProps) {
  const { activeCityId } = useActiveEntityContext()
  const ui = useUiMessages()
  const normalizedSearch = searchValue.trim().toLowerCase()
  const visibleCities = normalizedSearch
    ? cities.filter((city) => {
        const countryName = city.countryId ? countries[city.countryId]?.name ?? '' : ui.common.unassigned
        const provinceName = activeCityProvinceNameById[city.id] ?? ''
        const levelName = getCityLevelName(city.levelId, worldCityLevels, ui)
        return [city.name, city.secondName ?? '', countryName, provinceName, levelName]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
    : cities
  const visibleCountryIds = new Set(visibleCities.map((city) => city.countryId ?? '__unassigned__'))
  const allCountryIds = new Set(cities.map((city) => city.countryId ?? '__unassigned__'))
  const visibleProvinceIds = new Set(visibleCities.map((city) => activeCityProvinceIdById[city.id] ?? '__none__'))
  const allProvinceIds = new Set(cities.map((city) => activeCityProvinceIdById[city.id] ?? '__none__'))
  const visibleLevelIds = new Set(visibleCities.map((city) => city.levelId))
  const allLevelIds = new Set(cities.map((city) => city.levelId))
  const visibleSecondNameCount = visibleCities.filter((city) => city.secondName?.trim()).length
  const allSecondNameCount = cities.filter((city) => city.secondName?.trim()).length

  const countryFilterLabel =
    effectiveCityCountryFilter === 'all'
      ? null
      : effectiveCityCountryFilter === 'unassigned'
        ? ui.common.unassigned
        : countries[effectiveCityCountryFilter]?.name ?? ui.common.unassigned
  const provinceFilterLabel =
    effectiveCityProvinceFilter === 'all'
      ? null
      : effectiveCityProvinceFilter === 'none'
        ? ui.common.none
        : provinces[effectiveCityProvinceFilter]?.name ?? ui.common.none
  const levelFilterLabel =
    effectiveCityLevelFilter === 'all'
      ? null
      : getCityLevelName(effectiveCityLevelFilter, worldCityLevels, ui)
  const hasSearchValue = searchValue.trim().length > 0
  const orderedColumns = orderedColumnIds.map((columnId) => {
    if (columnId === 'type') {
      return {
        id: columnId,
        label: ui.cityEditor.type,
        colClassName: 'floating-table-col-type',
      }
    }
    if (columnId === 'country') {
      return {
        id: columnId,
        label: ui.cityTable.country,
        colClassName: 'floating-table-col-country',
      }
    }
    if (columnId === 'province') {
      return {
        id: columnId,
        label: ui.common.province,
        colClassName: 'floating-table-col-province',
      }
    }
    return {
      id: columnId,
      label: ui.common.secondName,
      colClassName: 'floating-table-col-second',
    }
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
            placeholder={`${ui.common.search} ${ui.common.name.toLowerCase()}, ${ui.cityTable.country.toLowerCase()}, ${ui.common.province.toLowerCase()}`}
            onChange={(event) => {
              onSearchChange(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="floating-table-grid">
        <table className="floating-table floating-table--cities">
          <colgroup>
            <col className="floating-table-col-name" />
            {orderedColumns.map((column) => (
              <col key={column.id} className={column.colClassName} />
            ))}
          </colgroup>
          <thead>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">{ui.common.organization}</th>
              {orderedColumns.map((column) => {
                const columnId = column.id
                const visible = compactColumnIds.includes(columnId)
                const columnIndex = orderedColumnIds.indexOf(columnId)
                const canMoveLeft = columnIndex > 0
                const canMoveRight = columnIndex < orderedColumnIds.length - 1
                return (
                  <th key={columnId} className="floating-table-meta-cell">
                    <div className="floating-table-column-organizer">
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => {
                          onToggleCompactColumn(columnId)
                        }}
                      />
                      <div className="floating-table-column-move-group">
                        <button
                          className="mini-icon-button"
                          type="button"
                          disabled={!canMoveLeft}
                          onClick={() => {
                            onMoveColumn(columnId, 'left')
                          }}
                          aria-label={`${ui.common.moveLeft}: ${columnId}`}
                        >
                          ‹
                        </button>
                        <button
                          className="mini-icon-button"
                          type="button"
                          disabled={!canMoveRight}
                          onClick={() => {
                            onMoveColumn(columnId, 'right')
                          }}
                          aria-label={`${ui.common.moveRight}: ${columnId}`}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </th>
                )
              })}
            </tr>
            <tr className="floating-table-meta-row floating-table-summary-row">
              <th className="floating-table-meta-cell">
                <span className="floating-table-summary-text">
                  {`${visibleCities.length} ${ui.common.shown} / ${totalCount} ${ui.common.total}`}
                </span>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'type') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <span className="floating-table-summary-text">
                        {`${visibleLevelIds.size} / ${allLevelIds.size}`}
                      </span>
                    </th>
                  )
                }
                if (column.id === 'country') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <span className="floating-table-summary-text">
                        {`${visibleCountryIds.size} / ${allCountryIds.size}`}
                      </span>
                    </th>
                  )
                }
                if (column.id === 'province') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <span className="floating-table-summary-text">
                        {`${visibleProvinceIds.size} / ${allProvinceIds.size}`}
                      </span>
                    </th>
                  )
                }
                return (
                  <th key={column.id} className="floating-table-meta-cell">
                    <span className="floating-table-summary-text">
                      {`${visibleSecondNameCount} / ${allSecondNameCount}`}
                    </span>
                  </th>
                )
              })}
            </tr>
            <tr className="floating-table-meta-row">
              <th className="floating-table-meta-label-cell">
                <div className="floating-table-meta-inline">
                  <button className="table-filter-clear-button" type="button" onClick={onClearFilters}>
                    {ui.common.clearFilters}
                  </button>
                </div>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'type') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <button
                        className={`floating-table-filter-button${levelFilterLabel ? '' : ' is-empty'}`}
                        type="button"
                        disabled={!levelFilterLabel}
                        onClick={onToggleLevelFilter.bind(null, effectiveCityLevelFilter)}
                      >
                        {levelFilterLabel ?? ui.common.none}
                      </button>
                    </th>
                  )
                }
                if (column.id === 'country') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <button
                        className={`floating-table-filter-button${countryFilterLabel ? '' : ' is-empty'}`}
                        type="button"
                        disabled={!countryFilterLabel}
                        onClick={() => {
                          onToggleCountryFilter(
                            effectiveCityCountryFilter === 'unassigned' ? null : effectiveCityCountryFilter,
                          )
                        }}
                      >
                        {countryFilterLabel ?? ui.common.none}
                      </button>
                    </th>
                  )
                }
                if (column.id === 'province') {
                  return (
                    <th key={column.id} className="floating-table-meta-cell">
                      <button
                        className={`floating-table-filter-button${provinceFilterLabel ? '' : ' is-empty'}`}
                        type="button"
                        disabled={!provinceFilterLabel}
                        onClick={() => {
                          onToggleProvinceFilter(
                            effectiveCityProvinceFilter === 'none' ? null : effectiveCityProvinceFilter,
                          )
                        }}
                      >
                        {provinceFilterLabel ?? ui.common.none}
                      </button>
                    </th>
                  )
                }
                return (
                  <th key={column.id} className="floating-table-meta-cell">
                    <span className="floating-table-filter-spacer" aria-hidden="true" />
                  </th>
                )
              })}
            </tr>
            <tr className="floating-table-header-row">
              <th>
                <button className="table-sort-button" type="button" onClick={() => onChangeSort('name')}>
                  {renderSortLabel(ui.cityTable.name, citySortKey === 'name', citySortDirection)}
                </button>
              </th>
              {orderedColumns.map((column) => {
                if (column.id === 'type') {
                  return (
                    <th key={column.id}>
                      <button className="table-sort-button" type="button" onClick={() => onChangeSort('type')}>
                        {renderCityTypeSortLabel(ui.cityEditor.type, citySortKey === 'type', cityTypeSortMode)}
                      </button>
                    </th>
                  )
                }
                if (column.id === 'country') {
                  return (
                    <th key={column.id}>
                      <button className="table-sort-button" type="button" onClick={() => onChangeSort('country')}>
                        {renderSortLabel(ui.cityTable.country, citySortKey === 'country', citySortDirection)}
                      </button>
                    </th>
                  )
                }
                if (column.id === 'province') {
                  return (
                    <th key={column.id}>
                      <button className="table-sort-button" type="button" onClick={() => onChangeSort('province')}>
                        {renderSortLabel(ui.common.province, citySortKey === 'province', citySortDirection)}
                      </button>
                    </th>
                  )
                }
                return (
                  <th key={column.id}>
                    <button className="table-sort-button" type="button" onClick={() => onChangeSort('second_name')}>
                      {renderSortLabel(ui.common.secondName, citySortKey === 'second_name', citySortDirection)}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibleCities.length === 0 ? (
              <tr>
                <td colSpan={orderedColumns.length + 1} className="floating-table-empty">
                  {ui.political.noCitiesForFilter}
                </td>
              </tr>
            ) : (
              visibleCities.map((city) => (
                <tr
                  key={city.id}
                  className={city.id === activeCityId ? ' is-active' : ''}
                  onClick={() => {
                    onSelectCity(city.id)
                  }}
                  onDoubleClick={() => {
                    onEditCity(city.id)
                  }}
                >
                  <td>
                    <span className="floating-city-primary">
                      <img
                        src={iconSourceMap[worldCityLevels[city.levelId]?.iconKey ?? '']}
                        className="city-icon"
                        alt={getCityLevelName(city.levelId, worldCityLevels, ui)}
                      />
                      <span className="city-name">{city.name}</span>
                    </span>
                  </td>
                  {orderedColumns.map((column) => {
                    if (column.id === 'type') {
                      return (
                        <td key={column.id}>
                          <button
                            className="floating-table-cell-button city-type"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onToggleLevelFilter(city.levelId)
                            }}
                          >
                            {getCityLevelName(city.levelId, worldCityLevels, ui)}
                          </button>
                        </td>
                      )
                    }
                    if (column.id === 'country') {
                      return (
                        <td key={column.id}>
                          <button
                            className="floating-table-cell-button city-country"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onToggleCountryFilter(city.countryId)
                            }}
                          >
                            {city.countryId ? (
                              <>
                                <span
                                  className="country-swatch"
                                  style={{ backgroundColor: countries[city.countryId]?.color }}
                                />
                                {countries[city.countryId]?.name}
                              </>
                            ) : (
                              ui.common.unassigned
                            )}
                          </button>
                        </td>
                      )
                    }
                    if (column.id === 'province') {
                      return (
                        <td key={column.id}>
                          <button
                            className="floating-table-cell-button city-country"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onToggleProvinceFilter(activeCityProvinceIdById[city.id] ?? null)
                            }}
                          >
                            {activeCityProvinceNameById[city.id] ?? ui.common.none}
                          </button>
                        </td>
                      )
                    }
                    return (
                      <td key={column.id} className="floating-table-text-cell">
                        {city.secondName?.trim() || ui.common.none}
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
