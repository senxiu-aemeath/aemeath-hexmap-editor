import type { CSSProperties } from 'react'
import type { City, Country, Province } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { renderSortLabel } from '../../political/display'
import type { PoliticalPaintMode, ProvinceSortKey, SortDirection } from '../../political/types'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { TableSelectionAnchor } from '../TableSelectionAnchor'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

export type ProvinceColumnId = 'country' | 'capital' | 'cells'

interface ProvinceSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  activeProvince: Province | null
  activeProvinceCellCount: number
  activeProvinceCapital: City | null
  isInfoExpanded: boolean
  provinces: Province[]
  countries: Record<string, Country>
  cities: Record<string, City>
  visibleSidebarColumns: ProvinceColumnId[]
  provinceSortKey: ProvinceSortKey
  provinceSortDirection: SortDirection
  isListExpanded: boolean
  onChangeSort: (nextKey: ProvinceSortKey) => void
  onChangePoliticalPaintMode: (mode: PoliticalPaintMode) => void
  onChangeRestrictProvinceBrushToOwnerCountry: (nextValue: boolean) => void
  onToggleInfoExpanded: () => void
  onToggleListExpanded: () => void
  onCreateProvince: () => void
  onDeleteActiveProvince: () => void
  onOpenExpandedTable?: () => void
  onResetToolMode: () => void
  onTogglePaintMode: () => void
  onToggleEraseMode: () => void
  onSelectProvince: (provinceId: string) => void
  onClearSelection: () => void
  onEditProvince: (province: Province) => void
}

