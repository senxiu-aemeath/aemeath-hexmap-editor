import type { Dispatch, SetStateAction } from 'react'

import { removeSubmap, upsertSubmap, type Submap, type WorldDocument } from '../../domain/world'
import { sanitizeGridValue } from '../../utils/appUtilities'

interface SubmapDraftValues {
  byGap: string
  bylineFontSize: string
  frameBottom: string
  frameColor: string
  frameLeft: string
  frameRight: string
  frameTop: string
  name: string
  pageMarginTop: string
  subtitle: string
  subtitleFontSize: string
  titleFontSize: string
  titleGap: string
  useDefaultStyle: boolean
  useWorldTitlePrefix: boolean
}

interface SubmapDraftStateActions {
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setEditingSubmapSnapshot: Dispatch<SetStateAction<Submap | null>>
  setPendingSubmapDeleteId: Dispatch<SetStateAction<string | null>>
  setSubmapDraftByGap: Dispatch<SetStateAction<string>>
  setSubmapDraftBylineFontSize: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameBottom: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameColor: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameLeft: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameRight: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameTop: Dispatch<SetStateAction<string>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
  setSubmapDraftPageMarginTop: Dispatch<SetStateAction<string>>
  setSubmapDraftSubtitle: Dispatch<SetStateAction<string>>
  setSubmapDraftSubtitleFontSize: Dispatch<SetStateAction<string>>
  setSubmapDraftTitleFontSize: Dispatch<SetStateAction<string>>
  setSubmapDraftTitleGap: Dispatch<SetStateAction<string>>
  setSubmapDraftUseDefaultStyle: Dispatch<SetStateAction<boolean>>
  setSubmapDraftUseWorldTitlePrefix: Dispatch<SetStateAction<boolean>>
}

export function applySubmapDraftToSubmap(args: {
  currentSubmap: Submap
  draft: SubmapDraftValues
  patch?: Partial<Submap>
  submapStyle: WorldDocument['submapStyle']
}) {
  const {
    currentSubmap,
    draft,
    patch,
    submapStyle,
  } = args
  const trimmedName = draft.name.trim()

  return {
    ...currentSubmap,
    name: trimmedName || currentSubmap.name,
    useWorldTitlePrefix: draft.useWorldTitlePrefix,
    useDefaultStyle: draft.useDefaultStyle,
    subtitle: draft.subtitle,
    pageMarginTop: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.pageMarginTop, submapStyle.pageMarginTop, 0, 160),
    frameTop: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.frameTop, submapStyle.frameTop, 0, 512),
    frameRight: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.frameRight, submapStyle.frameRight, 0, 512),
    frameBottom: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.frameBottom, submapStyle.frameBottom, 0, 512),
    frameLeft: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.frameLeft, submapStyle.frameLeft, 0, 512),
    frameColor: draft.useDefaultStyle ? undefined : draft.frameColor || submapStyle.frameColor,
    titleFontSize: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.titleFontSize, submapStyle.titleFontSize, 8, 320),
    subtitleFontSize: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.subtitleFontSize, submapStyle.subtitleFontSize, 8, 240),
    bylineFontSize: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.bylineFontSize, submapStyle.bylineFontSize, 8, 180),
    titleSubtitleGap: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.titleGap, submapStyle.titleSubtitleGap, 0, 48),
    subtitleBylineGap: draft.useDefaultStyle
      ? undefined
      : sanitizeGridValue(draft.byGap, submapStyle.subtitleBylineGap, 0, 48),
    ...patch,
  } satisfies Submap
}

