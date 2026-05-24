import type { GovernmentType } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { DataTableShell } from '../DataTableShell'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { SelectedInfoShell } from '../SelectedInfoShell'
import { TableSelectionAnchor } from '../TableSelectionAnchor'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

interface GovernmentTypesSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  governmentTypes: GovernmentType[]
  activeGovernmentTypeUsageCount: number
  isInfoExpanded: boolean
  isListExpanded: boolean
  onToggleInfoExpanded: () => void
  onToggleListExpanded: () => void
  onCreateGovernmentType: () => void
  onDeleteActiveGovernmentType: () => void
  onSelectGovernmentType: (governmentTypeId: string) => void
  onClearSelection: () => void
  onEditGovernmentType: (governmentType: GovernmentType) => void
}

export function GovernmentTypesSection({ isSectionExpanded,
  onToggleSection,
  governmentTypes,
  activeGovernmentTypeUsageCount,
  isInfoExpanded,
  isListExpanded,
  onToggleInfoExpanded,
  onToggleListExpanded,
  onCreateGovernmentType,
  onDeleteActiveGovernmentType,
  onSelectGovernmentType,
  onClearSelection,
  onEditGovernmentType,
}: GovernmentTypesSectionProps) {
  const ui = useUiMessages()
  const { activeGovernmentTypeId } = useActiveEntityContext()
  const activeGovernmentType =
    activeGovernmentTypeId
      ? governmentTypes.find((governmentType) => governmentType.id === activeGovernmentTypeId) ?? null
      : null

  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.political.governmentTypes}
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
              className={`detail-card details-card selected-info-card active-country-card active-government-type-card${isInfoExpanded ? ' is-expanded' : ''}`}
            >
              {activeGovernmentType ? (
                <div className="selected-info-split">
                  <div className="selected-info-stack">
                    <div className="selected-info-pair">
                      <strong>{ui.common.name}</strong>
                      <span>{activeGovernmentType.name}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.countryEditor.color}</strong>
                      <span>{activeGovernmentType.color}</span>
                    </div>
                    <div className="selected-info-pair">
                      <strong>{ui.common.count}</strong>
                      <span>{activeGovernmentTypeUsageCount}</span>
                    </div>
                  </div>
                  <div className="selected-info-color-side">
                    <span
                      className="country-swatch government-type-color-swatch"
                      style={{ backgroundColor: activeGovernmentType.color }}
                    />
                  </div>
                </div>
              ) : (
                <span>{ui.political.noSelectedGovernmentType}</span>
              )}
            </div>
          </SelectedInfoShell>
          <div className="mode-tool-card-list">
            <CardTitle>{ui.common.tool}</CardTitle>
            <ControlCard variant="frameless">
              <div className="table-action-group table-action-group--label-primary table-action-group--equal-3">
                <button className="toolbar-action-button toolbar-action-button--secondary" type="button" onClick={onCreateGovernmentType}>
                  {ui.common.create}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--secondary"
                  type="button"
                  disabled={!activeGovernmentType}
                  onClick={() => {
                    if (activeGovernmentType) {
                      onEditGovernmentType(activeGovernmentType)
                    }
                  }}
                >
                  {ui.common.edit}
                </button>
                <button
                  className="toolbar-action-button toolbar-action-button--danger"
                  type="button"
                  disabled={!activeGovernmentType || activeGovernmentTypeUsageCount > 0}
                  onClick={onDeleteActiveGovernmentType}
                >
                  {ui.common.delete}
                </button>
              </div>
            </ControlCard>
          </div>
          {governmentTypes.length === 0 ? (
            <div className="detail-card details-card">
              <strong>{ui.political.noGovernmentTypes}</strong>
              <span>{ui.political.noGovernmentTypesHint}</span>
            </div>
          ) : (
            <DataTableShell
              expanded={isListExpanded}
              onToggleExpanded={onToggleListExpanded}
              toggleLabel={`Toggle ${ui.political.governmentTypes} list`}
              headerRow={
                <div className="country-table-row country-table-head">
                  <span>{ui.cityTable.name}</span>
                  <span className="country-status">{ui.countryEditor.color}</span>
                </div>
              }
            >
              {governmentTypes.map((governmentType) => (
                <div
                  key={governmentType.id}
                  className={`country-table-row country-table-body-row${governmentType.id === activeGovernmentTypeId ? ' is-active' : ''}`}
                >
                  <button
                    className="country-table-name"
                    type="button"
                    onClick={() => {
                      onSelectGovernmentType(governmentType.id)
                    }}
                    onDoubleClick={() => {
                      onEditGovernmentType(governmentType)
                    }}
                  >
                    {governmentType.id === activeGovernmentTypeId ? (
                      <TableSelectionAnchor label={`${ui.common.clear} ${ui.political.governmentTypes}`} onClearSelection={onClearSelection}>
                        <span className="country-swatch" style={{ backgroundColor: governmentType.color }} />
                      </TableSelectionAnchor>
                    ) : (
                      <span className="table-selection-anchor table-selection-anchor--passive" aria-hidden="true">
                        <span className="country-swatch" style={{ backgroundColor: governmentType.color }} />
                      </span>
                    )}
                    <span>{governmentType.name}</span>
                  </button>
                  <span className="country-status">{governmentType.color}</span>
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
