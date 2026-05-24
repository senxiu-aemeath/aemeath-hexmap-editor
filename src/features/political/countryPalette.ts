interface RgbColor {
  r: number
  g: number
  b: number
}

function normalizeHexColor(value: string) {
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase()
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1)
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return null
}

function hexColorToRgb(value: string): RgbColor | null {
  const normalized = normalizeHexColor(value)
  if (!normalized) {
    return null
  }
  const r = Number.parseInt(normalized.slice(1, 3), 16)
  const g = Number.parseInt(normalized.slice(3, 5), 16)
  const b = Number.parseInt(normalized.slice(5, 7), 16)
  if (![r, g, b].every((channel) => Number.isFinite(channel))) {
    return null
  }
  return { r, g, b }
}

function clampRgbChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function rgbColorToHex(value: RgbColor) {
  const toHex = (channel: number) => clampRgbChannel(channel).toString(16).padStart(2, '0')
  return `#${toHex(value.r)}${toHex(value.g)}${toHex(value.b)}`
}

function blendRgbColors(base: RgbColor, target: RgbColor, ratio: number): RgbColor {
  const clampedRatio = Math.max(0, Math.min(1, ratio))
  return {
    r: clampRgbChannel(base.r + (target.r - base.r) * clampedRatio),
    g: clampRgbChannel(base.g + (target.g - base.g) * clampedRatio),
    b: clampRgbChannel(base.b + (target.b - base.b) * clampedRatio),
  }
}

function getPerceivedBrightness(color: RgbColor) {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000
}

export function deriveCountryPaletteFromFill(fillColor: string) {
  const base = hexColorToRgb(fillColor)
  if (!base) {
    return {
      borderColor: fillColor,
      provinceDefaultColor: fillColor,
      provinceBorderColor: fillColor,
    }
  }

  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }
  const brightness = getPerceivedBrightness(base)
  const provinceLiftRatio = brightness > 208 ? 0.14 : 0.2
  const provinceBorderDarkenRatio = brightness < 86 ? 0.16 : 0.24
  const borderDarkenRatio = brightness < 86 ? 0.4 : 0.5

  const provinceDefault = blendRgbColors(base, white, provinceLiftRatio)
  const provinceBorder = blendRgbColors(base, black, provinceBorderDarkenRatio)
  const border = blendRgbColors(base, black, borderDarkenRatio)

  return {
    borderColor: rgbColorToHex(border),
    provinceDefaultColor: rgbColorToHex(provinceDefault),
    provinceBorderColor: rgbColorToHex(provinceBorder),
  }
}
