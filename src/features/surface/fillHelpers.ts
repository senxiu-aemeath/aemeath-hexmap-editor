import type { HexCell } from '../../domain/grid'
import {
  isSurfaceEmpty,
  isSurfaceLand,
  type WorldDocument,
} from '../../domain/world'
import { getTerrainBrushKindForSurface } from '../../components/surface/terrainBrush'

const ODD_R_TERRAIN_NEIGHBOR_OFFSETS = [
  [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
    { q: -1, r: 0 },
    { q: -1, r: -1 },
    { q: 0, r: -1 },
  ],
  [
    { q: 1, r: 0 },
    { q: 1, r: 1 },
    { q: 0, r: 1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
  ],
] as const

export function getTerrainFillCellIds(
  world: WorldDocument,
  cellsById: Map<string, HexCell>,
  cellsByCoordinates: Map<string, HexCell>,
  startCellId: string,
  mode: 'fill_type' | 'fill_height',
) {
  const startSurface = world.cellSurfaces[startCellId]
  if (!startSurface) {
    return []
  }
  const startBrushKind = getTerrainBrushKindForSurface(startSurface)
  const startElevation = startSurface.elevation
  const visited = new Set<string>()
  const queue = [startCellId]
  let queueIndex = 0
  const result: string[] = []

  while (queueIndex < queue.length) {
    const cellId = queue[queueIndex]
    queueIndex += 1
    if (!cellId || visited.has(cellId)) {
      continue
    }
    visited.add(cellId)
    const cell = cellsById.get(cellId)
    const surface = world.cellSurfaces[cellId]
    if (!cell || !surface) {
      continue
    }
    if (getTerrainBrushKindForSurface(surface) !== startBrushKind) {
      continue
    }
    if (mode === 'fill_height' && surface.elevation !== startElevation) {
      continue
    }
    result.push(cellId)
    const parity = cell.r % 2 === 0 ? 0 : 1
    for (const offset of ODD_R_TERRAIN_NEIGHBOR_OFFSETS[parity]) {
      const neighbor = cellsByCoordinates.get(`${cell.q + offset.q},${cell.r + offset.r}`)
      if (neighbor && !visited.has(neighbor.id)) {
        queue.push(neighbor.id)
      }
    }
  }

  return result
}

export function getPoliticalFillCellIds(
  world: WorldDocument,
  cellsById: Map<string, HexCell>,
  cellsByCoordinates: Map<string, HexCell>,
  startCellId: string,
  layer: 'country' | 'province',
  mode: 'fill_type' | 'fill_height',
  provinceOwnerCountryId?: string | null,
) {
  const startCell = cellsById.get(startCellId)
  if (!startCell) {
    return []
  }

  const getAssignment = (cellId: string) =>
    layer === 'country' ? world.countryAssignments[cellId] ?? null : world.provinceAssignments[cellId] ?? null

  const startAssignment = getAssignment(startCellId)
  const startSurface = world.cellSurfaces[startCellId]
  const startBrushKind = getTerrainBrushKindForSurface(startSurface)
  const startElevation = startSurface?.elevation ?? 0
  const visited = new Set<string>()
  const queue = [startCellId]
  let queueIndex = 0
  const result: string[] = []

  while (queueIndex < queue.length) {
    const cellId = queue[queueIndex]
    queueIndex += 1
    if (!cellId || visited.has(cellId)) {
      continue
    }
    visited.add(cellId)

    const cell = cellsById.get(cellId)
    if (!cell || getAssignment(cellId) !== startAssignment) {
      continue
    }

    const surface = world.cellSurfaces[cellId]
    if (layer === 'country') {
      if (isSurfaceEmpty(surface)) {
        continue
      }
    } else {
      if (!isSurfaceLand(surface)) {
        continue
      }
      if (provinceOwnerCountryId && (world.countryAssignments[cellId] ?? null) !== provinceOwnerCountryId) {
        continue
      }
    }

    if (mode === 'fill_height') {
      if (
        getTerrainBrushKindForSurface(surface) !== startBrushKind ||
        (surface?.elevation ?? 0) !== startElevation
      ) {
        continue
      }
    }

    result.push(cellId)

    const parity = ((cell.r % 2) + 2) % 2
    for (const offset of ODD_R_TERRAIN_NEIGHBOR_OFFSETS[parity]) {
      const neighbor = cellsByCoordinates.get(`${cell.q + offset.q},${cell.r + offset.r}`)
      if (neighbor && !visited.has(neighbor.id)) {
        queue.push(neighbor.id)
      }
    }
  }

  return result
}
