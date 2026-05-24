interface AnchoredFloatingPositionInput {
  anchorRect: DOMRect
  floatingWidth: number
  floatingHeight: number
  viewportPadding?: number
  offset?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getAnchoredFloatingPosition({
  anchorRect,
  floatingWidth,
  floatingHeight,
  viewportPadding = 16,
  offset = 8,
}: AnchoredFloatingPositionInput) {
  const maxLeft = Math.max(viewportPadding, window.innerWidth - floatingWidth - viewportPadding)
  const left = clamp(anchorRect.left, viewportPadding, maxLeft)
  const belowTop = anchorRect.bottom + offset
  const aboveTop = anchorRect.top - floatingHeight - offset
  const maxTop = Math.max(viewportPadding, window.innerHeight - floatingHeight - viewportPadding)
  const top =
    belowTop + floatingHeight <= window.innerHeight - viewportPadding
      ? belowTop
      : clamp(aboveTop, viewportPadding, maxTop)

  return { top, left }
}
