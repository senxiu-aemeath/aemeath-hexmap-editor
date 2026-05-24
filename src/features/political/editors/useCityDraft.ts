import { useState } from 'react'

export function useCityDraft() {
  const [isCityEditorOpen, setIsCityEditorOpen] = useState(false)
  const [editingCityId, setEditingCityId] = useState<string | null>(null)
  const [pendingCityCellId, setPendingCityCellId] = useState<string | null>(null)
  const [cityDraftName, setCityDraftName] = useState('')
  const [cityDraftSecondName, setCityDraftSecondName] = useState('')
  const [cityDraftCountryId, setCityDraftCountryId] = useState('unassigned')
  const [cityDraftLevelId, setCityDraftLevelId] = useState('')
  const [cityDraftDescription, setCityDraftDescription] = useState('')
  const [cityAssignedLabelDrafts, setCityAssignedLabelDrafts] = useState<Record<string, boolean>>({})

  return {
    isCityEditorOpen, setIsCityEditorOpen,
    editingCityId, setEditingCityId,
    pendingCityCellId, setPendingCityCellId,
    cityDraftName, setCityDraftName,
    cityDraftSecondName, setCityDraftSecondName,
    cityDraftCountryId, setCityDraftCountryId,
    cityDraftLevelId, setCityDraftLevelId,
    cityDraftDescription, setCityDraftDescription,
    cityAssignedLabelDrafts, setCityAssignedLabelDrafts,
  }
}

export type CityDraft = ReturnType<typeof useCityDraft>
