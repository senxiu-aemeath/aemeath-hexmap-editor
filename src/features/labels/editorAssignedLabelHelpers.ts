import type { Dispatch, SetStateAction } from 'react'

import {
  createAssignedLabelForGroup,
  upsertLabel,
  type LabelGroup,
  type WorldDocument,
} from '../../domain/world'

export function toggleExistingAssignedLabelState(args: {
  checked: boolean
  editingTargetId: string | null
  group: LabelGroup
  requestAssignedLabelRemoval: (
    targetKind: 'city' | 'country' | 'province',
    targetId: string,
    group: LabelGroup,
  ) => void
  setActiveLabelId: Dispatch<SetStateAction<string | null>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  targetKind: 'city' | 'country' | 'province'
  world: WorldDocument
}) {
  if (!args.editingTargetId) {
    return
  }

  if (args.checked) {
    const nextLabel = createAssignedLabelForGroup(
      args.world,
      args.group.id,
      args.editingTargetId,
    )
    if (!nextLabel) {
      return
    }
    args.setWorld((current) => upsertLabel(current, nextLabel))
    args.setActiveLabelId(nextLabel.id)
    return
  }

  args.requestAssignedLabelRemoval(args.targetKind, args.editingTargetId, args.group)
}

export function toggleDraftAssignedLabelState(args: {
  checked: boolean
  group: LabelGroup
  setDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  syncDraftDefaultIfNeeded: (group: LabelGroup, checked: boolean) => void
}) {
  args.syncDraftDefaultIfNeeded(args.group, args.checked)
  args.setDrafts((current) => ({
    ...current,
    [args.group.id]: args.checked,
  }))
}

export function toggleAssignedLabelVisibilityState(args: {
  labelId: string
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  world: WorldDocument
}) {
  const existingLabel = args.world.labels[args.labelId]
  if (!existingLabel) {
    return
  }

  args.setWorld((current) =>
    upsertLabel(current, {
      ...existingLabel,
      visible: !existingLabel.visible,
    }),
  )
}
