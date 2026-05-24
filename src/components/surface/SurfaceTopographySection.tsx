import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { TerrainAnchorField, type TerrainColorAnchor } from '../TerrainAnchorField'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface SurfaceTopographySectionProps {
  expanded: boolean
  onToggle: () => void
  terrainLandAnchors: TerrainColorAnchor[]
  onSetTerrainLandAnchors: (anchors: TerrainColorAnchor[]) => void
  terrainWaterAnchors: TerrainColorAnchor[]
  onSetTerrainWaterAnchors: (anchors: TerrainColorAnchor[]) => void
  terrainSnowLineElevation: number
  terrainSnowColor: string
  onSetTerrainSnow: (payload: { elevation: number; color: string }) => void
}

export function SurfaceTopographySection({ expanded,
  onToggle,
  terrainLandAnchors,
  onSetTerrainLandAnchors,
  terrainWaterAnchors,
  onSetTerrainWaterAnchors,
  terrainSnowLineElevation,
  terrainSnowColor,
  onSetTerrainSnow,
}: SurfaceTopographySectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.surface.topographyMode} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.surface.geographicColors}</CardTitle>
          <ControlCard variant="frameless">
            <div className="terrain-anchor-grid">
              <TerrainAnchorField
                label={ui.surface.landBaseColor}
                anchors={terrainLandAnchors}
                min={-5}
                max={20}
                pickerKeyPrefix="terrain:land-anchor"
                onChange={onSetTerrainLandAnchors}
                snowLineElevation={terrainSnowLineElevation}
                snowColor={terrainSnowColor}
                onSnowChange={onSetTerrainSnow}
              />
              <TerrainAnchorField
                label={ui.surface.waterBaseSimpleColor}
                anchors={terrainWaterAnchors}
                min={-10}
                max={0}
                pickerKeyPrefix="terrain:water-anchor"
                onChange={onSetTerrainWaterAnchors}
              />
            </div>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
