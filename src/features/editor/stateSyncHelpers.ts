import type { WorldDocument } from '../../domain/world'
import type { WorldNumberDrafts } from '../../components/world/WorldModePanel'

function areStringArraysEqual(left: string[], right: string[]) {
  if (left === right) {
    return true
  }
  if (left.length !== right.length) {
    return false
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }
  return true
}

export function buildWorldNumberDrafts(
  world: Pick<WorldDocument, 'axes' | 'frame' | 'metadata' | 'submapStyle'>,
): WorldNumberDrafts {
  return {
    pageMarginTop: String(world.metadata.pageMarginTop),
    titleFontSize: String(world.metadata.titleFontSize),
    subtitleFontSize: String(world.metadata.subtitleFontSize),
    bylineFontSize: String(world.metadata.bylineFontSize),
    titleSubtitleGap: String(world.metadata.titleSubtitleGap),
    subtitleBylineGap: String(world.metadata.subtitleBylineGap),
    frameTop: String(world.frame.top),
    frameRight: String(world.frame.right),
    frameBottom: String(world.frame.bottom),
    frameLeft: String(world.frame.left),
    axisFontSize: String(world.axes.fontSize),
    submapPageMarginTop: String(world.submapStyle.pageMarginTop),
    submapTitleFontSize: String(world.submapStyle.titleFontSize),
    submapSubtitleFontSize: String(world.submapStyle.subtitleFontSize),
    submapBylineFontSize: String(world.submapStyle.bylineFontSize),
    submapTitleSubtitleGap: String(world.submapStyle.titleSubtitleGap),
    submapSubtitleBylineGap: String(world.submapStyle.subtitleBylineGap),
    submapFrameTop: String(world.submapStyle.frameTop),
    submapFrameRight: String(world.submapStyle.frameRight),
    submapFrameBottom: String(world.submapStyle.frameBottom),
    submapFrameLeft: String(world.submapStyle.frameLeft),
  }
}

export function getSyncedWorldNumberDrafts(
  current: WorldNumberDrafts,
  previousSyncedDrafts: WorldNumberDrafts,
  nextSyncedDrafts: WorldNumberDrafts,
) {
  let changed = false
  const nextDrafts = { ...current }

  for (const key of Object.keys(nextSyncedDrafts) as Array<keyof WorldNumberDrafts>) {
    if (current[key] !== previousSyncedDrafts[key]) {
      continue
    }
    if (current[key] === nextSyncedDrafts[key]) {
      continue
    }
    nextDrafts[key] = nextSyncedDrafts[key]
    changed = true
  }

  return changed ? nextDrafts : current
}

export function pruneCanvasViewStates<T>(
  current: Record<string, T>,
  submapsById: Record<string, unknown>,
) {
  const nextEntries = Object.entries(current).filter(([key]) => {
    return key === '__all__' || Boolean(submapsById[key])
  })

  if (nextEntries.length === Object.keys(current).length) {
    return current
  }

  return Object.fromEntries(nextEntries)
}

export function getAlignedMoveLabelGroups(
  current: Record<string, boolean>,
  labelGroups: Array<{ id: string }>,
) {
  const next: Record<string, boolean> = {}
  let changed = false

  for (const group of labelGroups) {
    if (current[group.id] === undefined) {
      next[group.id] = true
      changed = true
    } else {
      next[group.id] = current[group.id]
    }
  }

  for (const groupId of Object.keys(current)) {
    if (!labelGroups.some((group) => group.id === groupId)) {
      changed = true
    }
  }

  return changed ? next : current
}

export function pruneRecentSelectionIds(
  current: string[],
  exists: (id: string) => boolean,
) {
  const next = current.filter((id) => exists(id))
  return areStringArraysEqual(current, next) ? current : next
}

export function prependRecentSelectionId(
  current: string[],
  id: string,
  exists: (id: string) => boolean,
  limit: number,
) {
  const next = [id, ...current.filter((entry) => entry !== id)]
    .filter((entry) => exists(entry))
    .slice(0, limit)
  return areStringArraysEqual(current, next) ? current : next
}
