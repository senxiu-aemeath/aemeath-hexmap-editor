import { useState } from 'react'

export function useRenderFlags() {
  const [showEmptySurface, setShowEmptySurface] = useState(true)
  const [showLandEmptyEdges, setShowLandEmptyEdges] = useState(true)
  const [showWaterEmptyEdges, setShowWaterEmptyEdges] = useState(false)
  const [colorWaterInCountryLayer, setColorWaterInCountryLayer] = useState(false)

  return {
    showEmptySurface, setShowEmptySurface,
    showLandEmptyEdges, setShowLandEmptyEdges,
    showWaterEmptyEdges, setShowWaterEmptyEdges,
    colorWaterInCountryLayer, setColorWaterInCountryLayer,
  }
}
