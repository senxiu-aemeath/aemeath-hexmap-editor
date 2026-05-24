import { useRef, useState } from 'react'
import type { LayerId } from '../world/layerControls'
import type { UniqueLevelConflict, PendingAssignedLabelRemoval } from '../labels/useLabelDialogController'
import type { SidebarDeleteConfirmationState } from '../../components/SidebarDeleteConfirmation'
import type { IconManagerSessionSnapshot } from '../icons/useIconManagerController'
import type { PoliticalWorkspaceSnapshot } from '../../political/types'
import { createInitialPoliticalWorkspaceSnapshot } from '../political/politicalWorkspace'

export function useSidebarInteraction() {
  const [iconManagerSearch, setIconManagerSearch] = useState('')
  const [iconManagerTagFilter, setIconManagerTagFilter] = useState<string | null>(null)
  const [iconManagerSortMode, setIconManagerSortMode] = useState<'alphabetic' | 'upload'>('alphabetic')
  const [selectedIconManagerKey, setSelectedIconManagerKey] = useState<string | null>(null)
  const brandDockRef = useRef<HTMLDivElement | null>(null)
  const brandDockPopoverRef = useRef<HTMLDivElement | null>(null)
  const brandDockCloseTimerRef = useRef<number | null>(null)
  const [brandDockPopoverRect, setBrandDockPopoverRect] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const [pendingSubmapDeleteId, setPendingSubmapDeleteId] = useState<string | null>(null)
  const [draggedSidebarLayerId, setDraggedSidebarLayerId] = useState<string | null>(null)
  const [sidebarLayerDropTargetId, setSidebarLayerDropTargetId] = useState<string | null>(null)
  const [draggedSidebarLabelGroupId, setDraggedSidebarLabelGroupId] = useState<string | null>(null)
  const [sidebarLabelGroupDropTargetId, setSidebarLabelGroupDropTargetId] = useState<string | null>(null)
  const [worldLayerShortcutTargetId, setWorldLayerShortcutTargetId] = useState<LayerId | null>(null)
  const [worldLabelGroupShortcutTargetId, setWorldLabelGroupShortcutTargetId] = useState<string | null>(null)
  const [uniqueLevelConflict, setUniqueLevelConflict] = useState<UniqueLevelConflict | null>(null)
  const [pendingAssignedLabelRemoval, setPendingAssignedLabelRemoval] =
    useState<PendingAssignedLabelRemoval | null>(null)
  const [pendingSidebarDeleteConfirmation, setPendingSidebarDeleteConfirmation] =
    useState<SidebarDeleteConfirmationState | null>(null)
  const [skipAssignedLabelRemovalConfirm, setSkipAssignedLabelRemovalConfirm] = useState(false)
  const iconManagerSessionSnapshotRef = useRef<IconManagerSessionSnapshot | null>(null)
  const iconManagerOriginKeyByCurrentRef = useRef<Record<string, string>>({})
  const politicalWorkspaceCacheRef = useRef<PoliticalWorkspaceSnapshot>(
    createInitialPoliticalWorkspaceSnapshot(),
  )

  return {
    iconManagerSearch, setIconManagerSearch,
    iconManagerTagFilter, setIconManagerTagFilter,
    iconManagerSortMode, setIconManagerSortMode,
    selectedIconManagerKey, setSelectedIconManagerKey,
    brandDockRef,
    brandDockPopoverRef,
    brandDockCloseTimerRef,
    brandDockPopoverRect, setBrandDockPopoverRect,
    pendingSubmapDeleteId, setPendingSubmapDeleteId,
    draggedSidebarLayerId, setDraggedSidebarLayerId,
    sidebarLayerDropTargetId, setSidebarLayerDropTargetId,
    draggedSidebarLabelGroupId, setDraggedSidebarLabelGroupId,
    sidebarLabelGroupDropTargetId, setSidebarLabelGroupDropTargetId,
    worldLayerShortcutTargetId, setWorldLayerShortcutTargetId,
    worldLabelGroupShortcutTargetId, setWorldLabelGroupShortcutTargetId,
    uniqueLevelConflict, setUniqueLevelConflict,
    pendingAssignedLabelRemoval, setPendingAssignedLabelRemoval,
    pendingSidebarDeleteConfirmation, setPendingSidebarDeleteConfirmation,
    skipAssignedLabelRemovalConfirm, setSkipAssignedLabelRemovalConfirm,
    iconManagerSessionSnapshotRef,
    iconManagerOriginKeyByCurrentRef,
    politicalWorkspaceCacheRef,
  }
}
