import type { CSSProperties } from 'react'
import type {
  MouseStackedMenuLayout,
  MouseStackedMenuPosition,
  MouseStackedMenuRenderableItem,
} from './types'

interface MouseStackedMenuOverlayProps {
  position: MouseStackedMenuPosition
  layout: MouseStackedMenuLayout
  itemById: ReadonlyMap<string, MouseStackedMenuRenderableItem>
  isWesternUiLanguage: boolean
  isSplitRoot: boolean
  onModeClick: () => void
  onBackClick: () => void
  onItemClick: (itemId: string) => void
}

export function MouseStackedMenuOverlay({
  position,
  layout,
  itemById,
  isWesternUiLanguage,
  isSplitRoot,
  onModeClick,
  onBackClick,
  onItemClick,
}: MouseStackedMenuOverlayProps) {
  return (
    <div
      className="mouse-stacked-menu"
      style={
        {
          left: `${position.left}px`,
          top: `${position.top}px`,
          width: `${position.width}px`,
          maxHeight: `${position.maxHeight}px`,
          overflowY: position.isScrollable ? 'auto' : 'visible',
          '--mouse-stacked-columns': String(layout.columns),
          '--mouse-stacked-min-rows': String(layout.minRows),
          '--mouse-stacked-row-height': `${layout.rowHeight ?? 46}px`,
          '--mouse-stacked-column-width': `${position.columnWidth}px`,
          '--mouse-stacked-gap': `${position.gap}px`,
          '--mouse-root-mode-col-width': position.modeColWidth ? `${position.modeColWidth}px` : undefined,
          '--mouse-root-divider-col-width': position.dividerColWidth ? `${position.dividerColWidth}px` : undefined,
          '--mouse-root-tool-col-width': position.toolColWidth ? `${position.toolColWidth}px` : undefined,
          '--mouse-root-tool-columns': position.toolColumnCount ? String(position.toolColumnCount) : undefined,
        } as CSSProperties
      }
    >
      <div className={`mouse-stacked-menu__grid${isSplitRoot ? ' is-split-root' : ''}`}>
        {layout.cells.map((cell) => {
          const cellStyle = {
            gridColumn: `${cell.col} / span ${cell.colSpan ?? 1}`,
            gridRow: `${cell.row} / span ${cell.rowSpan ?? 1}`,
          } as CSSProperties
          const modeLabel = cell.label ?? ''
          const hasCjkGlyph = /[\u3400-\u9fff\uf900-\ufaff]/.test(modeLabel)
          const shouldUseWesternVertical = (cell.rowSpan ?? 1) > 1 && isWesternUiLanguage && !hasCjkGlyph

          if (cell.kind === 'mode') {
            return (
              <button
                type="button"
                key={cell.key}
                className={`mouse-stacked-menu__mode-core${(cell.rowSpan ?? 1) > 1 ? ' is-vertical' : ''}${
                  shouldUseWesternVertical ? ' is-western-vertical' : ''
                }`}
                style={cellStyle}
                onClick={onModeClick}
              >
                <span className="mouse-stacked-menu__mode-label">
                  <span className="mouse-stacked-menu__mode-label-anchor">
                    <span className="mouse-stacked-menu__mode-label-text">{modeLabel}</span>
                  </span>
                </span>
              </button>
            )
          }

          if (cell.kind === 'back') {
            const isVerticalBack = (cell.rowSpan ?? 1) > 1
            const shouldUseWesternVerticalBack = isVerticalBack && isWesternUiLanguage && !hasCjkGlyph
            return (
              <button
                type="button"
                key={cell.key}
                className={`mouse-stacked-menu__back${isVerticalBack ? ' is-vertical' : ''}${
                  shouldUseWesternVerticalBack ? ' is-western-vertical' : ''
                }`}
                style={cellStyle}
                onClick={onBackClick}
              >
                <span className="mouse-stacked-menu__back-label">
                  <span className="mouse-stacked-menu__back-label-anchor">
                    <span className="mouse-stacked-menu__back-label-text">{cell.label}</span>
                  </span>
                </span>
              </button>
            )
          }

          const item = cell.itemId ? itemById.get(cell.itemId) : null
          if (!item) {
            return null
          }
          const isCountryItem = item.id.startsWith('political-country:')
          const hasSwatch = Boolean(item.swatchColor)
          const visualLabel = item.visualLabel ?? item.label
          return (
            <button
              type="button"
              key={cell.key}
              className={`mouse-stacked-menu__item${item.active ? ' is-active' : ''}${item.visualLabel ? ' has-visual-label' : ''}${isCountryItem ? ' is-country-item' : ''}${hasSwatch ? ' has-swatch' : ''}`}
              style={cellStyle}
              aria-label={item.label}
              title={item.label}
              disabled={item.disabled}
              onClick={() => {
                onItemClick(item.id)
              }}
            >
              {hasSwatch ? (
                <span className="mouse-stacked-menu__item-content" aria-hidden="true">
                  <span
                    className="mouse-stacked-menu__item-swatch"
                    style={{ backgroundColor: item.swatchColor }}
                  />
                  <span className="mouse-stacked-menu__item-text">{visualLabel}</span>
                </span>
              ) : (
                <span aria-hidden="true">{visualLabel}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
