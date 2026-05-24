export interface MouseStackedMenuRenderableItem {
  id: string
  label: string
  visualLabel?: string
  swatchColor?: string
  active?: boolean
  disabled?: boolean
}

export interface MouseStackedMenuCell {
  key: string
  kind: 'item' | 'mode' | 'back'
  label?: string
  col: number
  row: number
  colSpan?: number
  rowSpan?: number
  itemId?: string
}

export interface MouseStackedMenuLayout {
  columns: number
  minRows: number
  rowHeight?: number
  cells: MouseStackedMenuCell[]
}

export interface MouseStackedMenuPosition {
  left: number
  top: number
  width: number
  maxHeight: number
  isScrollable: boolean
  columnWidth: number
  gap: number
  modeColWidth?: number
  dividerColWidth?: number
  toolColWidth?: number
  toolColumnCount?: number
}
