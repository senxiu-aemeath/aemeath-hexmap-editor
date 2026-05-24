import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import {
  removeAssignedLabelForObject,
  removeLabel,
  removeLabelGroup,
  updateLabelGroupAssignment,
  type Label,
  type LabelGroup,
  type WorldDocument,
} from '../../domain/world'

export interface UniqueLevelConflict {
  levelId: string
  countryId: string | null
  existingCityId: string
  actionType: 'place' | 'change'
  cityData?: { name: string; cellId: string; levelId: string }
}

export interface PendingAssignedLabelRemoval {
  targetKind: 'city' | 'country' | 'province'
  targetId: string
  groupId: string
  groupName: string
}

interface LabelEditorOpenSnapshot {
  label: Label
  labelGroups: Record<string, LabelGroup>
}

interface UseLabelDialogControllerArgs {
  state: {
    activeLabelId: string | null
    activeManagedLabelGroupId: string | null
    editingCityId: string | null
    editingLabel: Label | null
    editingLabelManagedGroup: LabelGroup | null
    pendingAssignedLabelRemoval: PendingAssignedLabelRemoval | null
    skipAssignedLabelRemovalConfirm: boolean
    uniqueLevelConflict: UniqueLevelConflict | null
  }
  refs: {
    labelEditorOpenSnapshotRef: MutableRefObject<LabelEditorOpenSnapshot | null>
    labelGroupEditorOpenSnapshotRef: MutableRefObject<LabelGroup | null>
  }
  actions: {
    finalizeCityCreationFromDraft: (
      baseWorld: WorldDocument,
      options?: {
        demoteExistingCityId?: string
        demoteToLevelId?: string
      },
    ) => {
      nextWorld: WorldDocument
      createdCityId: string | null
    }
    setActiveLabelId: Dispatch<SetStateAction<string | null>>
    setActiveManagedLabelGroupId: Dispatch<SetStateAction<string | null>>
    setEditingLabelId: Dispatch<SetStateAction<string | null>>
    setEditingLabelGroupId: Dispatch<SetStateAction<string | null>>
    setIsLabelEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsLabelGroupEditorOpen: Dispatch<SetStateAction<boolean>>
    setPendingAssignedLabelRemoval: Dispatch<SetStateAction<PendingAssignedLabelRemoval | null>>
    setSkipAssignedLabelRemovalConfirm: Dispatch<SetStateAction<boolean>>
    setUniqueLevelConflict: Dispatch<SetStateAction<UniqueLevelConflict | null>>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
  }
}

export function useLabelDialogController({
  state,
  refs,
  actions,
}: UseLabelDialogControllerArgs) {
  const {
    activeLabelId,
    activeManagedLabelGroupId,
    editingCityId,
    editingLabel,
    editingLabelManagedGroup,
    pendingAssignedLabelRemoval,
    skipAssignedLabelRemovalConfirm,
    uniqueLevelConflict,
  } = state
  const {
    labelEditorOpenSnapshotRef,
    labelGroupEditorOpenSnapshotRef,
  } = refs
  const {
    finalizeCityCreationFromDraft,
    setActiveLabelId,
    setActiveManagedLabelGroupId,
    setEditingLabelId,
    setEditingLabelGroupId,
    setIsLabelEditorOpen,
    setIsLabelGroupEditorOpen,
    setPendingAssignedLabelRemoval,
    setSkipAssignedLabelRemovalConfirm,
    setUniqueLevelConflict,
    setWorld,
  } = actions

  const handleCloseLabelEditor = () => {
    setIsLabelEditorOpen(false)
    setEditingLabelId(null)
    labelEditorOpenSnapshotRef.current = null
  }

  const handleCloseLabelGroupEditor = () => {
    setIsLabelGroupEditorOpen(false)
    setEditingLabelGroupId(null)
    labelGroupEditorOpenSnapshotRef.current = null
  }

  const handleDeleteEditingLabel = () => {
    if (!editingLabel) {
      return
    }

    const labelId = editingLabel.id
    setWorld((current) => removeLabel(current, labelId))
    if (activeLabelId === labelId) {
      setActiveLabelId(null)
    }
    handleCloseLabelEditor()
  }

  const handleDeleteEditingLabelGroup = () => {
    if (!editingLabelManagedGroup) {
      return
    }

    const groupId = editingLabelManagedGroup.id
    setWorld((current) => removeLabelGroup(current, groupId))
    if (activeManagedLabelGroupId === groupId) {
      setActiveManagedLabelGroupId(null)
    }
    handleCloseLabelGroupEditor()
  }

  const handleCloseAssignedLabelRemovalDialog = () => {
    setPendingAssignedLabelRemoval(null)
    setSkipAssignedLabelRemovalConfirm(false)
  }

  const handleConfirmAssignedLabelRemoval = () => {
    const pending = pendingAssignedLabelRemoval
    if (!pending) {
      return
    }

    setWorld((current) => {
      let nextWorld = current

      if (skipAssignedLabelRemovalConfirm) {
        const group = current.labelGroups[pending.groupId]
        if (group?.kind === 'assigned' && group.assignment) {
          nextWorld = updateLabelGroupAssignment(nextWorld, pending.groupId, {
            ...group.assignment,
            confirmOnRemove: false,
          })
        }
      }

      return removeAssignedLabelForObject(nextWorld, pending.groupId, pending.targetId)
    })

    handleCloseAssignedLabelRemovalDialog()
  }

  const handleCloseUniqueLevelConflictDialog = () => {
    setUniqueLevelConflict(null)
  }

  const handleConfirmUniqueLevelConflict = () => {
    const conflict = uniqueLevelConflict
    setUniqueLevelConflict(null)

    if (!conflict) {
      return
    }

    setWorld((current) => {
      let nextWorld = { ...current }
      const existingCity = nextWorld.cities[conflict.existingCityId]
      if (existingCity) {
        nextWorld.cities = {
          ...nextWorld.cities,
          [existingCity.id]: {
            ...existingCity,
            levelId: 'fallback',
          },
        }
      }

      if (conflict.actionType === 'place' && conflict.cityData) {
        nextWorld = finalizeCityCreationFromDraft(nextWorld, {
          demoteExistingCityId: conflict.existingCityId,
          demoteToLevelId: 'fallback',
        }).nextWorld
      } else if (conflict.actionType === 'change' && editingCityId) {
        const city = nextWorld.cities[editingCityId]
        if (city) {
          nextWorld.cities = {
            ...nextWorld.cities,
            [editingCityId]: {
              ...city,
              levelId: conflict.levelId,
            },
          }
        }
      }

      return nextWorld
    })
  }

  return {
    handleCloseLabelEditor,
    handleCloseLabelGroupEditor,
    handleDeleteEditingLabel,
    handleDeleteEditingLabelGroup,
    handleCloseAssignedLabelRemovalDialog,
    handleConfirmAssignedLabelRemoval,
    handleCloseUniqueLevelConflictDialog,
    handleConfirmUniqueLevelConflict,
  }
}
