import type { Country, Label, LabelAnchor, LabelGroup } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { ActionUnit, CardTitle, ControlCard, ControlRow, FieldUnit } from '../ToolControlPrimitives'

interface LabelsToolSectionProps {
  expanded: boolean
  onToggleSection: () => void
  infoExpanded: boolean
  onToggleInfo: () => void
  activeLabel: Label | null
  activeLabelId: string | null
  activeLabelText: string
  activeLabelGroup: LabelGroup | null
  describeLabelAnchor: (anchor: LabelAnchor) => string
  onOpenActiveLabelEditor: () => void
  labelAnchorDisplayMode: 'none' | 'all' | 'selected'
  onSetLabelAnchorDisplayMode: (mode: 'none' | 'all' | 'selected') => void
  canCreateCityNameLabel: boolean
  canCreateCountryNameLabel: boolean
  canCreateProvinceNameLabel: boolean
  canCreateCountryIconLabel: boolean
  onCreateCityNameLabel: () => void
  onCreateCountryNameLabel: () => void
  onCreateProvinceNameLabel: () => void
  onCreateCountryIconLabel: () => void
  onCreateFreeLabel: () => void
  onDeleteActiveLabel: () => void
  onOpenTextLabelsFullTable: () => void
  onOpenIconLabelsFullTable: () => void
  listExpanded: boolean
  onToggleList: () => void
  labelGroupFilter: string
  onClearLabelGroupFilter: () => void
  onToggleLabelGroupFilter: (groupId: string) => void
  filteredLabels: Label[]
  splitFilteredLabels: {
    text: Label[]
    icons: Label[]
  }
  worldLabelGroups: Record<string, LabelGroup>
  countriesById: Record<string, Country>
  iconSourceMap: Record<string, string>
  resolveLabelText: (label: Label) => string
  onSelectLabel: (labelId: string) => void
  onEditLabel: (labelId: string) => void
  onSetLabelVisible: (label: Label, visible: boolean) => void
  onSetLabelLocked: (label: Label, locked: boolean) => void
}

