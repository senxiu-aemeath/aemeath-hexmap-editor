import type { ComponentProps } from 'react'

import { useEditorModeContext } from '../state/EditorModeContext'
import { ModeDock } from '../components/ModeDock'
import { WorldModePanelContainer } from '../components/world/WorldModePanelContainer'
import { SurfaceModePanelContainer } from '../components/surface/SurfaceModePanelContainer'
import { MoveModePanelContainer } from '../components/move/MoveModePanelContainer'
import { PoliticalCountryModeContainer } from '../components/political/PoliticalCountryModeContainer'
import { PoliticalProvinceModeContainer } from '../components/political/PoliticalProvinceModeContainer'
import { PoliticalCityModeContainer } from '../components/political/PoliticalCityModeContainer'
import { LabelModePanelContainer } from '../components/labels/LabelModePanelContainer'
import { DebugSection } from '../components/political/DebugSection'

type ModeDockProps = ComponentProps<typeof ModeDock>
type WorldModePanelContainerProps = ComponentProps<typeof WorldModePanelContainer>
type SurfaceModePanelContainerProps = ComponentProps<typeof SurfaceModePanelContainer>
type MoveModePanelContainerProps = ComponentProps<typeof MoveModePanelContainer>
type PoliticalCountryModeContainerProps = ComponentProps<typeof PoliticalCountryModeContainer>
type PoliticalProvinceModeContainerProps = ComponentProps<typeof PoliticalProvinceModeContainer>
type PoliticalCityModeContainerProps = ComponentProps<typeof PoliticalCityModeContainer>
type LabelModePanelContainerProps = ComponentProps<typeof LabelModePanelContainer>
type DebugSectionProps = ComponentProps<typeof DebugSection>

interface RightInspectorProps {
  // Sidebar resize
  onStartRightSidebarResize: () => void

  // ModeDock
  isModeDockOpen: ModeDockProps['isOpen']
  activeModeDockLabel: ModeDockProps['activeLabel']
  politicalSubModes: ModeDockProps['politicalSubModes']
  onOpenModeDock: ModeDockProps['onOpen']
  onCloseModeDock: ModeDockProps['onClose']
  onToggleModeDock: ModeDockProps['onToggleOpen']
  onEditorModeChangeWorld: () => void
  onEditorModeChangeSurface: () => void
  onSelectPoliticalSubModeFromDock: ModeDockProps['onSelectPoliticalSubMode']
  onEditorModeChangeLabel: () => void
  onEditorModeChangeMove: () => void

  // WorldModePanelContainer
  worldModeProps: Omit<WorldModePanelContainerProps, never>

  // SurfaceModePanelContainer
  surfaceModeProps: SurfaceModePanelContainerProps

  // MoveModePanelContainer
  moveModeProps: MoveModePanelContainerProps

  // PoliticalCountryModeContainer
  countryModeProps: PoliticalCountryModeContainerProps

  // PoliticalProvinceModeContainer
  provinceModeProps: PoliticalProvinceModeContainerProps

  // PoliticalCityModeContainer
  cityModeProps: PoliticalCityModeContainerProps

  // LabelModePanelContainer
  labelModeProps: LabelModePanelContainerProps

  // DebugSection
  isDebugSectionExpanded: DebugSectionProps['isExpanded']
  onToggleDebugSection: DebugSectionProps['onToggleExpanded']
  hoveredCellText: DebugSectionProps['hoveredCellText']
  hoveredDetailsText: DebugSectionProps['hoveredDetailsText']
  hoveredSurfaceText: DebugSectionProps['hoveredSurfaceText']
  politicalToolText: DebugSectionProps['politicalToolText']
  cityBrushText: DebugSectionProps['cityBrushText']
  recentPaintActionItems: DebugSectionProps['recentPaintActionItems']
  onClearCache: DebugSectionProps['onClearCache']
}

export function RightInspector({
  onStartRightSidebarResize,
  isModeDockOpen,
  activeModeDockLabel,
  politicalSubModes,
  onOpenModeDock,
  onCloseModeDock,
  onToggleModeDock,
  onEditorModeChangeWorld,
  onEditorModeChangeSurface,
  onSelectPoliticalSubModeFromDock,
  onEditorModeChangeLabel,
  onEditorModeChangeMove,
  worldModeProps,
  surfaceModeProps,
  moveModeProps,
  countryModeProps,
  provinceModeProps,
  cityModeProps,
  labelModeProps,
  isDebugSectionExpanded,
  onToggleDebugSection,
  hoveredCellText,
  hoveredDetailsText,
  hoveredSurfaceText,
  politicalToolText,
  cityBrushText,
  recentPaintActionItems,
  onClearCache,
}: RightInspectorProps) {
  const { editorMode, politicalSubMode } = useEditorModeContext()

  return (
    <aside className="inspector">
      <div
        className="sidebar-edge-resizer sidebar-edge-resizer--left"
        onMouseDown={onStartRightSidebarResize}
      />
      <ModeDock
        isOpen={isModeDockOpen}
        activeLabel={activeModeDockLabel}
        politicalSubModes={politicalSubModes}
        onOpen={onOpenModeDock}
        onClose={onCloseModeDock}
        onToggleOpen={onToggleModeDock}
        onSelectWorld={onEditorModeChangeWorld}
        onSelectSurface={onEditorModeChangeSurface}
        onSelectPoliticalSubMode={onSelectPoliticalSubModeFromDock}
        onSelectLabel={onEditorModeChangeLabel}
        onSelectMove={onEditorModeChangeMove}
      />

      {editorMode === 'world' && (
        <WorldModePanelContainer {...worldModeProps} />
      )}

      {editorMode === 'surface' && (
        <SurfaceModePanelContainer {...surfaceModeProps} />
      )}

      {editorMode === 'move' && (
        <MoveModePanelContainer {...moveModeProps} />
      )}

      {editorMode === 'political' &&
        (politicalSubMode === 'country' ? (
          <PoliticalCountryModeContainer {...countryModeProps} />
        ) : (
          politicalSubMode === 'province' ? (
            <PoliticalProvinceModeContainer {...provinceModeProps} />
          ) : (
            <PoliticalCityModeContainer {...cityModeProps} />
          )
        ))}

      {editorMode === 'label' && (
        <LabelModePanelContainer {...labelModeProps} />
      )}

      <div className="section-gap">
        <DebugSection
          isExpanded={isDebugSectionExpanded}
          onToggleExpanded={onToggleDebugSection}
          hoveredCellText={hoveredCellText}
          hoveredDetailsText={hoveredDetailsText}
          hoveredSurfaceText={hoveredSurfaceText}
          politicalToolText={politicalToolText}
          cityBrushText={cityBrushText}
          recentPaintActionItems={recentPaintActionItems}
          onClearCache={onClearCache}
        />
      </div>
    </aside>
  )
}
