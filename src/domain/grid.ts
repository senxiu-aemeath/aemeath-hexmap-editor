export interface HexGridConfig {
  cols: number;
  rows: number;
  hexSize: number;
  orientation: 'pointy';
}

export interface HexCell {
  id: string;
  q: number;
  r: number;
  centerX: number;
  centerY: number;
}

export interface HexBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface HexNeighbor {
  sideIndex: number;
  neighborId: string | null;
}

export interface HexEdge {
  id: string;
  cellId: string;
  neighborId: string | null;
  sideIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const SQRT_3 = Math.sqrt(3);
const ODD_R_NEIGHBOR_OFFSETS = [
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
] as const;

export function createRectHexGrid(config: HexGridConfig): HexCell[] {
  const cells: HexCell[] = [];
  const xStep = SQRT_3 * config.hexSize;
  const yStep = 1.5 * config.hexSize;

  for (let row = 0; row < config.rows; row += 1) {
    for (let col = 0; col < config.cols; col += 1) {
      const offsetX = row % 2 === 0 ? 0 : xStep / 2;

      cells.push({
        id: `cell-${col}-${row}`,
        q: col,
        r: row,
        centerX: col * xStep + offsetX,
        centerY: row * yStep,
      });
    }
  }

  return cells;
}

export function getPointyHexPolygon(
  centerX: number,
  centerY: number,
  size: number,
): number[] {
  const points: number[] = [];

  for (let corner = 0; corner < 6; corner += 1) {
    const angle = ((60 * corner - 30) * Math.PI) / 180;
    points.push(centerX + size * Math.cos(angle));
    points.push(centerY + size * Math.sin(angle));
  }

  return points;
}

export function getPointyHexEdge(
  centerX: number,
  centerY: number,
  size: number,
  sideIndex: number,
) {
  const polygon = getPointyHexPolygon(centerX, centerY, size);
  const index = (sideIndex % 6) * 2;
  const nextIndex = ((sideIndex + 1) % 6) * 2;

  return {
    x1: polygon[index],
    y1: polygon[index + 1],
    x2: polygon[nextIndex],
    y2: polygon[nextIndex + 1],
  };
}

export function getGridBounds(cells: HexCell[], size: number): HexBounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const cell of cells) {
    minX = Math.min(minX, cell.centerX - size);
    minY = Math.min(minY, cell.centerY - size);
    maxX = Math.max(maxX, cell.centerX + size);
    maxY = Math.max(maxY, cell.centerY + size);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function findCellAtPoint(
  cellsByCoordinates: Map<string, HexCell>,
  hexSize: number,
  x: number,
  y: number,
): HexCell | null {
  const roundedAxial = roundAxialCoordinates(
    ((SQRT_3 / 3) * x - y / 3) / hexSize,
    ((2 / 3) * y) / hexSize,
  )
  const centerCoordinate = axialToOddR(roundedAxial.q, roundedAxial.r)
  const candidateKeys = new Set([getCoordinateKey(centerCoordinate.q, centerCoordinate.r)])
  const parity = centerCoordinate.r % 2 === 0 ? 0 : 1

  for (const offset of ODD_R_NEIGHBOR_OFFSETS[parity]) {
    candidateKeys.add(
      getCoordinateKey(centerCoordinate.q + offset.q, centerCoordinate.r + offset.r),
    )
  }

  for (const coordinateKey of candidateKeys) {
    const cell = cellsByCoordinates.get(coordinateKey)

    if (!cell) {
      continue
    }

    if (pointInPolygon(x, y, getPointyHexPolygon(cell.centerX, cell.centerY, hexSize))) {
      return cell;
    }
  }

  return null;
}

export function createCellMap(cells: HexCell[]) {
  return new Map(cells.map((cell) => [cell.id, cell]));
}

export function createCoordinateCellMap(cells: HexCell[]) {
  return new Map(cells.map((cell) => [getCoordinateKey(cell.q, cell.r), cell]));
}

export function getCellsAlongLine(
  startCell: HexCell,
  endCell: HexCell,
  cellsByCoordinates: Map<string, HexCell>,
) {
  const startAxial = oddRToAxial(startCell.q, startCell.r)
  const endAxial = oddRToAxial(endCell.q, endCell.r)
  const startCube = axialToCube(startAxial.q, startAxial.r)
  const endCube = axialToCube(endAxial.q, endAxial.r)
  const distance = Math.max(
    Math.abs(startCube.q - endCube.q),
    Math.abs(startCube.r - endCube.r),
    Math.abs(startCube.s - endCube.s),
  )

  if (distance === 0) {
    return [startCell]
  }

  const cells: HexCell[] = []

  for (let step = 0; step <= distance; step += 1) {
    const t = step / distance
    const interpolated = roundCubeCoordinates(
      lerp(startCube.q, endCube.q, t),
      lerp(startCube.r, endCube.r, t),
      lerp(startCube.s, endCube.s, t),
    )
    const oddR = axialToOddR(interpolated.q, interpolated.r)
    const cell = cellsByCoordinates.get(getCoordinateKey(oddR.q, oddR.r))

    if (cell && cells.at(-1)?.id !== cell.id) {
      cells.push(cell)
    }
  }

  return cells
}

export function getCellNeighbors(cell: HexCell, cellsByCoordinates: Map<string, HexCell>): HexNeighbor[] {
  const parity = cell.r % 2 === 0 ? 0 : 1;
  const offsets = ODD_R_NEIGHBOR_OFFSETS[parity];

  return offsets.map((offset, sideIndex) => {
    const neighbor = cellsByCoordinates.get(getCoordinateKey(cell.q + offset.q, cell.r + offset.r));

    return {
      sideIndex,
      neighborId: neighbor?.id ?? null,
    };
  });
}

export function getCellsWithinRadius(
  centerCell: HexCell,
  radius: number,
  cellsByCoordinates: Map<string, HexCell>,
) {
  if (radius <= 0) {
    return [centerCell]
  }

  const centerAxial = oddRToAxial(centerCell.q, centerCell.r)
  const cells: HexCell[] = []

  for (let dq = -radius; dq <= radius; dq += 1) {
    const minDr = Math.max(-radius, -dq - radius)
    const maxDr = Math.min(radius, -dq + radius)

    for (let dr = minDr; dr <= maxDr; dr += 1) {
      const oddR = axialToOddR(centerAxial.q + dq, centerAxial.r + dr)
      const cell = cellsByCoordinates.get(getCoordinateKey(oddR.q, oddR.r))

      if (cell) {
        cells.push(cell)
      }
    }
  }

  return cells
}

export function buildHexEdges(cells: HexCell[], hexSize: number): HexEdge[] {
  const cellsByCoordinates = new Map(
    cells.map((cell) => [getCoordinateKey(cell.q, cell.r), cell]),
  );
  const edges: HexEdge[] = [];
  const seenEdges = new Set<string>();

  for (const cell of cells) {
    const neighbors = getCellNeighbors(cell, cellsByCoordinates);

    for (const neighbor of neighbors) {
      const edgeId = getHexEdgeId(cell.id, neighbor.neighborId, neighbor.sideIndex);

      if (seenEdges.has(edgeId)) {
        continue;
      }

      seenEdges.add(edgeId);

      const segment = getPointyHexEdge(
        cell.centerX,
        cell.centerY,
        hexSize,
        neighbor.sideIndex,
      );

      edges.push({
        id: edgeId,
        cellId: cell.id,
        neighborId: neighbor.neighborId,
        sideIndex: neighbor.sideIndex,
        x1: segment.x1,
        y1: segment.y1,
        x2: segment.x2,
        y2: segment.y2,
      });
    }
  }

  return edges;
}

export function getCoordinateKey(q: number, r: number) {
  return `${q},${r}`;
}

function getHexEdgeId(cellId: string, neighborId: string | null, sideIndex: number) {
  if (!neighborId) {
    return `boundary:${cellId}:${sideIndex}`;
  }

  return [cellId, neighborId].sort().join('|');
}

function roundAxialCoordinates(q: number, r: number) {
  let cubeQ = q
  let cubeR = r
  const cubeS = -cubeQ - cubeR

  const roundedQ = Math.round(cubeQ)
  const roundedR = Math.round(cubeR)
  const roundedS = Math.round(cubeS)

  const qDiff = Math.abs(roundedQ - cubeQ)
  const rDiff = Math.abs(roundedR - cubeR)
  const sDiff = Math.abs(roundedS - cubeS)

  if (qDiff > rDiff && qDiff > sDiff) {
    cubeQ = -roundedR - roundedS
    cubeR = roundedR
  } else if (rDiff > sDiff) {
    cubeQ = roundedQ
    cubeR = -roundedQ - roundedS
  } else {
    cubeQ = roundedQ
    cubeR = roundedR
  }

  return { q: cubeQ, r: cubeR }
}

function axialToOddR(q: number, r: number) {
  return {
    q: q + (r - (r & 1)) / 2,
    r,
  }
}

function oddRToAxial(q: number, r: number) {
  return {
    q: q - (r - (r & 1)) / 2,
    r,
  }
}

function axialToCube(q: number, r: number) {
  return {
    q,
    r,
    s: -q - r,
  }
}

function roundCubeCoordinates(q: number, r: number, s: number) {
  let roundedQ = Math.round(q)
  let roundedR = Math.round(r)
  let roundedS = Math.round(s)

  const qDiff = Math.abs(roundedQ - q)
  const rDiff = Math.abs(roundedR - r)
  const sDiff = Math.abs(roundedS - s)

  if (qDiff > rDiff && qDiff > sDiff) {
    roundedQ = -roundedR - roundedS
  } else if (rDiff > sDiff) {
    roundedR = -roundedQ - roundedS
  } else {
    roundedS = -roundedQ - roundedR
  }

  return {
    q: roundedQ,
    r: roundedR,
    s: roundedS,
  }
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t
}

function pointInPolygon(x: number, y: number, polygon: number[]): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
    const xi = polygon[i];
    const yi = polygon[i + 1];
    const xj = polygon[j];
    const yj = polygon[j + 1];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}
