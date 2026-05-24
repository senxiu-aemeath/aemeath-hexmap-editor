import { useState } from 'react'

import type { TerrainBrushKind, TerrainDisplayMode, TerrainPaintMode } from '../../components/surface/terrainBrush'

export function useTerrainBrush() {
  const [terrainBrushKind, setTerrainBrushKind] = useState<TerrainBrushKind>('land')
  const [terrainBrushElevation, setTerrainBrushElevation] = useState(0)
  const [terrainPaintMode, setTerrainPaintMode] = useState<TerrainPaintMode>('radius_0')
  const [terrainDisplayMode, setTerrainDisplayMode] = useState<TerrainDisplayMode>('surface')
  const [brushRadius, setBrushRadius] = useState(0)

  return {
    terrainBrushKind, setTerrainBrushKind,
    terrainBrushElevation, setTerrainBrushElevation,
    terrainPaintMode, setTerrainPaintMode,
    terrainDisplayMode, setTerrainDisplayMode,
    brushRadius, setBrushRadius,
  }
}

export type TerrainBrushState = ReturnType<typeof useTerrainBrush>
