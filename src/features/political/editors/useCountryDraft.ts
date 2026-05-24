import { useState } from 'react'

import { deriveCountryPaletteFromFill } from '../countryPalette'

const DEFAULT_COUNTRY_COLOR = '#d86f45'
const DEFAULT_COUNTRY_PALETTE = deriveCountryPaletteFromFill(DEFAULT_COUNTRY_COLOR)

export function useCountryDraft() {
  const [isCountryEditorOpen, setIsCountryEditorOpen] = useState(false)
  const [editingCountryId, setEditingCountryId] = useState<string | null>(null)
  const [countryDraftName, setCountryDraftName] = useState('')
  const [countryDraftSecondName, setCountryDraftSecondName] = useState('')
  const [countryDraftIconKey, setCountryDraftIconKey] = useState<string | null>(null)
  const [countryDraftColor, setCountryDraftColor] = useState(DEFAULT_COUNTRY_COLOR)
  const [countryDraftBorderColor, setCountryDraftBorderColor] = useState(DEFAULT_COUNTRY_PALETTE.borderColor)
  const [countryDraftProvinceDefaultColor, setCountryDraftProvinceDefaultColor] =
    useState(DEFAULT_COUNTRY_PALETTE.provinceDefaultColor)
  const [countryDraftProvinceBorderColor, setCountryDraftProvinceBorderColor] =
    useState(DEFAULT_COUNTRY_PALETTE.provinceBorderColor)
  const [countryDraftGovernmentTypeId, setCountryDraftGovernmentTypeId] = useState('none')
  const [countryDraftIsCityState, setCountryDraftIsCityState] = useState(false)
  const [countryDraftDescription, setCountryDraftDescription] = useState('')
  const [countryAssignedLabelDrafts, setCountryAssignedLabelDrafts] = useState<Record<string, boolean>>({})
  const [countryPreviewColor, setCountryPreviewColor] = useState<string | null>(null)
  const [countryPreviewBorderColor, setCountryPreviewBorderColor] = useState<string | null>(null)
  const [countryPreviewProvinceBorderColor, setCountryPreviewProvinceBorderColor] = useState<string | null>(null)

  return {
    isCountryEditorOpen, setIsCountryEditorOpen,
    editingCountryId, setEditingCountryId,
    countryDraftName, setCountryDraftName,
    countryDraftSecondName, setCountryDraftSecondName,
    countryDraftIconKey, setCountryDraftIconKey,
    countryDraftColor, setCountryDraftColor,
    countryDraftBorderColor, setCountryDraftBorderColor,
    countryDraftProvinceDefaultColor, setCountryDraftProvinceDefaultColor,
    countryDraftProvinceBorderColor, setCountryDraftProvinceBorderColor,
    countryDraftGovernmentTypeId, setCountryDraftGovernmentTypeId,
    countryDraftIsCityState, setCountryDraftIsCityState,
    countryDraftDescription, setCountryDraftDescription,
    countryAssignedLabelDrafts, setCountryAssignedLabelDrafts,
    countryPreviewColor, setCountryPreviewColor,
    countryPreviewBorderColor, setCountryPreviewBorderColor,
    countryPreviewProvinceBorderColor, setCountryPreviewProvinceBorderColor,
    defaultCountryDraftColor: DEFAULT_COUNTRY_COLOR,
    defaultCountryDraftPalette: DEFAULT_COUNTRY_PALETTE,
  }
}

export type CountryDraft = ReturnType<typeof useCountryDraft>
