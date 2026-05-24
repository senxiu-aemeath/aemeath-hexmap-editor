import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import type { TerrainDisplayMode } from './terrainBrush'

interface SurfaceDisplaySectionProps {
  expanded: boolean
  onToggle: () => void
  terrainDisplayMode: TerrainDisplayMode
  onSetTerrainDisplayMode: (mode: TerrainDisplayMode) => void
  showEmptySurface: boolean
  onSetShowEmptySurface: (value: boolean) => void
  showSnowOverride: boolean
  onSetShowSnowOverride: (value: boolean) => void
  showLandEmptyEdges: boolean
  onSetShowLandEmptyEdges: (value: boolean) => void
  showWaterEmptyEdges: boolean
  onSetShowWaterEmptyEdges: (value: boolean) => void
}

export function SurfaceDisplaySection({ expanded,
  onToggle,
  terrainDisplayMode,
  onSetTerrainDisplayMode,
  showEmptySurface,
  onSetShowEmptySurface,
  showSnowOverride,
  onSetShowSnowOverride,
  showLandEmptyEdges,
  onSetShowLandEmptyEdges,
  showWaterEmptyEdges,
  onSetShowWaterEmptyEdges,
}: SurfaceDisplaySectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.surface.display} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.surface.surfaceMode}</CardTitle>
          <ControlCard variant="frameless">
            <div className="segmented-control">
              {([
                ['surface', ui.surface.surfaceMode],
                ['topography', ui.surface.topographyMode],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  className={`mode-button${terrainDisplayMode === mode ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    onSetTerrainDisplayMode(mode)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </ControlCard>
          <CardTitle>{ui.surface.visibility}</CardTitle>
          <ControlCard variant="frameless">
            <label className="toggle-row">
              <span>{ui.surface.showEmptyCells}</span>
              <input
                type="checkbox"
                checked={showEmptySurface}
                onChange={(event) => {
                  onSetShowEmptySurface(event.target.checked)
                }}
              />
            </label>
            <label className="toggle-row">
              <span>{ui.surface.showSnowOverride}</span>
              <input
                type="checkbox"
                checked={showSnowOverride}
                onChange={(event) => {
                  onSetShowSnowOverride(event.target.checked)
                }}
              />
            </label>
            <label className="toggle-row">
              <span>{ui.surface.showLandEmptyEdges}</span>
              <input
                type="checkbox"
                checked={showLandEmptyEdges}
                onChange={(event) => {
                  onSetShowLandEmptyEdges(event.target.checked)
                }}
              />
            </label>
            <label className="toggle-row">
              <span>{ui.surface.showWaterEmptyEdges}</span>
              <input
                type="checkbox"
                checked={showWaterEmptyEdges}
                onChange={(event) => {
                  onSetShowWaterEmptyEdges(event.target.checked)
                }}
              />
            </label>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
