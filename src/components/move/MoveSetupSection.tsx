import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface MoveSetupSectionProps {
  moveOperation: 'move' | 'copy'
  movePayload: 'terrain' | 'political'
  onSetMoveOperation: (operation: 'move' | 'copy') => void
  onSetMovePayload: (payload: 'terrain' | 'political') => void
}

export function MoveSetupSection({ moveOperation,
  movePayload,
  onSetMoveOperation,
  onSetMovePayload,
}: MoveSetupSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section">
      <SectionToggleHeader title={ui.move.setup} expanded={true} onToggle={() => {}} />
      <div className="mode-tool-card-list">
        <CardTitle>{ui.move.operation}</CardTitle>
        <ControlCard variant="frameless">
          <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
            <button
              className={`toolbar-action-button${moveOperation === 'move' ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                onSetMoveOperation('move')
              }}
            >
              {ui.move.move}
            </button>
            <button
              className={`toolbar-action-button${moveOperation === 'copy' ? ' is-active' : ''}`}
              type="button"
              disabled={movePayload !== 'terrain'}
              onClick={() => {
                if (movePayload === 'terrain') {
                  onSetMoveOperation('copy')
                }
              }}
            >
              {ui.move.copy}
            </button>
          </div>
        </ControlCard>

        <CardTitle>{ui.move.payload}</CardTitle>
        <ControlCard variant="frameless">
          <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
            {(['terrain', 'political'] as const).map((payload) => (
              <button
                key={payload}
                className={`toolbar-action-button${movePayload === payload ? ' is-active' : ''}`}
                type="button"
                onClick={() => {
                  onSetMovePayload(payload)
                }}
              >
                {ui.move[payload]}
              </button>
            ))}
          </div>
        </ControlCard>
      </div>
    </section>
  )
}
