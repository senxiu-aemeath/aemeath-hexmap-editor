import { useState } from 'react'

export function useCityLevelDraft() {
  const [isCityLevelEditorOpen, setIsCityLevelEditorOpen] = useState(false)
  const [editingCityLevelId, setEditingCityLevelId] = useState<string | null>(null)
  const [cityLevelDraftName, setCityLevelDraftName] = useState('')
  const [cityLevelDraftRank, setCityLevelDraftRank] = useState(1)
  const [cityLevelDraftIconKey, setCityLevelDraftIconKey] = useState('')
  const [cityLevelDraftIconScalePercent, setCityLevelDraftIconScalePercent] = useState(100)
  const [cityLevelDraftUniquePerCountry, setCityLevelDraftUniquePerCountry] = useState(false)
  const [cityLevelDraftDisplayInCountryInfo, setCityLevelDraftDisplayInCountryInfo] = useState(false)

  return {
    isCityLevelEditorOpen, setIsCityLevelEditorOpen,
    editingCityLevelId, setEditingCityLevelId,
    cityLevelDraftName, setCityLevelDraftName,
    cityLevelDraftRank, setCityLevelDraftRank,
    cityLevelDraftIconKey, setCityLevelDraftIconKey,
    cityLevelDraftIconScalePercent, setCityLevelDraftIconScalePercent,
    cityLevelDraftUniquePerCountry, setCityLevelDraftUniquePerCountry,
    cityLevelDraftDisplayInCountryInfo, setCityLevelDraftDisplayInCountryInfo,
  }
}

export type CityLevelDraft = ReturnType<typeof useCityLevelDraft>
