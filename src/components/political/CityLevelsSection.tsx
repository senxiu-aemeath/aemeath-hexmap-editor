import type { CityLevel } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import type { CityLevelSortDirection, CityLevelSortKey, CityToolMode } from '../../political/types'
import { renderSortLabel } from '../../political/display'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { TableSelectionAnchor } from '../TableSelectionAnchor'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

interface CityLevelsSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  activeCityLevel: CityLevel | null
  activeCityLevelUsageCount: number
  iconSourceMap: Record<string, string>
  isInfoExpanded: boolean
  sortedCityLevels: CityLevel[]
  cityLevelSortKey: CityLevelSortKey
  cityLevelSortDirection: CityLevelSortDirection
  isListExpanded: boolean
  onChangeSort: (nextKey: CityLevelSortKey) => void
  onToggleInfoExpanded: () => void
  onToggleListExpanded: () => void
  onCreateCityLevel: () => void
  onDeleteActiveCityLevel: () => void
  onSetCityToolMode: (mode: CityToolMode) => void
  onSelectCityLevel: (levelId: string) => void
  onClearSelection: () => void
  onEditCityLevel: (level: CityLevel) => void
}

export function CityLevelsSection({ isSectionExpanded,
  onToggleSection,
  activeCityLevel,
  activeCityLevelUsageCount,
  iconSourceMap,
  isInfoExpanded,
  sortedCityLevels,
  cityLevelSortKey,
  cityLevelSortDirection,
  isListExpanded,
  onChangeSort,
  onToggleInfoExpanded,
  onToggleListExpanded,
  onCreateCityLevel,
  onDeleteActiveCityLevel,
  onSetCityToolMode,
  onSelectCityLevel,
  onClearSelection,
  onEditCityLevel,
}: CityLevelsSectionProps) {
  const ui = useUiMessages()
  const { cityToolMode } = useEditorModeContext()
  const { activeCityLevelId } = useActiveEntityContext()
  const activeIconSrc = activeCityLevel ? iconSourceMap[activeCityLevel.iconKey] : null
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.political.cityLevels}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded && (
        <>
          <SelectedInfoShell
            title={ui.common.details}
            expanded={isInfoExpanded}
            onToggleExpanded={onToggleInfoExpanded}
            className="info-shell--compact"
          >
            <div
              className={`detail-card details-card selected-info-card active-city-card active-city-level-card${isInfoExpanded ? ' is-expanded' : ''}`}
              title={activeCityLevel?.name ?? ui.political.noSelectedCityLevel}
            >
              {activeCityLevel ? (
                <div className="selected-info-split">
                  <div className="selected-info-stack">
                    <div className="selected-info-pair">
                      <strong>{ui.common.name}</strong>
                      <span>{activeCityLevel.name}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.cityLevelEditor.rank}</strong>
                      <span>{activeCityLevel.rank}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.common.count}</strong>
                      <span>{activeCityLevelUsageCount}</span>
                    </div>
                  </div>
                  <div className="selected-info-color-side">
                    {activeIconSrc ? (
                      <img
                        src={activeIconSrc}
                        className="government-type-color-swatch city-level-detail-icon"
                        alt={activeCityLevel.iconKey}
                      />
                    ) : null}
                  </div>
                </div>
              ) : (
                <span>{ui.political.noSelectedCityLevel}</span>
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
              <div className="table-action-group table-action-group--label-primary table-action-group--equal-3">
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCityLevel}>
                  {ui.common.create}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--secondary"
                  type="button"
                  disabled={!activeCityLevel}
                  onClick={() => {
                    if (activeCityLevel) {
                      onEditCityLevel(activeCityLevel)
                    }
                  }}
                >
                  {ui.common.edit}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--danger"
                  type="button"
                  disabled={!activeCityLevel || activeCityLevelUsageCount > 0}
                  onClick={onDeleteActiveCityLevel}
                >
                  {ui.common.delete}
                </button>
              </div>
            </ControlCard>
          </div>
          {sortedCityLevels.length === 0 ? (
            <div className="detail-card details-card">
              <strong>{ui.political.noCityLevels}</strong>
            </div>
          ) : (
            <DataTableShell
              expanded={isListExpanded}
              onToggleExpanded={onToggleListExpanded}
              toggleLabel={`Toggle ${ui.political.cityLevels} list`}
              headerRow={
                <div className="city-table-row city-table-head city-level-table-row">
                  <button className="table-sort-button" type="button" onClick={() => onChangeSort('name')}>
                    {renderSortLabel(
                      ui.cityLevelTable.name,
                      cityLevelSortKey === 'name',
                      cityLevelSortDirection,
                    )}
                  </button>
                  <button
                    className="table-sort-button table-sort-button--align-end"
                    type="button"
                    onClick={() => onChangeSort('rank')}
                  >
                    {renderSortLabel(
                      ui.cityLevelTable.rank,
                      cityLevelSortKey === 'rank',
                      cityLevelSortDirection,
                    )}
                  </button>
                </div>
              }
            >
              {sortedCityLevels.map((level) => (
                <div
                  key={level.id}
                  className={`city-table-row city-level-table-row city-level-table-body-row${level.id === activeCityLevelId ? ' is-active' : ''}`}
                >
                  <button
                    className="city-table-name"
                    type="button"
                    onClick={() => {
                      onSelectCityLevel(level.id)
                    }}
                    onDoubleClick={() => {
                      onEditCityLevel(level)
                    }}
                  >
                    {level.id === activeCityLevelId ? (
                      <TableSelectionAnchor
                        label={`${ui.common.clear} ${ui.political.cityLevels}`}
                        onClearSelection={onClearSelection}
                      >
                        {iconSourceMap[level.iconKey] ? (
                          <img
                            src={iconSourceMap[level.iconKey]}
                            className="city-icon"
                            alt={level.iconKey}
                          />
                        ) : null}
                      </TableSelectionAnchor>
                    ) : (
                      <span className="table-selection-anchor table-selection-anchor--passive" aria-hidden="true">
                        {iconSourceMap[level.iconKey] ? (
                          <img
                            src={iconSourceMap[level.iconKey]}
                            className="city-icon"
                            alt={level.iconKey}
                          />
                        ) : null}
                      </span>
                    )}
                    <span>{level.name}</span>
                  </button>
                  <span className="city-status">{level.rank}</span>
                  <span className="table-slot-cell" aria-hidden="true" />
                </div>
              ))}
            </DataTableShell>
          )}
        </>
      )}
    </section>
  )
}
