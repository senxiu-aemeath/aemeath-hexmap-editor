import { useEffect, useState, type ReactNode } from 'react'
import type { LabelStyle } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { ColorApplyField } from '../ColorApplyField'

interface LabelStyleDefaultToggle {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

interface LabelStyleControlsProps {
  title: string
  style: LabelStyle
  overriddenKeys?: Set<keyof LabelStyle>
  disabled?: boolean
  defaultToggle?: LabelStyleDefaultToggle
  onChange: <K extends keyof LabelStyle>(key: K, value: LabelStyle[K]) => void
  onResetKey?: (key: keyof LabelStyle) => void
  onDefaultKey?: (key: keyof LabelStyle) => void
  onRestoreKey?: (key: keyof LabelStyle) => void
  onRestoreAll?: () => void
}

export function LabelStyleControls({
  title,
  style,
  overriddenKeys,
  disabled = false,
  defaultToggle,
  onChange,
  onResetKey,
  onDefaultKey,
  onRestoreKey,
}: LabelStyleControlsProps) {
  const ui = useUiMessages()
  const strokeEnabled = style.strokeWidth > 0

  const applyKeys = (
    keys: Array<keyof LabelStyle>,
    handler: ((key: keyof LabelStyle) => void) | undefined,
  ) => {
    if (!handler) {
      return
    }
    for (const key of keys) {
      handler(key)
    }
  }

  const resetTypography = () => {
    applyKeys(
      [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'scaleWithCountrySize',
        'countrySizeScaleMin',
        'countrySizeScaleMax',
      ],
      onResetKey ?? onRestoreKey,
    )
  }
  const defaultTypography = () => {
    applyKeys(
      [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'scaleWithCountrySize',
        'countrySizeScaleMin',
        'countrySizeScaleMax',
      ],
      onDefaultKey,
    )
  }

  const resetPaint = () => {
    applyKeys(['fill', 'stroke', 'strokeWidth', 'opacity'], onResetKey ?? onRestoreKey)
  }
  const defaultPaint = () => {
    applyKeys(['fill', 'stroke', 'strokeWidth', 'opacity'], onDefaultKey)
  }

  const resetLayout = () => {
    applyKeys(['textAlign', 'rotation'], onResetKey ?? onRestoreKey)
  }
  const defaultLayout = () => {
    applyKeys(['textAlign', 'rotation'], onDefaultKey)
  }

  const renderHeaderActions = (onReset: () => void, onDefault: () => void) => (
    <div className="label-style-header-actions">
      {defaultToggle && (
        <label className="editor-action-toggle label-style-default-toggle">
          <span>{ui.common.defaultValue}</span>
          <input
            type="checkbox"
            checked={defaultToggle.checked}
            disabled={defaultToggle.disabled ?? disabled}
            onChange={(event) => {
              defaultToggle.onChange(event.target.checked)
            }}
          />
        </label>
      )}
      {!defaultToggle && onDefaultKey && (
        <button
          className="mini-icon-button editor-action-button"
          type="button"
          disabled={disabled}
          onClick={onDefault}
        >
          {ui.common.defaultValue}
        </button>
      )}
      <button
        className="mini-icon-button editor-action-button"
        type="button"
        disabled={disabled || !(onResetKey || onRestoreKey)}
        onClick={onReset}
      >
        {ui.common.reset}
      </button>
    </div>
  )

  return (
    <div className="label-style-sections">
      <div className="detail-card label-style-card">
        <div className="label-style-header">
          <strong className="label-style-card-title">{ui.label.styleTypography}</strong>
          {renderHeaderActions(resetTypography, defaultTypography)}
        </div>
        <div className="label-style-list">
          <StyleRow
            label={ui.label.styleFont}
            disabled={disabled}
            overridden={overriddenKeys?.has('fontFamily') ?? false}
            onRestore={() => onRestoreKey?.('fontFamily')}
          >
            <FontFamilyField
              key={style.fontFamily}
              value={style.fontFamily}
              disabled={disabled}
              onCommit={(value) => onChange('fontFamily', value)}
            />
          </StyleRow>
          <NumericRow
            label={ui.label.styleSize}
            disabled={disabled}
            overridden={overriddenKeys?.has('fontSize') ?? false}
            onRestore={() => onRestoreKey?.('fontSize')}
            value={style.fontSize}
            min={1}
            max={320}
            step={1}
            clampMode="min-only"
            onCommit={(value) => onChange('fontSize', value)}
          />
          <NumericRow
            label={ui.label.styleWeight}
            disabled={disabled}
            overridden={overriddenKeys?.has('fontWeight') ?? false}
            onRestore={() => onRestoreKey?.('fontWeight')}
            value={normalizeWeightValue(style.fontWeight)}
            min={100}
            max={1200}
            step={100}
            clampMode="min-only"
            onCommit={(value) => onChange('fontWeight', String(value))}
          />
          <StyleRow
            label={ui.label.styleFontStyle}
            disabled={disabled}
            overridden={overriddenKeys?.has('fontStyle') ?? false}
            onRestore={() => onRestoreKey?.('fontStyle')}
          >
            <select
              value={style.fontStyle}
              disabled={disabled}
              onChange={(event) => onChange('fontStyle', event.target.value as LabelStyle['fontStyle'])}
            >
              <option value="normal">{ui.common.normal}</option>
              <option value="italic">{ui.common.italic}</option>
            </select>
          </StyleRow>
          <NumericRow
            label={ui.label.styleLetterSpacing}
            disabled={disabled}
            overridden={overriddenKeys?.has('letterSpacing') ?? false}
            onRestore={() => onRestoreKey?.('letterSpacing')}
            value={style.letterSpacing}
            min={-40}
            max={120}
            step={0.1}
            clampMode="none"
            onCommit={(value) => onChange('letterSpacing', value)}
          />
          <StyleRow
            label={ui.label.styleScaleWithCountrySize}
            disabled={disabled}
            overridden={overriddenKeys?.has('scaleWithCountrySize') ?? false}
            onRestore={() => onRestoreKey?.('scaleWithCountrySize')}
          >
            <label className="label-style-checkbox">
              <input
                type="checkbox"
                checked={style.scaleWithCountrySize}
                disabled={disabled}
                onChange={(event) => onChange('scaleWithCountrySize', event.target.checked)}
              />
              <span>{ui.common.enable}</span>
            </label>
          </StyleRow>
          <NumericRow
            label={ui.label.styleCountryScaleMin}
            disabled={disabled}
            overridden={overriddenKeys?.has('countrySizeScaleMin') ?? false}
            onRestore={() => onRestoreKey?.('countrySizeScaleMin')}
            value={style.countrySizeScaleMin}
            min={0.1}
            max={3}
            step={0.01}
            clampMode="min-only"
            onCommit={(value) => {
              const nextMin = Math.max(0.1, value)
              onChange('countrySizeScaleMin', nextMin)
              if (style.countrySizeScaleMax < nextMin) {
                onChange('countrySizeScaleMax', nextMin)
              }
            }}
          />
          <NumericRow
            label={ui.label.styleCountryScaleMax}
            disabled={disabled}
            overridden={overriddenKeys?.has('countrySizeScaleMax') ?? false}
            onRestore={() => onRestoreKey?.('countrySizeScaleMax')}
            value={style.countrySizeScaleMax}
            min={0.1}
            max={3}
            step={0.01}
            clampMode="min-only"
            onCommit={(value) => {
              const nextMax = Math.max(0.1, value)
              onChange('countrySizeScaleMax', nextMax)
              if (style.countrySizeScaleMin > nextMax) {
                onChange('countrySizeScaleMin', nextMax)
              }
            }}
          />
          <StyleRow
            label={ui.label.styleTransform}
            disabled={disabled}
            overridden={overriddenKeys?.has('textTransform') ?? false}
            onRestore={() => onRestoreKey?.('textTransform')}
          >
            <select
              value={style.textTransform}
              disabled={disabled}
              onChange={(event) =>
                onChange('textTransform', event.target.value as LabelStyle['textTransform'])
              }
            >
              <option value="none">{ui.common.none}</option>
              <option value="uppercase">{ui.common.uppercase}</option>
              <option value="lowercase">{ui.common.lowercase}</option>
              <option value="capitalize">{ui.common.capitalize}</option>
            </select>
          </StyleRow>
        </div>
      </div>

      <div className="detail-card label-style-card">
        <div className="label-style-header">
          <strong className="label-style-card-title">{ui.label.stylePaint}</strong>
          {renderHeaderActions(resetPaint, defaultPaint)}
        </div>
        <div className="label-style-list">
          <StyleRow
            label={ui.label.styleFill}
            disabled={disabled}
            overridden={overriddenKeys?.has('fill') ?? false}
            onRestore={() => onRestoreKey?.('fill')}
          >
            <ColorApplyField
              value={style.fill}
              pickerKey={`label-style:${title}:fill`}
              disabled={disabled}
              onApply={(value) => onChange('fill', value)}
            />
          </StyleRow>
          <StyleRow
            label={ui.label.styleStroke}
            disabled={disabled}
            overridden={
              (overriddenKeys?.has('stroke') ?? false) || (overriddenKeys?.has('strokeWidth') ?? false)
            }
            onRestore={() => {
              onRestoreKey?.('stroke')
              onRestoreKey?.('strokeWidth')
            }}
          >
            <div className="label-style-inline label-style-inline--spread">
              <label className="label-style-checkbox">
                <input
                  type="checkbox"
                  checked={strokeEnabled}
                  disabled={disabled}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange('strokeWidth', style.strokeWidth > 0 ? style.strokeWidth : 1)
                    } else {
                      onChange('strokeWidth', 0)
                    }
                  }}
                />
                <span>{ui.common.enable}</span>
              </label>
              <ColorApplyField
                value={style.stroke}
                pickerKey={`label-style:${title}:stroke`}
                disabled={disabled || !strokeEnabled}
                onApply={(value) => onChange('stroke', value)}
              />
            </div>
          </StyleRow>
          <NumericRow
            label={ui.label.styleStrokeWidth}
            disabled={disabled || !strokeEnabled}
            overridden={overriddenKeys?.has('strokeWidth') ?? false}
            onRestore={() => onRestoreKey?.('strokeWidth')}
            value={style.strokeWidth}
            min={0}
            max={60}
            step={0.1}
            clampMode="min-only"
            onCommit={(value) => onChange('strokeWidth', value)}
          />
          <NumericRow
            label={ui.label.styleOpacity}
            disabled={disabled}
            overridden={overriddenKeys?.has('opacity') ?? false}
            onRestore={() => onRestoreKey?.('opacity')}
            value={style.opacity}
            min={0}
            max={1}
            step={0.05}
            onCommit={(value) => onChange('opacity', value)}
          />
        </div>
      </div>

      <div className="detail-card label-style-card">
        <div className="label-style-header">
          <strong className="label-style-card-title">{ui.label.styleLayout}</strong>
          {renderHeaderActions(resetLayout, defaultLayout)}
        </div>
        <div className="label-style-list">
          <StyleRow
            label={ui.label.styleAlign}
            disabled={disabled}
            overridden={overriddenKeys?.has('textAlign') ?? false}
            onRestore={() => onRestoreKey?.('textAlign')}
          >
            <select
              value={style.textAlign}
              disabled={disabled}
              onChange={(event) => onChange('textAlign', event.target.value as LabelStyle['textAlign'])}
            >
              <option value="left">{ui.common.leftAlign}</option>
              <option value="center">{ui.common.centerAlign}</option>
              <option value="right">{ui.common.rightAlign}</option>
            </select>
          </StyleRow>
          <NumericRow
            label={ui.label.styleRotation}
            disabled={disabled}
            overridden={overriddenKeys?.has('rotation') ?? false}
            onRestore={() => onRestoreKey?.('rotation')}
            value={style.rotation}
            min={-6.283}
            max={6.283}
            step={0.01}
            onCommit={(value) => onChange('rotation', value)}
          />
        </div>
      </div>
      <p className="label-style-instruction">{ui.label.styleRestoreHint}</p>
    </div>
  )
}

