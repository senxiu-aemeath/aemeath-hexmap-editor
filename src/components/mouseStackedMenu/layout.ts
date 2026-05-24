import type { AppMessages } from '../../i18n'
import type { MouseStackedMenuCell, MouseStackedMenuLayout, MouseStackedMenuRenderableItem } from './types'

type MouseStackedEditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type MouseStackedPoliticalSubMode = 'country' | 'province' | 'city'

function createMouseStackedItemCell(itemId: string, row: number, col: number, options: Pick<MouseStackedMenuCell, 'colSpan' | 'rowSpan'> = {}): MouseStackedMenuCell {
  return {
    key: `item:${itemId}:${row}:${col}`,
    kind: 'item',
    itemId,
    row,
    col,
    ...options,
  }
}

function createMouseStackedModeCell(label: string, row: number, col: number): MouseStackedMenuCell {
  return {
    key: `mode:${label}:${row}:${col}`,
    kind: 'mode',
    label,
    row,
    col,
  }
}

function createMouseStackedBackCell(label: string, row: number, col: number): MouseStackedMenuCell {
  return {
    key: `back:${label}:${row}:${col}`,
    kind: 'back',
    label,
    row,
    col,
  }
}

function pushMouseStackedItemCell<TItem extends MouseStackedMenuRenderableItem & { id: string }>(
  cells: MouseStackedMenuCell[],
  itemById: ReadonlyMap<string, TItem>,
  itemId: string,
  row: number,
  col: number,
  options: Pick<MouseStackedMenuCell, 'colSpan' | 'rowSpan'> = {},
) {
  if (!itemById.has(itemId)) {
    return
  }
  cells.push(createMouseStackedItemCell(itemId, row, col, options))
}

function getBackFlowSlots(columns: number, minRows: number) {
  const slots: Array<{ row: number; col: number }> = []
  const totalRows = Math.max(3, minRows)
  for (let row = 1; row <= totalRows; row += 1) {
    for (let col = 1; col <= columns; col += 1) {
      if (row === 1 && col === 1) {
        continue
      }
      slots.push({ row, col })
    }
  }
  return slots
}

function getExistingMouseStackedItemIds<TItem extends MouseStackedMenuRenderableItem & { id: string }>(
  itemById: ReadonlyMap<string, TItem>,
  itemIds: string[],
) {
  return itemIds.filter((itemId) => itemById.has(itemId))
}

function pushCenteredMouseStackedItemColumn<TItem extends MouseStackedMenuRenderableItem & { id: string }>(
  cells: MouseStackedMenuCell[],
  itemById: ReadonlyMap<string, TItem>,
  itemIds: string[],
  col: number,
  totalRows: number,
) {
  const existingItemIds = getExistingMouseStackedItemIds(itemById, itemIds)
  const startRow = 1 + Math.max(0, Math.floor((totalRows - existingItemIds.length) / 2))
  existingItemIds.forEach((itemId, index) => {
    pushMouseStackedItemCell(cells, itemById, itemId, startRow + index, col)
  })
}

function pushTopMouseStackedItemColumn<TItem extends MouseStackedMenuRenderableItem & { id: string }>(
  cells: MouseStackedMenuCell[],
  itemById: ReadonlyMap<string, TItem>,
  itemIds: string[],
  col: number,
  options: Pick<MouseStackedMenuCell, 'colSpan' | 'rowSpan'> = {},
) {
  const existingItemIds = getExistingMouseStackedItemIds(itemById, itemIds)
  existingItemIds.forEach((itemId, index) => {
    pushMouseStackedItemCell(cells, itemById, itemId, index + 1, col, options)
  })
}

function buildBackFlowMouseStackedMenuLayout<TItem extends MouseStackedMenuRenderableItem & { id: string }>(args: {
  itemById: ReadonlyMap<string, TItem>
  itemIds: string[]
  backLabel: string
  columns?: number
  minRows?: number
}): MouseStackedMenuLayout {
  const { itemById, itemIds, backLabel, columns = 4, minRows = 2 } = args
  const cells: MouseStackedMenuCell[] = [createMouseStackedBackCell(backLabel, 1, 1)]
  const slots = getBackFlowSlots(columns, minRows)
  itemIds.forEach((itemId, index) => {
    const slot = slots[index]
    if (!slot) {
      return
    }
    pushMouseStackedItemCell(cells, itemById, itemId, slot.row, slot.col)
  })
  const highestRow = cells.reduce((maxRow, cell) => Math.max(maxRow, cell.row + (cell.rowSpan ?? 1) - 1), 1)
  return {
    columns,
    minRows: Math.max(minRows, highestRow),
    cells,
  }
}

