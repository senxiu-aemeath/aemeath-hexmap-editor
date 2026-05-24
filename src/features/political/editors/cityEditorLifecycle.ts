import type { Dispatch, SetStateAction } from 'react'

import type { City, CityLevel } from '../../../domain/world'
import type { AppMessages } from '../../../i18n'

interface UseCityEditorLifecycleControllerArgs {
  actions: {
    setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingCityId: Dispatch<SetStateAction<string | null>>
    setPendingCityCellId: Dispatch<SetStateAction<string | null>>
    setCityDraftName: Dispatch<SetStateAction<string>>
    setCityDraftSecondName: Dispatch<SetStateAction<string>>
    setCityDraftCountryId: Dispatch<SetStateAction<string>>
    setCityDraftLevelId: Dispatch<SetStateAction<string>>
    setCityDraftDescription: Dispatch<SetStateAction<string>>
    setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingCityLevelId: Dispatch<SetStateAction<string | null>>
    setCityLevelDraftName: Dispatch<SetStateAction<string>>
    setCityLevelDraftRank: Dispatch<SetStateAction<number>>
    setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>
    setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>
    setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>
    setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>
  }
}

export function closeCityEditor(
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
  setIsCityEditorOpen(false)
  setEditingCityId(null)
  setPendingCityCellId(null)
  setCityDraftName('')
  setCityDraftSecondName('')
  setCityDraftCountryId('unassigned')
  setCityDraftLevelId('')
  setCityDraftDescription('')
  setCityAssignedLabelDrafts({})
}

export function openCityLevelEditor(
  cityLevel: CityLevel,
  setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCityLevelId: Dispatch<SetStateAction<string | null>>,
  setCityLevelDraftName: Dispatch<SetStateAction<string>>,
  setCityLevelDraftRank: Dispatch<SetStateAction<number>>,
  setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>,
  setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>,
  setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>,
  setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>,
) {
  setIsCityLevelEditorOpen(true)
  setEditingCityLevelId(cityLevel.id)
  setCityLevelDraftName(cityLevel.name)
  setCityLevelDraftRank(cityLevel.rank)
  setCityLevelDraftIconKey(cityLevel.iconKey)
  setCityLevelDraftIconScalePercent(cityLevel.iconScalePercent)
  setCityLevelDraftUniquePerCountry(cityLevel.uniquePerCountry)
  setCityLevelDraftDisplayInCountryInfo(cityLevel.displayInCountryInfo)
}

export function closeCityLevelEditor(
  setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCityLevelId: Dispatch<SetStateAction<string | null>>,
  setCityLevelDraftName: Dispatch<SetStateAction<string>>,
  setCityLevelDraftRank: Dispatch<SetStateAction<number>>,
  setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>,
  setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>,
  setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>,
  setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>,
) {
  setIsCityLevelEditorOpen(false)
  setEditingCityLevelId(null)
  setCityLevelDraftName('')
  setCityLevelDraftRank(1)
  setCityLevelDraftIconKey('')
  setCityLevelDraftIconScalePercent(100)
  setCityLevelDraftUniquePerCountry(false)
  setCityLevelDraftDisplayInCountryInfo(false)
}

export function getNextCityName(levelName: string, cities: City[], ui: AppMessages) {
  const prefix = ui.generated.newCity(levelName)
  const duplicates = cities.filter((city) => city.name.startsWith(prefix)).length
  return duplicates === 0 ? prefix : ui.generated.newCityIndexed(levelName, duplicates + 1)
}

export function useCityEditorLifecycleController({
  actions,
}: UseCityEditorLifecycleControllerArgs) {
  const {
    setIsCityEditorOpen,
    setEditingCityId,
    setPendingCityCellId,
    setCityDraftName,
    setCityDraftSecondName,
    setCityDraftCountryId,
    setCityDraftLevelId,
    setCityDraftDescription,
    setCityAssignedLabelDrafts,
    setIsCityLevelEditorOpen,
    setEditingCityLevelId,
    setCityLevelDraftName,
    setCityLevelDraftRank,
    setCityLevelDraftIconKey,
    setCityLevelDraftIconScalePercent,
    setCityLevelDraftUniquePerCountry,
    setCityLevelDraftDisplayInCountryInfo,
  } = actions

  const handleCloseCityEditor = () => {
    closeCityEditor(
      setIsCityEditorOpen,
      setEditingCityId,
      setPendingCityCellId,
      setCityDraftName,
      setCityDraftSecondName,
      setCityDraftCountryId,
      setCityDraftLevelId,
      setCityDraftDescription,
      setCityAssignedLabelDrafts,
    )
  }

  const handleCloseCityLevelEditor = () => {
    closeCityLevelEditor(
      setIsCityLevelEditorOpen,
      setEditingCityLevelId,
      setCityLevelDraftName,
      setCityLevelDraftRank,
      setCityLevelDraftIconKey,
      setCityLevelDraftIconScalePercent,
      setCityLevelDraftUniquePerCountry,
      setCityLevelDraftDisplayInCountryInfo,
    )
  }

  return {
    handleCloseCityEditor,
    handleCloseCityLevelEditor,
  }
}
