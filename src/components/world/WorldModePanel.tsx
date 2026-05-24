import type { KeyboardEventHandler } from 'react'

import type { WorldDocument } from '../../domain/world'
import { WorldGridSection } from './WorldGridSection'
import { WorldInformationSection } from './WorldInformationSection'
import { WorldStyleSection } from './WorldStyleSection'

export interface WorldNumberDrafts {
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

interface WorldModePanelProps {
  world: WorldDocument
  appliedGridConfig: {
    cols: number
    rows: number
    hexSize: number
  }
  infoExpanded: boolean
  styleExpanded: boolean
  gridExpanded: boolean
  onToggleInfo: () => void
  onToggleStyle: () => void
  onToggleGrid: () => void
  draftGridColsInput: string
  draftGridRowsInput: string
  draftGridHexSizeInput: string
  onSetDraftGridColsInput: (value: string) => void
  onSetDraftGridRowsInput: (value: string) => void
  onSetDraftGridHexSizeInput: (value: string) => void
  onCommitDraftGridConfig: () => void
  onUpdateMetadataField: (
    key: 'name' | 'author' | 'title' | 'subtitle',
    value: string,
  ) => void
  onToggleMetadataFlag: (
    key: 'showBranding' | 'showTitle' | 'showSubtitle' | 'showByline',
    value: boolean,
  ) => void
  onResizeBaseMap: () => void
  onCreateNewWorld: () => void
  onCommitOnEnter: KeyboardEventHandler<HTMLInputElement>
  worldNumberDrafts: WorldNumberDrafts
  onSetWorldNumberDraft: (key: keyof WorldNumberDrafts, value: string) => void
  onCommitWorldNumberDraft: (
    key: keyof WorldNumberDrafts,
    fallback: number,
    min: number,
    max: number,
    apply: (nextValue: number) => void,
  ) => void
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

export function WorldModePanel(props: WorldModePanelProps) {
  return (
    <div className="tool-section-stack world-panel section-gap">
      <WorldInformationSection
        expanded={props.infoExpanded}
        onToggle={props.onToggleInfo}
        world={props.world}
        appliedGridConfig={props.appliedGridConfig}
        onUpdateMetadataField={props.onUpdateMetadataField}
        onToggleMetadataFlag={props.onToggleMetadataFlag}
      />
      <WorldGridSection
        expanded={props.gridExpanded}
        onToggle={props.onToggleGrid}
        draftGridColsInput={props.draftGridColsInput}
        draftGridRowsInput={props.draftGridRowsInput}
        draftGridHexSizeInput={props.draftGridHexSizeInput}
        onSetDraftGridColsInput={props.onSetDraftGridColsInput}
        onSetDraftGridRowsInput={props.onSetDraftGridRowsInput}
        onSetDraftGridHexSizeInput={props.onSetDraftGridHexSizeInput}
        onCommitDraftGridConfig={props.onCommitDraftGridConfig}
        onCommitOnEnter={props.onCommitOnEnter}
        onResizeBaseMap={props.onResizeBaseMap}
        onCreateNewWorld={props.onCreateNewWorld}
      />
      <WorldStyleSection
        expanded={props.styleExpanded}
        onToggle={props.onToggleStyle}
        world={props.world}
        worldNumberDrafts={props.worldNumberDrafts}
        onSetWorldNumberDraft={props.onSetWorldNumberDraft}
        onCommitWorldNumberDraft={props.onCommitWorldNumberDraft}
        onCommitOnEnter={props.onCommitOnEnter}
        onSetHeaderFontFamily={props.onSetHeaderFontFamily}
        onSetMetadataColor={props.onSetMetadataColor}
        onUpdateMetadataNumber={props.onUpdateMetadataNumber}
        onUpdateFrameNumber={props.onUpdateFrameNumber}
        onSetFrameColor={props.onSetFrameColor}
        onToggleAxis={props.onToggleAxis}
        onSetAxisColor={props.onSetAxisColor}
        onSetAxisFontSize={props.onSetAxisFontSize}
        onUpdateSubmapStyleNumber={props.onUpdateSubmapStyleNumber}
        onSetSubmapFrameColor={props.onSetSubmapFrameColor}
      />
    </div>
  )
}
