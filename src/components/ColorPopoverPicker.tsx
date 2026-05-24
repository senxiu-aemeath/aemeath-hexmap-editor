import { useEffect, useMemo, useRef, useState } from 'react'
import { useUiMessages } from '../i18n'
import { isPointerEventOutside } from './floatingDismiss'
import { FloatingPortal } from './FloatingPortal'
import { useAnchoredFloatingPosition } from './useAnchoredFloatingPosition'

const GLOBAL_HISTORY_KEY = 'hex-map-editor:color-history:global'
const LOCAL_HISTORY_KEY_PREFIX = 'hex-map-editor:color-history:picker:'
const LOCAL_HISTORY_LIMIT = 10
const GLOBAL_HISTORY_LIMIT = 20
const HISTORY_SYNC_EVENT = 'hex-map-editor:color-history-sync'

interface HsvColor {
  h: number
  s: number
  v: number
}

interface ColorPopoverPickerProps {
  value: string
  onApply: (value: string) => void
  pickerKey: string
  themeId?: string
  showHexLabel?: boolean
  disabled?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(value: string) {
  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : null
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex)
  if (!normalized) {
    return null
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const toChannel = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`
}

function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  let h = 0

  if (delta !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6)
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2)
    } else {
      h = 60 * ((rn - gn) / delta + 4)
    }
  }

  const s = max === 0 ? 0 : delta / max
  const v = max

  return {
    h: Math.round((h + 360) % 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  }
}

function hsvToRgb(h: number, s: number, v: number) {
  const sn = clamp(s, 0, 100) / 100
  const vn = clamp(v, 0, 100) / 100
  const c = vn * sn
  const hp = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = vn - c

  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (hp >= 0 && hp < 1) {
    r1 = c
    g1 = x
  } else if (hp < 2) {
    r1 = x
    g1 = c
  } else if (hp < 3) {
    g1 = c
    b1 = x
  } else if (hp < 4) {
    g1 = x
    b1 = c
  } else if (hp < 5) {
    r1 = x
    b1 = c
  } else {
    r1 = c
    b1 = x
  }

  return {
    r: (r1 + m) * 255,
    g: (g1 + m) * 255,
    b: (b1 + m) * 255,
  }
}

function hexToHsv(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) {
    return { h: 0, s: 0, v: 100 }
  }

  return rgbToHsv(rgb.r, rgb.g, rgb.b)
}

function hsvToHex(hsv: HsvColor) {
  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

function readHistory(key: string) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((entry): entry is string => typeof entry === 'string' && Boolean(normalizeHex(entry)))
  } catch {
    return []
  }
}

function writeHistory(key: string, colors: string[], limit: number) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(colors.slice(0, limit)))
}

function pushHistory(colors: string[], color: string, limit: number) {
  const normalized = normalizeHex(color)
  if (!normalized) {
    return colors
  }

  return [normalized, ...colors.filter((entry) => entry !== normalized)].slice(0, limit)
}

export function ColorPopoverPicker({
  value,
  onApply,
  pickerKey,
  themeId,
  showHexLabel = true,
  disabled = false,
}: ColorPopoverPickerProps) {
  const ui = useUiMessages()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [openingHex, setOpeningHex] = useState(value)
  const [draftHex, setDraftHex] = useState(value)
  const [draftHsv, setDraftHsv] = useState<HsvColor>(() => hexToHsv(value))
  const [localHistory, setLocalHistory] = useState<string[]>([])
  const [globalHistory, setGlobalHistory] = useState<string[]>([])
  const popoverPosition = useAnchoredFloatingPosition({
    isOpen,
    anchorRef: triggerRef,
    floatingRef: popoverRef,
    fallbackWidth: () => Math.min(320, window.innerWidth - 48),
    fallbackHeight: 420,
  })

  const normalizedDraftHex = useMemo(() => normalizeHex(draftHex), [draftHex])
  const effectiveDraftHex = normalizedDraftHex ?? hsvToHex(draftHsv)

  useEffect(() => {
    setDraftHex(value)
    setDraftHsv(hexToHsv(value))
  }, [value])

  useEffect(() => {
    setLocalHistory(readHistory(`${LOCAL_HISTORY_KEY_PREFIX}${pickerKey}`))
    setGlobalHistory(readHistory(GLOBAL_HISTORY_KEY))
  }, [pickerKey])

  useEffect(() => {
    const syncHistory = () => {
      setLocalHistory(readHistory(`${LOCAL_HISTORY_KEY_PREFIX}${pickerKey}`))
      setGlobalHistory(readHistory(GLOBAL_HISTORY_KEY))
    }

    window.addEventListener(HISTORY_SYNC_EVENT, syncHistory)
    return () => {
      window.removeEventListener(HISTORY_SYNC_EVENT, syncHistory)
    }
  }, [pickerKey])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (isPointerEventOutside(target, [triggerRef.current, popoverRef.current])) {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  const commitColor = (nextColor: string, closeAfterApply: boolean) => {
    const normalized = normalizeHex(nextColor)
    if (!normalized) {
      return
    }

    const nextLocal = pushHistory(localHistory, normalized, LOCAL_HISTORY_LIMIT)
    const nextGlobal = pushHistory(globalHistory, normalized, GLOBAL_HISTORY_LIMIT)
    setLocalHistory(nextLocal)
    setGlobalHistory(nextGlobal)
    writeHistory(`${LOCAL_HISTORY_KEY_PREFIX}${pickerKey}`, nextLocal, LOCAL_HISTORY_LIMIT)
    writeHistory(GLOBAL_HISTORY_KEY, nextGlobal, GLOBAL_HISTORY_LIMIT)
    window.dispatchEvent(new Event(HISTORY_SYNC_EVENT))
    onApply(normalized)
    setDraftHex(normalized)
    setDraftHsv(hexToHsv(normalized))
    if (closeAfterApply) {
      setIsOpen(false)
    }
  }

  const handleSatValPointer = (clientX: number, clientY: number) => {
    const rect = popoverRef.current?.querySelector('.color-popover-picker__satval')?.getBoundingClientRect()
    if (!rect) {
      return
    }

    const nextS = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100)
    const nextV = clamp((1 - (clientY - rect.top) / rect.height) * 100, 0, 100)
    const nextHsv = { ...draftHsv, s: Math.round(nextS), v: Math.round(nextV) }
    setDraftHsv(nextHsv)
    setDraftHex(hsvToHex(nextHsv))
  }

  const historyColors = [
    { label: ui.common.local, colors: localHistory },
    { label: ui.common.global, colors: globalHistory },
  ]
  const popover = isOpen
    ? (
      <FloatingPortal>
        <div
          ref={popoverRef}
          className="color-popover-picker__popover color-popover-picker__popover--floating"
          data-theme-id={themeId}
          style={{
            top: `${popoverPosition.top}px`,
            left: `${popoverPosition.left}px`,
          }}
        >
          <div className="color-popover-picker__preview-row">
            <div
              className="color-popover-picker__preview"
              style={{ backgroundColor: effectiveDraftHex }}
            />
            <input
              className="color-popover-picker__hex"
              type="text"
              value={draftHex}
              onChange={(event) => {
                const nextValue = event.target.value
                setDraftHex(nextValue)
                const normalized = normalizeHex(nextValue)
                if (normalized) {
                  setDraftHsv(hexToHsv(normalized))
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitColor(draftHex, true)
                }
              }}
            />
          </div>
          <div
            className="color-popover-picker__satval"
            style={{ '--picker-hue': `${draftHsv.h}` } as React.CSSProperties}
            onPointerDown={(event) => {
              event.preventDefault()
              handleSatValPointer(event.clientX, event.clientY)

              const handleMove = (moveEvent: PointerEvent) => {
                handleSatValPointer(moveEvent.clientX, moveEvent.clientY)
              }

              const handleUp = () => {
                window.removeEventListener('pointermove', handleMove)
                window.removeEventListener('pointerup', handleUp)
              }

              window.addEventListener('pointermove', handleMove)
              window.addEventListener('pointerup', handleUp)
            }}
          >
            <div
              className="color-popover-picker__satval-thumb"
              style={{
                left: `${draftHsv.s}%`,
                top: `${100 - draftHsv.v}%`,
              }}
            />
          </div>
          <label className="color-popover-picker__slider-row color-popover-picker__slider-row--hue">
            <span>{ui.colorPicker.hue}</span>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={draftHsv.h}
              onChange={(event) => {
                const nextHsv = { ...draftHsv, h: Number.parseInt(event.target.value, 10) }
                setDraftHsv(nextHsv)
                setDraftHex(hsvToHex(nextHsv))
              }}
            />
            <button
              type="button"
              className="color-popover-picker__hue-preview"
              style={{ backgroundColor: openingHex }}
              title={ui.colorPicker.revertToOpeningColor}
              onClick={() => {
                setDraftHex(openingHex)
                setDraftHsv(hexToHsv(openingHex))
              }}
            />
          </label>
          {historyColors.map((section) =>
            section.colors.length > 0 ? (
              <div className="color-popover-picker__history" key={section.label}>
                <div className="color-popover-picker__history-title">{section.label}</div>
                <div className="color-popover-picker__history-grid">
                  {section.colors.map((color) => (
                    <button
                      key={`${section.label}-${color}`}
                      type="button"
                      className="color-popover-picker__history-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setDraftHex(color)
                        setDraftHsv(hexToHsv(color))
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null,
          )}
          <div className="color-popover-picker__actions">
            <button
              type="button"
              className="toolbar-action-button toolbar-action-button--secondary"
              onClick={() => {
                setDraftHex(value)
                setDraftHsv(hexToHsv(value))
                setIsOpen(false)
              }}
            >
              {ui.common.cancel}
            </button>
            <button
              type="button"
              className="toolbar-action-button toolbar-action-button--secondary"
              onClick={() => {
                commitColor(effectiveDraftHex, false)
              }}
            >
              {ui.common.apply}
            </button>
            <button
              type="button"
              className="toolbar-action-button"
              onClick={() => {
                commitColor(effectiveDraftHex, true)
              }}
            >
              {ui.common.confirm}
            </button>
          </div>
        </div>
      </FloatingPortal>
      )
    : null

  return (
    <div className="color-popover-picker">
      <button
        ref={triggerRef}
        type="button"
        className={`color-popover-picker__trigger${showHexLabel ? '' : ' color-popover-picker__trigger--icon-only'}`}
        disabled={disabled}
        onClick={() => {
          if (disabled) {
            return
          }
          setIsOpen((current) => {
            const next = !current
            if (next) {
              setOpeningHex(value)
              setDraftHex(value)
              setDraftHsv(hexToHsv(value))
            }
            return next
          })
        }}
      >
        <span
          className="color-popover-picker__swatch"
          style={{ backgroundColor: value }}
        />
        {showHexLabel ? <span className="color-popover-picker__label">{value}</span> : null}
      </button>
      {popover}
    </div>
  )
}
