import type { WorldDocument } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { DeferredTextInput } from '../DeferredTextInput'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard, FieldUnit } from '../ToolControlPrimitives'

interface WorldInformationSectionProps {
  expanded: boolean
  onToggle: () => void
  world: WorldDocument
  appliedGridConfig: {
    cols: number
    rows: number
    hexSize: number
  }
  onUpdateMetadataField: (
    key: 'name' | 'author' | 'title' | 'subtitle',
    value: string,
  ) => void
  onToggleMetadataFlag: (
    key: 'showBranding' | 'showTitle' | 'showSubtitle' | 'showByline',
    value: boolean,
  ) => void
}

export function WorldInformationSection({ expanded,
  onToggle,
  world,
  appliedGridConfig,
  onUpdateMetadataField,
  onToggleMetadataFlag,
}: WorldInformationSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.world.informationSection} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <div className="detail-card details-card selected-info-card active-city-card world-summary-card">
            <div className="selected-info-pair">
              <strong>{ui.world.title}</strong>
              <span>{world.metadata.title.trim() || ui.common.empty}</span>
            </div>
            <div className="selected-info-pair">
              <strong>{ui.world.subtitle}</strong>
              <span>{world.metadata.subtitle.trim() || ui.common.empty}</span>
            </div>
            <div className="selected-info-pair">
              <strong>{ui.common.submaps}</strong>
              <span>{Object.keys(world.submaps).length}</span>
            </div>
            <div className="selected-info-pair">
              <strong>{ui.world.gridSection}</strong>
              <span>{`${appliedGridConfig.cols} × ${appliedGridConfig.rows} · ${appliedGridConfig.hexSize}`}</span>
            </div>
          </div>

          <CardTitle>{ui.world.worldInfo}</CardTitle>
          <ControlCard variant="framed">
            <FieldUnit fieldKey={ui.world.name} stacked>
              <DeferredTextInput
                value={world.metadata.name}
                onCommit={(nextValue) => {
                  onUpdateMetadataField('name', nextValue)
                }}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.world.author} stacked>
              <DeferredTextInput
                value={world.metadata.author}
                onCommit={(nextValue) => {
                  onUpdateMetadataField('author', nextValue)
                }}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.world.title} stacked>
              <DeferredTextInput
                value={world.metadata.title}
                onCommit={(nextValue) => {
                  onUpdateMetadataField('title', nextValue)
                }}
              />
            </FieldUnit>
            <FieldUnit fieldKey={ui.world.subtitle} stacked>
              <DeferredTextInput
                value={world.metadata.subtitle}
                onCommit={(nextValue) => {
                  onUpdateMetadataField('subtitle', nextValue)
                }}
              />
            </FieldUnit>
          </ControlCard>

          <CardTitle>{ui.world.displayOptions}</CardTitle>
          <ControlCard variant="frameless">
            <div className="detail-list">
              <label className="toggle-row">
                <span>{ui.world.showBranding}</span>
                <input
                  type="checkbox"
                  checked={world.metadata.showBranding}
                  onChange={(event) => {
                    onToggleMetadataFlag('showBranding', event.target.checked)
                  }}
                />
              </label>
              <label className="toggle-row">
                <span>{ui.world.showTitle}</span>
                <input
                  type="checkbox"
                  checked={world.metadata.showTitle}
                  onChange={(event) => {
                    onToggleMetadataFlag('showTitle', event.target.checked)
                  }}
                />
              </label>
              <label className="toggle-row">
                <span>{ui.world.showSubtitle}</span>
                <input
                  type="checkbox"
                  checked={world.metadata.showSubtitle}
                  onChange={(event) => {
                    onToggleMetadataFlag('showSubtitle', event.target.checked)
                  }}
                />
              </label>
              <label className="toggle-row">
                <span>{ui.world.showByline}</span>
                <input
                  type="checkbox"
                  checked={world.metadata.showByline}
                  onChange={(event) => {
                    onToggleMetadataFlag('showByline', event.target.checked)
                  }}
                />
              </label>
            </div>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
