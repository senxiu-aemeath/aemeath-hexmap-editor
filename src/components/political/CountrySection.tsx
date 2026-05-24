import type { CSSProperties } from 'react'
import { useUiMessages } from '../../i18n'
import type { City, CityLevel, Country, GovernmentType } from '../../domain/world'
import type { CountrySortKey, SortDirection } from '../../political/types'
import { renderSortLabel } from '../../political/display'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { TableSelectionAnchor } from '../TableSelectionAnchor'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

export type CountryColumnId = 'government' | 'city_state' | 'provinces' | 'cells'

interface CountrySectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  activeCountry: Country | null
  activeCountryAssignmentCount: number
  isInfoExpanded: boolean
  filteredCountries: Country[]
  iconSourceMap: Record<string, string>
  governmentTypes: Record<string, GovernmentType>
  visibleSidebarColumns: CountryColumnId[]
  effectiveGovernmentTypeFilter: string
  countrySortKey: CountrySortKey
  countrySortDirection: SortDirection
  isListExpanded: boolean
  canPaintCountries: boolean
  onChangeSort: (nextKey: CountrySortKey) => void
  onChangePoliticalPaintMode: (mode: import('../../political/types').PoliticalPaintMode) => void
  onToggleInfoExpanded: () => void
  onToggleListExpanded: () => void
  onClearFilter: () => void
  onCreateCountry: () => void
  onDeleteActiveCountry: () => void
  onOpenExpandedTable?: () => void
  onResetToolMode: () => void
  onTogglePaintMode: () => void
  onToggleEraseMode: () => void
  onSelectCountry: (countryId: string) => void
  onClearSelection: () => void
  onOpenCountryEditor: (country: Country) => void
  onToggleGovernmentTypeFilter: (governmentTypeId: string | null) => void
  activeCountryCities?: City[]
  cityLevels?: Record<string, CityLevel>
  activeCountryProvinceCount?: number
}

