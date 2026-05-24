import { useEffect, useRef, type ChangeEvent } from 'react'

import type { HexGridConfig } from '../../domain/grid'
import type { WorldDocument } from '../../domain/world'
import type { UserIconDefinition } from '../icons/iconRegistry'
import type { CanvasViewState } from '../../render/HexMapCanvas'
import {
  applyConfigSnapshot as applyConfigSnapshotToState,
  applyProjectSnapshot as applyProjectSnapshotToState,
  restoreStoredSession,
  type SavedConfigFile,
  type SavedProjectFile,
} from './sessionSnapshots'

type ProjectSnapshotActions = Parameters<typeof applyProjectSnapshotToState>[1]
type ConfigSnapshotActions = Parameters<typeof applyConfigSnapshotToState>[1]

// Fields sourced from contexts — excluded from the configState parameter
type ContextConfigFields =
  | 'editorMode'
  | 'politicalSubMode'
  | 'countryToolMode'
  | 'provinceToolMode'
  | 'politicalPaintMode'
  | 'restrictProvinceBrushToOwnerCountry'
  | 'cityToolMode'
  | 'brushRadius'
  | 'terrainDisplayMode'
  | 'terrainPaintMode'
  | 'terrainBrushKind'
  | 'terrainBrushElevation'
  | 'cityStatesFillTerritory'
  | 'countryFillOpacity'
  | 'countryBorderColor'
  | 'countryBorderWidth'
  | 'countryBorderOpacity'
  | 'countrySharedBorderOverridesOwn'
  | 'countrySharedBorderMode'
  | 'provinceFillOpacity'
  | 'provinceBorderColor'
  | 'provinceBorderWidth'
  | 'provinceBorderOpacity'
  | 'provinceBorderOverridesCountryBorder'
  | 'terrainLandFillColor'
  | 'terrainWaterFillColor'
  | 'terrainLandAnchors'
  | 'terrainWaterAnchors'
  | 'terrainSnowLineElevation'
  | 'terrainSnowColor'
  | 'showSnowOverride'
  | 'terrainEmptyFillColor'
  | 'terrainLandUnknownFillColor'
  | 'terrainWaterUnknownFillColor'
  | 'terrainWaterDarkFillColor'
  | 'landEdgeColor'
  | 'landEdgeWidth'
  | 'landEmptyEdgeColor'
  | 'landEmptyEdgeWidth'
  | 'coastEdgeColor'
  | 'coastEdgeWidth'
  | 'waterEdgeColor'
  | 'waterEdgeWidth'
  | 'waterEmptyEdgeColor'
  | 'waterEmptyEdgeWidth'
  | 'darkWaterEdgeColor'
  | 'darkWaterEdgeWidth'
  | 'snowEdgeColor'
  | 'snowEdgeWidth'
  | 'snowBoundaryEdgeColor'
  | 'snowBoundaryEdgeWidth'
  | 'showEmptySurface'
  | 'showLandEmptyEdges'
  | 'showWaterEmptyEdges'
  | 'colorWaterInCountryLayer'

