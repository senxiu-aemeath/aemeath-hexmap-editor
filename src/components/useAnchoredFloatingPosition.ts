import { useEffect, useState, type RefObject } from 'react'
import { getAnchoredFloatingPosition } from './floatingPosition'

interface UseAnchoredFloatingPositionOptions {
  isOpen: boolean
  anchorRef: RefObject<HTMLElement | null>
  floatingRef: RefObject<HTMLElement | null>
  fallbackWidth: () => number
  fallbackHeight: number
}

export function useAnchoredFloatingPosition({
  isOpen,
  anchorRef,
  floatingRef,
  fallbackWidth,
  fallbackHeight,
}: UseAnchoredFloatingPositionOptions) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!isOpen || !anchorRef.current) {
      return
    }

    const updatePosition = () => {
      if (!anchorRef.current) {
        return
      }

      const rect = anchorRef.current.getBoundingClientRect()
      const floatingWidth = floatingRef.current?.offsetWidth ?? fallbackWidth()
      const floatingHeight = floatingRef.current?.offsetHeight ?? fallbackHeight

      setPosition(
        getAnchoredFloatingPosition({
          anchorRect: rect,
          floatingWidth,
          floatingHeight,
        }),
      )
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, fallbackHeight, fallbackWidth, floatingRef, isOpen])

  return position
}
