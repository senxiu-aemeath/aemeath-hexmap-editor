import { useRef, useState } from 'react'
import type { HexGridConfig } from '../../domain/grid'
import type { WorldNumberDrafts } from '../../components/world/WorldModePanel'
import { buildWorldNumberDrafts } from '../editor/stateSyncHelpers'
import { createInitialWorld } from '../../domain/world'

const DEFAULT_GRID: HexGridConfig = {
  cols: 30,
  rows: 20,
  hexSize: 28,
  orientation: 'pointy',
}

const DEFAULT_WORLD_NUMBER_DRAFTS = buildWorldNumberDrafts(createInitialWorld(DEFAULT_GRID))

export { DEFAULT_GRID }

export function useGridConfig() {
  const [draftGridConfig, setDraftGridConfig] = useState(DEFAULT_GRID)
  const [draftGridColsInput, setDraftGridColsInput] = useState(() => String(DEFAULT_GRID.cols))
  const [draftGridRowsInput, setDraftGridRowsInput] = useState(() => String(DEFAULT_GRID.rows))
  const [draftGridHexSizeInput, setDraftGridHexSizeInput] = useState(
    () => String(DEFAULT_GRID.hexSize),
  )
  const [worldNumberDrafts, setWorldNumberDrafts] = useState<WorldNumberDrafts>(
    DEFAULT_WORLD_NUMBER_DRAFTS,
  )
  const lastSyncedWorldNumberDraftsRef = useRef<WorldNumberDrafts>(
    DEFAULT_WORLD_NUMBER_DRAFTS,
  )
  const [appliedGridConfig, setAppliedGridConfig] = useState(DEFAULT_GRID)

  return {
    draftGridConfig, setDraftGridConfig,
    draftGridColsInput, setDraftGridColsInput,
    draftGridRowsInput, setDraftGridRowsInput,
    draftGridHexSizeInput, setDraftGridHexSizeInput,
    worldNumberDrafts, setWorldNumberDrafts,
    lastSyncedWorldNumberDraftsRef,
    appliedGridConfig, setAppliedGridConfig,
    DEFAULT_GRID,
  }
}
