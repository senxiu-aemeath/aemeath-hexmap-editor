import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useUiMessages } from '../i18n'
import type { IconRegistryEntry } from '../features/icons/iconRegistry'
import { isPointerEventOutside } from './floatingDismiss'
import { FloatingPortal } from './FloatingPortal'
import { useAnchoredFloatingPosition } from './useAnchoredFloatingPosition'

interface IconPickerProps {
  value: string | null | undefined
  entries: IconRegistryEntry[]
  onApply: (value: string | null) => void
  disabled?: boolean
  allowEmpty?: boolean
  pickerLabel?: string
}

export function IconPicker({
  value,
  entries,
  onApply,
  disabled = false,
  allowEmpty = false,
  pickerLabel,
}: IconPickerProps) {
  const ui = useUiMessages()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const popoverPosition = useAnchoredFloatingPosition({
    isOpen,
    anchorRef: triggerRef,
    floatingRef: popoverRef,
    fallbackWidth: () => Math.min(360, window.innerWidth - 48),
    fallbackHeight: 420,
  })

  const closePicker = useCallback(() => {
    setSearchValue('')
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (isPointerEventOutside(target, [triggerRef.current, popoverRef.current])) {
        closePicker()
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [closePicker, isOpen])

  const normalizedSearch = searchValue.trim().toLowerCase()
  const filteredEntries = useMemo(
    () =>
      normalizedSearch
        ? entries.filter((entry) => entry.key.toLowerCase().includes(normalizedSearch))
        : entries,
    [entries, normalizedSearch],
  )
  const selectedEntry = entries.find((entry) => entry.key === value) ?? null

  return (
    <>
      <button
        ref={triggerRef}
        className={`icon-picker-trigger${isOpen ? ' is-open' : ''}`}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (isOpen) {
            closePicker()
            return
          }
          setIsOpen(true)
        }}
      >
        <span className="icon-picker-trigger__preview">
          {selectedEntry ? (
            <img src={selectedEntry.src} alt={selectedEntry.key} />
          ) : (
            <span className="icon-picker-trigger__empty" aria-hidden="true">
              -
            </span>
          )}
        </span>
        <span className="icon-picker-trigger__label">
          {selectedEntry?.key ?? pickerLabel ?? ui.icons.none}
        </span>
      </button>
      {isOpen ? (
        <FloatingPortal>
          <div
            ref={popoverRef}
            className="icon-picker-popover"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
            }}
          >
            <div className="icon-picker-popover__header">
              <strong>{ui.icons.pickerTitle}</strong>
              {allowEmpty ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    onApply(null)
                    closePicker()
                  }}
                >
                  {ui.icons.clear}
                </button>
              ) : null}
            </div>
            <input
              className="icon-picker-popover__search"
              type="text"
              value={searchValue}
              placeholder={ui.icons.searchPlaceholder}
              onChange={(event) => {
                setSearchValue(event.target.value)
              }}
            />
            <div className="icon-picker-popover__grid">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <button
                    key={entry.key}
                    className={`icon-picker-option${entry.key === selectedEntry?.key ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onApply(entry.key)
                      closePicker()
                    }}
                  >
                    <span className="icon-picker-option__preview">
                      <img src={entry.src} alt={entry.key} />
                    </span>
                    <span className="icon-picker-option__meta">
                      <span className="icon-picker-option__key">{entry.key}</span>
                      <span className="icon-picker-option__tag">
                        {entry.builtIn ? ui.icons.builtIn : ui.icons.custom}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="icon-picker-popover__empty">{ui.icons.noIcons}</div>
              )}
            </div>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}