export function ProvinceSection({ isSectionExpanded,
  onToggleSection,
  activeProvince,
  activeProvinceCellCount,
  activeProvinceCapital,
  isInfoExpanded,
  provinces,
  countries,
  cities,
  visibleSidebarColumns,
  provinceSortKey,
  provinceSortDirection,
  isListExpanded,
  onChangeSort,
  onChangePoliticalPaintMode,
  onChangeRestrictProvinceBrushToOwnerCountry,
  onToggleInfoExpanded,
  onToggleListExpanded,
  onCreateProvince,
  onDeleteActiveProvince,
  onOpenExpandedTable,
  onResetToolMode,
  onTogglePaintMode,
  onToggleEraseMode,
  onSelectProvince,
  onClearSelection,
  onEditProvince,
}: ProvinceSectionProps) {
  const ui = useUiMessages()
  const { provinceToolMode, politicalPaintMode, restrictProvinceBrushToOwnerCountry } = useEditorModeContext()
  const { activeProvinceId } = useActiveEntityContext()
  const provinceTableColumns = [
    'minmax(var(--side-table-name-col-min, 156px), var(--side-table-name-col-province-fr, 1.16fr))',
    ...visibleSidebarColumns.map((column) => {
      if (column === 'country') return 'minmax(136px, 0.82fr)'
      if (column === 'capital') return 'minmax(136px, 0.82fr)'
      return 'minmax(72px, 0.42fr)'
    }),
  ].join(' ')
  return (
    <section className="country-table-panel">
      <section className="data-table-section">
        <SectionToggleHeader title={ui.political.provinces} expanded={isSectionExpanded} onToggle={onToggleSection} />
        {isSectionExpanded && (
          <>
            <SelectedInfoShell title={ui.common.details} expanded={isInfoExpanded} onToggleExpanded={onToggleInfoExpanded}>
              <div
                className={`detail-card details-card selected-info-card active-country-card${isInfoExpanded ? ' is-expanded' : ''}`}
                title={activeProvince?.name ?? ui.political.noSelectedProvince}
              >
                {activeProvince ? (
                  <div className="selected-info-split">
                    <div className="selected-info-stack">
                      <div className="selected-info-pair">
                        <strong>{ui.common.name}</strong>
                        <span>{activeProvince.name}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.countryEditor.color}</strong>
                        <span>{activeProvince.color}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.cityTable.country}</strong>
                        <span>
                          {activeProvince.countryId
                            ? countries[activeProvince.countryId]?.name ?? ui.common.unassigned
                            : ui.common.unassigned}
                        </span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.common.cells}</strong>
                        <span>{activeProvinceCellCount}</span>
                      </div>
                      <div className="selected-info-pair">
                        <strong>{ui.provinceEditor.capitalCity}</strong>
                        <span>{activeProvinceCapital ? activeProvinceCapital.name : ui.common.none}</span>
                      </div>
                      {activeProvince.description?.trim() ? (
                        <div className="selected-info-pair selected-info-pair--description">
                          <strong>{ui.common.description}</strong>
                          <p>{activeProvince.description}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="selected-info-color-side">
                      <span
                        className="country-swatch government-type-color-swatch"
                        style={{ backgroundColor: activeProvince.color }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ) : (
                  <span>{ui.political.noSelectedProvince}</span>
                )}
              </div>
            </SelectedInfoShell>
            <div className="mode-tool-card-list country-section-controls">
              <CardTitle>{ui.common.tool}</CardTitle>
              <ControlCard variant="frameless">
                <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
                  <button
                    className={`toolbar-action-button${provinceToolMode === 'view' ? ' is-active' : ''}`}
                    type="button"
                    onClick={onResetToolMode}
                  >
                    {ui.politicalTool.view}
                  </button>
                  <button
                    className={`toolbar-action-button${provinceToolMode === 'paint' ? ' is-active' : ''}`}
                    type="button"
                    disabled={!activeProvince}
                    onClick={onTogglePaintMode}
                  >
                    {ui.politicalTool.paint}
                  </button>
                  <button
                    className={`toolbar-action-button${provinceToolMode === 'erase' ? ' is-active' : ''}`}
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
                    <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateProvince}>
                      {ui.common.create}
                    </button>
                    <button
                      className="toolbar-action-button toolbar-action-button--secondary"
                      type="button"
                      disabled={!activeProvince}
                      onClick={() => {
                        if (activeProvince) {
                          onEditProvince(activeProvince)
                        }
                      }}
                    >
                      {ui.common.edit}
                    </button>
                    <button
                      className="toolbar-action-button toolbar-action-button--danger"
                      type="button"
                      disabled={!activeProvince}
                      onClick={onDeleteActiveProvince}
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
                      {ui.provinceEditor.fullProvinceTable ?? ui.common.fullTable}
                    </button>
                  ) : (
                    <span className="control-placeholder-cell" aria-hidden="true" />
                  )}
                </div>
              </ControlCard>
            </div>
            {provinceToolMode !== 'view' ? (
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
                <CardTitle>{ui.common.options}</CardTitle>
                <ControlCard variant="frameless">
                  <label className="toggle-row compact-toggle-row editor-inline-toggle">
                    <span>{ui.political.provinceRestrictToOwnerCountry}</span>
                    <input
                      type="checkbox"
                      checked={restrictProvinceBrushToOwnerCountry}
                      onChange={(event) => {
                        onChangeRestrictProvinceBrushToOwnerCountry(event.target.checked)
                      }}
                    />
                  </label>
                </ControlCard>
              </div>
            ) : null}
            {provinces.length === 0 ? (
              <div className="detail-card details-card">
                <strong>{ui.political.noProvinces}</strong>
                <span>{ui.political.noProvincesHint}</span>
              </div>
            ) : (
              <DataTableShell
                expanded={isListExpanded}
                onToggleExpanded={onToggleListExpanded}
                toggleLabel={`Toggle ${ui.political.provinces} list`}
                headerRow={
                  <div className="city-table-row city-table-head province-table-row" style={{ '--table-columns': provinceTableColumns } as CSSProperties}>
                    <button className="table-sort-button" type="button" onClick={() => onChangeSort('name')}>
                      {renderSortLabel(ui.cityTable.name, provinceSortKey === 'name', provinceSortDirection)}
                    </button>
                    {visibleSidebarColumns.map((column) => {
                      if (column === 'country') {
                        return (
                          <button
                            key={column}
                            className="table-sort-button table-sort-button--align-end"
                            type="button"
                            onClick={() => onChangeSort('country')}
                          >
                            {renderSortLabel(ui.cityTable.country, provinceSortKey === 'country', provinceSortDirection)}
                          </button>
                        )
                      }
                      if (column === 'capital') return <span key={column} className="city-country">{ui.provinceEditor.capitalCity}</span>
                      return <span key={column} className="city-country">{ui.common.cells}</span>
                    })}
                  </div>
                }
              >
                {provinces.map((province) => (
                  <div
                    key={province.id}
                    className={`city-table-row province-table-row province-table-body-row${province.id === activeProvinceId ? ' is-active' : ''}`}
                    style={{ '--table-columns': provinceTableColumns } as CSSProperties}
                  >
                    <button
                      className="city-table-name"
                      type="button"
                      onClick={() => {
                        onSelectProvince(province.id)
                      }}
                      onDoubleClick={() => {
                        onEditProvince(province)
                      }}
                    >
                      {province.id === activeProvinceId ? (
                        <TableSelectionAnchor label={`${ui.common.clear} ${ui.political.provinces}`} onClearSelection={onClearSelection}>
                          <span className="country-swatch" style={{ backgroundColor: province.color }} />
                        </TableSelectionAnchor>
                      ) : (
                        <span className="table-selection-anchor table-selection-anchor--passive" aria-hidden="true">
                          <span className="country-swatch" style={{ backgroundColor: province.color }} />
                        </span>
                      )}
                      <span className="city-name">{province.name}</span>
                    </button>
                    {visibleSidebarColumns.map((column) => {
                      if (column === 'country') {
                        return (
                          <span key={column} className="table-cell-button table-cell-button--align-end city-type">
                            {province.countryId
                              ? countries[province.countryId]?.name ?? ui.common.unassigned
                              : ui.common.unassigned}
                          </span>
                        )
                      }
                      if (column === 'capital') {
                        return (
                          <span key={column} className="table-cell-button table-cell-button--align-end city-country">
                            {province.capitalCityId ? cities[province.capitalCityId]?.name ?? ui.common.none : ui.common.none}
                          </span>
                        )
                      }
                      return (
                        <span key={column} className="table-cell-button table-cell-button--align-end city-country">
                          {province.id === activeProvinceId ? activeProvinceCellCount : '—'}
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
