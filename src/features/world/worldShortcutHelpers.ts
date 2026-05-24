import type { Dispatch, SetStateAction } from 'react'

import {
  upsertLabelGroup,
  type LabelGroup,
  type Submap,
  type WorldDocument,
} from '../../domain/world'
import type { LayerControl, LayerId } from './layerControls'

export function activateFullSubmapViewState(actions: {
  setActiveSubmapId: Dispatch<SetStateAction<string | null>>
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setIsSubmapSelectionMode: Dispatch<SetStateAction<boolean>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
}) {
  actions.setActiveSubmapId(null)
  actions.setEditingSubmapId(null)
  actions.setSubmapDraftName('')
  actions.setIsSubmapSelectionMode(false)
}

export function beginCreateSubmapSelectionState(actions: {
  setActiveSubmapId: Dispatch<SetStateAction<string | null>>
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setIsSubmapSelectionMode: Dispatch<SetStateAction<boolean>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
}) {
  actions.setActiveSubmapId(null)
  actions.setIsSubmapSelectionMode(true)
  actions.setEditingSubmapId(null)
  actions.setSubmapDraftName('')
}

export function cycleWorldSubmapTargetState(args: {
  activeSubmapId: string | null
  activateFullSubmapView: () => void
  delta: number
  setActiveSubmapId: Dispatch<SetStateAction<string | null>>
  setIsSubmapSelectionMode: Dispatch<SetStateAction<boolean>>
  submaps: Submap[]
}) {
  const ids = ['__full__', ...args.submaps.map((submap) => submap.id)]
  const currentId = args.activeSubmapId ?? '__full__'
  const currentIndex = Math.max(0, ids.findIndex((id) => id === currentId))
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextId = ids[nextIndex] ?? '__full__'
  if (nextId === '__full__') {
    args.activateFullSubmapView()
    return
  }
  args.setActiveSubmapId(nextId)
  args.setIsSubmapSelectionMode(false)
}

export function cycleWorldLayerTargetState(args: {
  delta: number
  layersWithMeta: LayerControl[]
  setWorldLayerShortcutTargetId: Dispatch<SetStateAction<LayerId | null>>
  worldLayerShortcutTargetId: LayerId | null
}) {
  if (args.layersWithMeta.length === 0) {
    return
  }
  const currentIndex = Math.max(
    0,
    args.layersWithMeta.findIndex(
      (layer) => layer.id === args.worldLayerShortcutTargetId,
    ),
  )
  const nextIndex =
    ((currentIndex + args.delta) % args.layersWithMeta.length +
      args.layersWithMeta.length) %
    args.layersWithMeta.length
  args.setWorldLayerShortcutTargetId(
    args.layersWithMeta[nextIndex]?.id ?? args.layersWithMeta[0]?.id ?? null,
  )
}

export function toggleWorldLayerShortcutTargetState(args: {
  setLayers: Dispatch<SetStateAction<LayerControl[]>>
  worldLayerShortcutTargetId: LayerId | null
}) {
  if (!args.worldLayerShortcutTargetId) {
    return false
  }
  args.setLayers((current) =>
    current.map((entry) =>
      entry.id === args.worldLayerShortcutTargetId
        ? {
            ...entry,
            visible: !entry.visible,
          }
        : entry,
    ),
  )
  return true
}

export function cycleWorldLabelGroupTargetState(args: {
  delta: number
  labelGroups: LabelGroup[]
  setWorldLabelGroupShortcutTargetId: Dispatch<SetStateAction<string | null>>
  worldLabelGroupShortcutTargetId: string | null
}) {
  if (args.labelGroups.length === 0) {
    return
  }
  const currentIndex = Math.max(
    0,
    args.labelGroups.findIndex(
      (group) => group.id === args.worldLabelGroupShortcutTargetId,
    ),
  )
  const nextIndex =
    ((currentIndex + args.delta) % args.labelGroups.length +
      args.labelGroups.length) %
    args.labelGroups.length
  args.setWorldLabelGroupShortcutTargetId(
    args.labelGroups[nextIndex]?.id ?? args.labelGroups[0]?.id ?? null,
  )
}

export function toggleWorldLabelGroupShortcutTargetState(args: {
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  worldLabelGroupShortcutTargetId: string | null
}) {
  if (!args.worldLabelGroupShortcutTargetId) {
    return false
  }

  let didToggle = false
  args.setWorld((current) => {
    const group = current.labelGroups[args.worldLabelGroupShortcutTargetId!]
    if (!group) {
      return current
    }
    didToggle = true
    return upsertLabelGroup(current, {
      ...group,
      visible: !group.visible,
    })
  })
  return didToggle
}

export function toggleLayerVisibilityByIdState(args: {
  layerId: LayerId
  setLayers: Dispatch<SetStateAction<LayerControl[]>>
}) {
  args.setLayers((current) =>
    current.map((entry) =>
      entry.id === args.layerId
        ? {
            ...entry,
            visible: !entry.visible,
          }
        : entry,
    ),
  )
}

export function toggleLabelGroupVisibilityByIdState(args: {
  groupId: string
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  args.setWorld((current) =>
    current.labelGroups[args.groupId]
      ? upsertLabelGroup(current, {
          ...current.labelGroups[args.groupId],
          visible: !current.labelGroups[args.groupId].visible,
        })
      : current,
  )
}
