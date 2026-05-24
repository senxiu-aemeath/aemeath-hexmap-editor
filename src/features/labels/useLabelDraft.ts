import { useRef, useState } from 'react'

import type { LabelGroup } from '../../domain/world'

interface LabelEditorOpenSnapshot {
  label: import('../../domain/world').Label
  labelGroups: Record<string, LabelGroup>
}

export function useLabelDraft() {
  const [isLabelEditorOpen, setIsLabelEditorOpen] = useState(false)
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [editingAssignedLabelCountryFilter, setEditingAssignedLabelCountryFilter] = useState<string>('all')
  const [isLabelGroupEditorOpen, setIsLabelGroupEditorOpen] = useState(false)
  const [editingLabelGroupId, setEditingLabelGroupId] = useState<string | null>(null)
  const labelEditorOpenSnapshotRef = useRef<LabelEditorOpenSnapshot | null>(null)
  const labelGroupEditorOpenSnapshotRef = useRef<LabelGroup | null>(null)

  return {
    isLabelEditorOpen, setIsLabelEditorOpen,
    editingLabelId, setEditingLabelId,
    editingAssignedLabelCountryFilter, setEditingAssignedLabelCountryFilter,
    isLabelGroupEditorOpen, setIsLabelGroupEditorOpen,
    editingLabelGroupId, setEditingLabelGroupId,
    labelEditorOpenSnapshotRef,
    labelGroupEditorOpenSnapshotRef,
  }
}

export type LabelDraftState = ReturnType<typeof useLabelDraft>
export type { LabelEditorOpenSnapshot }
