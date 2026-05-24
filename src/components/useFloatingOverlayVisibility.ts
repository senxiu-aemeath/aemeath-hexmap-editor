import { useState } from 'react'

export function useFloatingOverlayVisibility() {
  const [isShellHovered, setIsShellHovered] = useState(false)
  const [isOverlayHovered, setIsOverlayHovered] = useState(false)
  const [isShellFocused, setIsShellFocused] = useState(false)

  return {
    isOverlayVisible: isShellHovered || isOverlayHovered || isShellFocused,
    shellEventHandlers: {
      onMouseEnter: () => {
        setIsShellHovered(true)
      },
      onMouseLeave: () => {
        setIsShellHovered(false)
      },
      onFocusCapture: () => {
        setIsShellFocused(true)
      },
      onBlurCapture: (event: React.FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsShellFocused(false)
        }
      },
    },
    overlayEventHandlers: {
      onMouseEnter: () => {
        setIsOverlayHovered(true)
      },
      onMouseLeave: () => {
        setIsOverlayHovered(false)
      },
    },
  }
}
