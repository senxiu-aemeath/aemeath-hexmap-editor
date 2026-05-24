import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode, WheelEvent as ReactWheelEvent } from 'react'
import { useUiMessages } from '../i18n'
import { FloatingPortal } from './FloatingPortal'
import { useFloatingOverlayVisibility } from './useFloatingOverlayVisibility'
import { useObservedElementRect } from './useObservedElementRect'

interface DataTableShellProps {
  expanded: boolean
  onToggleExpanded: () => void
  filterRow?: ReactNode
  headerRow: ReactNode
  children: ReactNode
  toggleLabel?: string
}

interface ScrollMetrics {
  filterHeight: number
  headerHeight: number
  bodyHeight: number
  bodyWidth: number
  contentHeight: number
  contentWidth: number
  rowHeight: number
  scrollTop: number
  scrollLeft: number
}

const MIN_THUMB_SIZE = 24
const FLOATING_OVERLAY_GAP = 3
const FLOATING_OVERLAY_HITBOX = 18
const COLLAPSED_VISIBLE_ROWS = 6
const FLOATING_TOGGLE_SIZE = 33
const FLOATING_RAIL_THICKNESS = 12
const BOTTOM_RAIL_HITBOX_HEIGHT = 26
const BOTTOM_RAIL_GAP = 6

function renderTableToggleIcon(isExpanded: boolean) {
  return isExpanded ? '▾' : '▸'
}