export function LabelsToolSection({ expanded,
  onToggleSection,
  infoExpanded,
  onToggleInfo,
  activeLabel,
  activeLabelId,
  activeLabelText,
  activeLabelGroup,
  describeLabelAnchor,
  onOpenActiveLabelEditor,
  labelAnchorDisplayMode,
  onSetLabelAnchorDisplayMode,
  canCreateCityNameLabel,
  canCreateCountryNameLabel,
  canCreateProvinceNameLabel,
  canCreateCountryIconLabel,
  onCreateCityNameLabel,
  onCreateCountryNameLabel,
  onCreateProvinceNameLabel,
  onCreateCountryIconLabel,
  onCreateFreeLabel,
  onDeleteActiveLabel,
  onOpenTextLabelsFullTable,
  onOpenIconLabelsFullTable,
  listExpanded,
  onToggleList,
  labelGroupFilter,
  onClearLabelGroupFilter,
  onToggleLabelGroupFilter,
  filteredLabels,
  splitFilteredLabels,
  worldLabelGroups,
  countriesById,
  iconSourceMap,
  resolveLabelText,
  onSelectLabel,
  onEditLabel,
  onSetLabelVisible,
  onSetLabelLocked,
}: LabelsToolSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.label.labels} expanded={expanded} onToggle={onToggleSection} />
      {expanded && (
        <div className="mode-tool-card-list">
          <SelectedInfoShell
            title={ui.common.details}
            expanded={infoExpanded}
            onToggleExpanded={onToggleInfo}
          >
            <div className={`detail-card details-card selected-info-card active-city-card${infoExpanded ? ' is-expanded' : ''}`}>
              {activeLabel ? (
                <>
                  <div className="selected-info-pair">
                    <strong>{ui.common.text}</strong>
                    <span>{activeLabelText || ui.common.empty}</span>
                  </div>
                  <div className="selected-info-pair">
                    <strong>{ui.label.group}</strong>
                    <span>{activeLabelGroup?.name ?? activeLabel.groupId}</span>
                  </div>
                  <div className="selected-info-pair">
                    <strong>{ui.common.anchor}</strong>
                    <span>{describeLabelAnchor(activeLabel.anchor)}</span>
                  </div>
                  <div className="selected-info-actions">
                    <button className="mode-button" type="button" onClick={onOpenActiveLabelEditor}>
                      {ui.label.editLabel}
                    </button>
                  </div>
                </>
              ) : (
                <div className="selected-info-empty">
                  <strong>{ui.label.noSelectedLabel}</strong>
                  <span>{ui.label.noSelectedLabelHint}</span>
                </div>
              )}
            </div>
          </SelectedInfoShell>

          <ControlCard className="label-control-card label-control-card--display" variant="frameless">
            <FieldUnit fieldKey={ui.label.anchorDisplay} stacked>
              <ControlRow columns={3} layout="segmented">
                <button
                  className={`toolbar-action-button toolbar-action-button--secondary toolbar-action-button--segmented${labelAnchorDisplayMode === 'none' ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => onSetLabelAnchorDisplayMode('none')}
                >
                  {ui.common.none}
                </button>
                <button
                  className={`toolbar-action-button toolbar-action-button--secondary toolbar-action-button--segmented${labelAnchorDisplayMode === 'all' ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => onSetLabelAnchorDisplayMode('all')}
                >
                  {ui.label.all}
                </button>
                <button
                  className={`toolbar-action-button toolbar-action-button--secondary toolbar-action-button--segmented${labelAnchorDisplayMode === 'selected' ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => onSetLabelAnchorDisplayMode('selected')}
                >
                  {ui.common.selected}
                </button>
              </ControlRow>
            </FieldUnit>
          </ControlCard>

          <CardTitle>{ui.common.tool}</CardTitle>
          <ControlCard className="label-control-card" variant="frameless">
            <ActionUnit>
              <ControlRow columns={4}>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCityNameLabel} disabled={!canCreateCityNameLabel}>
                  {ui.label.cityName}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCountryNameLabel} disabled={!canCreateCountryNameLabel}>
                  {ui.label.countryName}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateProvinceNameLabel} disabled={!canCreateProvinceNameLabel}>
                  {ui.label.provinceName}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateCountryIconLabel} disabled={!canCreateCountryIconLabel}>
                  {ui.label.countryIcon}
                </button>
              </ControlRow>
            </ActionUnit>
            <ActionUnit>
              <ControlRow columns={3}>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateFreeLabel}>
                  {ui.common.create}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onOpenActiveLabelEditor} disabled={!activeLabel}>
                  {ui.common.edit}
                </button>
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onDeleteActiveLabel} disabled={!activeLabel}>
                  {ui.common.delete}
                </button>
              </ControlRow>
            </ActionUnit>
            <ActionUnit>
              <ControlRow columns={2}>
                <button className="toolbar-action-button label-full-table-button" type="button" onClick={onOpenTextLabelsFullTable}>
                  {ui.label.textFullTable}
                </button>
                <button className="toolbar-action-button label-full-table-button" type="button" onClick={onOpenIconLabelsFullTable}>
                  {ui.label.iconFullTable}
                </button>
              </ControlRow>
            </ActionUnit>
          </ControlCard>

          <DataTableShell
            expanded={listExpanded}
            onToggleExpanded={onToggleList}
            toggleLabel={`Toggle ${ui.label.labels} list`}
            filterRow={
              <div className="label-table-row table-filter-row label-entry-table-row">
                <button className="table-filter-clear-button" type="button" disabled={labelGroupFilter === 'all'} onClick={onClearLabelGroupFilter}>
                  {ui.common.clear}
                </button>
                <button
                  className="table-filter-value table-filter-value-button table-cell-button table-cell-button--align-end label-table-group"
                  type="button"
                  disabled={labelGroupFilter === 'all'}
                  onDoubleClick={onClearLabelGroupFilter}
                >
                  {labelGroupFilter === 'all'
                    ? ui.common.none
                    : worldLabelGroups[labelGroupFilter]?.name ?? labelGroupFilter}
                </button>
                <span className="label-table-flag">{ui.label.visible}</span>
                <span className="label-table-flag">{ui.label.offsetLocked}</span>
                <span className="table-slot-cell" aria-hidden="true" />
              </div>
            }
            headerRow={
              <div className="label-table-row label-table-head label-entry-table-row">
                <span>{ui.label.text}</span>
                <span className="label-table-group">{ui.label.group}</span>
                <span className="label-table-flag">{ui.label.visible}</span>
                <span className="label-table-flag">{ui.label.offsetLocked}</span>
              </div>
            }
          >
            {filteredLabels.length === 0 ? (
              <div className="city-empty-state">
                <strong>{ui.label.noLabels}</strong>
                <div>{ui.label.noLabelsHint}</div>
              </div>
            ) : (
              <>
                {splitFilteredLabels.text.length > 0 && (
                  <div className="label-table-section-label">{ui.label.textLabels}</div>
                )}
                {splitFilteredLabels.text.map((label) => {
                  const labelText = resolveLabelText(label) || ui.common.empty
                  const labelGroup = worldLabelGroups[label.groupId]
                  return (
                    <div
                      key={label.id}
                      className={`label-table-row label-entry-table-row label-entry-table-body-row${activeLabelId === label.id ? ' is-active' : ''}`}
                    >
                      <button
                        className="label-table-name"
                        type="button"
                        onClick={() => onSelectLabel(label.id)}
                        onDoubleClick={() => onEditLabel(label.id)}
                      >
                        <span>{labelText}</span>
                      </button>
                      <button
                        className="table-cell-button table-cell-button--align-end label-table-group"
                        type="button"
                        onDoubleClick={() => onToggleLabelGroupFilter(label.groupId)}
                      >
                        {labelGroup?.name ?? label.groupId}
                      </button>
                      <label className="label-table-checkbox">
                        <input
                          type="checkbox"
                          checked={label.visible}
                          onChange={(event) => onSetLabelVisible(label, event.target.checked)}
                        />
                      </label>
                      <label className="label-table-checkbox">
                        <input
                          type="checkbox"
                          checked={label.locked}
                          onChange={(event) => onSetLabelLocked(label, event.target.checked)}
                        />
                      </label>
                      <span className="table-slot-cell" aria-hidden="true" />
                    </div>
                  )
                })}

                {splitFilteredLabels.icons.length > 0 && (
                  <div className="label-table-section-label">{ui.label.iconLabels}</div>
                )}
                {splitFilteredLabels.icons.map((label) => {
                  const labelGroup = worldLabelGroups[label.groupId]
                  const sourceCountry =
                    label.source.kind === 'country' ? countriesById[label.source.countryId] ?? null : null
                  const iconSrc = sourceCountry?.iconKey ? iconSourceMap[sourceCountry.iconKey] : null
                  return (
                    <div
                      key={label.id}
                      className={`label-table-row label-entry-table-row label-entry-table-body-row${activeLabelId === label.id ? ' is-active' : ''}`}
                    >
                      <button
                        className="label-table-name"
                        type="button"
                        onClick={() => onSelectLabel(label.id)}
                        onDoubleClick={() => onEditLabel(label.id)}
                      >
                        {iconSrc ? (
                          <span className="label-list-icon-preview" aria-hidden="true">
                            <img src={iconSrc} alt={sourceCountry?.name ?? ui.label.countryIcon} />
                          </span>
                        ) : null}
                        <span>{sourceCountry?.name ?? ui.label.countryIcon}</span>
                      </button>
                      <button
                        className="table-cell-button table-cell-button--align-end label-table-group"
                        type="button"
                        onDoubleClick={() => onToggleLabelGroupFilter(label.groupId)}
                      >
                        {labelGroup?.name ?? label.groupId}
                      </button>
                      <label className="label-table-checkbox">
                        <input
                          type="checkbox"
                          checked={label.visible}
                          onChange={(event) => onSetLabelVisible(label, event.target.checked)}
                        />
                      </label>
                      <label className="label-table-checkbox">
                        <input
                          type="checkbox"
                          checked={label.locked}
                          onChange={(event) => onSetLabelLocked(label, event.target.checked)}
                        />
                      </label>
                      <span className="table-slot-cell" aria-hidden="true" />
                    </div>
                  )
                })}
              </>
            )}
          </DataTableShell>
        </div>
      )}
    </section>
  )
}
