import { useMemo } from 'react'

import { buildAltMouseStackedMenuLayout } from '../../components/mouseStackedMenu/layout'
import type {
  MouseStackedMenuLayout,
  MouseStackedMenuPosition,
  MouseStackedMenuRenderableItem,
} from '../../components/mouseStackedMenu/types'
import type { AppMessages } from '../../i18n'
import type { EditorModeContextValue } from '../../state/EditorModeContext'

interface UseAltRadialLayoutArgs<TItem extends MouseStackedMenuRenderableItem & { id: string }> {
  activeUiLanguage: string
  altRadialItems: TItem[]
  altRadialMenu: string
  altRadialOriginPosition: { x: number; y: number }
  editorMode: EditorModeContextValue['editorMode']
  politicalSubMode: EditorModeContextValue['politicalSubMode']
  ui: AppMessages
}

export function useAltRadialLayout<TItem extends MouseStackedMenuRenderableItem & { id: string }>({
  activeUiLanguage,
  altRadialItems,
  altRadialMenu,
  altRadialOriginPosition,
  editorMode,
  politicalSubMode,
  ui,
}: UseAltRadialLayoutArgs<TItem>) {
  const altMouseStackedMenuLayout = useMemo<MouseStackedMenuLayout>(
    () =>
      buildAltMouseStackedMenuLayout({
        menuId: altRadialMenu,
        editorMode,
        politicalSubMode,
        ui,
        items: altRadialItems,
      }),
    [altRadialItems, altRadialMenu, editorMode, politicalSubMode, ui],
  )

  const altRadialItemById = useMemo<ReadonlyMap<string, MouseStackedMenuRenderableItem>>(
    () => new Map<string, TItem>(altRadialItems.map((item) => [item.id, item])),
    [altRadialItems],
  )

  const isWesternUiLanguage = activeUiLanguage === 'en' || activeUiLanguage === 'fr'
  const isRootMouseStackedMenu = altRadialMenu === 'root'
  const isSwitchMouseStackedMenu = altRadialMenu === 'switch-mode'
  const isRootSplitMouseStackedMenu = false

  const altMouseStackedMenuPosition = useMemo<MouseStackedMenuPosition>(() => {
    const columnCount = altMouseStackedMenuLayout.columns
    const rowHeight = altMouseStackedMenuLayout.rowHeight ?? 46
    const gap = isRootMouseStackedMenu || isSwitchMouseStackedMenu ? 6 : 8
    const modeColWidth = isRootSplitMouseStackedMenu ? 74 : undefined
    const dividerColWidth = isRootSplitMouseStackedMenu ? 26 : undefined
    const toolColWidth = isRootSplitMouseStackedMenu ? 78 : undefined
    const toolColumnCount = isRootSplitMouseStackedMenu ? Math.max(1, columnCount - 2) : undefined
    const defaultColumnWidth = isSwitchMouseStackedMenu
      ? 94
      : isRootMouseStackedMenu
        ? 84
        : columnCount >= 7
          ? 78
          : columnCount >= 6
            ? 84
            : columnCount >= 5
              ? 92
              : 104
    const columnWidth = toolColWidth ?? defaultColumnWidth
    const width =
      isRootSplitMouseStackedMenu &&
      modeColWidth !== undefined &&
      dividerColWidth !== undefined &&
      toolColWidth !== undefined &&
      toolColumnCount !== undefined
        ? modeColWidth + dividerColWidth + toolColWidth * toolColumnCount + gap * (toolColumnCount + 1)
        : columnCount * columnWidth + (columnCount - 1) * gap
    const height = altMouseStackedMenuLayout.minRows * rowHeight + (altMouseStackedMenuLayout.minRows - 1) * gap
    const viewportMaxHeight = typeof window === 'undefined'
      ? 420
      : Math.max(320, Math.min(window.innerHeight - 24, 560))
    const maxHeight = viewportMaxHeight
    const anchorCell =
      altMouseStackedMenuLayout.cells.find((cell) => cell.kind === 'mode') ??
      altMouseStackedMenuLayout.cells.find((cell) => cell.kind === 'back') ??
      null
    const anchorCol = anchorCell?.col ?? 2
    const anchorRow = anchorCell?.row ?? 1
    const anchorColSpan = anchorCell?.colSpan ?? 1
    const anchorRowSpan = anchorCell?.rowSpan ?? 1
    const coreCenterX =
      isRootSplitMouseStackedMenu && modeColWidth !== undefined
        ? modeColWidth / 2
        : (anchorCol - 1) * (columnWidth + gap) +
          (anchorColSpan * columnWidth + (anchorColSpan - 1) * gap) / 2
    const coreCenterY =
      (anchorRow - 1) * (rowHeight + gap) +
      (anchorRowSpan * rowHeight + (anchorRowSpan - 1) * gap) / 2
    if (typeof window === 'undefined') {
      return {
        left: 80,
        top: 80,
        width,
        maxHeight,
        isScrollable: false,
        columnWidth,
        gap,
        modeColWidth,
        dividerColWidth,
        toolColWidth,
        toolColumnCount,
      }
    }
    const left = Math.min(
      Math.max(altRadialOriginPosition.x - coreCenterX, 12),
      window.innerWidth - width - 12,
    )
    const top = Math.min(
      Math.max(altRadialOriginPosition.y - coreCenterY, 12),
      window.innerHeight - Math.min(height, maxHeight) - 12,
    )
    return {
      left,
      top,
      width,
      maxHeight,
      isScrollable: height > maxHeight,
      columnWidth,
      gap,
      modeColWidth,
      dividerColWidth,
      toolColWidth,
      toolColumnCount,
    }
  }, [
    altMouseStackedMenuLayout.cells,
    altMouseStackedMenuLayout.columns,
    altMouseStackedMenuLayout.minRows,
    altMouseStackedMenuLayout.rowHeight,
    altRadialOriginPosition.x,
    altRadialOriginPosition.y,
    isRootMouseStackedMenu,
    isSwitchMouseStackedMenu,
    isRootSplitMouseStackedMenu,
  ])

  return {
    altMouseStackedMenuLayout,
    altRadialItemById,
    altMouseStackedMenuPosition,
    isWesternUiLanguage,
    isRootSplitMouseStackedMenu,
  }
}
