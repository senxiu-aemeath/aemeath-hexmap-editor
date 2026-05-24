import type { CityLevel } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { getCityLevelName } from '../../political/display'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface CityPlacementSectionProps {
  isSectionExpanded: boolean
  onToggleSection: () => void
  cityLevels: CityLevel[]
  worldCityLevels: Record<string, CityLevel>
  iconSourceMap: Record<string, string>
  effectiveCityBrushLevelId: string | null
  onSetCityBrushLevel: (levelId: string) => void
}

export function CityPlacementSection({ isSectionExpanded,
  onToggleSection,
  cityLevels,
  worldCityLevels,
  iconSourceMap,
  effectiveCityBrushLevelId,
  onSetCityBrushLevel,
}: CityPlacementSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader
        title={ui.political.cityTypes}
        expanded={isSectionExpanded}
        onToggle={onToggleSection}
      />
      {isSectionExpanded && (
        <div className="mode-tool-card-list city-placement-panel">
          <CardTitle>{ui.common.placement}</CardTitle>
          <ControlCard variant="frameless">
            <div className="detail-card city-placement-summary">
              <strong>{ui.common.placement}</strong>
              <span>
                {effectiveCityBrushLevelId
                  ? getCityLevelName(effectiveCityBrushLevelId, worldCityLevels, ui)
                  : ui.common.none}
              </span>
            </div>
          </ControlCard>
          <CardTitle>{ui.political.cityLevels}</CardTitle>
          <ControlCard variant="frameless">
            <div className="tool-palette">
              {cityLevels.map((level) => (
                <button
                  key={level.id}
                  className={`icon-tool-button${effectiveCityBrushLevelId === level.id ? ' is-active' : ''}`}
                  title={getCityLevelName(level.id, worldCityLevels, ui)}
                  onClick={() => {
                    onSetCityBrushLevel(level.id)
                  }}
                >
                  {iconSourceMap[level.iconKey] ? (
                    <img
                      src={iconSourceMap[level.iconKey]}
                      alt={getCityLevelName(level.id, worldCityLevels, ui)}
                    />
                  ) : null}
                  <span>{getCityLevelName(level.id, worldCityLevels, ui)}</span>
                </button>
              ))}
            </div>
          </ControlCard>
        </div>
      )}
    </section>
  )
}