// Setters sourced from contexts — excluded from configSnapshotActions parameter
type ContextConfigActions =
  | 'setEditorMode'
  | 'setPoliticalSubMode'
  | 'setCountryToolMode'
  | 'setProvinceToolMode'
  | 'setPoliticalPaintMode'
  | 'setRestrictProvinceBrushToOwnerCountry'
  | 'setCityToolMode'
  | 'setBrushRadius'
  | 'setTerrainDisplayMode'
  | 'setTerrainPaintMode'
  | 'setTerrainBrushKind'
  | 'setTerrainBrushElevation'
  | 'setCityStatesFillTerritory'
  | 'setCountryFillOpacity'
  | 'setCountryBorderColor'
  | 'setCountryBorderWidth'
  | 'setCountryBorderOpacity'
  | 'setCountrySharedBorderOverridesOwn'
  | 'setCountrySharedBorderMode'
  | 'setProvinceFillOpacity'
  | 'setProvinceBorderColor'
  | 'setProvinceBorderWidth'
  | 'setProvinceBorderOpacity'
  | 'setProvinceBorderOverridesCountryBorder'
  | 'setTerrainLandFillColor'
  | 'setTerrainWaterFillColor'
  | 'setTerrainLandAnchors'
  | 'setTerrainWaterAnchors'
  | 'setTerrainSnowLineElevation'
  | 'setTerrainSnowColor'
  | 'setShowSnowOverride'
  | 'setTerrainEmptyFillColor'
  | 'setTerrainLandUnknownFillColor'
  | 'setTerrainWaterUnknownFillColor'
  | 'setTerrainWaterDarkFillColor'
  | 'setLandEdgeColor'
  | 'setLandEdgeWidth'
  | 'setLandEmptyEdgeColor'
  | 'setLandEmptyEdgeWidth'
  | 'setCoastEdgeColor'
  | 'setCoastEdgeWidth'
  | 'setWaterEdgeColor'
  | 'setWaterEdgeWidth'
  | 'setWaterEmptyEdgeColor'
  | 'setWaterEmptyEdgeWidth'
  | 'setDarkWaterEdgeColor'
  | 'setDarkWaterEdgeWidth'
  | 'setSnowEdgeColor'
  | 'setSnowEdgeWidth'
  | 'setSnowBoundaryEdgeColor'
  | 'setSnowBoundaryEdgeWidth'
  | 'setShowEmptySurface'
  | 'setShowLandEmptyEdges'
  | 'setShowWaterEmptyEdges'
  | 'setColorWaterInCountryLayer'

