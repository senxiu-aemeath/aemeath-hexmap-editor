import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useUiMessages } from '../i18n'
import { FloatingPortal } from './FloatingPortal'
import { useFloatingOverlayVisibility } from './useFloatingOverlayVisibility'
import { useObservedElementRect } from './useObservedElementRect'

interface SelectedInfoShellProps {
  title: string
  expanded: boolean
  onToggleExpanded: () => void
  className?: string
  children: ReactNode
}

const FLOATING_TOGGLE_GAP = 3
const FLOATING_TOGGLE_HITBOX = 18
const FLOATING_TOGGLE_SIZE = 33

function renderInfoToggleIcon(isExpanded: boolean) {
  return isExpanded ? '▾' : '▸'
}

export function SelectedInfoShell({
  title,
  expanded,
  onToggleExpanded,
  className = '',
  children,
}: SelectedInfoShellProps) {
  const ui = useUiMessages()
  const shellRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLDivElement | null>(null)
  const shellRect = useObservedElementRect(shellRef, [children, expanded, title], {
    observeRefs: [headRef],
  })
  const [headerHeight, setHeaderHeight] = useState(40)
  const { isOverlayVisible, shellEventHandlers, overlayEventHandlers } = useFloatingOverlayVisibility()

  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      setHeaderHeight(headRef.current?.offsetHeight ?? 40)
    }

    updateHeaderHeight()

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateHeaderHeight()
          })

    if (resizeObserver) {
      if (headRef.current) {
        resizeObserver.observe(headRef.current)
      }
    }

    return () => {
      resizeObserver?.disconnect()
    }
  }, [children, expanded, title])

  const floatingButtonSize = FLOATING_TOGGLE_SIZE
  const floatingToggleLeft = shellRect ? shellRect.left - FLOATING_TOGGLE_GAP - floatingButtonSize : 0
  const floatingToggleTop = shellRect ? shellRect.top + (headerHeight - floatingButtonSize) / 2 : 0
  const floatingOverlayLeft = shellRect
    ? shellRect.left - FLOATING_TOGGLE_GAP - floatingButtonSize - FLOATING_TOGGLE_HITBOX
    : 0
  const floatingOverlayWidth = floatingButtonSize + FLOATING_TOGGLE_GAP + FLOATING_TOGGLE_HITBOX
  return (
    <>
      <div
        ref={shellRef}
        className={`info-shell${expanded ? ' is-expanded' : ''}${className ? ` ${className}` : ''}`}
        {...shellEventHandlers}
      >
        <div ref={headRef} className="info-shell-head">
          <strong>{title}</strong>
        </div>
        <div className={`info-shell-body${expanded ? ' is-expanded' : ''}`}>{children}</div>
      </div>
      {shellRect ? (
        <FloatingPortal>
            <div
              className={`info-shell-floating-overlay${isOverlayVisible ? ' is-active' : ''}`}
              style={{
                top: `${floatingToggleTop}px`,
                left: `${floatingOverlayLeft}px`,
                width: `${floatingOverlayWidth}px`,
                height: `${floatingButtonSize}px`,
              }}
              {...overlayEventHandlers}
            >
              <button
                className="info-shell-toggle info-shell-toggle--floating"
                type="button"
                aria-expanded={expanded}
                aria-label={`${ui.common.toggle} ${title}`}
                onClick={onToggleExpanded}
                style={{
                  top: '0px',
                  left: `${floatingToggleLeft - floatingOverlayLeft}px`,
                  width: `${floatingButtonSize}px`,
                  height: `${floatingButtonSize}px`,
                }}
              >
                {renderInfoToggleIcon(expanded)}
              </button>
            </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}
