import { createContext, useContext } from 'react'
import type {
  CityToolMode,
  CountryToolMode,
  PoliticalPaintMode,
  PoliticalSubMode,
  ProvinceToolMode,
} from '../political/types'
import type { EditorMode } from '../features/workspace/useEditorMode'

export interface EditorModeContextValue {
  editorMode: EditorMode
  setEditorMode: React.Dispatch<React.SetStateAction<EditorMode>>
  politicalSubMode: PoliticalSubMode
  setPoliticalSubMode: React.Dispatch<React.SetStateAction<PoliticalSubMode>>
  countryToolMode: CountryToolMode
  setCountryToolMode: React.Dispatch<React.SetStateAction<CountryToolMode>>
  provinceToolMode: ProvinceToolMode
  setProvinceToolMode: React.Dispatch<React.SetStateAction<ProvinceToolMode>>
  politicalPaintMode: PoliticalPaintMode
  setPoliticalPaintMode: React.Dispatch<React.SetStateAction<PoliticalPaintMode>>
  restrictProvinceBrushToOwnerCountry: boolean
  setRestrictProvinceBrushToOwnerCountry: React.Dispatch<React.SetStateAction<boolean>>
  cityToolMode: CityToolMode
  setCityToolMode: React.Dispatch<React.SetStateAction<CityToolMode>>
}

export const EditorModeContext = createContext<EditorModeContextValue | null>(null)

export function useEditorModeContext() {
  const ctx = useContext(EditorModeContext)
  if (!ctx) throw new Error('useEditorModeContext must be used within EditorModeContext.Provider')
  return ctx
}
