import type { Dispatch, SetStateAction } from 'react'
import { useMemo } from 'react'

import { clampSurfaceElevation } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { useRenderFlagsContext } from '../../state/RenderFlagsContext'
import { useTerrainBrushContext } from '../../state/TerrainBrushContext'
import { useTerrainStyleContext } from '../../state/TerrainStyleContext'
import { sanitizeFloatValue } from '../../utils/appUtilities'
import { getElevationMarkLeft } from '../../features/move/moveHelpers'
import {
  getSurfaceSummary,
  getTerrainBrushElevationRange,
  getTerrainBrushState,
  getUniqueSortedElevations,
} from './terrainBrush'
import { SurfaceModePanel } from './SurfaceModePanel'

const SURFACE_EDGE_SLIDER_MAX = 8
const SURFACE_EDGE_INPUT_MAX = 24

interface SurfaceModePanelContainerProps {
  isTerrainDisplayExpanded: boolean
  setIsTerrainDisplayExpanded: Dispatch<SetStateAction<boolean>>
  isTerrainPaintExpanded: boolean
  setIsTerrainPaintExpanded: Dispatch<SetStateAction<boolean>>
  isTerrainBaseStyleExpanded: boolean
  setIsTerrainBaseStyleExpanded: Dispatch<SetStateAction<boolean>>
  isTerrainTopographyExpanded: boolean
  setIsTerrainTopographyExpanded: Dispatch<SetStateAction<boolean>>
}

