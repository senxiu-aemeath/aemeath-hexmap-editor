import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

export interface ObservedElementRect {
  top: number
  left: number
  width: number
  height: number
}

interface UseObservedElementRectOptions {
  observeRefs?: Array<RefObject<Element | null>>
}

const RECT_EPSILON = 0.5

function areRectsEqual(
  previous: ObservedElementRect | null,
  next: ObservedElementRect | null,
) {
  if (previous === next) {
    return true
  }
  if (!previous || !next) {
    return false
  }
  return (
    Math.abs(previous.top - next.top) < RECT_EPSILON &&
    Math.abs(previous.left - next.left) < RECT_EPSILON &&
    Math.abs(previous.width - next.width) < RECT_EPSILON &&
    Math.abs(previous.height - next.height) < RECT_EPSILON
  )
}

function toObservedRect(element: Element | null): ObservedElementRect | null {
  const nextRect = element?.getBoundingClientRect()
  return nextRect
    ? {
        top: nextRect.top,
        left: nextRect.left,
        width: nextRect.width,
        height: nextRect.height,
      }
    : null
}

export function useObservedElementRect(
  targetRef: RefObject<Element | null>,
  dependencies: readonly unknown[],
  options: UseObservedElementRectOptions = {},
) {
  const { observeRefs = [] } = options
  const [rect, setRect] = useState<ObservedElementRect | null>(null)

  useLayoutEffect(() => {
    const updateRect = () => {
      const nextRect = toObservedRect(targetRef.current)
      setRect((current) => (areRectsEqual(current, nextRect) ? current : nextRect))
    }

    updateRect()

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateRect()
          })

    if (resizeObserver) {
      for (const ref of [targetRef, ...observeRefs]) {
        if (ref.current) {
          resizeObserver.observe(ref.current)
        }
      }
    }

    return () => {
      resizeObserver?.disconnect()
    }
  }, [targetRef, ...observeRefs, ...dependencies])

  useEffect(() => {
    const updateRect = () => {
      const nextRect = toObservedRect(targetRef.current)
      setRect((current) => (areRectsEqual(current, nextRect) ? current : nextRect))
    }

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [targetRef])

  return rect
}
