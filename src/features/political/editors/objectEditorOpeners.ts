import type { Dispatch, SetStateAction } from 'react'

import type { City, Country, GovernmentType, Province } from '../../../domain/world'
import { deriveCountryPaletteFromFill } from '../countryPalette'

export function openCountryEditor(
  country: Country,
  setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCountryId: Dispatch<SetStateAction<string | null>>,
  setCountryDraftName: Dispatch<SetStateAction<string>>,
  setCountryDraftSecondName: Dispatch<SetStateAction<string>>,
  setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>,
  setCountryDraftColor: Dispatch<SetStateAction<string>>,
  setCountryDraftBorderColor: Dispatch<SetStateAction<string>>,
  setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>,
  setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>,
  setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>,
  setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>,
  setCountryDraftDescription: Dispatch<SetStateAction<string>>,
  setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  setIsCountryEditorOpen(true)
  setEditingCountryId(country.id)
  setCountryDraftName(country.name)
  setCountryDraftSecondName(country.secondName ?? '')
  setCountryDraftIconKey(country.iconKey ?? null)
  setCountryDraftColor(country.color)
  setCountryDraftBorderColor(country.borderColor ?? country.color)
  setCountryDraftProvinceDefaultColor(
    country.provinceDefaultColor ?? deriveCountryPaletteFromFill(country.color).provinceDefaultColor,
  )
  setCountryDraftProvinceBorderColor(
    country.provinceBorderColor ?? country.borderColor ?? country.color,
  )
  setCountryDraftGovernmentTypeId(country.governmentTypeId ?? 'none')
  setCountryDraftIsCityState(country.isCityState)
  setCountryDraftDescription(country.description ?? '')
  setCountryAssignedLabelDrafts({})
}

export function openGovernmentTypeEditor(
  governmentType: GovernmentType,
  setIsGovernmentTypeEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingGovernmentTypeId: Dispatch<SetStateAction<string | null>>,
  setGovernmentTypeDraftName: Dispatch<SetStateAction<string>>,
  setGovernmentTypeDraftColor: Dispatch<SetStateAction<string>>,
) {
  setIsGovernmentTypeEditorOpen(true)
  setEditingGovernmentTypeId(governmentType.id)
  setGovernmentTypeDraftName(governmentType.name)
  setGovernmentTypeDraftColor(governmentType.color)
}

export function openCityEditor(
  city: City,
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCityId: Dispatch<SetStateAction<string | null>>,
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>,
  setCityDraftName: Dispatch<SetStateAction<string>>,
  setCityDraftSecondName: Dispatch<SetStateAction<string>>,
  setCityDraftCountryId: Dispatch<SetStateAction<string>>,
  setCityDraftLevelId: Dispatch<SetStateAction<string>>,
  setCityDraftDescription: Dispatch<SetStateAction<string>>,
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>,
) {
  setIsCityEditorOpen(true)
  setEditingCityId(city.id)
  setPendingCityCellId(null)
  setCityDraftName(city.name)
  setCityDraftSecondName(city.secondName ?? '')
  setCityDraftCountryId(city.countryId ?? 'unassigned')
  setCityDraftLevelId(city.levelId)
  setCityDraftDescription(city.description ?? '')
  setCityAssignedLabelDrafts({})
}

export function openProvinceEditor(
  province: Province,
  setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingProvinceId: Dispatch<SetStateAction<string | null>>,
  setProvinceDraftName: Dispatch<SetStateAction<string>>,
  setProvinceDraftColor: Dispatch<SetStateAction<string>>,
  setProvinceDraftCountryId: Dispatch<SetStateAction<string>>,
  setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>,
  setProvinceDraftDescription: Dispatch<SetStateAction<string>>,
  setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>,
  resetAssignedLabelDrafts: boolean,
) {
  setIsProvinceEditorOpen(true)
  setEditingProvinceId(province.id)
  setProvinceDraftName(province.name)
  setProvinceDraftColor(province.color)
  setProvinceDraftCountryId(province.countryId ?? 'unassigned')
  setProvinceDraftCapitalCityId(province.capitalCityId ?? 'none')
  setProvinceDraftDescription(province.description ?? '')
  if (resetAssignedLabelDrafts) {
    setProvinceAssignedLabelDrafts({})
  }
}