export function buildAltMouseStackedMenuLayout<TItem extends MouseStackedMenuRenderableItem & { id: string }>(args: {
  menuId: string
  editorMode: MouseStackedEditorMode
  politicalSubMode: MouseStackedPoliticalSubMode
  ui: AppMessages
  items: TItem[]
}): MouseStackedMenuLayout {
  const { menuId, editorMode, politicalSubMode, ui, items } = args
  const itemById = new Map<string, TItem>(items.map((item) => [item.id, item]))
  const modeLabel = editorMode === 'political' ? ui.politicalSubMode[politicalSubMode] : ui.editorMode[editorMode]
  const rootRows = 4

  if (menuId === 'switch-mode') {
    const leftModeItemIds = ['switch-mode', 'editor-world', 'editor-surface', 'editor-country']
    const rightModeItemIds = ['editor-province', 'editor-city', 'editor-label', 'editor-move']
    const cells: MouseStackedMenuCell[] = [
      { ...createMouseStackedBackCell(ui.common.back, 1, 2), rowSpan: rootRows },
    ]
    pushTopMouseStackedItemColumn(cells, itemById, leftModeItemIds, 1)
    pushTopMouseStackedItemColumn(cells, itemById, rightModeItemIds, 3)
    return {
      columns: 3,
      minRows: rootRows,
      rowHeight: 30,
      cells,
    }
  }

  if (menuId === 'root') {
    if (editorMode === 'world') {
      const leftToolColumnItemIds = ['world-full-map', 'world-new-submap']
      const rightRecentSubmapItemIds = items
        .filter((item) => item.id.startsWith('world-submap:'))
        .map((item) => item.id)
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 2), rowSpan: rootRows },
      ]
      pushTopMouseStackedItemColumn(cells, itemById, leftToolColumnItemIds, 1)
      if (rightRecentSubmapItemIds.length > 0) {
        pushTopMouseStackedItemColumn(cells, itemById, rightRecentSubmapItemIds, 3)
      }
      return {
        columns: rightRecentSubmapItemIds.length > 0 ? 3 : 2,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'surface') {
      const leftRadiusColumnItemIds = ['radius_0', 'radius_1', 'radius_2', 'radius_3']
      const leftFillColumnItemIds = ['fill_type', 'fill_height']
      const rightBrushColumnItemIds = [
        'terrain-brush-land',
        'terrain-brush-water',
        'terrain-brush-dark-water',
        'terrain-brush-empty',
        'terrain-brush-unknown',
      ]
      const rightDisplayColumnItemIds = [
        'surface-display',
        'topography-display',
        'terrain-elevation-snow',
        'terrain-elevation-zero',
      ]
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 3), rowSpan: rootRows },
      ]
      pushCenteredMouseStackedItemColumn(cells, itemById, leftFillColumnItemIds, 1, rootRows)
      pushCenteredMouseStackedItemColumn(cells, itemById, leftRadiusColumnItemIds, 2, rootRows)
      pushTopMouseStackedItemColumn(cells, itemById, rightBrushColumnItemIds, 4)
      pushTopMouseStackedItemColumn(cells, itemById, rightDisplayColumnItemIds, 5)
      return {
        columns: 5,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'political' && politicalSubMode === 'country') {
      const leftRadiusColumnItemIds = ['radius_0', 'radius_1', 'radius_2', 'radius_3']
      const leftFillColumnItemIds = ['fill_type', 'fill_height']
      const rightToolColumnItemIds = ['view', 'paint', 'erase', 'create-country']
      const rightCountryColumnItemIds = items
        .filter((item) => item.id.startsWith('political-country:'))
        .map((item) => item.id)
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 3), rowSpan: rootRows },
      ]
      pushCenteredMouseStackedItemColumn(cells, itemById, leftFillColumnItemIds, 1, rootRows)
      pushCenteredMouseStackedItemColumn(cells, itemById, leftRadiusColumnItemIds, 2, rootRows)
      pushTopMouseStackedItemColumn(cells, itemById, rightToolColumnItemIds, 4)
      pushTopMouseStackedItemColumn(cells, itemById, rightCountryColumnItemIds, 5, { colSpan: 2 })
      return {
        columns: 6,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'political' && politicalSubMode === 'province') {
      const leftRadiusColumnItemIds = ['radius_0', 'radius_1', 'radius_2', 'radius_3']
      const leftFillColumnItemIds = ['fill_type', 'fill_height']
      const rightToolColumnItemIds = ['view', 'paint', 'erase', 'create-province']
      const rightRecentCountryItemIds = items
        .filter((item) => item.id.startsWith('political-country:'))
        .map((item) => item.id)
      const rightRecentProvinceItemIds = items
        .filter((item) => item.id.startsWith('political-province:'))
        .map((item) => item.id)
      const rightRecentCountryCol = 5
      const rightRecentProvinceCol =
        rightRecentCountryItemIds.length > 0
          ? 6
          : 5
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 3), rowSpan: rootRows },
      ]
      pushCenteredMouseStackedItemColumn(cells, itemById, leftFillColumnItemIds, 1, rootRows)
      pushCenteredMouseStackedItemColumn(cells, itemById, leftRadiusColumnItemIds, 2, rootRows)
      pushTopMouseStackedItemColumn(cells, itemById, rightToolColumnItemIds, 4)
      if (rightRecentCountryItemIds.length > 0) {
        pushTopMouseStackedItemColumn(cells, itemById, rightRecentCountryItemIds, rightRecentCountryCol)
      }
      if (rightRecentProvinceItemIds.length > 0) {
        pushTopMouseStackedItemColumn(cells, itemById, rightRecentProvinceItemIds, rightRecentProvinceCol)
      }
      return {
        columns:
          4 +
          (rightRecentCountryItemIds.length > 0 ? 1 : 0) +
          (rightRecentProvinceItemIds.length > 0 ? 1 : 0),
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'political' && politicalSubMode === 'city') {
      const cityLevelIds = items
        .filter((item) => item.id.startsWith('city-level:'))
        .slice(0, 4)
        .map((item) => item.id)
      const rightToolColumnItemIds = ['view', 'city-place']
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 2), rowSpan: rootRows },
      ]
      pushTopMouseStackedItemColumn(cells, itemById, cityLevelIds, 1)
      pushTopMouseStackedItemColumn(cells, itemById, rightToolColumnItemIds, 3)
      return {
        columns: 3,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'label') {
      const leftToolColumnItemIds = ['label-create-free', 'label-create-free-icon']
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 2), rowSpan: rootRows },
      ]
      pushCenteredMouseStackedItemColumn(cells, itemById, leftToolColumnItemIds, 1, rootRows)
      return {
        columns: 2,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }

    if (editorMode === 'move') {
      const leftOperationColumnItemIds = [
        'move-payload-terrain',
        'move-payload-political',
        'move-operation-move',
        'move-operation-copy',
      ]
      const rightToolColumnItemIds = ['move-apply', 'new-selection', 'move-clear']
      const cells: MouseStackedMenuCell[] = [
        { ...createMouseStackedModeCell(modeLabel, 1, 2), rowSpan: rootRows },
      ]
      pushTopMouseStackedItemColumn(cells, itemById, leftOperationColumnItemIds, 1)
      pushTopMouseStackedItemColumn(cells, itemById, rightToolColumnItemIds, 3)
      return {
        columns: 3,
        minRows: rootRows,
        rowHeight: 30,
        cells,
      }
    }
  }

  if (menuId === 'world-sections') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: ['world-section-info', 'world-section-style', 'world-section-grid'],
      backLabel: ui.common.back,
    })
  }

  if (menuId === 'terrain-view') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: ['surface-display', 'topography-display'],
      backLabel: ui.common.back,
    })
  }

  if (menuId === 'terrain-brush') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: [
        'terrain-brush-land',
        'terrain-brush-water',
        'terrain-brush-dark-water',
        'terrain-brush-empty',
        'terrain-brush-unknown',
      ],
      backLabel: ui.common.back,
      minRows: 3,
    })
  }

  if (menuId === 'terrain-elevation') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: [
        'terrain-elevation-down',
        'terrain-elevation-up',
        'terrain-elevation-zero',
        'terrain-elevation-snow',
      ],
      backLabel: ui.common.back,
    })
  }

  if (menuId === 'terrain-paint' || menuId === 'political-paint') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: ['radius_0', 'radius_1', 'fill_type', 'radius_2', 'radius_3', 'fill_height'],
      backLabel: ui.common.back,
    })
  }

  if (menuId === 'political-tool') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: ['view', 'paint', 'erase', 'city-place', 'create-country', 'create-province'],
      backLabel: ui.common.back,
      columns: 5,
    })
  }

  if (menuId === 'political-country-target') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: items.map((item) => item.id),
      backLabel: ui.common.back,
      columns: 5,
      minRows: 3,
    })
  }

  if (menuId === 'political-province-target') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: items.map((item) => item.id),
      backLabel: ui.common.back,
      columns: 5,
      minRows: 3,
    })
  }

  if (menuId === 'city-levels' || menuId === 'city-place') {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: items.map((item) => item.id),
      backLabel: ui.common.back,
      minRows: 3,
    })
  }

  if (
    menuId === 'move' ||
    menuId === 'move-selection' ||
    menuId === 'move-operation' ||
    menuId === 'move-payload' ||
    menuId === 'label-create' ||
    menuId === 'label-anchors' ||
    menuId === 'label-groups' ||
    menuId === 'label-tables' ||
    menuId === 'world-submaps' ||
    menuId === 'world-layers' ||
    menuId === 'world-label-groups'
  ) {
    return buildBackFlowMouseStackedMenuLayout({
      itemById,
      itemIds: items.map((item) => item.id),
      backLabel: ui.common.back,
      columns: menuId === 'label-groups' || menuId === 'world-submaps' ? 5 : 4,
      minRows: 3,
    })
  }

  return buildBackFlowMouseStackedMenuLayout({
    itemById,
    itemIds: items.map((item) => item.id),
    backLabel: ui.common.back,
    minRows: 3,
  })
}