function StyleRow({
  label,
  overridden,
  disabled = false,
  onRestore,
  children,
}: {
  label: string
  overridden: boolean
  disabled?: boolean
  onRestore?: () => void
  children: ReactNode
}) {
  return (
    <div className={`label-style-row${overridden ? ' is-overridden' : ''}${disabled ? ' is-disabled' : ''}`}>
      <div
        className="label-style-name"
        role="button"
        tabIndex={disabled ? -1 : 0}
        onDoubleClick={() => {
          if (disabled || !overridden) {
            return
          }
          onRestore?.()
        }}
        onKeyDown={(event) => {
          if ((event.key === 'Enter' || event.key === ' ') && overridden) {
            event.preventDefault()
            onRestore?.()
          }
        }}
      >
        {label}
      </div>
      <div className="label-style-control">{children}</div>
    </div>
  )
}

function FontFamilyField({
  value,
  disabled,
  onCommit,
}: {
  value: string
  disabled: boolean
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = useState(value)

  return (
    <input
      type="text"
      value={draft}
      disabled={disabled}
      onChange={(event) => {
        setDraft(event.target.value)
      }}
      onBlur={() => {
        onCommit(draft)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
    />
  )
}

function NumericRow({
  label,
  value,
  min,
  max,
  step,
  clampMode = 'slider',
  disabled = false,
  overridden,
  onRestore,
  onCommit,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  clampMode?: 'slider' | 'min-only' | 'none'
  disabled?: boolean
  overridden: boolean
  onRestore?: () => void
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState(() => String(value))
  const sliderMin = Math.min(min, value)
  const sliderMax = Math.max(max, value)

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  return (
    <StyleRow
      label={label}
      disabled={disabled}
      overridden={overridden}
      onRestore={onRestore}
    >
      <div className="label-style-slider-row">
        <input
          className="label-style-slider"
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = Number(event.target.value)
            onCommit(nextValue)
          }}
        />
        <input
          className="label-style-number"
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          onBlur={() => {
            const nextValue = Number.parseFloat(draft)
            if (Number.isFinite(nextValue)) {
              const committedValue =
                clampMode === 'slider'
                  ? clamp(nextValue, min, max)
                  : clampMode === 'min-only'
                    ? Math.max(nextValue, min)
                    : nextValue
              onCommit(committedValue)
            }
            setDraft(String(value))
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
        />
      </div>
    </StyleRow>
  )
}

function normalizeWeightValue(value: string) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isFinite(parsed)) {
    return clamp(Math.round(parsed / 100) * 100, 100, 900)
  }
  return 400
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
