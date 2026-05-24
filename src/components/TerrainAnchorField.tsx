import { useEffect, useMemo, useRef, useState } from 'react'
import { useUiMessages } from '../i18n'
import { isPointerEventOutside } from './floatingDismiss'
import { FloatingPortal } from './FloatingPortal'
import { ColorPopoverPicker } from './ColorPopoverPicker'
import { useAnchoredFloatingPosition } from './useAnchoredFloatingPosition'

export interface TerrainColorAnchor {
  elevation: number
  color: string
}

interface TerrainAnchorFieldProps {
  label: string
  anchors: TerrainColorAnchor[]
  min: number
  max: number
  pickerKeyPrefix: string
  onChange: (anchors: TerrainColorAnchor[]) => void
  snowLineElevation?: number | null
  snowColor?: string | null
  onSnowChange?: ((payload: { elevation: number; color: string }) => void) | null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseHexColor(color: string) {
  return Number.parseInt(color.replace('#', ''), 16)
}

function mixHexColors(leftHex: string, rightHex: string, ratio: number) {
  const left = parseHexColor(leftHex)
  const right = parseHexColor(rightHex)
  const clamped = Math.max(0, Math.min(1, ratio))
  const leftR = (left >> 16) & 0xff
  const leftG = (left >> 8) & 0xff
  const leftB = left & 0xff
  const rightR = (right >> 16) & 0xff
  const rightG = (right >> 8) & 0xff
  const rightB = right & 0xff

  const mixedR = Math.round(leftR + (rightR - leftR) * clamped)
  const mixedG = Math.round(leftG + (rightG - leftG) * clamped)
  const mixedB = Math.round(leftB + (rightB - leftB) * clamped)

  return `#${((mixedR << 16) | (mixedG << 8) | mixedB).toString(16).padStart(6, '0')}`
}

function normalizeAnchors(anchors: TerrainColorAnchor[], min: number, max: number) {
  if (anchors.length === 0) {
    return []
  }
  const sorted = [...anchors]
    .map((anchor) => ({
      elevation: clamp(Math.round(anchor.elevation), min, max),
      color: anchor.color,
    }))
    .sort((left, right) => left.elevation - right.elevation)

  const result: TerrainColorAnchor[] = []
  sorted.forEach((anchor, index) => {
    if (index === 0) {
      result.push({ ...anchor, elevation: min })
      return
    }
    if (index === sorted.length - 1) {
      result.push({ ...anchor, elevation: max })
      return
    }
    const previous = result[index - 1]
    const nextRaw = sorted[index + 1]
    result.push({
      ...anchor,
      elevation: clamp(anchor.elevation, previous.elevation + 1, Math.max(previous.elevation + 1, nextRaw.elevation - 1)),
    })
  })

  if (result.length === 1) {
    return [{ ...result[0], elevation: min }, { ...result[0], elevation: max }]
  }
  result[0] = { ...result[0], elevation: min }
  result[result.length - 1] = { ...result[result.length - 1], elevation: max }
  return result
}

function resolveColorAtElevation(anchors: TerrainColorAnchor[], elevation: number) {
  if (anchors.length === 0) {
    return '#000000'
  }
  const exact = anchors.find((anchor) => anchor.elevation === elevation)
  if (exact) {
    return exact.color
  }
  const left = [...anchors].reverse().find((anchor) => anchor.elevation < elevation) ?? anchors[0]
  const right = anchors.find((anchor) => anchor.elevation > elevation) ?? anchors.at(-1) ?? anchors[0]
  if (left.elevation === right.elevation) {
    return left.color
  }
  return mixHexColors(left.color, right.color, (elevation - left.elevation) / (right.elevation - left.elevation))
}

export function TerrainAnchorField({
  label,
  anchors,
  min,
  max,
  pickerKeyPrefix,
  onChange,
  snowLineElevation = null,
  snowColor = null,
  onSnowChange = null,
}: TerrainAnchorFieldProps) {
  const ui = useUiMessages()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const dragIndexRef = useRef<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<{ kind: 'anchor'; index: number } | { kind: 'snow' }>({
    kind: 'anchor',
    index: 0,
  })
  const popoverPosition = useAnchoredFloatingPosition({
    isOpen,
    anchorRef: triggerRef,
    floatingRef: popoverRef,
    fallbackWidth: () => 420,
    fallbackHeight: 480,
  })
  const createSnowDraft = () =>
    snowLineElevation !== null && snowColor ? { elevation: snowLineElevation, color: snowColor } : null
  const [draftAnchors, setDraftAnchors] = useState<TerrainColorAnchor[]>(() => normalizeAnchors(anchors, min, max))
  const [openingAnchors, setOpeningAnchors] = useState<TerrainColorAnchor[]>(() => normalizeAnchors(anchors, min, max))
  const [draftSnow, setDraftSnow] = useState(createSnowDraft)
  const [openingSnow, setOpeningSnow] = useState(createSnowDraft)

  const normalizedAnchors = useMemo(() => normalizeAnchors(anchors, min, max), [anchors, max, min])
  const normalizedDraftAnchors = useMemo(() => normalizeAnchors(draftAnchors, min, max), [draftAnchors, max, min])
  const displaySnow = isOpen ? draftSnow : createSnowDraft()

  const gradientStyle = useMemo(() => {
    const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index)
    const segments = steps.flatMap((elevation, index, array) => {
      const color = resolveColorAtElevation(normalizedAnchors, elevation)
      const start = (index / array.length) * 100
      const end = ((index + 1) / array.length) * 100
      return [`${color} ${start}%`, `${color} ${end}%`]
    })
    return { background: `linear-gradient(90deg, ${segments.join(', ')})` }
  }, [max, min, normalizedAnchors])