export function DataTableShell({
  expanded,
  onToggleExpanded,
  filterRow,
  headerRow,
  children,
  toggleLabel,
}: DataTableShellProps) {
  const ui = useUiMessages()
  const shellRef = useRef<HTMLDivElement | null>(null)
  const horizontalRef = useRef<HTMLDivElement | null>(null)
  const filterRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const verticalRailRef = useRef<HTMLDivElement | null>(null)
  const horizontalRailRef = useRef<HTMLButtonElement | null>(null)
  const dragRef = useRef<{
    axis: 'x' | 'y'
    pointerStart: number
    scrollStart: number
  } | null>(null)
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    filterHeight: 0,
    headerHeight: 0,
    bodyHeight: 0,
    bodyWidth: 0,
    contentHeight: 0,
    contentWidth: 0,
    rowHeight: 40,
    scrollTop: 0,
    scrollLeft: 0,
  })
  const shellRect = useObservedElementRect(shellRef, [children, expanded, filterRow, headerRow], {
    observeRefs: [filterRef, headerRef, bodyRef, contentRef, horizontalRef, trackRef],
  })
  const { isOverlayVisible, shellEventHandlers, overlayEventHandlers } = useFloatingOverlayVisibility()

  const updateMetrics = () => {
    const horizontal = horizontalRef.current
    const body = bodyRef.current
    const content = contentRef.current
    const track = trackRef.current
    const firstRow = content?.firstElementChild as HTMLElement | null
    const rowHeight = firstRow?.offsetHeight ?? 40

    setMetrics({
      filterHeight: filterRef.current?.offsetHeight ?? 0,
      headerHeight: headerRef.current?.offsetHeight ?? 0,
      bodyHeight: body?.clientHeight ?? 0,
      bodyWidth: horizontal?.clientWidth ?? 0,
      contentHeight: Math.max(content?.scrollHeight ?? 0, body?.scrollHeight ?? 0),
      contentWidth: track?.scrollWidth ?? 0,
      rowHeight,
      scrollTop: body?.scrollTop ?? 0,
      scrollLeft: horizontal?.scrollLeft ?? 0,
    })
  }

  const hasVerticalOverflow = !expanded && metrics.contentHeight > metrics.bodyHeight + 1
  const hasHorizontalOverflow = metrics.contentWidth > metrics.bodyWidth + 1
  const collapsedBodyMaxHeight = Math.max(metrics.rowHeight * COLLAPSED_VISIBLE_ROWS, metrics.rowHeight)
  const estimatedRowCount =
    metrics.rowHeight > 0 ? Math.max(metrics.contentHeight / metrics.rowHeight, 1) : COLLAPSED_VISIBLE_ROWS

  const verticalThumbSize = hasVerticalOverflow
    ? Math.max((COLLAPSED_VISIBLE_ROWS / estimatedRowCount) * metrics.bodyHeight, MIN_THUMB_SIZE)
    : 0
  const verticalThumbOffset =
    hasVerticalOverflow && metrics.contentHeight > metrics.bodyHeight
      ? (metrics.scrollTop / (metrics.contentHeight - metrics.bodyHeight)) *
        (metrics.bodyHeight - verticalThumbSize)
      : 0

  const horizontalThumbSize = hasHorizontalOverflow
    ? Math.max((metrics.bodyWidth / Math.max(metrics.contentWidth, 1)) * metrics.bodyWidth, MIN_THUMB_SIZE)
    : 0
  const horizontalThumbOffset =
    hasHorizontalOverflow && metrics.contentWidth > metrics.bodyWidth
      ? (metrics.scrollLeft / (metrics.contentWidth - metrics.bodyWidth)) *
        (metrics.bodyWidth - horizontalThumbSize)
      : 0

  useLayoutEffect(() => {
    const frameId =
      typeof window === 'undefined' ? null : window.requestAnimationFrame(() => {
        updateMetrics()
      })

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateMetrics()
          })

    if (resizeObserver) {
      if (filterRef.current) {
        resizeObserver.observe(filterRef.current)
      }
      if (headerRef.current) {
        resizeObserver.observe(headerRef.current)
      }
      if (bodyRef.current) {
        resizeObserver.observe(bodyRef.current)
      }
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current)
      }
      if (horizontalRef.current) {
        resizeObserver.observe(horizontalRef.current)
      }
      if (trackRef.current) {
        resizeObserver.observe(trackRef.current)
      }
    }

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
      resizeObserver?.disconnect()
    }
  }, [children, expanded, filterRow, headerRow])

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      const drag = dragRef.current
      const body = bodyRef.current
      const horizontal = horizontalRef.current
      if (!drag || !body || !horizontal) {
        return
      }

      if (drag.axis === 'y') {
        const trackSize = Math.max((verticalRailRef.current?.clientHeight ?? metrics.bodyHeight) - verticalThumbSize, 1)
        const maxScroll = Math.max(metrics.contentHeight - metrics.bodyHeight, 0)
        if (trackSize <= 0 || maxScroll <= 0) {
          return
        }
        const delta = event.clientY - drag.pointerStart
        const nextScroll = drag.scrollStart + (delta / trackSize) * maxScroll
        body.scrollTop = Math.min(Math.max(nextScroll, 0), maxScroll)
      } else {
        const trackSize = Math.max((horizontalRailRef.current?.clientWidth ?? metrics.bodyWidth) - horizontalThumbSize, 1)
        const maxScroll = Math.max(metrics.contentWidth - metrics.bodyWidth, 0)
        if (trackSize <= 0 || maxScroll <= 0) {
          return
        }
        const delta = event.clientX - drag.pointerStart
        const nextScroll = drag.scrollStart + (delta / trackSize) * maxScroll
        horizontal.scrollLeft = Math.min(Math.max(nextScroll, 0), maxScroll)
      }
    }

    const stopDrag = () => {
      dragRef.current = null
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', stopDrag)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', stopDrag)
    }
  }, [
    horizontalThumbSize,
    metrics.bodyHeight,
    metrics.bodyWidth,
    metrics.contentHeight,
    metrics.contentWidth,
    verticalThumbSize,
  ])

  const handleBodyScroll = () => {
    const body = bodyRef.current
    setMetrics((current) => ({
      ...current,
      bodyHeight: body?.clientHeight ?? current.bodyHeight,
      contentHeight: Math.max(contentRef.current?.scrollHeight ?? 0, body?.scrollHeight ?? 0),
      rowHeight: (contentRef.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? current.rowHeight,
      scrollTop: body?.scrollTop ?? current.scrollTop,
    }))
  }

  const handleHorizontalScroll = () => {
    const horizontal = horizontalRef.current
    setMetrics((current) => ({
      ...current,
      bodyWidth: horizontal?.clientWidth ?? current.bodyWidth,
      contentWidth: trackRef.current?.scrollWidth ?? current.contentWidth,
      scrollLeft: horizontal?.scrollLeft ?? current.scrollLeft,
    }))
  }

  const handleWheelCapture = (
    event: ReactWheelEvent<HTMLButtonElement> | globalThis.WheelEvent,
    preferredAxis?: 'x' | 'y',
  ) => {
    const body = bodyRef.current
    const horizontal = horizontalRef.current
    if (!body || !horizontal) {
      return
    }

    const canScrollVertically = !expanded && metrics.contentHeight > metrics.bodyHeight + 1
    const canScrollHorizontally = metrics.contentWidth > metrics.bodyWidth + 1
    const wantsHorizontal = event.shiftKey

    if (preferredAxis === 'x' && canScrollHorizontally && wantsHorizontal) {
      event.preventDefault()
      event.stopPropagation()
      const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
      horizontal.scrollLeft += delta
      return
    }

    if (preferredAxis === 'y' && canScrollVertically) {
      event.preventDefault()
      event.stopPropagation()
      body.scrollTop += event.deltaY
      return
    }

    if (preferredAxis === 'x' || preferredAxis === 'y') {
      return
    }

    if (canScrollHorizontally && !canScrollVertically && wantsHorizontal) {
      event.preventDefault()
      event.stopPropagation()
      const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
      horizontal.scrollLeft += delta
      return
    }

    if (canScrollVertically && !canScrollHorizontally) {
      event.preventDefault()
      event.stopPropagation()
      body.scrollTop += event.deltaY
      return
    }

    if (canScrollVertically && canScrollHorizontally) {
      event.preventDefault()
      event.stopPropagation()
      if (wantsHorizontal) {
        const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
        horizontal.scrollLeft += delta
      } else {
        body.scrollTop += event.deltaY
      }
    }
  }

  useEffect(() => {
    const shell = shellRef.current
    if (!shell) {
      return
    }

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      handleWheelCapture(event)
    }

    shell.addEventListener('wheel', handleNativeWheel, { capture: true, passive: false })
    return () => {
      shell.removeEventListener('wheel', handleNativeWheel, { capture: true } as EventListenerOptions)
    }
  })

  const floatingButtonWidth = FLOATING_TOGGLE_SIZE
  const floatingButtonHeight = FLOATING_TOGGLE_SIZE
  const floatingRailThickness = FLOATING_RAIL_THICKNESS
  const floatingLeft = shellRect ? shellRect.left - FLOATING_OVERLAY_GAP - floatingButtonWidth : 0
  const floatingRailLeft = shellRect
    ? shellRect.left - FLOATING_OVERLAY_GAP - floatingButtonWidth / 2 - floatingRailThickness / 2
    : 0
  const floatingToggleTop = shellRect
    ? shellRect.top + metrics.filterHeight + (metrics.headerHeight - floatingButtonHeight) / 2
    : 0
  const floatingRailTop = shellRect ? shellRect.top + metrics.filterHeight + metrics.headerHeight : 0
  const floatingOverlayTop = floatingToggleTop
  const floatingOverlayHeight = floatingButtonHeight + metrics.bodyHeight
  const floatingOverlayLeft = shellRect
    ? shellRect.left - FLOATING_OVERLAY_GAP - floatingButtonWidth - FLOATING_OVERLAY_HITBOX
    : 0
  const floatingOverlayWidth = floatingButtonWidth + FLOATING_OVERLAY_GAP + FLOATING_OVERLAY_HITBOX
  const floatingBottomRailTop = shellRect
    ? shellRect.top + metrics.filterHeight + metrics.headerHeight + metrics.bodyHeight + BOTTOM_RAIL_GAP
    : 0
  const tableShellStyleVars = {
    '--table-filter-height': `${metrics.filterHeight}px`,
    '--table-header-height': `${metrics.headerHeight}px`,
    '--table-body-height': `${metrics.bodyHeight}px`,
    '--table-collapsed-max-height': `${collapsedBodyMaxHeight}px`,
    '--table-floating-rail-thickness': `${floatingRailThickness}px`,
    '--table-rail-visible-thickness': '10px',
    '--table-rail-base-bg': '#3a4149c7',
    '--table-rail-floating-bg': 'color-mix(in srgb, var(--table-rail-base-bg) 42%, transparent)',
    '--table-rail-track-bg': 'color-mix(in srgb, var(--table-rail-base-bg) 38%, transparent)',
    '--table-rail-hover-bg': '#515d6ce0',
    '--table-rail-border': 'color-mix(in srgb, var(--theme-panel-title) 68%, transparent)',
    '--table-rail-floating-border': '#697582ff',
  } as CSSProperties

  return (
    <>
      <div
        ref={shellRef}
        className={`table-shell side-table-card${expanded ? ' is-expanded' : ''}`}
        style={tableShellStyleVars}
        {...shellEventHandlers}
      >
        <div className="table-shell-hover-pad table-shell-hover-pad--left" aria-hidden="true" />
        <div className="table-shell-hover-pad table-shell-hover-pad--bottom" aria-hidden="true" />
        <div ref={horizontalRef} className="table-shell-horizontal" onScroll={handleHorizontalScroll}>
          <div ref={trackRef} className="table-shell-track">
            {filterRow ? (
              <div ref={filterRef} className="table-filter-row-shell">
                {filterRow}
              </div>
            ) : null}
            <div ref={headerRef} className="table-shell-head">
              {headerRow}
            </div>
            <div
              ref={bodyRef}
              className={`table-scroll-body${expanded ? ' is-expanded' : ''}`}
              onScroll={handleBodyScroll}
            >
              <div ref={contentRef} className="table-scroll-body-content">
                {children}
              </div>
            </div>
          </div>
        </div>

      </div>
      {shellRect ? (
        <FloatingPortal>
            <div
              className={`table-shell-floating-overlay${isOverlayVisible ? ' is-active' : ''}`}
              style={{
                ...tableShellStyleVars,
                top: `${floatingOverlayTop}px`,
                left: `${floatingOverlayLeft}px`,
                width: `${floatingOverlayWidth}px`,
                height: `${floatingOverlayHeight}px`,
              }}
              {...overlayEventHandlers}
            >
              <button
                className="table-shell-float-toggle table-shell-float-toggle--floating"
                type="button"
                aria-expanded={expanded}
                aria-label={toggleLabel ?? `${ui.common.toggle} ${ui.common.table}`}
                onClick={onToggleExpanded}
                style={{
                  top: `${floatingToggleTop}px`,
                  left: `${floatingLeft}px`,
                  width: `${floatingButtonWidth}px`,
                  height: `${floatingButtonHeight}px`,
                }}
              >
                {renderTableToggleIcon(expanded)}
              </button>
              {hasVerticalOverflow && !expanded ? (
                <div
                  ref={verticalRailRef}
                  className="table-shell-left-rail table-shell-left-rail--floating is-visible"
                  style={{
                    top: `${floatingRailTop}px`,
                    left: `${floatingRailLeft}px`,
                    width: `${floatingRailThickness}px`,
                    height: `${metrics.bodyHeight}px`,
                  }}
                >
                  <button
                    className="table-shell-left-rail-hitbox"
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onWheel={(event) => {
                      handleWheelCapture(event, 'y')
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      dragRef.current = {
                        axis: 'y',
                        pointerStart: event.clientY,
                        scrollStart: metrics.scrollTop,
                      }
                    }}
                  >
                    <span
                      className="table-shell-left-rail-thumb"
                      style={{
                        height: `${verticalThumbSize}px`,
                        transform: `translateY(${verticalThumbOffset}px)`,
                      }}
                    />
                  </button>
                </div>
              ) : null}
              {hasHorizontalOverflow ? (
                <div
                    className="table-shell-bottom-rail table-shell-bottom-rail--floating is-visible"
                  style={{
                    top: `${floatingBottomRailTop}px`,
                    left: `${shellRect.left}px`,
                    width: `${metrics.bodyWidth}px`,
                    height: `${BOTTOM_RAIL_HITBOX_HEIGHT}px`,
                  }}
                >
                  <button
                    ref={horizontalRailRef}
                    className="table-shell-bottom-rail-hitbox"
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onWheel={(event) => {
                      handleWheelCapture(event, 'x')
                    }}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      dragRef.current = {
                        axis: 'x',
                        pointerStart: event.clientX,
                        scrollStart: metrics.scrollLeft,
                      }
                    }}
                  >
                    <span
                      className="table-shell-bottom-rail-thumb"
                      style={{
                        width: `${horizontalThumbSize}px`,
                        transform: `translateX(${horizontalThumbOffset}px)`,
                      }}
                    />
                  </button>
                </div>
              ) : null}
            </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}