function sanitizeIntValue(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

export function SurfaceModePanelContainer({
  isTerrainDisplayExpanded,
  setIsTerrainDisplayExpanded,
  isTerrainPaintExpanded,
  setIsTerrainPaintExpanded,
  isTerrainBaseStyleExpanded,
  setIsTerrainBaseStyleExpanded,
  isTerrainTopographyExpanded,
  setIsTerrainTopographyExpanded,
}: SurfaceModePanelContainerProps) {
  const ui = useUiMessages()

  const {
    terrainBrushKind,
    setTerrainBrushKind,
    terrainBrushElevation,
    setTerrainBrushElevation,
    terrainPaintMode,
    setTerrainPaintMode,
    terrainDisplayMode,
    setTerrainDisplayMode,
    setBrushRadius,
  } = useTerrainBrushContext()

  const {
    terrainLandFillColor,
    setTerrainLandFillColor,
    terrainWaterFillColor,
    setTerrainWaterFillColor,
    terrainLandAnchors,
    setTerrainLandAnchors,
    terrainWaterAnchors,
    setTerrainWaterAnchors,
    terrainSnowLineElevation,
    setTerrainSnowLineElevation,
    terrainSnowColor,
    setTerrainSnowColor,
    showSnowOverride,
    setShowSnowOverride,
    terrainEmptyFillColor,
    setTerrainEmptyFillColor,
    terrainLandUnknownFillColor,
    setTerrainLandUnknownFillColor,
    terrainWaterUnknownFillColor,
    setTerrainWaterUnknownFillColor,
    terrainWaterDarkFillColor,
    setTerrainWaterDarkFillColor,
    landEdgeColor,
    setLandEdgeColor,
    landEdgeWidth,
    setLandEdgeWidth,
    landEmptyEdgeColor,
    setLandEmptyEdgeColor,
    landEmptyEdgeWidth,
    setLandEmptyEdgeWidth,
    coastEdgeColor,
    setCoastEdgeColor,
    coastEdgeWidth,
    setCoastEdgeWidth,
    waterEdgeColor,
    setWaterEdgeColor,
    waterEdgeWidth,
    setWaterEdgeWidth,
    waterEmptyEdgeColor,
    setWaterEmptyEdgeColor,
    waterEmptyEdgeWidth,
    setWaterEmptyEdgeWidth,
    darkWaterEdgeColor,
    setDarkWaterEdgeColor,
    darkWaterEdgeWidth,
    setDarkWaterEdgeWidth,
    snowEdgeColor,
    setSnowEdgeColor,
    snowEdgeWidth,
    setSnowEdgeWidth,
    snowBoundaryEdgeColor,
    setSnowBoundaryEdgeColor,
    snowBoundaryEdgeWidth,
    setSnowBoundaryEdgeWidth,
  } = useTerrainStyleContext()

  const {
    showEmptySurface,
    setShowEmptySurface,
    showLandEmptyEdges,
    setShowLandEmptyEdges,
    showWaterEmptyEdges,
    setShowWaterEmptyEdges,
  } = useRenderFlagsContext()

  const surfaceBrush = useMemo(
    () => getTerrainBrushState(terrainBrushKind, terrainBrushElevation),
    [terrainBrushElevation, terrainBrushKind],
  )

  const terrainElevationMarks = useMemo(
    () =>
      terrainBrushKind === 'land'
        ? getUniqueSortedElevations(terrainLandAnchors)
        : terrainBrushKind === 'water' || terrainBrushKind === 'dark_water'
          ? getUniqueSortedElevations(terrainWaterAnchors)
          : [],
    [terrainBrushKind, terrainLandAnchors, terrainWaterAnchors],
  )

  const terrainBrushElevationRange = useMemo(
    () => getTerrainBrushElevationRange(terrainBrushKind),
    [terrainBrushKind],
  )

  const surfaceBrushSummary = useMemo(
    () => getSurfaceSummary(ui, surfaceBrush),
    [surfaceBrush, ui],
  )

  const colorFields = useMemo(
    () => [
      { label: ui.surface.landBaseColor, pickerKey: 'terrain:base-land', value: terrainLandFillColor, onApply: setTerrainLandFillColor },
      {
        label: ui.surface.waterBaseSimpleColor,
        pickerKey: 'terrain:base-water',
        value: terrainWaterFillColor,
        onApply: setTerrainWaterFillColor,
      },
      { label: ui.surface.emptyColor, pickerKey: 'terrain:empty-preview', value: terrainEmptyFillColor, onApply: setTerrainEmptyFillColor },
      {
        label: ui.surface.landUnknownColor,
        pickerKey: 'terrain:land-unknown',
        value: terrainLandUnknownFillColor,
        onApply: setTerrainLandUnknownFillColor,
      },
      {
        label: ui.surface.waterUnknownColor,
        pickerKey: 'terrain:water-unknown',
        value: terrainWaterUnknownFillColor,
        onApply: setTerrainWaterUnknownFillColor,
      },
      {
        label: ui.surface.waterDarkColor,
        pickerKey: 'terrain:water-dark',
        value: terrainWaterDarkFillColor,
        onApply: setTerrainWaterDarkFillColor,
      },
    ],
    [
      terrainEmptyFillColor,
      terrainLandFillColor,
      terrainLandUnknownFillColor,
      terrainWaterDarkFillColor,
      terrainWaterFillColor,
      terrainWaterUnknownFillColor,
      ui,
    ],
  )

  const edgeFields = useMemo(
    () => [
      {
        label: ui.surface.landInnerEdge,
        pickerKey: 'terrain:land-edge',
        color: landEdgeColor,
        onApplyColor: setLandEdgeColor,
        width: landEdgeWidth,
        onApplyWidth: (value: string) => setLandEdgeWidth(sanitizeFloatValue(value, landEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.waterInnerEdge,
        pickerKey: 'terrain:water-edge',
        color: waterEdgeColor,
        onApplyColor: setWaterEdgeColor,
        width: waterEdgeWidth,
        onApplyWidth: (value: string) => setWaterEdgeWidth(sanitizeFloatValue(value, waterEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.darkWaterInnerEdge,
        pickerKey: 'terrain:dark-water-edge',
        color: darkWaterEdgeColor,
        onApplyColor: setDarkWaterEdgeColor,
        width: darkWaterEdgeWidth,
        onApplyWidth: (value: string) => setDarkWaterEdgeWidth(sanitizeFloatValue(value, darkWaterEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.snowInnerEdge,
        pickerKey: 'terrain:snow-edge',
        color: snowEdgeColor,
        onApplyColor: setSnowEdgeColor,
        width: snowEdgeWidth,
        onApplyWidth: (value: string) => setSnowEdgeWidth(sanitizeFloatValue(value, snowEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.coastEdge,
        pickerKey: 'terrain:coast-edge',
        color: coastEdgeColor,
        onApplyColor: setCoastEdgeColor,
        width: coastEdgeWidth,
        onApplyWidth: (value: string) => setCoastEdgeWidth(sanitizeFloatValue(value, coastEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.snowBoundaryEdge,
        pickerKey: 'terrain:snow-boundary-edge',
        color: snowBoundaryEdgeColor,
        onApplyColor: setSnowBoundaryEdgeColor,
        width: snowBoundaryEdgeWidth,
        onApplyWidth: (value: string) =>
          setSnowBoundaryEdgeWidth(sanitizeFloatValue(value, snowBoundaryEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.landEmptyEdge,
        pickerKey: 'terrain:land-empty-edge',
        color: landEmptyEdgeColor,
        onApplyColor: setLandEmptyEdgeColor,
        width: landEmptyEdgeWidth,
        onApplyWidth: (value: string) => setLandEmptyEdgeWidth(sanitizeFloatValue(value, landEmptyEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
      {
        label: ui.surface.waterEmptyEdge,
        pickerKey: 'terrain:water-empty-edge',
        color: waterEmptyEdgeColor,
        onApplyColor: setWaterEmptyEdgeColor,
        width: waterEmptyEdgeWidth,
        onApplyWidth: (value: string) => setWaterEmptyEdgeWidth(sanitizeFloatValue(value, waterEmptyEdgeWidth, 0, SURFACE_EDGE_INPUT_MAX)),
      },
    ],
    [
      coastEdgeColor,
      coastEdgeWidth,
      darkWaterEdgeColor,
      darkWaterEdgeWidth,
      landEdgeColor,
      landEdgeWidth,
      landEmptyEdgeColor,
      landEmptyEdgeWidth,
      snowBoundaryEdgeColor,
      snowBoundaryEdgeWidth,
      snowEdgeColor,
      snowEdgeWidth,
      ui,
      waterEdgeColor,
      waterEdgeWidth,
      waterEmptyEdgeColor,
      waterEmptyEdgeWidth,
    ],
  )

  return (
    <SurfaceModePanel
      isTerrainDisplayExpanded={isTerrainDisplayExpanded}
      onToggleTerrainDisplay={() => {
        setIsTerrainDisplayExpanded((current) => !current)
      }}
      terrainDisplayMode={terrainDisplayMode}
      onSetTerrainDisplayMode={setTerrainDisplayMode}
      showEmptySurface={showEmptySurface}
      onSetShowEmptySurface={setShowEmptySurface}
      showSnowOverride={showSnowOverride}
      onSetShowSnowOverride={setShowSnowOverride}
      showLandEmptyEdges={showLandEmptyEdges}
      onSetShowLandEmptyEdges={setShowLandEmptyEdges}
      showWaterEmptyEdges={showWaterEmptyEdges}
      onSetShowWaterEmptyEdges={setShowWaterEmptyEdges}
      isTerrainPaintExpanded={isTerrainPaintExpanded}
      onToggleTerrainPaint={() => {
        setIsTerrainPaintExpanded((current) => !current)
      }}
      terrainPaintMode={terrainPaintMode}
      onSelectTerrainPaintMode={(mode, radiusIndex) => {
        setTerrainPaintMode(mode)
        if (typeof radiusIndex === 'number') {
          setBrushRadius(radiusIndex)
        }
      }}
      terrainBrushKind={terrainBrushKind}
      onSelectTerrainBrushKind={(kind) => {
        setTerrainBrushKind(kind)
        const range = getTerrainBrushElevationRange(kind)
        setTerrainBrushElevation((current) => clamp(current, range.min, range.max))
      }}
      terrainBrushElevationRange={terrainBrushElevationRange}
      terrainBrushElevation={terrainBrushElevation}
      terrainSnowLineElevation={terrainSnowLineElevation}
      terrainElevationMarks={terrainElevationMarks}
      getElevationMarkLeft={getElevationMarkLeft}
      onSetTerrainBrushElevationFromSlider={(value) => {
        setTerrainBrushElevation(
          clampSurfaceElevation(terrainBrushKind === 'land' ? 'land' : 'water', value),
        )
      }}
      onSetTerrainBrushElevationFromInput={(value) => {
        setTerrainBrushElevation(
          clampSurfaceElevation(
            terrainBrushKind === 'land' ? 'land' : 'water',
            sanitizeIntValue(
              value,
              terrainBrushElevation,
              terrainBrushElevationRange.min,
              terrainBrushElevationRange.max,
            ),
          ),
        )
      }}
      onSetTerrainBrushElevationZero={() => {
        setTerrainBrushElevation(
          clampSurfaceElevation(terrainBrushKind === 'land' ? 'land' : 'water', 0),
        )
      }}
      onSetTerrainBrushElevationSnow={() => {
        setTerrainBrushElevation(clampSurfaceElevation('land', terrainSnowLineElevation))
      }}
      surfaceBrushSummary={surfaceBrushSummary}
      isTerrainBaseStyleExpanded={isTerrainBaseStyleExpanded}
      onToggleTerrainBaseStyle={() => {
        setIsTerrainBaseStyleExpanded((current) => !current)
      }}
      colorFields={colorFields}
      edgeFields={edgeFields}
      edgeSliderMax={SURFACE_EDGE_SLIDER_MAX}
      edgeInputMax={SURFACE_EDGE_INPUT_MAX}
      isTerrainTopographyExpanded={isTerrainTopographyExpanded}
      onToggleTerrainTopography={() => {
        setIsTerrainTopographyExpanded((current) => !current)
      }}
      terrainLandAnchors={terrainLandAnchors}
      onSetTerrainLandAnchors={setTerrainLandAnchors}
      terrainWaterAnchors={terrainWaterAnchors}
      onSetTerrainWaterAnchors={setTerrainWaterAnchors}
      terrainSnowColor={terrainSnowColor}
      onSetTerrainSnow={({ elevation, color }) => {
        setTerrainSnowLineElevation(elevation)
        setTerrainSnowColor(color)
      }}
    />
  )
}
