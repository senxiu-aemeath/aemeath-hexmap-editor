import { useUiMessages } from '../../i18n'
import { ColorApplyField } from '../ColorApplyField'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { usePoliticalStyleContext } from '../../state/PoliticalStyleContext'
import { useRenderFlagsContext } from '../../state/RenderFlagsContext'

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

interface CountryStyleSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
}

export function CountryStyleSection({ isSectionExpanded, onToggleSection }: CountryStyleSectionProps) {
  const ui = useUiMessages()
  const {
    countryFillOpacity, setCountryFillOpacity,
    countryBorderColor, setCountryBorderColor,
    countryBorderWidth, setCountryBorderWidth,
    countryBorderOpacity, setCountryBorderOpacity,
    countrySharedBorderOverridesOwn, setCountrySharedBorderOverridesOwn,
    countrySharedBorderMode, setCountrySharedBorderMode,
  } = usePoliticalStyleContext()
  const { colorWaterInCountryLayer, setColorWaterInCountryLayer } = useRenderFlagsContext()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.politicalStyles.countrySectionTitle}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded && (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.common.display}</CardTitle>
          <ControlCard variant="frameless">
            <label className="toggle-row">
              <span>{ui.sidebar.countryWaterFill}</span>
              <input
                type="checkbox"
                checked={colorWaterInCountryLayer}
                onChange={(event) => {
                  setColorWaterInCountryLayer(event.target.checked)
                }}
              />
            </label>
            <label className="control-field">
              <span>{ui.politicalStyles.countryFillOpacity}</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={countryFillOpacity}
                onChange={(event) => {
                  setCountryFillOpacity(clamp(Number.parseFloat(event.target.value), 0, 1))
                }}
              />
            </label>
          </ControlCard>
          <CardTitle>{ui.layers.border}</CardTitle>
          <ControlCard variant="frameless">
            <label className="control-field">
              <span>{ui.politicalStyles.countryBorderColor}</span>
              <ColorApplyField
                pickerKey="country-style:border-color"
                value={countryBorderColor}
                onApply={setCountryBorderColor}
              />
            </label>
            <label className="control-field">
              <span>{ui.politicalStyles.countryBorderWidth}</span>
              <input
                type="number"
                min={0}
                max={12}
                step={0.1}
                value={countryBorderWidth}
                onChange={(event) => {
                  setCountryBorderWidth(clamp(Number.parseFloat(event.target.value), 0, 12))
                }}
              />
            </label>
            <label className="control-field">
              <span>{ui.politicalStyles.countryBorderOpacity}</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={countryBorderOpacity}
                onChange={(event) => {
                  setCountryBorderOpacity(clamp(Number.parseFloat(event.target.value), 0, 1))
                }}
              />
            </label>
            <label className="toggle-row">
              <span>{ui.politicalStyles.countrySharedBorderOverridesOwn}</span>
              <input
                type="checkbox"
                checked={countrySharedBorderOverridesOwn}
                onChange={(event) => {
                  setCountrySharedBorderOverridesOwn(event.target.checked)
                }}
              />
            </label>
            <div className="field-group">
              <span>{ui.politicalStyles.countrySharedBorderMode}</span>
              <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
                <button
                  className={`toolbar-action-button${countrySharedBorderMode === 'uniform' ? ' is-active' : ''}`}
                  type="button"
                  disabled={!countrySharedBorderOverridesOwn}
                  onClick={() => {
                    setCountrySharedBorderMode('uniform')
                  }}
                >
                  {ui.politicalStyles.countrySharedBorderModeUniform}
                </button>
                <button
                  className={`toolbar-action-button${countrySharedBorderMode === 'mixed' ? ' is-active' : ''}`}
                  type="button"
                  disabled={!countrySharedBorderOverridesOwn}
                  onClick={() => {
                    setCountrySharedBorderMode('mixed')
                  }}
                >
                  {ui.politicalStyles.countrySharedBorderModeMixed}
                </button>
              </div>
            </div>
          </ControlCard>
        </div>
      )}
    </section>
  )
}
