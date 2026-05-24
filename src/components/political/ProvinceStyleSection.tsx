import { useUiMessages } from '../../i18n'
import { ColorApplyField } from '../ColorApplyField'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { usePoliticalStyleContext } from '../../state/PoliticalStyleContext'

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

interface ProvinceStyleSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
}

export function ProvinceStyleSection({ isSectionExpanded, onToggleSection }: ProvinceStyleSectionProps) {
  const ui = useUiMessages()
  const {
    provinceFillOpacity, setProvinceFillOpacity,
    provinceBorderColor, setProvinceBorderColor,
    provinceBorderWidth, setProvinceBorderWidth,
    provinceBorderOpacity, setProvinceBorderOpacity,
    provinceBorderOverridesCountryBorder, setProvinceBorderOverridesCountryBorder,
  } = usePoliticalStyleContext()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.politicalStyles.provinceSectionTitle}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded && (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.common.display}</CardTitle>
          <ControlCard variant="frameless">
            <label className="control-field">
              <span>{ui.politicalStyles.provinceFillOpacity}</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={provinceFillOpacity}
                onChange={(event) => {
                  setProvinceFillOpacity(clamp(Number.parseFloat(event.target.value), 0, 1))
                }}
              />
            </label>
          </ControlCard>
          <CardTitle>{ui.layers.border}</CardTitle>
          <ControlCard variant="frameless">
            <label className="control-field">
              <span>{ui.politicalStyles.provinceBorderColor}</span>
              <ColorApplyField
                pickerKey="province-style:border-color"
                value={provinceBorderColor}
                onApply={setProvinceBorderColor}
              />
            </label>
            <label className="control-field">
              <span>{ui.politicalStyles.provinceBorderWidth}</span>
              <input
                type="number"
                min={0}
                max={12}
                step={0.1}
                value={provinceBorderWidth}
                onChange={(event) => {
                  setProvinceBorderWidth(clamp(Number.parseFloat(event.target.value), 0, 12))
                }}
              />
            </label>
            <label className="control-field">
              <span>{ui.politicalStyles.provinceBorderOpacity}</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={provinceBorderOpacity}
                onChange={(event) => {
                  setProvinceBorderOpacity(clamp(Number.parseFloat(event.target.value), 0, 1))
                }}
              />
            </label>
            <label className="toggle-row">
              <span>{ui.politicalStyles.provinceBorderOverridesCountryBorder}</span>
              <input
                type="checkbox"
                checked={provinceBorderOverridesCountryBorder}
                onChange={(event) => {
                  setProvinceBorderOverridesCountryBorder(event.target.checked)
                }}
              />
            </label>
          </ControlCard>
        </div>
      )}
    </section>
  )
}
