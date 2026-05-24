import type { LabelGroup } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface CityAutomationSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  assignedLabelGroups: LabelGroup[]
  onChangeAutoCreateMode: (
    groupId: string,
    mode: 'always' | 'never' | 'default',
  ) => void
  onChangeAutoCreateDefault: (groupId: string, value: boolean) => void
  onChangeConfirmOnRemove: (groupId: string, value: boolean) => void
}

export function CityAutomationSection({ isSectionExpanded,
  onToggleSection,
  assignedLabelGroups,
  onChangeAutoCreateMode,
  onChangeAutoCreateDefault,
  onChangeConfirmOnRemove,
}: CityAutomationSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.automation.citySectionTitle}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded &&
        (assignedLabelGroups.length === 0 ? (
          <div className="mode-tool-card-list">
            <CardTitle>{ui.automation.citySectionTitle}</CardTitle>
            <div className="detail-card">
              <strong>{ui.automation.noAssignedLabelRules}</strong>
              <span>{ui.automation.noAssignedLabelRulesHint}</span>
            </div>
          </div>
        ) : (
          <div className="mode-tool-card-list">
            <CardTitle>{ui.automation.citySectionTitle}</CardTitle>
            <ControlCard variant="frameless">
              <div className="automation-rules-table-shell">
                <table className="automation-rules-table">
                  <colgroup>
                    <col className="automation-rules-col-name" />
                    <col className="automation-rules-col-mode" />
                    <col className="automation-rules-col-confirm" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>{ui.common.name}</th>
                      <th>{ui.automation.autoCreateMode}</th>
                      <th>{ui.automation.confirmOnRemove}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedLabelGroups.map((group) => {
                      if (group.kind !== 'assigned' || !group.assignment) {
                        return null
                      }

                      const selectValue =
                        group.assignment.autoCreateMode === 'always'
                          ? 'always'
                          : group.assignment.autoCreateMode === 'never'
                            ? 'never'
                            : group.assignment.autoCreateDefault
                              ? 'default_on'
                              : 'default_off'

                      return (
                        <tr key={group.id}>
                          <td className="automation-rules-name-cell">{group.name}</td>
                          <td>
                            <select
                              value={selectValue}
                              onChange={(event) => {
                                const nextValue = event.target.value as 'always' | 'never' | 'default_on' | 'default_off'
                                if (nextValue === 'always' || nextValue === 'never') {
                                  onChangeAutoCreateMode(group.id, nextValue)
                                  return
                                }
                                onChangeAutoCreateMode(group.id, 'default')
                                onChangeAutoCreateDefault(group.id, nextValue === 'default_on')
                              }}
                            >
                              <option value="always">{ui.automation.modeAlways}</option>
                              <option value="never">{ui.automation.modeNever}</option>
                              <option value="default_on">{ui.automation.modeDefaultOn}</option>
                              <option value="default_off">{ui.automation.modeDefaultOff}</option>
                            </select>
                          </td>
                          <td>
                            <label className="automation-rules-toggle">
                              <input
                                type="checkbox"
                                checked={group.assignment.confirmOnRemove}
                                onChange={(event) => {
                                  onChangeConfirmOnRemove(group.id, event.target.checked)
                                }}
                              />
                            </label>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ControlCard>
          </div>
        ))}
    </section>
  )
}
