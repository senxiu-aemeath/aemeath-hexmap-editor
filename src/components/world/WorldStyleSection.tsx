import type { KeyboardEventHandler } from 'react'

import type { WorldDocument } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { ColorApplyField } from '../ColorApplyField'
import { DeferredTextInput } from '../DeferredTextInput'
import { SectionToggleHeader } from '../SectionToggleHeader'
import { CardTitle, ControlCard, ControlRow, FieldUnit } from '../ToolControlPrimitives'

interface WorldNumberDrafts {
  pageMarginTop: string
  titleFontSize: string
  subtitleFontSize: string
  bylineFontSize: string
  titleSubtitleGap: string
  subtitleBylineGap: string
  frameTop: string
  frameRight: string
  frameBottom: string
  frameLeft: string
  axisFontSize: string
  submapPageMarginTop: string
  submapTitleFontSize: string
  submapSubtitleFontSize: string
  submapBylineFontSize: string
  submapTitleSubtitleGap: string
  submapSubtitleBylineGap: string
  submapFrameTop: string
  submapFrameRight: string
  submapFrameBottom: string
  submapFrameLeft: string
}

interface WorldStyleSectionProps {
  expanded: boolean
  onToggle: () => void
  world: WorldDocument
  worldNumberDrafts: WorldNumberDrafts
  onSetWorldNumberDraft: (key: keyof WorldNumberDrafts, value: string) => void
  onCommitWorldNumberDraft: (
    key: keyof WorldNumberDrafts,
    fallback: number,
    min: number,
    max: number,
    apply: (nextValue: number) => void,
  ) => void
  onCommitOnEnter: KeyboardEventHandler<HTMLInputElement>
  onSetHeaderFontFamily: (value: string) => void
  onSetMetadataColor: (key: 'titleColor' | 'subtitleColor' | 'bylineColor', value: string) => void
  onUpdateMetadataNumber: (
    key:
      | 'titleFontSize'
      | 'subtitleFontSize'
      | 'bylineFontSize'
      | 'pageMarginTop'
      | 'titleSubtitleGap'
      | 'subtitleBylineGap',
    value: number,
  ) => void
  onUpdateFrameNumber: (key: 'top' | 'right' | 'bottom' | 'left', value: number) => void
  onSetFrameColor: (value: string) => void
  onToggleAxis: (key: 'showTop' | 'showRight' | 'showBottom' | 'showLeft', value: boolean) => void
  onSetAxisColor: (value: string) => void
  onSetAxisFontSize: (value: number) => void
  onUpdateSubmapStyleNumber: (
    key:
      | 'titleFontSize'
      | 'subtitleFontSize'
      | 'bylineFontSize'
      | 'pageMarginTop'
      | 'titleSubtitleGap'
      | 'subtitleBylineGap'
      | 'frameTop'
      | 'frameRight'
      | 'frameBottom'
      | 'frameLeft',
    value: number,
  ) => void
  onSetSubmapFrameColor: (value: string) => void
}

