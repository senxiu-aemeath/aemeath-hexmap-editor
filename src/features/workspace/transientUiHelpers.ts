import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { Label, LabelGroup } from '../../domain/world'
import type {
  PendingAssignedLabelRemoval,
  UniqueLevelConflict,
} from '../labels/useLabelDialogController'

type ExpandedTableId =
  | 'cities'
  | 'countries'
  | 'provinces'
  | 'label-groups'
  | 'text-labels'
  | 'icon-labels'
  | 'icons'
  | 'fonts'
  | null

type ObjectEditorSidecarAnchor = 'inspector' | 'expanded-table' | 'left-sidebar'

interface LabelEditorOpenSnapshotLike {
  label: Label
  labelGroups: Record<string, LabelGroup>
}

export function closeObjectEditorsState(args: {
  labelEditorOpenSnapshotRef: MutableRefObject<LabelEditorOpenSnapshotLike | null>
  labelGroupEditorOpenSnapshotRef: MutableRefObject<LabelGroup | null>
  setCountryPreviewBorderColor: Dispatch<SetStateAction<string | null>>
  setCountryPreviewColor: Dispatch<SetStateAction<string | null>>
  setCountryPreviewProvinceBorderColor: Dispatch<SetStateAction<string | null>>
  setEditingCityId: Dispatch<SetStateAction<string | null>>
  setEditingCityLevelId: Dispatch<SetStateAction<string | null>>
  setEditingCountryId: Dispatch<SetStateAction<string | null>>
  setEditingGovernmentTypeId: Dispatch<SetStateAction<string | null>>
  setEditingLabelGroupId: Dispatch<SetStateAction<string | null>>
  setEditingLabelId: Dispatch<SetStateAction<string | null>>
  setEditingProvinceId: Dispatch<SetStateAction<string | null>>
  setGovernmentTypePreviewColor: Dispatch<SetStateAction<string | null>>
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsGovernmentTypeEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsLabelEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsLabelGroupEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>
  setObjectEditorSidecarAnchor: Dispatch<SetStateAction<ObjectEditorSidecarAnchor>>
  setProvincePreviewColor: Dispatch<SetStateAction<string | null>>
}) {
  args.setObjectEditorSidecarAnchor('inspector')
  args.setCountryPreviewColor(null)
  args.setCountryPreviewBorderColor(null)
  args.setCountryPreviewProvinceBorderColor(null)
  args.setProvincePreviewColor(null)
  args.setGovernmentTypePreviewColor(null)
  args.setIsCountryEditorOpen(false)
  args.setEditingCountryId(null)
  args.setIsProvinceEditorOpen(false)
  args.setEditingProvinceId(null)
  args.setIsGovernmentTypeEditorOpen(false)
  args.setEditingGovernmentTypeId(null)
  args.setIsCityEditorOpen(false)
  args.setEditingCityId(null)
  args.setIsCityLevelEditorOpen(false)
  args.setEditingCityLevelId(null)
  args.setIsLabelEditorOpen(false)
  args.setEditingLabelId(null)
  args.labelEditorOpenSnapshotRef.current = null
  args.setIsLabelGroupEditorOpen(false)
  args.setEditingLabelGroupId(null)
  args.labelGroupEditorOpenSnapshotRef.current = null
}

export function closeTransientUiState(args: {
  closeObjectEditors: () => void
  setExpandedTableId: Dispatch<SetStateAction<ExpandedTableId>>
  setPendingAssignedLabelRemoval: Dispatch<
    SetStateAction<PendingAssignedLabelRemoval | null>
  >
  setUniqueLevelConflict: Dispatch<SetStateAction<UniqueLevelConflict | null>>
}) {
  args.closeObjectEditors()
  args.setExpandedTableId(null)
  args.setPendingAssignedLabelRemoval(null)
  args.setUniqueLevelConflict(null)
}
