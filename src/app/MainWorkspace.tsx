import type { ComponentProps } from 'react'
import { useEditorModeContext } from '../state/EditorModeContext'
import { ShortcutOverlay } from '../components/ShortcutOverlay'
import { MouseStackedMenuOverlay } from '../components/mouseStackedMenu/MouseStackedMenuOverlay'
import { HexMapCanvas } from '../render/HexMapCanvas'
import {
  getSurfaceSummary,
} from '../components/surface/terrainBrush'
import type { TerrainPaintMode } from '../components/surface/terrainBrush'
import type { CellSurfaceState } from '../domain/world'
import type { HexCell } from '../domain/grid'
import type { Country } from '../domain/world'
import type { ShortcutHintSection } from '../features/shortcuts/shortcutHints'
import type {
  MouseStackedMenuLayout,
  MouseStackedMenuPosition,
  MouseStackedMenuRenderableItem,
} from '../components/mouseStackedMenu/types'
import type { AltRadialActionId } from '../features/shortcuts/useAltRadialItems'
import type { AppMessages } from '../i18n'

type HexMapCanvasProps = ComponentProps<typeof HexMapCanvas>

interface MainWorkspaceProps {
  // ShortcutOverlay
  isAltShortcutOverlayOpen: boolean
  shortcutHintSections: ShortcutHintSection[]

  // MouseStackedMenuOverlay (shown conditionally)
  isAltRadialMenuEnabled: boolean
  isAltRadialSuppressed: boolean
  altMouseStackedMenuPosition: MouseStackedMenuPosition
  altMouseStackedMenuLayout: MouseStackedMenuLayout
  altRadialItemById: ReadonlyMap<string, MouseStackedMenuRenderableItem>
  isWesternUiLanguage: boolean
  isRootSplitMouseStackedMenu: boolean
  onAltRadialModeClick: () => void
  onAltRadialBackClick: () => void
  onAltRadialItemClick: (itemId: AltRadialActionId) => void

  // HexMapCanvas
  canvasKey: string
  canvasProps: HexMapCanvasProps

  // Footer — grid / cell count
  gridCols: number
  gridRows: number
  visibleCellCount: number
  hoveredCell: HexCell | null

  // Footer — political / mode
  activeCountry: Country | null

  // Footer — mode text
  terrainPaintMode: TerrainPaintMode
  surfaceBrush: CellSurfaceState | null
  brushRadiusText: string
  politicalToolText: string
  politicalPaintModeText: string
  moveToolText: string

  // UI messages (needed for footer text)
  ui: AppMessages
}

export function MainWorkspace({
  isAltShortcutOverlayOpen,
  shortcutHintSections,
  isAltRadialMenuEnabled,
  isAltRadialSuppressed,
  altMouseStackedMenuPosition,
  altMouseStackedMenuLayout,
  altRadialItemById,
  isWesternUiLanguage,
  isRootSplitMouseStackedMenu,
  onAltRadialModeClick,
  onAltRadialBackClick,
  onAltRadialItemClick,
  canvasKey,
  canvasProps,
  gridCols,
  gridRows,
  visibleCellCount,
  hoveredCell,
  activeCountry,
  terrainPaintMode,
  surfaceBrush,
  brushRadiusText,
  politicalToolText,
  politicalPaintModeText,
  moveToolText,
  ui,
}: MainWorkspaceProps) {
  const { editorMode } = useEditorModeContext()
  const { politicalSubMode } = useEditorModeContext()

  return (
    <main className="workspace">
      <ShortcutOverlay visible={isAltShortcutOverlayOpen} sections={shortcutHintSections} />
      {isAltShortcutOverlayOpen && isAltRadialMenuEnabled && !isAltRadialSuppressed ? (
        <MouseStackedMenuOverlay
          position={altMouseStackedMenuPosition}
          layout={altMouseStackedMenuLayout}
          itemById={altRadialItemById}
          isWesternUiLanguage={isWesternUiLanguage}
          isSplitRoot={isRootSplitMouseStackedMenu}
          onModeClick={onAltRadialModeClick}
          onBackClick={onAltRadialBackClick}
          onItemClick={(itemId) => {
            onAltRadialItemClick(itemId as AltRadialActionId)
          }}
        />
      ) : null}
      <header className="workspace-header workspace-header--compact" aria-hidden="true" />

      <section className="canvas-panel">
        <div className="canvas-frame">
          <HexMapCanvas key={canvasKey} {...canvasProps} />
        </div>
      </section>

      <footer className="workspace-footer">
        <div className="workspace-footer-group">
          <span className="pill">{ui.app.gridSize(gridCols, gridRows)}</span>
          <span>{ui.app.cellsGenerated(visibleCellCount)}</span>
          <span>
            {hoveredCell ? ui.app.hoveringCell(hoveredCell.id) : ui.app.hoverHint}
          </span>
        </div>
        <div className="workspace-footer-group workspace-footer-group--right">
          <span>
            {activeCountry ? ui.app.activeCountry(activeCountry.name) : ui.app.noActiveCountry}
          </span>
          <span className="workspace-footer-mode">
            {editorMode === 'political'
              ? ui.app.modeLabel(
                  politicalSubMode === 'city' || politicalToolText === ui.politicalTool.view
                    ? politicalToolText
                    : `${politicalToolText} · ${politicalPaintModeText}`,
                )
              : editorMode === 'surface'
                ? ui.app.brushLabel(
                    terrainPaintMode.startsWith('radius_')
                      ? `${getSurfaceSummary(ui, surfaceBrush)} · ${brushRadiusText}`
                      : terrainPaintMode === 'fill_type'
                        ? `${getSurfaceSummary(ui, surfaceBrush)} · ${ui.surface.fillType}`
                        : `${getSurfaceSummary(ui, surfaceBrush)} · ${ui.surface.fillHeight}`,
                  )
                : editorMode === 'move'
                  ? ui.app.modeLabel(moveToolText)
                : editorMode === 'label'
                  ? ui.app.modeLabel(ui.editorMode.label)
                  : ui.app.worldModeLabel}
          </span>
        </div>
      </footer>
    </main>
  )
}
