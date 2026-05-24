import { createContext, useContext } from 'react'

export interface RenderFlagsContextValue {
  showEmptySurface: boolean
  setShowEmptySurface: React.Dispatch<React.SetStateAction<boolean>>
  showLandEmptyEdges: boolean
  setShowLandEmptyEdges: React.Dispatch<React.SetStateAction<boolean>>
  showWaterEmptyEdges: boolean
  setShowWaterEmptyEdges: React.Dispatch<React.SetStateAction<boolean>>
  colorWaterInCountryLayer: boolean
  setColorWaterInCountryLayer: React.Dispatch<React.SetStateAction<boolean>>
}

export const RenderFlagsContext = createContext<RenderFlagsContextValue | null>(null)

export function useRenderFlagsContext() {
  const ctx = useContext(RenderFlagsContext)
  if (!ctx) throw new Error('useRenderFlagsContext must be used within RenderFlagsContext.Provider')
  return ctx
}
