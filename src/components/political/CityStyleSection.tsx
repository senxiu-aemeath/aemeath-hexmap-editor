import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { usePoliticalStyleContext } from '../../state/PoliticalStyleContext'

interface CityStyleSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
}

export function CityStyleSection({ isSectionExpanded, onToggleSection }: CityStyleSectionProps) {
  const ui = useUiMessages()
  const { cityStatesFillTerritory, setCityStatesFillTerritory } = usePoliticalStyleContext()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.cityRules.styleSectionTitle}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded && (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.common.display}</CardTitle>
          <ControlCard variant="frameless">
            <label className="toggle-row">
              <span>{ui.cityRules.cityStatesFillTerritory}</span>
              <input
                type="checkbox"
                checked={cityStatesFillTerritory}
                onChange={(event) => {
                  setCityStatesFillTerritory(event.target.checked)
                }}
              />
            </label>
            <small className="help-text">{ui.cityRules.cityStatesFillTerritoryDesc}</small>
          </ControlCard>
        </div>
      )}
    </section>
  )
}
