import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import {
  createInitialWorld,
  resizeWorldDocument,
  type Submap,
} from '../../domain/world'
import type { HexGridConfig } from '../../domain/grid'
import { WorldModePanel, type WorldNumberDrafts } from './WorldModePanel'
import { useWorldContext } from '../../state/WorldContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type WorldModePanelProps = ComponentProps<typeof WorldModePanel>

interface WorldModePanelContainerProps {
  appliedGridConfig: HexGridConfig
  infoExpanded: boolean
  setInfoExpanded: Dispatch<SetStateAction<boolean>>
  styleExpanded: boolean
  setStyleExpanded: Dispatch<SetStateAction<boolean>>
  gridExpanded: boolean
  setGridExpanded: Dispatch<SetStateAction<boolean>>
  draftGridConfig: HexGridConfig
  setDraftGridConfig: Dispatch<SetStateAction<HexGridConfig>>
  draftGridColsInput: string
  setDraftGridColsInput: Dispatch<SetStateAction<string>>
  draftGridRowsInput: string
  setDraftGridRowsInput: Dispatch<SetStateAction<string>>
  draftGridHexSizeInput: string
  setDraftGridHexSizeInput: Dispatch<SetStateAction<string>>
  setAppliedGridConfig: Dispatch<SetStateAction<HexGridConfig>>
  setEditingSubmapId: Dispatch<SetStateAction<string | null>>
  setSubmapDraftName: Dispatch<SetStateAction<string>>
  onClearPoliticalInteraction: () => void
  onCloseCityEditor: () => void
  onCloseCityLevelEditor: () => void
  onCloseTransientUi: () => void
  onCommitDraftGridConfig: () => void
  setEditingSubmapSnapshot: Dispatch<SetStateAction<Submap | null>>
  setSubmapDraftSubtitle: Dispatch<SetStateAction<string>>
  setSubmapDraftFrameColor: Dispatch<SetStateAction<string>>
  onCommitOnEnter: WorldModePanelProps['onCommitOnEnter']
  worldNumberDrafts: WorldNumberDrafts
  setWorldNumberDrafts: Dispatch<SetStateAction<WorldNumberDrafts>>
  onCommitWorldNumberDraft: WorldModePanelProps['onCommitWorldNumberDraft']
}

