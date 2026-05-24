import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

interface DebugSectionProps {
  isExpanded: boolean
  onToggleExpanded: () => void
  hoveredCellText: string
  hoveredDetailsText: string
  hoveredSurfaceText: string
  politicalToolText: string
  cityBrushText: string
  recentPaintActionItems: Array<{
    id: number
    primaryText: string
    secondaryText: string
  }>
  onClearCache: () => void
}

export function DebugSection({ isExpanded,
  onToggleExpanded,
  hoveredCellText,
  hoveredDetailsText,
  hoveredSurfaceText,
  politicalToolText,
  cityBrushText,
  recentPaintActionItems,
  onClearCache,
}: DebugSectionProps) {
  const ui = useUiMessages()
  const { editorMode, politicalSubMode } = useEditorModeContext()
  const { activeCountryId, hoveredCellId } = useActiveEntityContext()
  return (
    <section className="data-table-section">
      <SectionToggleHeader
        title={ui.sidebar.debug}
        expanded={isExpanded}
        onToggle={onToggleExpanded}
      />
      {isExpanded && (
        <div className="mode-tool-card-list">
          <ControlCard variant="frameless">
            <button
              type="button"
              className="toolbar-action-button toolbar-action-button--secondary toolbar-action-button--fullwidth"
              onClick={onClearCache}
            >
              {ui.common.clearCache}
            </button>
          </ControlCard>
          <CardTitle>{ui.sidebar.debug}</CardTitle>
          <div className="detail-list">
            <div className="detail-card">
              <strong>{ui.political.hoveredCell}</strong>
              <span>{hoveredCellText}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.political.hoveredDetails}</strong>
              <span>{hoveredDetailsText}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.political.surface}</strong>
              <span>{hoveredSurfaceText}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.mode}</strong>
              <span>{ui.editorMode[editorMode]}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.politicalSub}</strong>
              <span>{ui.politicalSubMode[politicalSubMode]}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.politicalTool}</strong>
              <span>{politicalToolText}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.cityBrush}</strong>
              <span>{cityBrushText}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.activeCountryId}</strong>
              <span>{activeCountryId ?? ui.common.none}</span>
            </div>
            <div className="detail-card">
              <strong>{ui.debug.hoveredCellId}</strong>
              <span>{hoveredCellId ?? ui.common.none}</span>
            </div>
            <div className="detail-card detail-card--debug-history">
              <strong>{ui.debug.recentActions}</strong>
              {recentPaintActionItems.length > 0 ? (
                <ul className="debug-history-list">
                  {recentPaintActionItems.map((item) => (
                    <li key={item.id} className="debug-history-list__item">
                      <span>{item.primaryText}</span>
                      <small>{item.secondaryText}</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <span>{ui.debug.noRecentActions}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
