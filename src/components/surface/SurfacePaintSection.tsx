import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import type { TerrainBrushKind, TerrainPaintMode } from './terrainBrush'

interface SurfacePaintSectionProps {
  expanded: boolean
  onToggle: () => void
  terrainPaintMode: TerrainPaintMode
  onSelectTerrainPaintMode: (mode: TerrainPaintMode, radiusIndex?: number) => void
  terrainBrushKind: TerrainBrushKind
  onSelectTerrainBrushKind: (kind: TerrainBrushKind) => void
  terrainBrushElevationRange: { min: number; max: number }
  terrainBrushElevation: number
  terrainSnowLineElevation: number
  terrainElevationMarks: number[]
  getElevationMarkLeft: (value: number, min: number, max: number) => number
  onSetTerrainBrushElevationFromSlider: (value: number) => void
  onSetTerrainBrushElevationFromInput: (value: string) => void
  onSetTerrainBrushElevationZero: () => void
  onSetTerrainBrushElevationSnow: () => void
  surfaceBrushSummary: string
}

export function SurfacePaintSection({ expanded,
  onToggle,
  terrainPaintMode,
  onSelectTerrainPaintMode,
  terrainBrushKind,
  onSelectTerrainBrushKind,
  terrainBrushElevationRange,
  terrainBrushElevation,
  terrainSnowLineElevation,
  terrainElevationMarks,
  getElevationMarkLeft,
  onSetTerrainBrushElevationFromSlider,
  onSetTerrainBrushElevationFromInput,
  onSetTerrainBrushElevationZero,
  onSetTerrainBrushElevationSnow,
  surfaceBrushSummary,
}: SurfacePaintSectionProps) {
  const ui = useUiMessages()
  const isElevationDisabled = terrainBrushKind === 'empty' || terrainBrushKind === 'unknown'

  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.surface.paintSection} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <CardTitle>{ui.surface.paintMode}</CardTitle>
          <ControlCard variant="frameless">
            <div className="terrain-segmented-grid terrain-segmented-grid--four-two">
              {(['radius_0', 'radius_1', 'radius_2', 'radius_3'] as const).map((mode, index) => (
                <button
                  key={mode}
                  className={`mode-button${terrainPaintMode === mode ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => {
                    onSelectTerrainPaintMode(mode, index)
                  }}
                >
                  {`R${index}`}
                </button>
              ))}
              <button
                className={`mode-button terrain-mode-button--span-2${terrainPaintMode === 'fill_type' ? ' is-active' : ''}`}
                type="button"
                onClick={() => onSelectTerrainPaintMode('fill_type')}
              >
                {ui.surface.fillType}
              </button>
              <button
                className={`mode-button terrain-mode-button--span-2${terrainPaintMode === 'fill_height' ? ' is-active' : ''}`}
                type="button"
                onClick={() => onSelectTerrainPaintMode('fill_height')}
              >
                {ui.surface.fillHeight}
              </button>
            </div>
          </ControlCard>
          <CardTitle>{ui.surface.brushType}</CardTitle>
          <ControlCard variant="frameless">
            <div className="terrain-segmented-grid terrain-segmented-grid--six">
              {([
                ['land', ui.surfaceBrush.land],
                ['water', ui.surfaceBrush.water],
                ['dark_water', ui.surface.waterDarkColor],
                ['empty', ui.surfaceBrush.empty],
                ['unknown', ui.surface.specialUnknown],
              ] as const).map(([kind, label]) => (
                <button
                  key={kind}
                  className={`mode-button${terrainBrushKind === kind ? ' is-active' : ''}${kind === 'empty' || kind === 'unknown' ? ' terrain-brush-kind-button--wide' : ' terrain-brush-kind-button--narrow'}`}
                  type="button"
                  onClick={() => {
                    onSelectTerrainBrushKind(kind)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </ControlCard>
          <CardTitle>{ui.surface.elevation}</CardTitle>
          <ControlCard variant="frameless" className={isElevationDisabled ? 'control-stack is-disabled' : 'control-stack'}>
            <div className="surface-elevation-control">
              <div className="surface-elevation-marks__secondary">
                {terrainBrushKind === 'land' && (
                  <span
                    className="surface-elevation-mark surface-elevation-mark--snow"
                    style={{
                      left: `${getElevationMarkLeft(
                        terrainSnowLineElevation,
                        terrainBrushElevationRange.min,
                        terrainBrushElevationRange.max,
                      )}%`,
                    }}
                  >
                    {terrainSnowLineElevation}
                  </span>
                )}
              </div>
              <div className="surface-elevation-slider-row">
                <input
                  type="range"
                  min={terrainBrushElevationRange.min}
                  max={terrainBrushElevationRange.max}
                  step={1}
                  value={isElevationDisabled ? 0 : terrainBrushElevation}
                  disabled={isElevationDisabled}
                  onChange={(event) => {
                    onSetTerrainBrushElevationFromSlider(Number(event.target.value))
                  }}
                />
              </div>
              <div className="surface-elevation-marks__primary">
                {terrainElevationMarks.map((mark) => (
                  <span
                    key={mark}
                    className="surface-elevation-mark"
                    style={{
                      left: `${getElevationMarkLeft(mark, terrainBrushElevationRange.min, terrainBrushElevationRange.max)}%`,
                    }}
                  >
                    {mark}
                  </span>
                ))}
              </div>
              <div className="surface-elevation-input-row">
                <input
                  className="surface-elevation-input"
                  type="number"
                  min={terrainBrushElevationRange.min}
                  max={terrainBrushElevationRange.max}
                  step={1}
                  value={isElevationDisabled ? 0 : terrainBrushElevation}
                  disabled={isElevationDisabled}
                  onChange={(event) => {
                    onSetTerrainBrushElevationFromInput(event.target.value)
                  }}
                />
                <button
                  className="mode-button surface-elevation-quick-button"
                  type="button"
                  disabled={isElevationDisabled}
                  onClick={onSetTerrainBrushElevationZero}
                >
                  Zero[0]
                </button>
                <button
                  className="mode-button surface-elevation-quick-button"
                  type="button"
                  disabled={terrainBrushKind !== 'land'}
                  onClick={onSetTerrainBrushElevationSnow}
                >
                  {`Snow[${terrainSnowLineElevation}]`}
                </button>
              </div>
            </div>
          </ControlCard>
          <ControlCard variant="frameless">
            <div className="surface-brush-summary">{surfaceBrushSummary}</div>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
