import {
  DEFAULT_SURFACE_STATE,
  createSurfaceState,
  type CellSurfaceState,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'
import type { TerrainColorAnchor } from '../TerrainAnchorField'

export type TerrainDisplayMode = 'surface' | 'topography'
export type TerrainPaintMode =
  | 'radius_0'
  | 'radius_1'
  | 'radius_2'
  | 'radius_3'
  | 'fill_type'
  | 'fill_height'
export type TerrainBrushKind = 'empty' | 'unknown' | 'land' | 'water' | 'dark_water'

export function getSurfaceSummary(
  ui: AppMessages,
  surface: CellSurfaceState | null | undefined,
) {
  const normalized = surface ?? DEFAULT_SURFACE_STATE
  const parts: string[] = [ui.surfaceBrush[normalized.kind]]

  if (normalized.kind !== 'empty') {
    parts.push(`z ${normalized.elevation}`)
  }

  if (normalized.special === 'unknown') {
    parts.push(ui.surface.specialUnknown)
  } else if (normalized.special === 'dark') {
    parts.push(ui.surface.specialDark)
  }

  return parts.join(' / ')
}

export function getTerrainBrushState(kind: TerrainBrushKind, elevation: number) {
  switch (kind) {
    case 'empty':
      return createSurfaceState('empty', 0, 'none')
    case 'unknown':
      return createSurfaceState('water', 0, 'unknown')
    case 'land':
      return createSurfaceState('land', elevation, 'none')
    case 'water':
      return createSurfaceState('water', elevation, 'none')
    case 'dark_water':
      return createSurfaceState('water', elevation, 'dark')
  }
}

export function getTerrainBrushElevationRange(kind: TerrainBrushKind) {
  switch (kind) {
    case 'land':
      return { min: -5, max: 20 }
    case 'water':
    case 'dark_water':
      return { min: -10, max: 0 }
    default:
      return { min: 0, max: 0 }
  }
}

export function getTerrainBrushKindForSurface(
  surface: CellSurfaceState | null | undefined,
): TerrainBrushKind {
  const normalized = surface ?? DEFAULT_SURFACE_STATE
  if (normalized.kind === 'empty') {
    return 'empty'
  }
  if (normalized.special === 'unknown') {
    return 'unknown'
  }
  if (normalized.special === 'dark') {
    return 'dark_water'
  }
  if (normalized.kind === 'water') {
    return 'water'
  }
  return 'land'
}

export function getUniqueSortedElevations(anchors: TerrainColorAnchor[]) {
  return Array.from(new Set(anchors.map((anchor) => anchor.elevation))).sort(
    (left, right) => left - right,
  )
}