export function WorldStyleSection({ expanded,
  onToggle,
  world,
  worldNumberDrafts,
  onSetWorldNumberDraft,
  onCommitWorldNumberDraft,
  onCommitOnEnter,
  onSetHeaderFontFamily,
  onSetMetadataColor,
  onUpdateMetadataNumber,
  onUpdateFrameNumber,
  onSetFrameColor,
  onToggleAxis,
  onSetAxisColor,
  onSetAxisFontSize,
  onUpdateSubmapStyleNumber,
  onSetSubmapFrameColor,
}: WorldStyleSectionProps) {
  const ui = useUiMessages()
  return (
    <section className="data-table-section section-gap">
      <SectionToggleHeader title={ui.world.styleSection} expanded={expanded} onToggle={onToggle} />
      {expanded ? (
        <div className="mode-tool-card-list">
          <CardTitle size="large">{ui.world.mapStyleSection}</CardTitle>
          <CardTitle>{ui.world.titleStyleSection}</CardTitle>
          <ControlCard variant="frameless">
            <FieldUnit>
              <div className="detail-list">
                <label className="control-field">
                  <span>{ui.world.headerFontFamily}</span>
                  <DeferredTextInput value={world.metadata.headerFontFamily} onCommit={onSetHeaderFontFamily} />
                </label>
                <label className="control-field">
                  <span>{ui.world.titleColor}</span>
                  <ColorApplyField value={world.metadata.titleColor} onApply={(value) => onSetMetadataColor('titleColor', value)} />
                </label>
                <label className="control-field">
                  <span>{ui.world.subtitleColor}</span>
                  <ColorApplyField value={world.metadata.subtitleColor} onApply={(value) => onSetMetadataColor('subtitleColor', value)} />
                </label>
                <label className="control-field">
                  <span>{ui.world.bylineColor}</span>
                  <ColorApplyField value={world.metadata.bylineColor} onApply={(value) => onSetMetadataColor('bylineColor', value)} />
                </label>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.titleFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.titleFontSize}
                      onChange={(event) => onSetWorldNumberDraft('titleFontSize', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('titleFontSize', world.metadata.titleFontSize, 8, 320, (nextValue) => onUpdateMetadataNumber('titleFontSize', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.subtitleFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.subtitleFontSize}
                      onChange={(event) => onSetWorldNumberDraft('subtitleFontSize', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('subtitleFontSize', world.metadata.subtitleFontSize, 8, 240, (nextValue) => onUpdateMetadataNumber('subtitleFontSize', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.bylineFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.bylineFontSize}
                      onChange={(event) => onSetWorldNumberDraft('bylineFontSize', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('bylineFontSize', world.metadata.bylineFontSize, 8, 180, (nextValue) => onUpdateMetadataNumber('bylineFontSize', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.pageMarginTop}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.pageMarginTop}
                      onChange={(event) => onSetWorldNumberDraft('pageMarginTop', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('pageMarginTop', world.metadata.pageMarginTop, 0, 160, (nextValue) => onUpdateMetadataNumber('pageMarginTop', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.titleSubtitleGap}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.titleSubtitleGap}
                      onChange={(event) => onSetWorldNumberDraft('titleSubtitleGap', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('titleSubtitleGap', world.metadata.titleSubtitleGap, 0, 48, (nextValue) => onUpdateMetadataNumber('titleSubtitleGap', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.subtitleBylineGap}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.subtitleBylineGap}
                      onChange={(event) => onSetWorldNumberDraft('subtitleBylineGap', event.target.value)}
                      onBlur={() => onCommitWorldNumberDraft('subtitleBylineGap', world.metadata.subtitleBylineGap, 0, 48, (nextValue) => onUpdateMetadataNumber('subtitleBylineGap', nextValue))}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
              </div>
            </FieldUnit>
          </ControlCard>

          <CardTitle>{ui.world.frame}</CardTitle>
          <ControlCard variant="frameless">
            <ControlRow columns={2} className="world-grid-pair">
              <label className="control-field">
                <span>{ui.world.top}</span>
                <input
                  type="text"
                  value={worldNumberDrafts.frameTop}
                  onChange={(event) => onSetWorldNumberDraft('frameTop', event.target.value)}
                  onBlur={() => onCommitWorldNumberDraft('frameTop', world.frame.top, 0, 512, (nextValue) => onUpdateFrameNumber('top', nextValue))}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
              <label className="control-field">
                <span>{ui.world.right}</span>
                <input
                  type="text"
                  value={worldNumberDrafts.frameRight}
                  onChange={(event) => onSetWorldNumberDraft('frameRight', event.target.value)}
                  onBlur={() => onCommitWorldNumberDraft('frameRight', world.frame.right, 0, 512, (nextValue) => onUpdateFrameNumber('right', nextValue))}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
            </ControlRow>
            <ControlRow columns={2} className="world-grid-pair">
              <label className="control-field">
                <span>{ui.world.bottom}</span>
                <input
                  type="text"
                  value={worldNumberDrafts.frameBottom}
                  onChange={(event) => onSetWorldNumberDraft('frameBottom', event.target.value)}
                  onBlur={() => onCommitWorldNumberDraft('frameBottom', world.frame.bottom, 0, 512, (nextValue) => onUpdateFrameNumber('bottom', nextValue))}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
              <label className="control-field">
                <span>{ui.world.left}</span>
                <input
                  type="text"
                  value={worldNumberDrafts.frameLeft}
                  onChange={(event) => onSetWorldNumberDraft('frameLeft', event.target.value)}
                  onBlur={() => onCommitWorldNumberDraft('frameLeft', world.frame.left, 0, 512, (nextValue) => onUpdateFrameNumber('left', nextValue))}
                  onKeyDown={onCommitOnEnter}
                />
              </label>
            </ControlRow>
            <label className="control-field">
              <span>{ui.world.color}</span>
              <ColorApplyField pickerKey="world:background-color" value={world.frame.color} onApply={onSetFrameColor} />
            </label>
          </ControlCard>

          <CardTitle>{ui.world.axes}</CardTitle>
          <ControlCard variant="frameless">
            <ControlRow columns={2} className="world-grid-pair">
              <label className="toggle-row">
                <span>{ui.world.top}</span>
                <input
                  type="checkbox"
                  checked={world.axes.showTop}
                  onChange={(event) => onToggleAxis('showTop', event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>{ui.world.right}</span>
                <input
                  type="checkbox"
                  checked={world.axes.showRight}
                  onChange={(event) => onToggleAxis('showRight', event.target.checked)}
                />
              </label>
            </ControlRow>
            <ControlRow columns={2} className="world-grid-pair">
              <label className="toggle-row">
                <span>{ui.world.bottom}</span>
                <input
                  type="checkbox"
                  checked={world.axes.showBottom}
                  onChange={(event) => onToggleAxis('showBottom', event.target.checked)}
                />
              </label>
              <label className="toggle-row">
                <span>{ui.world.left}</span>
                <input
                  type="checkbox"
                  checked={world.axes.showLeft}
                  onChange={(event) => onToggleAxis('showLeft', event.target.checked)}
                />
              </label>
            </ControlRow>
            <label className="control-field">
              <span>{ui.world.axisColor}</span>
              <ColorApplyField pickerKey="world:axis-color" value={world.axes.color} onApply={onSetAxisColor} />
            </label>
            <label className="control-field">
              <span>{ui.world.axisFontSize}</span>
              <input
                type="text"
                value={worldNumberDrafts.axisFontSize}
                onChange={(event) => onSetWorldNumberDraft('axisFontSize', event.target.value)}
                onBlur={() => onCommitWorldNumberDraft('axisFontSize', world.axes.fontSize, 8, 180, (nextValue) => onSetAxisFontSize(nextValue))}
                onKeyDown={onCommitOnEnter}
              />
            </label>
          </ControlCard>

          <CardTitle size="large">{ui.world.submapStyleSection}</CardTitle>
          <CardTitle>{ui.world.titleStyleSection}</CardTitle>
          <ControlCard variant="frameless">
            <FieldUnit>
              <div className="detail-list">
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.titleFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapTitleFontSize}
                      onChange={(event) => onSetWorldNumberDraft('submapTitleFontSize', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapTitleFontSize', world.submapStyle.titleFontSize, 8, 320, (nextValue) => {
                          onUpdateSubmapStyleNumber('titleFontSize', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.subtitleFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapSubtitleFontSize}
                      onChange={(event) => onSetWorldNumberDraft('submapSubtitleFontSize', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapSubtitleFontSize', world.submapStyle.subtitleFontSize, 8, 240, (nextValue) => {
                          onUpdateSubmapStyleNumber('subtitleFontSize', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.bylineFontSize}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapBylineFontSize}
                      onChange={(event) => onSetWorldNumberDraft('submapBylineFontSize', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapBylineFontSize', world.submapStyle.bylineFontSize, 8, 180, (nextValue) => {
                          onUpdateSubmapStyleNumber('bylineFontSize', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.pageMarginTop}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapPageMarginTop}
                      onChange={(event) => onSetWorldNumberDraft('submapPageMarginTop', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapPageMarginTop', world.submapStyle.pageMarginTop, 0, 160, (nextValue) => {
                          onUpdateSubmapStyleNumber('pageMarginTop', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.titleSubtitleGap}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapTitleSubtitleGap}
                      onChange={(event) => onSetWorldNumberDraft('submapTitleSubtitleGap', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapTitleSubtitleGap', world.submapStyle.titleSubtitleGap, 0, 48, (nextValue) => {
                          onUpdateSubmapStyleNumber('titleSubtitleGap', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.subtitleBylineGap}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapSubtitleBylineGap}
                      onChange={(event) => onSetWorldNumberDraft('submapSubtitleBylineGap', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapSubtitleBylineGap', world.submapStyle.subtitleBylineGap, 0, 48, (nextValue) => {
                          onUpdateSubmapStyleNumber('subtitleBylineGap', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
              </div>
            </FieldUnit>
          </ControlCard>

          <CardTitle>{ui.world.frame}</CardTitle>
          <ControlCard variant="frameless">
            <FieldUnit>
              <div className="detail-list">
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.top}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapFrameTop}
                      onChange={(event) => onSetWorldNumberDraft('submapFrameTop', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapFrameTop', world.submapStyle.frameTop, 0, 512, (nextValue) => {
                          onUpdateSubmapStyleNumber('frameTop', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.right}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapFrameRight}
                      onChange={(event) => onSetWorldNumberDraft('submapFrameRight', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapFrameRight', world.submapStyle.frameRight, 0, 512, (nextValue) => {
                          onUpdateSubmapStyleNumber('frameRight', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <ControlRow columns={2} className="world-grid-pair">
                  <label className="control-field">
                    <span>{ui.world.bottom}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapFrameBottom}
                      onChange={(event) => onSetWorldNumberDraft('submapFrameBottom', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapFrameBottom', world.submapStyle.frameBottom, 0, 512, (nextValue) => {
                          onUpdateSubmapStyleNumber('frameBottom', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                  <label className="control-field">
                    <span>{ui.world.left}</span>
                    <input
                      type="text"
                      value={worldNumberDrafts.submapFrameLeft}
                      onChange={(event) => onSetWorldNumberDraft('submapFrameLeft', event.target.value)}
                      onBlur={() => {
                        onCommitWorldNumberDraft('submapFrameLeft', world.submapStyle.frameLeft, 0, 512, (nextValue) => {
                          onUpdateSubmapStyleNumber('frameLeft', nextValue)
                        })
                      }}
                      onKeyDown={onCommitOnEnter}
                    />
                  </label>
                </ControlRow>
                <label className="control-field">
                  <span>{ui.world.color}</span>
                  <ColorApplyField
                    value={world.submapStyle.frameColor}
                    onApply={onSetSubmapFrameColor}
                  />
                </label>
              </div>
            </FieldUnit>
          </ControlCard>
        </div>
      ) : null}
    </section>
  )
}
