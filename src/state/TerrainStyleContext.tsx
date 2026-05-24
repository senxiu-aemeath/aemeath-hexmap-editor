import { createContext, useContext } from 'react'
import type { TerrainColorAnchor } from '../components/TerrainAnchorField'

export interface TerrainStyleContextValue {
  terrainLandFillColor: string
  setTerrainLandFillColor: React.Dispatch<React.SetStateAction<string>>
  terrainWaterFillColor: string
  setTerrainWaterFillColor: React.Dispatch<React.SetStateAction<string>>
  terrainLandAnchors: TerrainColorAnchor[]
  setTerrainLandAnchors: React.Dispatch<React.SetStateAction<TerrainColorAnchor[]>>
  terrainWaterAnchors: TerrainColorAnchor[]
  setTerrainWaterAnchors: React.Dispatch<React.SetStateAction<TerrainColorAnchor[]>>
  terrainSnowLineElevation: number
  setTerrainSnowLineElevation: React.Dispatch<React.SetStateAction<number>>
  terrainSnowColor: string
  setTerrainSnowColor: React.Dispatch<React.SetStateAction<string>>
  showSnowOverride: boolean
  setShowSnowOverride: React.Dispatch<React.SetStateAction<boolean>>
  terrainEmptyFillColor: string
  setTerrainEmptyFillColor: React.Dispatch<React.SetStateAction<string>>
  terrainLandUnknownFillColor: string
  setTerrainLandUnknownFillColor: React.Dispatch<React.SetStateAction<string>>
  terrainWaterUnknownFillColor: string
  setTerrainWaterUnknownFillColor: React.Dispatch<React.SetStateAction<string>>
  terrainWaterDarkFillColor: string
  setTerrainWaterDarkFillColor: React.Dispatch<React.SetStateAction<string>>
  landEdgeColor: string
  setLandEdgeColor: React.Dispatch<React.SetStateAction<string>>
  landEdgeWidth: number
  setLandEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  landEmptyEdgeColor: string
  setLandEmptyEdgeColor: React.Dispatch<React.SetStateAction<string>>
  landEmptyEdgeWidth: number
  setLandEmptyEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  coastEdgeColor: string
  setCoastEdgeColor: React.Dispatch<React.SetStateAction<string>>
  coastEdgeWidth: number
  setCoastEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  waterEdgeColor: string
  setWaterEdgeColor: React.Dispatch<React.SetStateAction<string>>
  waterEdgeWidth: number
  setWaterEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  waterEmptyEdgeColor: string
  setWaterEmptyEdgeColor: React.Dispatch<React.SetStateAction<string>>
  waterEmptyEdgeWidth: number
  setWaterEmptyEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  darkWaterEdgeColor: string
  setDarkWaterEdgeColor: React.Dispatch<React.SetStateAction<string>>
  darkWaterEdgeWidth: number
  setDarkWaterEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  snowEdgeColor: string
  setSnowEdgeColor: React.Dispatch<React.SetStateAction<string>>
  snowEdgeWidth: number
  setSnowEdgeWidth: React.Dispatch<React.SetStateAction<number>>
  snowBoundaryEdgeColor: string
  setSnowBoundaryEdgeColor: React.Dispatch<React.SetStateAction<string>>
  snowBoundaryEdgeWidth: number
  setSnowBoundaryEdgeWidth: React.Dispatch<React.SetStateAction<number>>
}

export const TerrainStyleContext = createContext<TerrainStyleContextValue | null>(null)

export function useTerrainStyleContext() {
  const ctx = useContext(TerrainStyleContext)
  if (!ctx) throw new Error('useTerrainStyleContext must be used within TerrainStyleContext.Provider')
  return ctx
}