export function startEditingSubmapState(args: {
  actions: SubmapDraftStateActions
  submap: Submap
  submapStyle: WorldDocument['submapStyle']
}) {
  const {
    actions,
    submap,
    submapStyle,
  } = args

  actions.setPendingSubmapDeleteId(null)
  actions.setEditingSubmapId(submap.id)
  actions.setEditingSubmapSnapshot(submap)
  actions.setSubmapDraftName(submap.name)
  actions.setSubmapDraftUseWorldTitlePrefix(submap.useWorldTitlePrefix !== false)
  actions.setSubmapDraftUseDefaultStyle(submap.useDefaultStyle !== false)
  actions.setSubmapDraftSubtitle(submap.subtitle ?? '')
  actions.setSubmapDraftPageMarginTop(
    String(submap.pageMarginTop ?? submapStyle.pageMarginTop),
  )
  actions.setSubmapDraftFrameTop(String(submap.frameTop ?? submapStyle.frameTop))
  actions.setSubmapDraftFrameRight(String(submap.frameRight ?? submapStyle.frameRight))
  actions.setSubmapDraftFrameBottom(
    String(submap.frameBottom ?? submapStyle.frameBottom),
  )
  actions.setSubmapDraftFrameLeft(String(submap.frameLeft ?? submapStyle.frameLeft))
  actions.setSubmapDraftFrameColor(submap.frameColor ?? submapStyle.frameColor)
  actions.setSubmapDraftTitleFontSize(
    String(submap.titleFontSize ?? submapStyle.titleFontSize),
  )
  actions.setSubmapDraftSubtitleFontSize(
    String(submap.subtitleFontSize ?? submapStyle.subtitleFontSize),
  )
  actions.setSubmapDraftBylineFontSize(
    String(submap.bylineFontSize ?? submapStyle.bylineFontSize),
  )
  actions.setSubmapDraftTitleGap(
    String(submap.titleSubtitleGap ?? submapStyle.titleSubtitleGap),
  )
  actions.setSubmapDraftByGap(
    String(submap.subtitleBylineGap ?? submapStyle.subtitleBylineGap),
  )
}

export function discardSubmapDraftState(args: {
  actions: Pick<
    SubmapDraftStateActions,
    | 'setEditingSubmapId'
    | 'setEditingSubmapSnapshot'
    | 'setSubmapDraftFrameColor'
    | 'setSubmapDraftName'
    | 'setSubmapDraftSubtitle'
    | 'setSubmapDraftUseDefaultStyle'
    | 'setSubmapDraftUseWorldTitlePrefix'
  >
  editingSubmapSnapshot: Submap | null
  setWorld: Dispatch<SetStateAction<WorldDocument>>
}) {
  if (args.editingSubmapSnapshot) {
    args.setWorld((current) => upsertSubmap(current, args.editingSubmapSnapshot!))
  }
  args.actions.setEditingSubmapId(null)
  args.actions.setEditingSubmapSnapshot(null)
  args.actions.setSubmapDraftName('')
  args.actions.setSubmapDraftUseWorldTitlePrefix(true)
  args.actions.setSubmapDraftUseDefaultStyle(true)
  args.actions.setSubmapDraftSubtitle('')
  args.actions.setSubmapDraftFrameColor('')
}

export function deleteSubmapState(args: {
  activeSubmapId: string | null
  editingSubmapId: string | null
  pendingSubmapDeleteId: string | null
  setActiveSubmapId: Dispatch<SetStateAction<string | null>>
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setPendingSubmapDeleteId: Dispatch<SetStateAction<string | null>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
  setSubmapDraftSubtitle: Dispatch<SetStateAction<string>>
  setWorld: Dispatch<SetStateAction<WorldDocument>>
  submapId: string
}) {
  args.setWorld((current) => removeSubmap(current, args.submapId))
  if (args.pendingSubmapDeleteId === args.submapId) {
    args.setPendingSubmapDeleteId(null)
  }
  if (args.activeSubmapId === args.submapId) {
    args.setActiveSubmapId(null)
  }
  if (args.editingSubmapId === args.submapId) {
    args.setEditingSubmapId(null)
    args.setSubmapDraftName('')
    args.setSubmapDraftSubtitle('')
  }
}

export function buildSidebarDeleteConfirmation(args: {
  onConfirm: () => void
  pointer: { x: number; y: number }
  rightSidebarWidth: number
  title: string
  viewportHeight: number
  viewportWidth: number
}) {
  const horizontalPadding = 12
  const width = Math.max(220, args.rightSidebarWidth - horizontalPadding * 2)
  const x = Math.max(8, args.viewportWidth - args.rightSidebarWidth + horizontalPadding)
  const estimatedHeight = 92
  const y = Math.max(
    8,
    Math.min(args.pointer.y - 24, args.viewportHeight - estimatedHeight),
  )

  return {
    title: args.title,
    x,
    y,
    width,
    onConfirm: args.onConfirm,
  }
}
