import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard } from '../ToolControlPrimitives'

interface LabelGroupToggle {
  id: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
}

interface MoveContentSectionProps {
  movePayload: 'terrain' | 'political'
  moveVacatedKind: 'land' | 'water' | 'empty'
  onSetMoveVacatedKind: (kind: 'land' | 'water' | 'empty') => void
  moveVacatedElevation: number
  onSetMoveVacatedElevation: (value: number) => void
  moveCities: boolean
  onSetMoveCities: (value: boolean) => void
  labelGroupToggles: LabelGroupToggle[]
  allLabelGroupsChecked: boolean
  onSetAllLabelGroups: (checked: boolean) => void
}

export function MoveContentSection({ movePayload,
  moveVacatedKind,
  onSetMoveVacatedKind,
  moveVacatedElevation,
  onSetMoveVacatedElevation,
  moveCities,
  onSetMoveCities,
  labelGroupToggles,
  allLabelGroupsChecked,
  onSetAllLabelGroups,
}: MoveContentSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section">
      <SectionToggleHeader title={ui.move.content} expanded={true} onToggle={() => {}} />
      <div className="mode-tool-card-list">
        {movePayload === 'terrain' ? (
          <>
            <CardTitle>{ui.move.vacatedSurface}</CardTitle>
            <ControlCard variant="frameless">
              <div className="table-action-group table-action-group--segmented table-action-group--country-primary">
                {(['land', 'water', 'empty'] as const).map((kind) => (
                  <button
                    key={kind}
                    className={`toolbar-action-button${moveVacatedKind === kind ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => {
                      onSetMoveVacatedKind(kind)
                    }}
                  >
                    {kind === 'land' ? ui.surface.landBaseColor : kind === 'water' ? ui.surface.waterBaseSimpleColor : ui.surface.emptyColor}
                  </button>
                ))}
              </div>
            </ControlCard>

            <CardTitle>{ui.move.vacatedElevation}</CardTitle>
            <ControlCard variant="frameless" className={moveVacatedKind === 'empty' ? 'control-stack is-disabled' : 'control-stack'}>
              <div className="surface-elevation-control">
                <div className="surface-width-row">
                  <input
                    type="range"
                    value={moveVacatedElevation}
                    disabled={moveVacatedKind === 'empty'}
                    min={moveVacatedKind === 'water' ? -10 : -5}
                    max={moveVacatedKind === 'water' ? 0 : 20}
                    step={1}
                    onChange={(event) => {
                      const parsed = Number(event.target.value)
                      if (Number.isFinite(parsed)) {
                        onSetMoveVacatedElevation(parsed)
                      }
                    }}
                  />
                  <input
                    className="surface-elevation-input"
                    type="number"
                    value={moveVacatedElevation}
                    disabled={moveVacatedKind === 'empty'}
                    min={moveVacatedKind === 'water' ? -10 : -5}
                    max={moveVacatedKind === 'water' ? 0 : 20}
                    step={1}
                    onChange={(event) => {
                      const parsed = Number(event.target.value)
                      if (Number.isFinite(parsed)) {
                        onSetMoveVacatedElevation(parsed)
                      }
                    }}
                  />
                </div>
              </div>
            </ControlCard>
          </>
        ) : (
          <>
            <CardTitle>{ui.move.cities}</CardTitle>
            <ControlCard variant="frameless">
              <label className="toggle-row">
                <span>{ui.move.cities}</span>
                <input
                  type="checkbox"
                  checked={moveCities}
                  onChange={(event) => {
                    onSetMoveCities(event.target.checked)
                  }}
                />
              </label>
            </ControlCard>
          </>
        )}

        <CardTitle>{ui.common.labelGroups}</CardTitle>
        <ControlCard variant="frameless">
          <div className="control-list">
            <label className="toggle-row">
              <span>{ui.label.all}</span>
              <input
                type="checkbox"
                checked={allLabelGroupsChecked}
                onChange={(event) => {
                  onSetAllLabelGroups(event.target.checked)
                }}
              />
            </label>
            {labelGroupToggles.map((group) => (
              <label key={group.id} className="toggle-row">
                <span>{group.name}</span>
                <input
                  type="checkbox"
                  checked={group.checked}
                  onChange={(event) => {
                    group.onChange(event.target.checked)
                  }}
                />
              </label>
            ))}
          </div>
        </ControlCard>
      </div>
    </section>
  )
}
