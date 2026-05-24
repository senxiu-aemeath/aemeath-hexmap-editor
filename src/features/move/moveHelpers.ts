import type { HexCell } from '../../domain/grid'
import { isSurfaceLand, type CellSurfaceState } from '../../domain/world'

type MovePayload = 'terrain' | 'political'

function oddRToAxialLocal(q: number, r: number) {
  return {
    q: q - (r - (r & 1)) / 2,
    r,
  }
}

function axialToOddRLocal(q: number, r: number) {
  return {
    q: q + (r - (r & 1)) / 2,
    r,
  }
}

export function getElevationMarkLeft(value: number, min: number, max: number) {
  if (max <= min) {
    return 0
  }
  return ((value - min) / (max - min)) * 100
}

export function getMoveAnchorCell(cells: HexCell[]) {
  return [...cells].sort((left, right) => left.r - right.r || left.q - right.q)[0] ?? null
}

export function getMoveTargetEntries(
  moveSourceCells: HexCell[],
  moveSourceAnchorCell: HexCell | null,
  hoveredCell: HexCell | null,
  cellsByCoordinates: Map<string, HexCell>,
  movePayload: MovePayload,
  cellSurfaces: Record<string, CellSurfaceState>,
) {
  if (moveSourceCells.length === 0 || !moveSourceAnchorCell || !hoveredCell) {
    return [] as Array<{ sourceCellId: string; targetCellId: string; blocked: boolean }>
  }

  const anchorAxial = oddRToAxialLocal(moveSourceAnchorCell.q, moveSourceAnchorCell.r)
  const hoveredAxial = oddRToAxialLocal(hoveredCell.q, hoveredCell.r)
  const deltaQ = hoveredAxial.q - anchorAxial.q
  const deltaR = hoveredAxial.r - anchorAxial.r

  return moveSourceCells.map((sourceCell) => {
    const sourceAxial = oddRToAxialLocal(sourceCell.q, sourceCell.r)
    const targetOddR = axialToOddRLocal(sourceAxial.q + deltaQ, sourceAxial.r + deltaR)
    const targetCell = cellsByCoordinates.get(`${targetOddR.q},${targetOddR.r}`) ?? null
    const targetCellId = targetCell?.id ?? ''

    let blocked = targetCell === null
    if (!blocked && movePayload === 'political') {
      blocked = !isSurfaceLand(cellSurfaces[targetCellId])
    }

    return {
      sourceCellId: sourceCell.id,
      targetCellId,
      blocked,
    }
  })
}