interface UseSessionPersistenceArgs {
  autoProjectStorageKey: string
  autoConfigStorageKey: string
  projectVersion: number
  projectState: {
    appliedGridConfig: HexGridConfig
    world: WorldDocument
    userIcons: UserIconDefinition[]
    embedIconsInProjectFile: boolean
    activeSubmapId: string | null
    canvasViewStates: Record<string, CanvasViewState>
  }
  configState: Omit<SavedConfigFile, 'kind' | 'version' | ContextConfigFields>
  configContextState: Pick<SavedConfigFile, ContextConfigFields>
  getProjectExportUserIcons: (
    userIcons: UserIconDefinition[],
    embedIconsInProjectFile: boolean,
  ) => UserIconDefinition[]
  projectSnapshotActions: ProjectSnapshotActions
  configSnapshotActions: Omit<ConfigSnapshotActions, ContextConfigActions>
  configContextActions: Pick<ConfigSnapshotActions, ContextConfigActions>
}

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function useSessionPersistence({
  autoProjectStorageKey,
  autoConfigStorageKey,
  projectVersion,
  projectState,
  configState,
  configContextState,
  getProjectExportUserIcons,
  projectSnapshotActions,
  configSnapshotActions,
  configContextActions,
}: UseSessionPersistenceArgs) {
  const {
    editorMode,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    politicalPaintMode,
    restrictProvinceBrushToOwnerCountry,
    cityToolMode,
    brushRadius,
    terrainDisplayMode,
    terrainPaintMode,
    terrainBrushKind,
    terrainBrushElevation,
    cityStatesFillTerritory,
    countryFillOpacity,
    countryBorderColor,
    countryBorderWidth,
    countryBorderOpacity,
    countrySharedBorderOverridesOwn,
    countrySharedBorderMode,
    provinceFillOpacity,
    provinceBorderColor,
    provinceBorderWidth,
    provinceBorderOpacity,
    provinceBorderOverridesCountryBorder,
    terrainLandFillColor,
    terrainWaterFillColor,
    terrainLandAnchors,
    terrainWaterAnchors,
    terrainSnowLineElevation,
    terrainSnowColor,
    showSnowOverride,
    terrainEmptyFillColor,
    terrainLandUnknownFillColor,
    terrainWaterUnknownFillColor,
    terrainWaterDarkFillColor,
    landEdgeColor,
    landEdgeWidth,
    landEmptyEdgeColor,
    landEmptyEdgeWidth,
    coastEdgeColor,
    coastEdgeWidth,
    waterEdgeColor,
    waterEdgeWidth,
    waterEmptyEdgeColor,
    waterEmptyEdgeWidth,
    darkWaterEdgeColor,
    darkWaterEdgeWidth,
    snowEdgeColor,
    snowEdgeWidth,
    snowBoundaryEdgeColor,
    snowBoundaryEdgeWidth,
    showEmptySurface,
    showLandEmptyEdges,
    showWaterEmptyEdges,
    colorWaterInCountryLayer,
  } = configContextState

  const {
    setBrushRadius,
    setTerrainBrushKind,
    setTerrainBrushElevation,
    setTerrainPaintMode,
    setTerrainDisplayMode,
    setTerrainLandFillColor,
    setTerrainWaterFillColor,
    setTerrainLandAnchors,
    setTerrainWaterAnchors,
    setTerrainSnowLineElevation,
    setTerrainSnowColor,
    setShowSnowOverride,
    setTerrainEmptyFillColor,
    setTerrainLandUnknownFillColor,
    setTerrainWaterUnknownFillColor,
    setTerrainWaterDarkFillColor,
    setLandEdgeColor,
    setLandEdgeWidth,
    setLandEmptyEdgeColor,
    setLandEmptyEdgeWidth,
    setCoastEdgeColor,
    setCoastEdgeWidth,
    setWaterEdgeColor,
    setWaterEdgeWidth,
    setWaterEmptyEdgeColor,
    setWaterEmptyEdgeWidth,
    setDarkWaterEdgeColor,
    setDarkWaterEdgeWidth,
    setSnowEdgeColor,
    setSnowEdgeWidth,
    setSnowBoundaryEdgeColor,
    setSnowBoundaryEdgeWidth,
    setShowEmptySurface,
    setShowLandEmptyEdges,
    setShowWaterEmptyEdges,
    setColorWaterInCountryLayer,
    setCityStatesFillTerritory,
    setCountryFillOpacity,
    setCountryBorderColor,
    setCountryBorderWidth,
    setCountryBorderOpacity,
    setCountrySharedBorderOverridesOwn,
    setCountrySharedBorderMode,
    setProvinceFillOpacity,
    setProvinceBorderColor,
    setProvinceBorderWidth,
    setProvinceBorderOpacity,
    setProvinceBorderOverridesCountryBorder,
    setEditorMode,
    setPoliticalSubMode,
    setCountryToolMode,
    setProvinceToolMode,
    setPoliticalPaintMode,
    setRestrictProvinceBrushToOwnerCountry,
    setCityToolMode,
  } = configContextActions

  const hasRestoredSessionRef = useRef(false)
  const serializedConfigPayload = JSON.stringify({
    kind: 'hex-map-config',
    version: projectVersion,
    editorMode,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    politicalPaintMode,
    restrictProvinceBrushToOwnerCountry,
    cityToolMode,
    brushRadius,
    terrainDisplayMode,
    terrainPaintMode,
    terrainBrushKind,
    terrainBrushElevation,
    cityStatesFillTerritory,
    countryFillOpacity,
    countryBorderColor,
    countryBorderWidth,
    countryBorderOpacity,
    countrySharedBorderOverridesOwn,
    countrySharedBorderMode,
    provinceFillOpacity,
    provinceBorderColor,
    provinceBorderWidth,
    provinceBorderOpacity,
    provinceBorderOverridesCountryBorder,
    terrainLandFillColor,
    terrainWaterFillColor,
    terrainLandAnchors,
    terrainWaterAnchors,
    terrainSnowLineElevation,
    terrainSnowColor,
    showSnowOverride,
    terrainEmptyFillColor,
    terrainLandUnknownFillColor,
    terrainWaterUnknownFillColor,
    terrainWaterDarkFillColor,
    landEdgeColor,
    landEdgeWidth,
    landEmptyEdgeColor,
    landEmptyEdgeWidth,
    coastEdgeColor,
    coastEdgeWidth,
    waterEdgeColor,
    waterEdgeWidth,
    waterEmptyEdgeColor,
    waterEmptyEdgeWidth,
    darkWaterEdgeColor,
    darkWaterEdgeWidth,
    snowEdgeColor,
    snowEdgeWidth,
    snowBoundaryEdgeColor,
    snowBoundaryEdgeWidth,
    showEmptySurface,
    showLandEmptyEdges,
    showWaterEmptyEdges,
    colorWaterInCountryLayer,
    ...configState,
  } satisfies SavedConfigFile)

  const fullConfigSnapshotActions: ConfigSnapshotActions = {
    ...configSnapshotActions,
    setEditorMode,
    setPoliticalSubMode,
    setCountryToolMode,
    setProvinceToolMode,
    setPoliticalPaintMode,
    setRestrictProvinceBrushToOwnerCountry,
    setCityToolMode,
    setBrushRadius,
    setTerrainDisplayMode,
    setTerrainPaintMode,
    setTerrainBrushKind,
    setTerrainBrushElevation,
    setCityStatesFillTerritory,
    setCountryFillOpacity,
    setCountryBorderColor,
    setCountryBorderWidth,
    setCountryBorderOpacity,
    setCountrySharedBorderOverridesOwn,
    setCountrySharedBorderMode,
    setProvinceFillOpacity,
    setProvinceBorderColor,
    setProvinceBorderWidth,
    setProvinceBorderOpacity,
    setProvinceBorderOverridesCountryBorder,
    setTerrainLandFillColor,
    setTerrainWaterFillColor,
    setTerrainLandAnchors,
    setTerrainWaterAnchors,
    setTerrainSnowLineElevation,
    setTerrainSnowColor,
    setShowSnowOverride,
    setTerrainEmptyFillColor,
    setTerrainLandUnknownFillColor,
    setTerrainWaterUnknownFillColor,
    setTerrainWaterDarkFillColor,
    setLandEdgeColor,
    setLandEdgeWidth,
    setLandEmptyEdgeColor,
    setLandEmptyEdgeWidth,
    setCoastEdgeColor,
    setCoastEdgeWidth,
    setWaterEdgeColor,
    setWaterEdgeWidth,
    setWaterEmptyEdgeColor,
    setWaterEmptyEdgeWidth,
    setDarkWaterEdgeColor,
    setDarkWaterEdgeWidth,
    setSnowEdgeColor,
    setSnowEdgeWidth,
    setSnowBoundaryEdgeColor,
    setSnowBoundaryEdgeWidth,
    setShowEmptySurface,
    setShowLandEmptyEdges,
    setShowWaterEmptyEdges,
    setColorWaterInCountryLayer,
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !hasRestoredSessionRef.current) {
      return
    }

    const payload: SavedProjectFile = {
      kind: 'hex-map-project',
      version: projectVersion,
      grid: projectState.appliedGridConfig,
      world: projectState.world,
      userIcons: projectState.userIcons,
      activeSubmapId: projectState.activeSubmapId,
      canvasViewStates: projectState.canvasViewStates,
    }
    window.localStorage.setItem(autoProjectStorageKey, JSON.stringify(payload))
  }, [
    autoProjectStorageKey,
    projectState.activeSubmapId,
    projectState.appliedGridConfig,
    projectState.canvasViewStates,
    projectState.userIcons,
    projectState.world,
    projectVersion,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasRestoredSessionRef.current) {
      return
    }

    window.localStorage.setItem(autoConfigStorageKey, serializedConfigPayload)
  }, [
    autoConfigStorageKey,
    serializedConfigPayload,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || hasRestoredSessionRef.current) {
      return
    }

    restoreStoredSession({
      autoProjectStorageKey,
      autoConfigStorageKey,
      applyProjectSnapshot: (parsed) => {
        applyProjectSnapshotToState(parsed, projectSnapshotActions)
      },
      applyConfigSnapshot: (parsed) => {
        applyConfigSnapshotToState(parsed, fullConfigSnapshotActions)
      },
    })

    hasRestoredSessionRef.current = true
  }, [
    autoConfigStorageKey,
    autoProjectStorageKey,
    fullConfigSnapshotActions,
    projectSnapshotActions,
  ])

  const handleClearCache = () => {
    if (typeof window === 'undefined') {
      return
    }

    const keysToRemove: string[] = []
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith('hex-map-editor:')) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key)
    })
    window.location.reload()
  }

  const handleSaveProject = () => {
    const dateLabel = new Date().toISOString().slice(0, 10)
    const exportLabel = (
      projectState.world.metadata.name.trim() ||
      projectState.world.metadata.title.trim() ||
      'World'
    ).replace(/[\\/:*?"<>|]+/g, '-')
    const payload: SavedProjectFile = {
      kind: 'hex-map-project',
      version: projectVersion,
      grid: projectState.appliedGridConfig,
      world: projectState.world,
      userIcons: getProjectExportUserIcons(
        projectState.userIcons,
        projectState.embedIconsInProjectFile,
      ),
      activeSubmapId: projectState.activeSubmapId,
      canvasViewStates: projectState.canvasViewStates,
    }
    downloadJsonFile(`S.A. - ${exportLabel} - ${dateLabel}.json`, payload)
  }

  const handleSaveConfig = () => {
    const payload: SavedConfigFile = {
      kind: 'hex-map-config',
      version: projectVersion,
      editorMode,
      politicalSubMode,
      countryToolMode,
      provinceToolMode,
      politicalPaintMode,
      restrictProvinceBrushToOwnerCountry,
      cityToolMode,
      brushRadius,
      terrainDisplayMode,
      terrainPaintMode,
      terrainBrushKind,
      terrainBrushElevation,
      cityStatesFillTerritory,
      countryFillOpacity,
      countryBorderColor,
      countryBorderWidth,
      countryBorderOpacity,
      countrySharedBorderOverridesOwn,
      countrySharedBorderMode,
      provinceFillOpacity,
      provinceBorderColor,
      provinceBorderWidth,
      provinceBorderOpacity,
      provinceBorderOverridesCountryBorder,
      terrainLandFillColor,
      terrainWaterFillColor,
      terrainLandAnchors,
      terrainWaterAnchors,
      terrainSnowLineElevation,
      terrainSnowColor,
      showSnowOverride,
      terrainEmptyFillColor,
      terrainLandUnknownFillColor,
      terrainWaterUnknownFillColor,
      terrainWaterDarkFillColor,
      landEdgeColor,
      landEdgeWidth,
      landEmptyEdgeColor,
      landEmptyEdgeWidth,
      coastEdgeColor,
      coastEdgeWidth,
      waterEdgeColor,
      waterEdgeWidth,
      waterEmptyEdgeColor,
      waterEmptyEdgeWidth,
      darkWaterEdgeColor,
      darkWaterEdgeWidth,
      snowEdgeColor,
      snowEdgeWidth,
      snowBoundaryEdgeColor,
      snowBoundaryEdgeWidth,
      showEmptySurface,
      showLandEmptyEdges,
      showWaterEmptyEdges,
      colorWaterInCountryLayer,
      ...configState,
    }
    downloadJsonFile('hex-map-config.json', payload)
  }

  const handleLoadProjectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const parsed = JSON.parse(await file.text()) as Partial<SavedProjectFile>
      applyProjectSnapshotToState(parsed, projectSnapshotActions)
    } catch {
      // Ignore invalid project files for now.
    }
  }

  const handleLoadConfigFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const parsed = JSON.parse(await file.text()) as Partial<SavedConfigFile>
      applyConfigSnapshotToState(parsed, fullConfigSnapshotActions)
    } catch {
      // Ignore invalid config files for now.
    }
  }

  return {
    handleClearCache,
    handleSaveProject,
    handleSaveConfig,
    handleLoadProjectFile,
    handleLoadConfigFile,
  }
}
