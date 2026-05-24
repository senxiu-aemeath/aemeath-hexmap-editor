import type { CSSProperties } from 'react'
import type { City, CityLevel, Country, Province } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import {
  getCityLevelName,
  renderCityTypeSortLabel,
  renderSortLabel,
} from '../../political/display'
import type { CitySortKey, CityToolMode, CityTypeSortMode, SortDirection } from '../../political/types'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { TableSelectionAnchor } from '../TableSelectionAnchor'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type CityColumnId = 'type' | 'country' | 'province' | 'second_name'

interface CitiesSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  worldCityLevels: Record<string, CityLevel>
  iconSourceMap: Record<string, string>
  countries: Record<string, Country>
  provinces: Record<string, Province>
  cityProvinceIdById: Record<string, string | null>
  cityProvinceNameById: Record<string, string | null>
  visibleSidebarColumns: CityColumnId[]
  activeCityProvinceName?: string | null
  activeCity: City | null
  isInfoExpanded: boolean
  filteredCities: City[]
  effectiveCityCountryFilter: string
  effectiveCityProvinceFilter: string
  effectiveCityLevelFilter: string
  citySortKey: CitySortKey
  citySortDirection: SortDirection
  cityTypeSortMode: CityTypeSortMode
  isListExpanded: boolean
  onSetCityToolMode: (mode: CityToolMode) => void
  onDeleteActiveCity: () => void
  onOpenExpandedTable: () => void
  onToggleInfoExpanded: () => void
  onClearFilters: () => void
  onClearCountryFilter: () => void
  onClearProvinceFilter: () => void
  onClearLevelFilter: () => void
  onChangeSort: (nextKey: CitySortKey) => void
  onToggleListExpanded: () => void
  onSelectCity: (cityId: string) => void
  onClearSelection: () => void
  onEditCity: (city: City) => void
  onToggleCountryFilter: (countryId: string | null) => void
  onToggleProvinceFilter: (provinceId: string | null) => void
  onToggleLevelFilter: (levelId: string) => void
}

