import { useState } from 'react'

export function useGovernmentTypeDraft() {
  const [isGovernmentTypeEditorOpen, setIsGovernmentTypeEditorOpen] = useState(false)
  const [editingGovernmentTypeId, setEditingGovernmentTypeId] = useState<string | null>(null)
  const [governmentTypeDraftName, setGovernmentTypeDraftName] = useState('')
  const [governmentTypeDraftColor, setGovernmentTypeDraftColor] = useState('#c79a34')
  const [governmentTypePreviewColor, setGovernmentTypePreviewColor] = useState<string | null>(null)

  return {
    isGovernmentTypeEditorOpen, setIsGovernmentTypeEditorOpen,
    editingGovernmentTypeId, setEditingGovernmentTypeId,
    governmentTypeDraftName, setGovernmentTypeDraftName,
    governmentTypeDraftColor, setGovernmentTypeDraftColor,
    governmentTypePreviewColor, setGovernmentTypePreviewColor,
  }
}

export type GovernmentTypeDraft = ReturnType<typeof useGovernmentTypeDraft>
