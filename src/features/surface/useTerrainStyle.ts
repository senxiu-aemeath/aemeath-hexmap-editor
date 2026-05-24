import { useState } from 'react'

import type { TerrainColorAnchor } from '../../components/TerrainAnchorField'

const DEFAULT_TERRAIN_LAND_ANCHORS: TerrainColorAnchor[] = [
  { elevation: -5, color: '#7ea35b' },
  { elevation: 10, color: '#c5b26f' },
  { elevation: 20, color: '#8b694e' },
]
const DEFAULT_TERRAIN_WATER_ANCHORS: TerrainColorAnchor[] = [
  { elevation: -10, color: '#0b1833' },
  { elevation: 0, color: '#86c5da' },
]

export function useTerrainStyle() {
  // Fill colors
  const [terrainLandFillColor, setTerrainLandFillColor] = useState('#7ea35b')
  const [terrainWaterFillColor, setTerrainWaterFillColor] = useState('#4a97c2')
  const [terrainLandAnchors, setTerrainLandAnchors] = useState<TerrainColorAnchor[]>(DEFAULT_TERRAIN_LAND_ANCHORS)
  const [terrainWaterAnchors, setTerrainWaterAnchors] = useState<TerrainColorAnchor[]>(DEFAULT_TERRAIN_WATER_ANCHORS)
  const [terrainSnowLineElevation, setTerrainSnowLineElevation] = useState(16)
  const [terrainSnowColor, setTerrainSnowColor] = useState('#f3f1eb')
  const [showSnowOverride, setShowSnowOverride] = useState(true)
  const [terrainEmptyFillColor, setTerrainEmptyFillColor] = useState('#5a4b42')
  const [terrainLandUnknownFillColor, setTerrainLandUnknownFillColor] = useState('#8c846f')
  const [terrainWaterUnknownFillColor, setTerrainWaterUnknownFillColor] = useState('#56758a')
  const [terrainWaterDarkFillColor, setTerrainWaterDarkFillColor] = useState('#16283d')

  // Edge colors and widths
  const [landEdgeColor, setLandEdgeColor] = useState('#8f8163')
  const [landEdgeWidth, setLandEdgeWidth] = useState(1.6)
  const [landEmptyEdgeColor, setLandEmptyEdgeColor] = useState('#8f8163')
  const [landEmptyEdgeWidth, setLandEmptyEdgeWidth] = useState(1.6)
  const [coastEdgeColor, setCoastEdgeColor] = useState('#d9c67f')
  const [coastEdgeWidth, setCoastEdgeWidth] = useState(2.2)
  const [waterEdgeColor, setWaterEdgeColor] = useState('#4f7aa3')
  const [waterEdgeWidth, setWaterEdgeWidth] = useState(1.4)
  const [waterEmptyEdgeColor, setWaterEmptyEdgeColor] = useState('#4f7aa3')
  const [waterEmptyEdgeWidth, setWaterEmptyEdgeWidth] = useState(1.4)
  const [darkWaterEdgeColor, setDarkWaterEdgeColor] = useState('#29435d')
  const [darkWaterEdgeWidth, setDarkWaterEdgeWidth] = useState(1.4)
  const [snowEdgeColor, setSnowEdgeColor] = useState('#d7d9dd')
  const [snowEdgeWidth, setSnowEdgeWidth] = useState(1.0)
  const [snowBoundaryEdgeColor, setSnowBoundaryEdgeColor] = useState('#ece8df')
  const [snowBoundaryEdgeWidth, setSnowBoundaryEdgeWidth] = useState(1.4)

  return {
    terrainLandFillColor, setTerrainLandFillColor,
    terrainWaterFillColor, setTerrainWaterFillColor,
    terrainLandAnchors, setTerrainLandAnchors,
    terrainWaterAnchors, setTerrainWaterAnchors,
    terrainSnowLineElevation, setTerrainSnowLineElevation,
    terrainSnowColor, setTerrainSnowColor,
    showSnowOverride, setShowSnowOverride,
    terrainEmptyFillColor, setTerrainEmptyFillColor,
    terrainLandUnknownFillColor, setTerrainLandUnknownFillColor,
    terrainWaterUnknownFillColor, setTerrainWaterUnknownFillColor,
    terrainWaterDarkFillColor, setTerrainWaterDarkFillColor,
    landEdgeColor, setLandEdgeColor,
    landEdgeWidth, setLandEdgeWidth,
    landEmptyEdgeColor, setLandEmptyEdgeColor,
    landEmptyEdgeWidth, setLandEmptyEdgeWidth,
    coastEdgeColor, setCoastEdgeColor,
    coastEdgeWidth, setCoastEdgeWidth,
    waterEdgeColor, setWaterEdgeColor,
    waterEdgeWidth, setWaterEdgeWidth,
    waterEmptyEdgeColor, setWaterEmptyEdgeColor,
    waterEmptyEdgeWidth, setWaterEmptyEdgeWidth,
    darkWaterEdgeColor, setDarkWaterEdgeColor,
    darkWaterEdgeWidth, setDarkWaterEdgeWidth,
    snowEdgeColor, setSnowEdgeColor,
    snowEdgeWidth, setSnowEdgeWidth,
    snowBoundaryEdgeColor, setSnowBoundaryEdgeColor,
    snowBoundaryEdgeWidth, setSnowBoundaryEdgeWidth,
    DEFAULT_TERRAIN_LAND_ANCHORS,
    DEFAULT_TERRAIN_WATER_ANCHORS,
  }
}

export type TerrainStyleState = ReturnType<typeof useTerrainStyle>
