import { useState } from 'react'

import type { Submap } from '../../domain/world'

export function useSubmapDraft() {
  const [editingSubmapId, setEditingSubmapId] = useState<string | null>(null)
  const [editingSubmapSnapshot, setEditingSubmapSnapshot] = useState<Submap | null>(null)
  const [submapDraftName, setSubmapDraftName] = useState('')
  const [submapDraftUseWorldTitlePrefix, setSubmapDraftUseWorldTitlePrefix] = useState(true)
  const [submapDraftUseDefaultStyle, setSubmapDraftUseDefaultStyle] = useState(true)
  const [submapDraftSubtitle, setSubmapDraftSubtitle] = useState('')
  const [submapDraftPageMarginTop, setSubmapDraftPageMarginTop] = useState('')
  const [submapDraftFrameTop, setSubmapDraftFrameTop] = useState('')
  const [submapDraftFrameRight, setSubmapDraftFrameRight] = useState('')
  const [submapDraftFrameBottom, setSubmapDraftFrameBottom] = useState('')
  const [submapDraftFrameLeft, setSubmapDraftFrameLeft] = useState('')
  const [submapDraftFrameColor, setSubmapDraftFrameColor] = useState('')
  const [submapDraftTitleFontSize, setSubmapDraftTitleFontSize] = useState('')
  const [submapDraftSubtitleFontSize, setSubmapDraftSubtitleFontSize] = useState('')
  const [submapDraftBylineFontSize, setSubmapDraftBylineFontSize] = useState('')
  const [submapDraftTitleGap, setSubmapDraftTitleGap] = useState('')
  const [submapDraftByGap, setSubmapDraftByGap] = useState('')

  return {
    editingSubmapId, setEditingSubmapId,
    editingSubmapSnapshot, setEditingSubmapSnapshot,
    submapDraftName, setSubmapDraftName,
    submapDraftUseWorldTitlePrefix, setSubmapDraftUseWorldTitlePrefix,
    submapDraftUseDefaultStyle, setSubmapDraftUseDefaultStyle,
    submapDraftSubtitle, setSubmapDraftSubtitle,
    submapDraftPageMarginTop, setSubmapDraftPageMarginTop,
    submapDraftFrameTop, setSubmapDraftFrameTop,
    submapDraftFrameRight, setSubmapDraftFrameRight,
    submapDraftFrameBottom, setSubmapDraftFrameBottom,
    submapDraftFrameLeft, setSubmapDraftFrameLeft,
    submapDraftFrameColor, setSubmapDraftFrameColor,
    submapDraftTitleFontSize, setSubmapDraftTitleFontSize,
    submapDraftSubtitleFontSize, setSubmapDraftSubtitleFontSize,
    submapDraftBylineFontSize, setSubmapDraftBylineFontSize,
    submapDraftTitleGap, setSubmapDraftTitleGap,
    submapDraftByGap, setSubmapDraftByGap,
  }
}

export type SubmapDraftState = ReturnType<typeof useSubmapDraft>