function sanitizeGridValue(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export function WorldModePanelContainer({
  appliedGridConfig,
  infoExpanded,
  setInfoExpanded,
  styleExpanded,
  setStyleExpanded,
  gridExpanded,
  setGridExpanded,
  draftGridConfig,
  setDraftGridConfig,
  draftGridColsInput,
  setDraftGridColsInput,
  draftGridRowsInput,
  setDraftGridRowsInput,
  draftGridHexSizeInput,
  setDraftGridHexSizeInput,
  setAppliedGridConfig,
  setEditingSubmapId,
  setSubmapDraftName,
  onClearPoliticalInteraction,
  onCloseCityEditor,
  onCloseCityLevelEditor,
  onCloseTransientUi,
  onCommitDraftGridConfig,
  setEditingSubmapSnapshot,
  setSubmapDraftSubtitle,
  setSubmapDraftFrameColor,
  onCommitOnEnter,
  worldNumberDrafts,
  setWorldNumberDrafts,
  onCommitWorldNumberDraft,
}: WorldModePanelContainerProps) {
  const { world, setWorld } = useWorldContext()
  const { setHoveredCellId, setIsSubmapSelectionMode, setActiveSubmapId } = useActiveEntityContext()
  return (
    <WorldModePanel
      world={world}
      appliedGridConfig={appliedGridConfig}
      infoExpanded={infoExpanded}
      styleExpanded={styleExpanded}
      gridExpanded={gridExpanded}
      onToggleInfo={() => {
        setInfoExpanded((current) => !current)
      }}
      onToggleStyle={() => {
        setStyleExpanded((current) => !current)
      }}
      onToggleGrid={() => {
        setGridExpanded((current) => !current)
      }}
      draftGridColsInput={draftGridColsInput}
      draftGridRowsInput={draftGridRowsInput}
      draftGridHexSizeInput={draftGridHexSizeInput}
      onSetDraftGridColsInput={setDraftGridColsInput}
      onSetDraftGridRowsInput={setDraftGridRowsInput}
      onSetDraftGridHexSizeInput={setDraftGridHexSizeInput}
      onCommitDraftGridConfig={onCommitDraftGridConfig}
      onUpdateMetadataField={(key, value) => {
        setWorld((current) => ({
          ...current,
          metadata: {
            ...current.metadata,
            [key]: value,
          },
        }))
      }}
      onToggleMetadataFlag={(key, value) => {
        setWorld((current) => ({
          ...current,
          metadata: {
            ...current.metadata,
            [key]: value,
          },
        }))
      }}
      onResizeBaseMap={() => {
        const nextGridConfig = {
          cols: sanitizeGridValue(draftGridColsInput, draftGridConfig.cols, 2, 256),
          rows: sanitizeGridValue(draftGridRowsInput, draftGridConfig.rows, 2, 256),
          hexSize: sanitizeGridValue(draftGridHexSizeInput, draftGridConfig.hexSize, 12, 64),
          orientation: draftGridConfig.orientation,
        } satisfies HexGridConfig

        setDraftGridConfig(nextGridConfig)
        setDraftGridColsInput(String(nextGridConfig.cols))
        setDraftGridRowsInput(String(nextGridConfig.rows))
        setDraftGridHexSizeInput(String(nextGridConfig.hexSize))
        setHoveredCellId(null)
        setAppliedGridConfig(nextGridConfig)
        setIsSubmapSelectionMode(false)
        setEditingSubmapId(null)
        setSubmapDraftName('')
        setWorld((current) => resizeWorldDocument(current, nextGridConfig))
        onClearPoliticalInteraction()
        onCloseCityEditor()
        onCloseCityLevelEditor()
      }}
      onCreateNewWorld={() => {
        const nextGridConfig = {
          cols: sanitizeGridValue(draftGridColsInput, draftGridConfig.cols, 2, 256),
          rows: sanitizeGridValue(draftGridRowsInput, draftGridConfig.rows, 2, 256),
          hexSize: sanitizeGridValue(draftGridHexSizeInput, draftGridConfig.hexSize, 12, 64),
          orientation: draftGridConfig.orientation,
        } satisfies HexGridConfig

        const nextWorld = createInitialWorld(nextGridConfig)
        onCloseTransientUi()
        setHoveredCellId(null)
        setDraftGridConfig(nextGridConfig)
        setDraftGridColsInput(String(nextGridConfig.cols))
        setDraftGridRowsInput(String(nextGridConfig.rows))
        setDraftGridHexSizeInput(String(nextGridConfig.hexSize))
        setAppliedGridConfig(nextGridConfig)
        setWorld(nextWorld)
        setActiveSubmapId(null)
        setEditingSubmapId(null)
        setEditingSubmapSnapshot(null)
        setSubmapDraftName('')
        setSubmapDraftSubtitle('')
        setSubmapDraftFrameColor('')
        setIsSubmapSelectionMode(false)
        onClearPoliticalInteraction()
      }}
      onCommitOnEnter={onCommitOnEnter}
      worldNumberDrafts={worldNumberDrafts}
      onSetWorldNumberDraft={(key, value) => {
        setWorldNumberDrafts((current) => ({
          ...current,
          [key]: value,
        }))
      }}
      onCommitWorldNumberDraft={onCommitWorldNumberDraft}
      onSetHeaderFontFamily={(value) => {
        setWorld((current) => ({
          ...current,
          metadata: {
            ...current.metadata,
            headerFontFamily: value,
          },
        }))
      }}
      onSetMetadataColor={(key, value) => {
        setWorld((current) => ({
          ...current,
          metadata: {
            ...current.metadata,
            [key]: value,
          },
        }))
      }}
      onUpdateMetadataNumber={(key, value) => {
        setWorld((current) => ({
          ...current,
          metadata: {
            ...current.metadata,
            [key]: value,
          },
        }))
      }}
      onUpdateFrameNumber={(key, value) => {
        setWorld((current) => ({
          ...current,
          frame: {
            ...current.frame,
            [key]: value,
          },
        }))
      }}
      onSetFrameColor={(value) => {
        setWorld((current) => ({
          ...current,
          frame: {
            ...current.frame,
            color: value,
          },
        }))
      }}
      onToggleAxis={(key, value) => {
        setWorld((current) => ({
          ...current,
          axes: {
            ...current.axes,
            [key]: value,
          },
        }))
      }}
      onSetAxisColor={(value) => {
        setWorld((current) => ({
          ...current,
          axes: {
            ...current.axes,
            color: value,
          },
        }))
      }}
      onSetAxisFontSize={(value) => {
        setWorld((current) => ({
          ...current,
          axes: {
            ...current.axes,
            fontSize: value,
          },
        }))
      }}
      onUpdateSubmapStyleNumber={(key, value) => {
        setWorld((current) => ({
          ...current,
          submapStyle: {
            ...current.submapStyle,
            [key]: value,
          },
        }))
      }}
      onSetSubmapFrameColor={(value) => {
        setWorld((current) => ({
          ...current,
          submapStyle: {
            ...current.submapStyle,
            frameColor: value,
          },
        }))
      }}
    />
  )
}
