import { createContext, useContext } from 'react'
import type { TerrainBrushKind, TerrainDisplayMode, TerrainPaintMode } from '../components/surface/terrainBrush'

export interface TerrainBrushContextValue {
  terrainBrushKind: TerrainBrushKind
  setTerrainBrushKind: React.Dispatch<React.SetStateAction<TerrainBrushKind>>
  terrainBrushElevation: number
  setTerrainBrushElevation: React.Dispatch<React.SetStateAction<number>>
  terrainPaintMode: TerrainPaintMode
  setTerrainPaintMode: React.Dispatch<React.SetStateAction<TerrainPaintMode>>
  terrainDisplayMode: TerrainDisplayMode
  setTerrainDisplayMode: React.Dispatch<React.SetStateAction<TerrainDisplayMode>>
  brushRadius: number
  setBrushRadius: React.Dispatch<React.SetStateAction<number>>
}

export const TerrainBrushContext = createContext<TerrainBrushContextValue | null>(null)

export function useTerrainBrushContext() {
  const ctx = useContext(TerrainBrushContext)
  if (!ctx) throw new Error('useTerrainBrushContext must be used within TerrainBrushContext.Provider')
  return ctx
}
