import type { TerrainColorAnchor } from '../TerrainAnchorField'
import { SurfaceBaseStyleSection } from './SurfaceBaseStyleSection'
import { SurfaceDisplaySection } from './SurfaceDisplaySection'
import { SurfacePaintSection } from './SurfacePaintSection'
import { SurfaceTopographySection } from './SurfaceTopographySection'
import type {
  TerrainBrushKind,
  TerrainDisplayMode,
  TerrainPaintMode,
} from './terrainBrush'

interface SurfaceModePanelProps {
  isTerrainDisplayExpanded: boolean
  onToggleTerrainDisplay: () => void
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
  isTerrainPaintExpanded: boolean
  onToggleTerrainPaint: () => void
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
  isTerrainBaseStyleExpanded: boolean
  onToggleTerrainBaseStyle: () => void
  colorFields: Array<{
    label: string
    pickerKey: string
    value: string
    onApply: (value: string) => void
  }>
  edgeFields: Array<{
    label: string
    pickerKey: string
    color: string
    onApplyColor: (value: string) => void
    width: number
    onApplyWidth: (value: string) => void
  }>
  edgeSliderMax: number
  edgeInputMax: number
  isTerrainTopographyExpanded: boolean
  onToggleTerrainTopography: () => void
  terrainLandAnchors: TerrainColorAnchor[]
  onSetTerrainLandAnchors: (anchors: TerrainColorAnchor[]) => void
  terrainWaterAnchors: TerrainColorAnchor[]
  onSetTerrainWaterAnchors: (anchors: TerrainColorAnchor[]) => void
  terrainSnowColor: string
  onSetTerrainSnow: (payload: { elevation: number; color: string }) => void
}

export function SurfaceModePanel(props: SurfaceModePanelProps) {
  return (
    <section className="tool-section-stack section-gap">
      <SurfaceDisplaySection
        expanded={props.isTerrainDisplayExpanded}
        onToggle={props.onToggleTerrainDisplay}
        terrainDisplayMode={props.terrainDisplayMode}
        onSetTerrainDisplayMode={props.onSetTerrainDisplayMode}
        showEmptySurface={props.showEmptySurface}
        onSetShowEmptySurface={props.onSetShowEmptySurface}
        showSnowOverride={props.showSnowOverride}
        onSetShowSnowOverride={props.onSetShowSnowOverride}
        showLandEmptyEdges={props.showLandEmptyEdges}
        onSetShowLandEmptyEdges={props.onSetShowLandEmptyEdges}
        showWaterEmptyEdges={props.showWaterEmptyEdges}
        onSetShowWaterEmptyEdges={props.onSetShowWaterEmptyEdges}
      />
      <SurfacePaintSection
        expanded={props.isTerrainPaintExpanded}
        onToggle={props.onToggleTerrainPaint}
        terrainPaintMode={props.terrainPaintMode}
        onSelectTerrainPaintMode={props.onSelectTerrainPaintMode}
        terrainBrushKind={props.terrainBrushKind}
        onSelectTerrainBrushKind={props.onSelectTerrainBrushKind}
        terrainBrushElevationRange={props.terrainBrushElevationRange}
        terrainBrushElevation={props.terrainBrushElevation}
        terrainSnowLineElevation={props.terrainSnowLineElevation}
        terrainElevationMarks={props.terrainElevationMarks}
        getElevationMarkLeft={props.getElevationMarkLeft}
        onSetTerrainBrushElevationFromSlider={props.onSetTerrainBrushElevationFromSlider}
        onSetTerrainBrushElevationFromInput={props.onSetTerrainBrushElevationFromInput}
        onSetTerrainBrushElevationZero={props.onSetTerrainBrushElevationZero}
        onSetTerrainBrushElevationSnow={props.onSetTerrainBrushElevationSnow}
        surfaceBrushSummary={props.surfaceBrushSummary}
      />
      <SurfaceBaseStyleSection
        expanded={props.isTerrainBaseStyleExpanded}
        onToggle={props.onToggleTerrainBaseStyle}
        colorFields={props.colorFields}
        edgeFields={props.edgeFields}
        sliderMax={props.edgeSliderMax}
        inputMax={props.edgeInputMax}
      />
      <SurfaceTopographySection
        expanded={props.isTerrainTopographyExpanded}
        onToggle={props.onToggleTerrainTopography}
        terrainLandAnchors={props.terrainLandAnchors}
        onSetTerrainLandAnchors={props.onSetTerrainLandAnchors}
        terrainWaterAnchors={props.terrainWaterAnchors}
        onSetTerrainWaterAnchors={props.onSetTerrainWaterAnchors}
        terrainSnowLineElevation={props.terrainSnowLineElevation}
        terrainSnowColor={props.terrainSnowColor}
        onSetTerrainSnow={props.onSetTerrainSnow}
      />
    </section>
  )
}