  const draftGradientStyle = useMemo(() => {
    const steps = Array.from({ length: max - min + 1 }, (_, index) => min + index)
    const segments = steps.flatMap((elevation, index, array) => {
      const color = resolveColorAtElevation(normalizedDraftAnchors, elevation)
      const start = (index / array.length) * 100
      const end = ((index + 1) / array.length) * 100
      return [`${color} ${start}%`, `${color} ${end}%`]
    })
    return { background: `linear-gradient(90deg, ${segments.join(', ')})` }
  }, [max, min, normalizedDraftAnchors])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (
        isPointerEventOutside(target, [triggerRef.current, popoverRef.current], [
          '.color-popover-picker__popover',
        ])
      ) {
        setDraftAnchors(openingAnchors)
        setDraftSnow(openingSnow)
        setIsOpen(false)
      }
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen, openingAnchors, openingSnow])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragIndex = dragIndexRef.current
      const axis = popoverRef.current?.querySelector('[data-terrain-anchor-axis]') as HTMLDivElement | null
      if (dragIndex === null || !axis) {
        return
      }
      const rect = axis.getBoundingClientRect()
      const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const requested = Math.round(min + ratio * (max - min))
      if (dragIndex === -1) {
        setDraftSnow((current) => (current ? { ...current, elevation: requested } : current))
        return
      }
      if (dragIndex === 0 || dragIndex === normalizedDraftAnchors.length - 1) {
        return
      }
      const previous = normalizedDraftAnchors[dragIndex - 1]
      const next = normalizedDraftAnchors[dragIndex + 1]
      const elevation = clamp(requested, previous.elevation + 1, next.elevation - 1)
      setDraftAnchors((current) =>
        normalizeAnchors(
          current.map((anchor, index) => (index === dragIndex ? { ...anchor, elevation } : anchor)),
          min,
          max,
        ),
      )
    }
    const handlePointerUp = () => {
      dragIndexRef.current = null
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [max, min, normalizedDraftAnchors])

  const handleAddAnchor = () => {
    const gaps = normalizedDraftAnchors.slice(0, -1).map((anchor, index) => ({
      index,
      gap: normalizedDraftAnchors[index + 1].elevation - anchor.elevation,
    }))
    const targetGap = gaps.sort((left, right) => right.gap - left.gap)[0]
    if (!targetGap || targetGap.gap <= 1) {
      return
    }
    const left = normalizedDraftAnchors[targetGap.index]
    const right = normalizedDraftAnchors[targetGap.index + 1]
    const elevation = Math.round((left.elevation + right.elevation) / 2)
    const color = resolveColorAtElevation(normalizedDraftAnchors, elevation)
    setDraftAnchors(normalizeAnchors([...normalizedDraftAnchors, { elevation, color }], min, max))
    setSelectedTarget({ kind: 'anchor', index: targetGap.index + 1 })
  }

  const resetDraftStateFromProps = () => {
    const normalized = normalizeAnchors(anchors, min, max)
    const nextSnow = createSnowDraft()
    setDraftAnchors(normalized)
    setOpeningAnchors(normalized)
    setDraftSnow(nextSnow)
    setOpeningSnow(nextSnow)
    setSelectedTarget({ kind: 'anchor', index: 0 })
  }

  const selectedAnchor =
    selectedTarget.kind === 'anchor'
      ? normalizedDraftAnchors[selectedTarget.index] ?? normalizedDraftAnchors[0]
      : null
  const selectedIndex = selectedTarget.kind === 'anchor' ? selectedTarget.index : -1
  const isEndpoint =
    selectedTarget.kind === 'anchor' &&
    (selectedTarget.index === 0 || selectedTarget.index === normalizedDraftAnchors.length - 1)
  const snowRatio =
    displaySnow !== null ? (displaySnow.elevation - min) / (max - min) : null

  const commitDraft = (close: boolean) => {
    const next = normalizeAnchors(draftAnchors, min, max)
    onChange(next)
    setOpeningAnchors(next)
    if (draftSnow && onSnowChange) {
      onSnowChange(draftSnow)
      setOpeningSnow(draftSnow)
    }
    if (close) {
      setIsOpen(false)
    }
  }

  return (
    <div className="terrain-anchor-field">
      <button
        ref={triggerRef}
        type="button"
        className="terrain-anchor-trigger"
        onClick={() => {
          setIsOpen((current) => {
            const next = !current
            if (next) {
              resetDraftStateFromProps()
            }
            return next
          })
        }}
      >
        <span>{label}</span>
        <span className="terrain-anchor-preview-wrap">
          {displaySnow ? (
            <span
              className={`terrain-snow-preview-stop${snowRatio !== null && snowRatio > 0.5 ? ' is-right' : ' is-left'}`}
              style={{
                left: `${((displaySnow.elevation - min) / (max - min)) * 100}%`,
                color: displaySnow.color,
              }}
            >
              {displaySnow.elevation}
            </span>
          ) : null}
          <span className="terrain-anchor-preview" style={gradientStyle} />
          <span className="terrain-anchor-preview-labels">
            {normalizedAnchors.map((anchor) => (
              <span
                key={`${label}-${anchor.elevation}`}
                className="terrain-anchor-preview-stop"
                style={{ left: `${((anchor.elevation - min) / (max - min)) * 100}%` }}
              >
                {anchor.elevation}
              </span>
            ))}
          </span>
        </span>
      </button>
      {isOpen ? (
        <FloatingPortal>
            <div
              ref={popoverRef}
              className="terrain-anchor-popover"
              style={{ top: popoverPosition.top, left: popoverPosition.left }}
            >
              <div className="terrain-anchor-popover-title">{label}</div>
              <div className="terrain-anchor-axis-wrap">
                <div className="terrain-anchor-axis-wrap">
                  {draftSnow ? (
                    <div className="terrain-snow-handle-row">
                      <button
                        type="button"
                        className={`terrain-snow-handle${snowRatio !== null && snowRatio > 0.5 ? ' is-right' : ' is-left'}`}
                        style={{
                          left: `${((draftSnow.elevation - min) / (max - min)) * 100}%`,
                          backgroundColor: draftSnow.color,
                        }}
                        onClick={() => {
                          setSelectedTarget({ kind: 'snow' })
                        }}
                        onPointerDown={() => {
                          dragIndexRef.current = -1
                          setSelectedTarget({ kind: 'snow' })
                        }}
                      >
                        {draftSnow.elevation}
                      </button>
                    </div>
                  ) : null}
                  <div className="terrain-anchor-axis" data-terrain-anchor-axis style={draftGradientStyle} />
                  <div className="terrain-anchor-handles">
                    {normalizedDraftAnchors.map((anchor, index) => (
                      <button
                        key={`${label}-handle-${anchor.elevation}-${index}`}
                        type="button"
                        className={`terrain-anchor-handle${selectedTarget.kind === 'anchor' && selectedIndex === index ? ' is-active' : ''}${index === 0 || index === normalizedDraftAnchors.length - 1 ? ' is-fixed' : ''}`}
                        style={{ left: `${((anchor.elevation - min) / (max - min)) * 100}%` }}
                        onClick={() => {
                          setSelectedTarget({ kind: 'anchor', index })
                        }}
                        onPointerDown={() => {
                          if (index === 0 || index === normalizedDraftAnchors.length - 1) {
                            setSelectedTarget({ kind: 'anchor', index })
                            return
                          }
                          dragIndexRef.current = index
                          setSelectedTarget({ kind: 'anchor', index })
                        }}
                      >
                        {anchor.elevation}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {selectedTarget.kind === 'snow' && draftSnow ? (
                <div className="terrain-anchor-selected">
                  <label className="control-field compact-control-field">
                    <span>{ui.common.height}</span>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={1}
                      value={draftSnow.elevation}
                      onChange={(event) => {
                        const requested = Number(event.target.value)
                        setDraftSnow({
                          ...draftSnow,
                          elevation: clamp(
                            Math.round(Number.isFinite(requested) ? requested : draftSnow.elevation),
                            min,
                            max,
                          ),
                        })
                      }}
                    />
                  </label>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.color}</span>
                    <ColorPopoverPicker
                      value={draftSnow.color}
                      pickerKey={`${pickerKeyPrefix}:snow`}
                      onApply={(value) => {
                        setDraftSnow({ ...draftSnow, color: value })
                      }}
                    />
                  </label>
                </div>
              ) : selectedAnchor ? (
                <div className="terrain-anchor-selected">
                  <label className="control-field compact-control-field">
                    <span>{ui.common.height}</span>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={1}
                      disabled={isEndpoint}
                      value={selectedAnchor.elevation}
                      onChange={(event) => {
                        const previous = normalizedDraftAnchors[selectedIndex - 1]
                        const next = normalizedDraftAnchors[selectedIndex + 1]
                        const requested = Number(event.target.value)
                        const elevation = clamp(
                          Math.round(Number.isFinite(requested) ? requested : selectedAnchor.elevation),
                          previous ? previous.elevation + 1 : min,
                          next ? next.elevation - 1 : max,
                        )
                        setDraftAnchors((current) =>
                          normalizeAnchors(
                            current.map((anchor, index) =>
                              index === selectedIndex ? { ...anchor, elevation } : anchor,
                            ),
                            min,
                            max,
                          ),
                        )
                      }}
                    />
                  </label>
                  <label className="control-field compact-control-field">
                    <span>{ui.common.color}</span>
                    <ColorPopoverPicker
                      value={selectedAnchor.color}
                      pickerKey={`${pickerKeyPrefix}:${selectedIndex}:${selectedAnchor.elevation}`}
                      onApply={(value) => {
                        setDraftAnchors((current) =>
                          current.map((anchor, index) =>
                            index === selectedIndex ? { ...anchor, color: value } : anchor,
                          ),
                        )
                      }}
                    />
                  </label>
                </div>
              ) : null}
              <div className="terrain-anchor-actions">
                <button
                  type="button"
                  className="toolbar-action-button toolbar-action-button--secondary"
                  onClick={handleAddAnchor}
                >
                  {ui.terrainAnchor.addAnchor}
                </button>
                <button
                  type="button"
                  className="toolbar-action-button toolbar-action-button--danger"
                  disabled={
                    selectedTarget.kind === 'snow' ||
                    isEndpoint ||
                    normalizedDraftAnchors.length <= 2
                  }
                  onClick={() => {
                    if (
                      selectedTarget.kind === 'snow' ||
                      isEndpoint ||
                      normalizedDraftAnchors.length <= 2
                    ) {
                      return
                    }
                    const nextAnchors = normalizedDraftAnchors.filter((_, index) => index !== selectedIndex)
                    setDraftAnchors(nextAnchors)
                    setSelectedTarget({ kind: 'anchor', index: Math.max(0, Math.min(selectedIndex - 1, nextAnchors.length - 1)) })
                  }}
                >
                  {ui.common.delete}
                </button>
              </div>
              <div className="terrain-anchor-actions">
                <button
                  type="button"
                  className="toolbar-action-button toolbar-action-button--cancel"
                  onClick={() => {
                    setDraftAnchors(openingAnchors)
                    setDraftSnow(openingSnow)
                    setIsOpen(false)
                  }}
                >
                  {ui.common.cancel}
                </button>
                <button
                  type="button"
                  className="toolbar-action-button toolbar-action-button--apply"
                  onClick={() => {
                    commitDraft(false)
                  }}
                >
                  {ui.common.apply}
                </button>
                <button
                  type="button"
                  className="toolbar-action-button toolbar-action-button--confirm"
                  onClick={() => {
                    commitDraft(true)
                  }}
                >
                  {ui.common.confirm}
                </button>
              </div>
            </div>
        </FloatingPortal>
      ) : null}
    </div>
  )
}
