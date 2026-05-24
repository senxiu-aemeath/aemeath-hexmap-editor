import type { KeyboardEventHandler } from 'react'

import { useUiMessages } from '../../i18n'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { ControlCard, ControlRow } from '../ToolControlPrimitives'

interface WorldGridSectionProps {
  expanded: boolean
  onToggle: () => void
  draftGridColsInput: string
  draftGridRowsInput: string
  draftGridHexSizeInput: string
  onSetDraftGridColsInput: (value: string) => void
  onSetDraftGridRowsInput: (value: string) => void
  onSetDraftGridHexSizeInput: (value: string) => void
  onCommitDraftGridConfig: () => void
  onCommitOnEnter: KeyboardEventHandler<HTMLInputElement>
  onResizeBaseMap: () => void
  onCreateNewWorld: () => void
}

export function WorldGridSection({ expanded,
  onToggle,
  draftGridColsInput,
  draftGridRowsInput,
  draftGridHexSizeInput,
  onSetDraftGridColsInput,
  onSetDraftGridRowsInput,
  onSetDraftGridHexSizeInput,
  onCommitDraftGridConfig,
  onCommitOnEnter,
  onResizeBaseMap,
  onCreateNewWorld,
}: WorldGridSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.world.gridSection} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <ControlCard variant="frameless">
            <ControlRow columns={3} className="world-grid-pair world-grid-triplet">
              <label className="control-field">
                <span>{ui.world.columns}</span>
                <input
                  type="number"
                  min={2}
                  max={256}
                  value={draftGridColsInput}
                  onChange={(event) => {
                    onSetDraftGridColsInput(event.target.value)
                  }}
                  onBlur={onCommitDraftGridConfig}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
              <label className="control-field">
                <span>{ui.world.rows}</span>
                <input
                  type="number"
                  min={2}
                  max={256}
                  value={draftGridRowsInput}
                  onChange={(event) => {
                    onSetDraftGridRowsInput(event.target.value)
                  }}
                  onBlur={onCommitDraftGridConfig}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
              <label className="control-field">
                <span>{ui.world.hexSize}</span>
                <input
                  type="number"
                  min={12}
                  max={64}
                  value={draftGridHexSizeInput}
                  onChange={(event) => {
                    onSetDraftGridHexSizeInput(event.target.value)
                  }}
                  onBlur={onCommitDraftGridConfig}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
            </ControlRow>
            <ControlRow columns={2} className="world-grid-pair world-grid-actions world-grid-card__actions">
              <button
                className="toolbar-action-button toolbar-action-button--secondary"
                type="button"
                onClick={onResizeBaseMap}
              >
                {ui.world.newBaseMap}
              </button>
              <button
                className="toolbar-action-button toolbar-action-button--secondary"
                type="button"
                onClick={onCreateNewWorld}
              >
                {ui.world.newWorld}
              </button>
            </ControlRow>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
