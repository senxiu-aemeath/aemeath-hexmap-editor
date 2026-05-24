import { useState } from 'react'
import type {
  CityToolMode,
  CountryToolMode,
  PoliticalPaintMode,
  PoliticalSubMode,
  ProvinceToolMode,
} from '../../political/types'

export type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'

export function useEditorMode() {
  const [editorMode, setEditorMode] = useState<EditorMode>('political')
  const [politicalSubMode, setPoliticalSubMode] = useState<PoliticalSubMode>('country')
  const [countryToolMode, setCountryToolMode] = useState<CountryToolMode>('view')
  const [provinceToolMode, setProvinceToolMode] = useState<ProvinceToolMode>('view')
  const [politicalPaintMode, setPoliticalPaintMode] = useState<PoliticalPaintMode>('radius_0')
  const [restrictProvinceBrushToOwnerCountry, setRestrictProvinceBrushToOwnerCountry] = useState(true)
  const [cityToolMode, setCityToolMode] = useState<CityToolMode>('view')

  return {
    editorMode, setEditorMode,
    politicalSubMode, setPoliticalSubMode,
    countryToolMode, setCountryToolMode,
    provinceToolMode, setProvinceToolMode,
    politicalPaintMode, setPoliticalPaintMode,
    restrictProvinceBrushToOwnerCountry, setRestrictProvinceBrushToOwnerCountry,
    cityToolMode, setCityToolMode,
  }
}
