import { createContext, useContext } from 'react'

export interface PoliticalStyleContextValue {
  cityStatesFillTerritory: boolean
  setCityStatesFillTerritory: React.Dispatch<React.SetStateAction<boolean>>
  countryFillOpacity: number
  setCountryFillOpacity: React.Dispatch<React.SetStateAction<number>>
  countryBorderColor: string
  setCountryBorderColor: React.Dispatch<React.SetStateAction<string>>
  countryBorderWidth: number
  setCountryBorderWidth: React.Dispatch<React.SetStateAction<number>>
  countryBorderOpacity: number
  setCountryBorderOpacity: React.Dispatch<React.SetStateAction<number>>
  countrySharedBorderOverridesOwn: boolean
  setCountrySharedBorderOverridesOwn: React.Dispatch<React.SetStateAction<boolean>>
  countrySharedBorderMode: 'uniform' | 'mixed'
  setCountrySharedBorderMode: React.Dispatch<React.SetStateAction<'uniform' | 'mixed'>>
  provinceFillOpacity: number
  setProvinceFillOpacity: React.Dispatch<React.SetStateAction<number>>
  provinceBorderColor: string
  setProvinceBorderColor: React.Dispatch<React.SetStateAction<string>>
  provinceBorderWidth: number
  setProvinceBorderWidth: React.Dispatch<React.SetStateAction<number>>
  provinceBorderOpacity: number
  setProvinceBorderOpacity: React.Dispatch<React.SetStateAction<number>>
  provinceBorderOverridesCountryBorder: boolean
  setProvinceBorderOverridesCountryBorder: React.Dispatch<React.SetStateAction<boolean>>
}

export const PoliticalStyleContext = createContext<PoliticalStyleContextValue | null>(null)

export function usePoliticalStyleContext() {
  const ctx = useContext(PoliticalStyleContext)
  if (!ctx) throw new Error('usePoliticalStyleContext must be used within PoliticalStyleContext.Provider')
  return ctx
}