export function CitiesSection({ isSectionExpanded,
  onToggleSection,
  worldCityLevels,
  iconSourceMap,
  countries,
  provinces,
  cityProvinceIdById,
  cityProvinceNameById,
  visibleSidebarColumns,
  activeCityProvinceName,
  activeCity,
  isInfoExpanded,
  filteredCities,
  effectiveCityCountryFilter,
  effectiveCityProvinceFilter,
  effectiveCityLevelFilter,
  citySortKey,
  citySortDirection,
  cityTypeSortMode,
  isListExpanded,
  onSetCityToolMode,
  onDeleteActiveCity,
  onOpenExpandedTable,
  onToggleInfoExpanded,
  onClearFilters,
  onClearCountryFilter,
  onClearProvinceFilter,
  onClearLevelFilter,
  onChangeSort,
  onToggleListExpanded,
  onSelectCity,
  onClearSelection,
  onEditCity,
  onToggleCountryFilter,
  onToggleProvinceFilter,
  onToggleLevelFilter,
}: CitiesSectionProps) {
  const ui = useUiMessages()
  const { cityToolMode } = useEditorModeContext()
  const { activeCityId } = useActiveEntityContext()
  const cityTableColumns = [
    'minmax(var(--side-table-name-col-min, 156px), var(--side-table-name-col-city-fr, 1.18fr))',
    ...visibleSidebarColumns.map((column) => {
      if (column === 'type') {
        return 'minmax(92px, 0.58fr)'
      }
      if (column === 'country') {
        return 'minmax(132px, 0.78fr)'
      }
      if (column === 'province') {
        return 'minmax(116px, 0.68fr)'
      }
      return 'minmax(116px, 0.64fr)'
    }),
  ].join(' ')
  const countryFilterLabel =
    effectiveCityCountryFilter === 'all'
      ? null
      : effectiveCityCountryFilter === 'unassigned'
        ? ui.common.unassigned
        : countries[effectiveCityCountryFilter]?.name ?? ui.common.unassigned
  const levelFilterLabel =
    effectiveCityLevelFilter === 'all'
      ? null
      : getCityLevelName(effectiveCityLevelFilter, worldCityLevels, ui)
  const provinceFilterLabel =
    effectiveCityProvinceFilter === 'all'
      ? null
      : effectiveCityProvinceFilter === 'none'
        ? ui.common.none
        : provinces[effectiveCityProvinceFilter]?.name ?? ui.common.none

  return (
    <div className="city-instance-manager section-gap">
      <section className="data-table-section">
        <SectionToggleHeader
          title={ui.political.citiesOnMap}
          expanded={isSectionExpanded}
          onToggle={onToggleSection}
        />
        {isSectionExpanded && (
          <>
            <SelectedInfoShell
              title={ui.common.details}
              expanded={isInfoExpanded}
              onToggleExpanded={onToggleInfoExpanded}
            >
              <div
                className={`detail-card details-card selected-info-card active-city-card${isInfoExpanded ? ' is-expanded' : ''}`}
                title={activeCity?.name ?? ui.political.noSelectedCity}
              >
                {activeCity ? (
                  <>
                    <div className="selected-info-pair">
                      <strong>{ui.common.name}</strong>
                      <span>{activeCity.name}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.cityEditor.type}</strong>
                      <span>{getCityLevelName(activeCity.levelId, worldCityLevels, ui)}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.cityTable.country}</strong>
                      <span>
                        {activeCity.countryId
                          ? countries[activeCity.countryId]?.name ?? ui.common.unassigned
                          : ui.common.unassigned}
                      </span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.common.province}</strong>
                      <span>{activeCityProvinceName ?? ui.common.none}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.common.secondName}</strong>
                      <span>{activeCity.secondName?.trim() || ui.common.none}</span>
                    </div>
                    {activeCity.description?.trim() ? (
                      <div className="selected-info-pair selected-info-pair--description">
                        <strong>{ui.common.description}</strong>
                        <p>{activeCity.description}</p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span>{ui.political.noSelectedCity}</span>
                )}
              </div>
            </SelectedInfoShell>
            <div className="mode-tool-card-list country-section-controls">
              <CardTitle>{ui.common.tool}</CardTitle>
              <ControlCard variant="frameless">
                <div className="table-action-group table-action-group--segmented table-action-group--city-primary">
                  <button
                    className={`toolbar-action-button${cityToolMode === 'view' ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onSetCityToolMode('view')
                    }}
                  >
                    {ui.politicalTool.view}
                  </button>
                  <button
                    className={`toolbar-action-button${cityToolMode === 'place_city' ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onSetCityToolMode('place_city')
                    }}
                  >
                    {ui.politicalTool.place_city}
                  </button>
                </div>
              </ControlCard>
              <ControlCard variant="frameless">
                <div className="control-list">
                  <div className="table-action-group table-action-group--label-primary table-action-group--equal-2">
                    <button
                      className="toolbar-action-button toolbar-action-button--secondary"
                      type="button"
                      disabled={!activeCity}
                      onClick={() => {
                        if (activeCity) {
                          onEditCity(activeCity)
                        }
                      }}
                    >
                      {ui.common.edit}
                    </button>
                    <button
                      className="toolbar-action-button toolbar-action-button--danger"
                      type="button"
                      disabled={!activeCity}
                      onClick={onDeleteActiveCity}
                    >
                      {ui.common.delete}
                    </button>
                  </div>
                  <button
                    className="toolbar-action-button toolbar-action-button--secondary toolbar-action-button--fullwidth"
                    type="button"
                    onClick={onOpenExpandedTable}
                  >
                    {ui.cityTable.fullCityTable}
                  </button>
                </div>
              </ControlCard>
            </div>
            <DataTableShell
              expanded={isListExpanded}
              onToggleExpanded={onToggleListExpanded}
              toggleLabel={`Toggle ${ui.political.citiesOnMap} list`}
              filterRow={
                <div className="city-table-row table-filter-row" style={{ '--table-columns': cityTableColumns } as CSSProperties}>
                  <button
                    className="table-filter-clear-button"
                    type="button"
                    disabled={!countryFilterLabel && !provinceFilterLabel && !levelFilterLabel}
                    onClick={onClearFilters}
                  >
                    {ui.common.clear}
                  </button>
                  {visibleSidebarColumns.map((column) => {
                    if (column === 'type') {
                      return (
                        <button
                          key={column}
                          className="table-filter-value table-filter-value-button table-cell-button city-type"
                          type="button"
                          disabled={!levelFilterLabel}
                          onDoubleClick={() => {
                            onClearLevelFilter()
                          }}
                        >
                          {levelFilterLabel ?? ui.common.none}
                        </button>
                      )
                    }

                    if (column === 'country') {
                      return (
                        <button
                          key={column}
                          className="table-filter-value table-filter-value-button table-cell-button city-country"
                          type="button"
                          disabled={!countryFilterLabel}
                          onDoubleClick={() => {
                            onClearCountryFilter()
                          }}
                        >
                          {countryFilterLabel ?? ui.common.none}
                        </button>
                      )
                    }

                    if (column === 'province') {
                      return (
                        <button
                          key={column}
                          className="table-filter-value table-filter-value-button table-cell-button city-country"
                          type="button"
                          disabled={!provinceFilterLabel}
                          onDoubleClick={() => {
                            onClearProvinceFilter()
                          }}
                        >
                          {provinceFilterLabel ?? ui.common.none}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={column}
                        className="table-filter-value table-filter-value-button table-cell-button city-country"
                        type="button"
                        disabled
                      >
                        {ui.common.none}
                      </button>
                    )
                  })}
                  <span className="table-slot-cell" aria-hidden="true" />
                </div>
              }
              headerRow={
                <div className="city-table-row city-table-head" style={{ '--table-columns': cityTableColumns } as CSSProperties}>
                  <button className="table-sort-button" type="button" onClick={() => onChangeSort('name')}>
                    {renderSortLabel(ui.cityTable.name, citySortKey === 'name', citySortDirection)}
                  </button>
                  {visibleSidebarColumns.map((column) => {
                    if (column === 'type') {
                      return (
                        <button
                          key={column}
                          className="table-sort-button"
                          type="button"
                          onClick={() => onChangeSort('type')}
                        >
                          {renderCityTypeSortLabel(
                            ui.cityEditor.type,
                            citySortKey === 'type',
                            cityTypeSortMode,
                          )}
                        </button>
                      )
                    }

                    if (column === 'country') {
                      return (
                        <button
                          key={column}
                          className="table-sort-button"
                          type="button"
                          onClick={() => onChangeSort('country')}
                        >
                          {renderSortLabel(
                            ui.cityTable.country,
                            citySortKey === 'country',
                            citySortDirection,
                          )}
                        </button>
                      )
                    }

                    if (column === 'province') {
                      return (
                        <button
                          key={column}
                          className="table-sort-button"
                          type="button"
                          onClick={() => onChangeSort('province')}
                        >
                          {renderSortLabel(ui.common.province, citySortKey === 'province', citySortDirection)}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={column}
                        className="table-sort-button"
                        type="button"
                        onClick={() => onChangeSort('second_name')}
                      >
                        {renderSortLabel(ui.common.secondName, citySortKey === 'second_name', citySortDirection)}
                      </button>
                    )
                  })}
                </div>
              }
            >
              {filteredCities.length === 0 ? (
                <div className="city-empty-state">{ui.political.noCitiesForFilter}</div>
              ) : (
                filteredCities.map((city) => (
                  <div
                    key={city.id}
                    className={`city-table-row city-table-body-row${city.id === activeCityId ? ' is-active' : ''}`}
                    style={{ '--table-columns': cityTableColumns } as CSSProperties}
                  >
                    <button
                      className="city-table-name"
                      type="button"
                      onClick={() => {
                        onSelectCity(city.id)
                      }}
                      onDoubleClick={() => {
                        onEditCity(city)
                      }}
                    >
                      {city.id === activeCityId ? (
                        <TableSelectionAnchor
                          label={`${ui.common.clear} ${ui.political.citiesOnMap}`}
                          onClearSelection={onClearSelection}
                        >
                          <img
                            src={iconSourceMap[worldCityLevels[city.levelId]?.iconKey ?? '']}
                            className="city-icon"
                            alt={getCityLevelName(city.levelId, worldCityLevels, ui)}
                          />
                        </TableSelectionAnchor>
                      ) : (
                        <img
                          src={iconSourceMap[worldCityLevels[city.levelId]?.iconKey ?? '']}
                          className="city-icon"
                          alt={getCityLevelName(city.levelId, worldCityLevels, ui)}
                        />
                      )}
                      <span className="city-name">{city.name}</span>
                    </button>
                    {visibleSidebarColumns.map((column) => {
                      if (column === 'type') {
                        return (
                          <button
                            key={column}
                            className="table-cell-button city-type"
                            type="button"
                            onDoubleClick={() => {
                              onToggleLevelFilter(city.levelId)
                            }}
                          >
                            {getCityLevelName(city.levelId, worldCityLevels, ui)}
                          </button>
                        )
                      }

                      if (column === 'country') {
                        return (
                          <button
                            key={column}
                            className="table-cell-button city-country"
                            type="button"
                            onDoubleClick={() => {
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
                        )
                      }

                      if (column === 'province') {
                        return (
                          <button
                            key={column}
                            className="table-cell-button city-country"
                            type="button"
                            onDoubleClick={() => {
                              onToggleProvinceFilter(cityProvinceNameById[city.id] ? cityProvinceIdById[city.id] ?? null : null)
                            }}
                          >
                            {cityProvinceNameById[city.id] ?? ui.common.none}
                          </button>
                        )
                      }

                      return (
                        <button
                          key={column}
                          className="table-cell-button city-country"
                          type="button"
                          disabled
                        >
                          {city.secondName?.trim() || ui.common.none}
                        </button>
                      )
                    })}
                    <span className="table-slot-cell" aria-hidden="true" />
                  </div>
                ))
              )}
            </DataTableShell>
          </>
        )}
      </section>
    </div>
  )
}
