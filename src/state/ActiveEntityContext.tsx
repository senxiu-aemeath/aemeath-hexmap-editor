import { createContext, useContext } from 'react'

export interface ActiveEntityContextValue {
  hoveredCellId: string | null
  setHoveredCellId: React.Dispatch<React.SetStateAction<string | null>>
  activeSubmapId: string | null
  setActiveSubmapId: React.Dispatch<React.SetStateAction<string | null>>
  isSubmapSelectionMode: boolean
  setIsSubmapSelectionMode: React.Dispatch<React.SetStateAction<boolean>>
  activeCountryId: string | null
  setActiveCountryId: React.Dispatch<React.SetStateAction<string | null>>
  activeProvinceId: string | null
  setActiveProvinceId: React.Dispatch<React.SetStateAction<string | null>>
  activeCityId: string | null
  setActiveCityId: React.Dispatch<React.SetStateAction<string | null>>
  activeLabelId: string | null
  setActiveLabelId: React.Dispatch<React.SetStateAction<string | null>>
  activeManagedLabelGroupId: string | null
  setActiveManagedLabelGroupId: React.Dispatch<React.SetStateAction<string | null>>
  activeCityLevelId: string | null
  setActiveCityLevelId: React.Dispatch<React.SetStateAction<string | null>>
  cityBrushLevelId: string | null
  setCityBrushLevelId: React.Dispatch<React.SetStateAction<string | null>>
  activeGovernmentTypeId: string | null
  setActiveGovernmentTypeId: React.Dispatch<React.SetStateAction<string | null>>
}

export const ActiveEntityContext = createContext<ActiveEntityContextValue | null>(null)

export function useActiveEntityContext() {
  const ctx = useContext(ActiveEntityContext)
  if (!ctx) throw new Error('useActiveEntityContext must be used within ActiveEntityContext.Provider')
  return ctx
}
