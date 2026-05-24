import type { Dispatch, SetStateAction } from 'react'

import type { Country, LabelGroupAssignment, Submap } from '../../domain/world'
import { deriveCountryPaletteFromFill } from './countryPalette'
import type { AppMessages } from '../../i18n'
import { getAssignedLabelDrafts } from '../labels/labelHelpers'

export function pickNextColor(countries: Country[]) {
  const palette = ['#d86f45', '#4b86b4', '#7ba05b', '#b85d80', '#c79a34', '#5a8b7a']

  return palette[countries.length % palette.length]
}

export function getNextSubmapName(submaps: Submap[], ui: AppMessages) {
  let index = submaps.length + 1
  let candidate = ui.generated.newSubmap(index)

  while (submaps.some((submap) => submap.name === candidate)) {
    index += 1
    candidate = ui.generated.newSubmap(index)
  }

  return candidate
}

export function applyCountryDraftDerivedColorsState(args: {
  fillColor: string
  setCountryDraftBorderColor: Dispatch<SetStateAction<string>>
  setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>
  setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>
}) {
  const palette = deriveCountryPaletteFromFill(args.fillColor)
  args.setCountryDraftBorderColor(palette.borderColor)
  args.setCountryDraftProvinceDefaultColor(palette.provinceDefaultColor)
  args.setCountryDraftProvinceBorderColor(palette.provinceBorderColor)
  return palette
}

export function getCountryProvinceDefaultColorValue(args: {
  countriesById: Record<string, Country>
  countryId: string | null
  defaultProvinceDefaultColor: string
}) {
  if (!args.countryId) {
    return args.defaultProvinceDefaultColor
  }
  const country = args.countriesById[args.countryId]
  if (!country) {
    return args.defaultProvinceDefaultColor
  }
  return (
    country.provinceDefaultColor ??
    deriveCountryPaletteFromFill(country.color).provinceDefaultColor
  )
}

export function beginCreateCountryState(args: {
  applyCountryDraftDerivedColors: (fillColor: string) => unknown
  closeObjectEditors: () => void
  countries: Country[]
  countryAssignedLabelGroups: Array<{
    id: string
    assignment: LabelGroupAssignment | null
  }>
  setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setCountryDraftColor: Dispatch<SetStateAction<string>>
  setCountryDraftDescription: Dispatch<SetStateAction<string>>
  setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>
  setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>
  setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>
  setCountryDraftName: Dispatch<SetStateAction<string>>
  setCountryDraftSecondName: Dispatch<SetStateAction<string>>
  setEditingCountryId: Dispatch<SetStateAction<string | null>>
  setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>
  ui: AppMessages
}) {
  args.closeObjectEditors()
  args.setIsCountryEditorOpen(true)
  args.setEditingCountryId(null)
  const nextColor = pickNextColor(args.countries)
  args.setCountryDraftName(args.ui.generated.newCountry(args.countries.length + 1))
  args.setCountryDraftSecondName('')
  args.setCountryDraftIconKey(null)
  args.setCountryDraftColor(nextColor)
  args.applyCountryDraftDerivedColors(nextColor)
  args.setCountryDraftGovernmentTypeId('none')
  args.setCountryDraftIsCityState(false)
  args.setCountryDraftDescription('')
  args.setCountryAssignedLabelDrafts(
    getAssignedLabelDrafts(args.countryAssignedLabelGroups),
  )
}

export function beginCreateProvinceState(args: {
  closeObjectEditors: () => void
  getCountryProvinceDefaultColor: (countryId: string | null) => string
  provinceAssignedLabelGroups: Array<{
    id: string
    assignment: LabelGroupAssignment | null
  }>
  provinceChooserCountryId: string | null
  provincesLength: number
  setEditingProvinceId: Dispatch<SetStateAction<string | null>>
  setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>
  setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>
  setProvinceDraftColor: Dispatch<SetStateAction<string>>
  setProvinceDraftCountryId: Dispatch<SetStateAction<string>>
  setProvinceDraftDescription: Dispatch<SetStateAction<string>>
  setProvinceDraftName: Dispatch<SetStateAction<string>>
  ui: AppMessages
}) {
  args.closeObjectEditors()
  args.setIsProvinceEditorOpen(true)
  args.setEditingProvinceId(null)
  args.setProvinceDraftName(args.ui.generated.newProvince(args.provincesLength + 1))
  const nextCountryId = args.provinceChooserCountryId
  args.setProvinceDraftColor(args.getCountryProvinceDefaultColor(nextCountryId))
  args.setProvinceDraftCountryId(nextCountryId ?? 'unassigned')
  args.setProvinceDraftCapitalCityId('none')
  args.setProvinceDraftDescription('')
  args.setProvinceAssignedLabelDrafts(
    getAssignedLabelDrafts(args.provinceAssignedLabelGroups),
  )
}