export function CountrySection({ isSectionExpanded,
  onToggleSection,
  activeCountry,
  activeCountryAssignmentCount,
  isInfoExpanded,
  filteredCountries,
  iconSourceMap,
  governmentTypes,
  visibleSidebarColumns,
  effectiveGovernmentTypeFilter,
  countrySortKey,
  countrySortDirection,
  isListExpanded,
  canPaintCountries,
  onChangeSort,
  onChangePoliticalPaintMode,
  onToggleInfoExpanded,
  onToggleListExpanded,
  onClearFilter,
  onCreateCountry,
  onDeleteActiveCountry,
  onOpenExpandedTable,
  onResetToolMode,
  onTogglePaintMode,
  onToggleEraseMode,
  onSelectCountry,
  onClearSelection,
  onOpenCountryEditor,
  onToggleGovernmentTypeFilter,
  activeCountryCities,
  cityLevels,
  activeCountryProvinceCount,
}: CountrySectionProps) {
  const ui = useUiMessages()
  const { countryToolMode, politicalPaintMode } = useEditorModeContext()
  const { activeCountryId } = useActiveEntityContext()
  const countryTableColumns = [
    'minmax(var(--side-table-name-col-min, 156px), var(--side-table-name-col-country-fr, 1.16fr))',
    ...visibleSidebarColumns.map((column) => {
      if (column === 'government') return 'minmax(136px, 0.82fr)'
      if (column === 'city_state') return 'minmax(90px, 0.56fr)'
      if (column === 'provinces') return 'minmax(84px, 0.48fr)'
      return 'minmax(72px, 0.42fr)'
    }),
  ].join(' ')
  const activeFilterLabel =
    effectiveGovernmentTypeFilter === 'all'
      ? null
      : effectiveGovernmentTypeFilter === 'none'
        ? ui.countryEditor.noGovernmentType
        : governmentTypes[effectiveGovernmentTypeFilter]?.name ?? ui.countryEditor.noGovernmentType

  return (
    <section className="country-table-panel">
      <section className="data-table-section">
        <SectionToggleHeader
          title={ui.political.countries}
          expanded={isSectionExpanded}
          onToggle={onToggleSection}
        />
        {isSectionExpanded && (
          <>
            <SelectedInfoShell title={ui.common.details} expanded={isInfoExpanded} onToggleExpanded={onToggleInfoExpanded}>
              <div
                className={`detail-card details-card selected-info-card active-country-card${isInfoExpanded ? ' is-expanded' : ''}`}
                title={activeCountry?.name ?? ui.political.noSelectedCountry}
              >
                {activeCountry ? (
                  <div className="selected-info-split">
                    <div className="selected-info-stack">
                      <div className="selected-info-pair">
                        <strong>{ui.common.name}</strong>
                        <span>{activeCountry.name}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.countryEditor.color}</strong>
                        <span>{activeCountry.color}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.political.governmentType}</strong>
                        <span>
                          {activeCountry.governmentTypeId
                            ? governmentTypes[activeCountry.governmentTypeId]?.name ?? ui.countryEditor.noGovernmentType
                            : ui.countryEditor.noGovernmentType}
                        </span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.countryEditor.isCityState}</strong>
                        <span>{activeCountry.isCityState ? ui.common.yes : ui.common.no}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.common.cells}</strong>
                        <span>{activeCountryAssignmentCount}</span>
                      </div>
                      {activeCountryProvinceCount !== undefined ? (
                        <div className="selected-info-pair">
                          <strong>{ui.political.provinces}</strong>
                          <span>{activeCountryProvinceCount}</span>
                        </div>
                      ) : null}
                      {activeCountryCities &&
                        cityLevels &&
                        Object.values(cityLevels)
                          .filter((level) => level.displayInCountryInfo)
                          .map((level) => {
                            const city = activeCountryCities.find((entry) => entry.levelId === level.id)
                            return (
                              <div key={level.id} className="selected-info-pair">
                                <strong>{level.name}</strong>
                                <span>{city ? city.name : `${ui.common.no} ${level.name}`}</span>
                              </div>
                            )
                          })}
                      {activeCountry.description?.trim() ? (
                        <div className="selected-info-pair selected-info-pair--description">
                          <strong>{ui.common.description}</strong>
                          <p>{activeCountry.description}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="selected-info-color-side selected-info-color-side--country">
                      <span className="country-detail-identity" aria-hidden="true">
                        <span className="country-detail-identity__frame">
                          {activeCountry.iconKey && iconSourceMap[activeCountry.iconKey] ? (
                            <img
                              src={iconSourceMap[activeCountry.iconKey]}
                              className="country-detail-identity__image"
                              alt={activeCountry.iconKey}
                            />
                          ) : (
                            <span className="country-detail-identity__fallback">
                              {activeCountry.name}
                            </span>
                          )}
                        </span>
                        <span
                          className="country-detail-identity__color-box"
                          style={{ backgroundColor: activeCountry.color }}
                        />
                      </span>
                    </div>
                  </div>
                ) : (
                  <span>{ui.political.noSelectedCountry}</span>
                )}
              </div>
            </SelectedInfoShell>
            <div className="mode-tool-card-list country-section-controls">
              <CardTitle>{ui.common.tool}</CardTitle>
              <ControlCard variant="frameless">
                <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
                  <button
                    className={`toolbar-action-button${countryToolMode === 'view' ? ' is-active' : ''}`}
                    type="button"
                    onClick={onResetToolMode}
                  >
                    {ui.politicalTool.view}
                  </button>
                  <button
                    className={`toolbar-action-button${countryToolMode === 'paint' ? ' is-active' : ''}`}
                    type="button"
                    disabled={!canPaintCountries}
                    onClick={onTogglePaintMode}
                  >
                    {ui.politicalTool.paint}
                  </button>
                  <button
                    className={`toolbar-action-button${countryToolMode === 'erase' ? ' is-active' : ''}`}
                    type="button"
                    onClick={onToggleEraseMode}
                  >
                    {ui.politicalTool.erase}
                  </button>
                </div>
              </ControlCard>
              <ControlCard variant="frameless">
                <div className="control-list">
                  <div className="table-action-group table-action-group--label-primary table-action-group--equal-3">
                    <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCountry}>
                      {ui.common.create}
                    </button>
                    <button
                      className="toolbar-action-button toolbar-action-button--secondary"
                      type="button"
                      disabled={!activeCountry}
                      onClick={() => {
                        if (activeCountry) {
                          onOpenCountryEditor(activeCountry)
                        }
                      }}
                    >
                      {ui.common.edit}
                    </button>
                    <button
                      className="toolbar-action-button toolbar-action-button--danger"
                      type="button"
                      disabled={!activeCountry}
                      onClick={onDeleteActiveCountry}
                    >
                      {ui.common.delete}
                    </button>
                  </div>
                  {onOpenExpandedTable ? (
                    <button
                      className="toolbar-action-button toolbar-action-button--secondary toolbar-action-button--fullwidth"
                      type="button"
                      onClick={onOpenExpandedTable}
                    >
                      {ui.political.fullCountryTable}
                    </button>
                  ) : (
                    <span className="control-placeholder-cell" aria-hidden="true" />
                  )}
                </div>
              </ControlCard>
            </div>
            {countryToolMode !== 'view' ? (
              <div className="mode-tool-card-list country-section-controls">
                <CardTitle>{ui.surface.paintMode}</CardTitle>
                <ControlCard variant="frameless">
                <div className="terrain-segmented-grid terrain-segmented-grid--four-two">
                  {(['radius_0', 'radius_1', 'radius_2', 'radius_3'] as const).map((mode, index) => (
                    <button
                      key={mode}
                      className={`mode-button${politicalPaintMode === mode ? ' is-active' : ''}`}
                      type="button"
                      onClick={() => {
                        onChangePoliticalPaintMode(mode)
                      }}
                    >
                      {`R${index}`}
                    </button>
                  ))}
                  <button
                    className={`mode-button terrain-mode-button--span-2${politicalPaintMode === 'fill_type' ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onChangePoliticalPaintMode('fill_type')
                    }}
                  >
                    {ui.surface.fillType}
                  </button>
                  <button
                    className={`mode-button terrain-mode-button--span-2${politicalPaintMode === 'fill_height' ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onChangePoliticalPaintMode('fill_height')
                    }}
                    >
                      {ui.surface.fillHeight}
                    </button>
                  </div>
                </ControlCard>
              </div>
            ) : null}
            {filteredCountries.length === 0 ? (
              <div className="detail-card details-card">
                <strong>{ui.political.noCountries}</strong>
                <span>{ui.political.noCountriesHint}</span>
              </div>
            ) : (
              <DataTableShell
                expanded={isListExpanded}
                onToggleExpanded={onToggleListExpanded}
                toggleLabel={`Toggle ${ui.political.countries} list`}
                filterRow={
                  <div className="country-table-row table-filter-row">
                    <button
                      className="table-filter-clear-button"
                      type="button"
                      disabled={!activeFilterLabel}
                      onClick={onClearFilter}
                    >
                      {ui.common.clearFilter}
                    </button>
                    <button
                      className="table-filter-value table-filter-value-button table-cell-button table-cell-button--align-end country-status"
                      type="button"
                      disabled={!activeFilterLabel}
                      onClick={() => {
                        if (activeFilterLabel) {
                          onClearFilter()
                        }
                      }}
                    >
                      {activeFilterLabel ?? ui.common.none}
                    </button>
                    <span className="table-slot-cell" aria-hidden="true" />
                  </div>
                }
                headerRow={
                  <div className="country-table-row country-table-head" style={{ '--table-columns': countryTableColumns } as CSSProperties}>
                    <button
                      className="table-sort-button"
                      type="button"
                      onClick={() => {
                        onChangeSort('name')
                      }}
                    >
                      {renderSortLabel(ui.cityTable.name, countrySortKey === 'name', countrySortDirection)}
                    </button>
                    {visibleSidebarColumns.map((column) => {
                      if (column === 'government') return <span key={column} className="country-status">{ui.political.governmentType}</span>
                      if (column === 'city_state') return <span key={column} className="country-status">{ui.countryEditor.isCityState}</span>
                      if (column === 'provinces') return <span key={column} className="country-status">{ui.political.provinces}</span>
                      return <span key={column} className="country-status">{ui.common.cells}</span>
                    })}
                  </div>
                }
              >
                {filteredCountries.map((country) => (
                  <div
                    key={country.id}
                    className={`country-table-row country-table-body-row${country.id === activeCountryId ? ' is-active' : ''}`}
                    style={{ '--table-columns': countryTableColumns } as CSSProperties}
                  >
                    <button
                      className="country-table-name"
                      type="button"
                      onClick={() => {
                        onSelectCountry(country.id)
                      }}
                      onDoubleClick={() => {
                        onOpenCountryEditor(country)
                      }}
                    >
                      {country.id === activeCountryId ? (
                        <TableSelectionAnchor label={`${ui.common.clear} ${ui.political.countries}`} onClearSelection={onClearSelection}>
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
                        </TableSelectionAnchor>
                      ) : (
                        <span className="table-selection-anchor table-selection-anchor--passive" aria-hidden="true">
                          {country.iconKey && iconSourceMap[country.iconKey] ? (
                            <span className="country-emblem__frame">
                              <img
                                src={iconSourceMap[country.iconKey]}
                                className="country-emblem__image"
                                alt={country.iconKey}
                              />
                            </span>
                          ) : null}
                          <span className="country-swatch" style={{ backgroundColor: country.color }} />
                        </span>
                      )}
                      <span>{country.name}</span>
                    </button>
                    {visibleSidebarColumns.map((column) => {
                      if (column === 'government') {
                        return (
                          <button
                            key={column}
                            className="table-cell-button table-cell-button--align-end country-status"
                            type="button"
                            onClick={() => {
                              onToggleGovernmentTypeFilter(country.governmentTypeId)
                            }}
                          >
                            {country.governmentTypeId
                              ? governmentTypes[country.governmentTypeId]?.name ?? ui.countryEditor.noGovernmentType
                              : ui.countryEditor.noGovernmentType}
                          </button>
                        )
                      }
                      if (column === 'city_state') {
                        return (
                          <span key={column} className="country-status">
                            {country.isCityState ? ui.common.yes : ui.common.no}
                          </span>
                        )
                      }
                      if (column === 'provinces') {
                        return (
                          <span key={column} className="country-status">
                            {activeCountryId === country.id && activeCountryProvinceCount !== undefined
                              ? activeCountryProvinceCount
                              : '—'}
                          </span>
                        )
                      }
                      return (
                        <span key={column} className="country-status">
                          {country.id === activeCountryId ? activeCountryAssignmentCount : '—'}
                        </span>
                      )
                    })}
                    <span className="table-slot-cell" aria-hidden="true" />
                  </div>
                ))}
              </DataTableShell>
            )}
          </>
        )}
      </section>
    </section>
  )
}
