import { useState } from 'react'

export function useProvinceDraft() {
  const [isProvinceEditorOpen, setIsProvinceEditorOpen] = useState(false)
  const [editingProvinceId, setEditingProvinceId] = useState<string | null>(null)
  const [provinceDraftName, setProvinceDraftName] = useState('')
  const [provinceDraftColor, setProvinceDraftColor] = useState('#a86a4f')
  const [provincePreviewColor, setProvincePreviewColor] = useState<string | null>(null)
  const [provinceDraftCountryId, setProvinceDraftCountryId] = useState('unassigned')
  const [provinceDraftCapitalCityId, setProvinceDraftCapitalCityId] = useState('none')
  const [provinceDraftDescription, setProvinceDraftDescription] = useState('')
  const [provinceAssignedLabelDrafts, setProvinceAssignedLabelDrafts] = useState<Record<string, boolean>>({})

  return {
    isProvinceEditorOpen, setIsProvinceEditorOpen,
    editingProvinceId, setEditingProvinceId,
    provinceDraftName, setProvinceDraftName,
    provinceDraftColor, setProvinceDraftColor,
    provincePreviewColor, setProvincePreviewColor,
    provinceDraftCountryId, setProvinceDraftCountryId,
    provinceDraftCapitalCityId, setProvinceDraftCapitalCityId,
    provinceDraftDescription, setProvinceDraftDescription,
    provinceAssignedLabelDrafts, setProvinceAssignedLabelDrafts,
  }
}

export type ProvinceDraft = ReturnType<typeof useProvinceDraft>
