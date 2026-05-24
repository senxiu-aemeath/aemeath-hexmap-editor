export function isPointerEventOutside(
  target: Node | null,
  containers: Array<Element | null | undefined>,
  ignoredClosestSelectors: string[] = [],
) {
  if (!target) {
    return false
  }

  if (target instanceof Element) {
    for (const selector of ignoredClosestSelectors) {
      if (target.closest(selector)) {
        return false
      }
    }
  }

  return containers.every((container) => !container?.contains(target))
}
