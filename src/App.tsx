import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'
import './App.css'
import {
  createCellMap,
  createCoordinateCellMap,
  type HexCell,
} from './domain/grid'
import {
  clampSurfaceElevation,
  createSurfaceState,
  createInitialWorld,
  normalizeWorldDocument,
  getProvinceCities,
  nudgeLabelAnchor,
  upsertLabelGroup,
  upsertSubmap,
} from './domain/world'
import type {
  LabelGroup,
  Submap,
  WorldDocument,
} from './domain/world'
import { UiMessagesContext, messages } from './i18n'
import {
  languageOptions,
  multilingualMessageOverrides,
} from './i18n_multilingual_latest'
import { EditorChrome } from './components/EditorChrome'
import { APP_FLOATING_PORTAL_ROOT_ID } from './components/floatingPortalRoot'
import {
  SidebarDeleteConfirmation,
} from './components/SidebarDeleteConfirmation'
import { SubmapEditorForm } from './components/SubmapEditorForm'
import { SubmapFloatingConfirm } from './components/SubmapFloatingConfirm'
import {
  getSurfaceSummary,
} from './components/surface/terrainBrush'
import { getCityLevelName } from './political/display'
import type {
  CityLevelSortKey,
  CitySortKey,
  CityToolMode,
  CityToolSectionId,
  CountrySortKey,
  ProvinceSortKey,
} from './political/types'
import { getThemeById, getThemeCssVars } from './theme'
import {
  createIconSourceMap,
  mergeIconRegistry,
  type UserIconDefinition,
} from './features/icons/iconRegistry'
import { useCountryDraft } from './features/political/editors/useCountryDraft'
import { useProvinceDraft } from './features/political/editors/useProvinceDraft'
import { useCityDraft } from './features/political/editors/useCityDraft'
import { useCityLevelDraft } from './features/political/editors/useCityLevelDraft'
import { useGovernmentTypeDraft } from './features/political/editors/useGovernmentTypeDraft'
import { useSubmapDraft } from './features/submaps/useSubmapDraft'
import { useSidebarSections } from './features/workspace/useSidebarSections'
import {
  useTableConfig,
  type CityColumnId,
  type CountryColumnId,
  type ProvinceColumnId,
  type LabelGroupCompactColumnId,
} from './features/workspace/useTableConfig'
import { useTerrainStyle } from './features/surface/useTerrainStyle'
import { usePoliticalStyle } from './features/political/usePoliticalStyle'
import { useSortFilterState } from './features/political/useSortFilterState'
import { useMoveMode } from './features/move/useMoveMode'
import { useAltShortcutState } from './features/shortcuts/useAltShortcutState'
import { useLabelDraft } from './features/labels/useLabelDraft'
import { useTerrainBrush } from './features/surface/useTerrainBrush'
import { useUiPreferences } from './features/workspace/useUiPreferences'
import { useLocalFontLookup } from './features/workspace/useLocalFontLookup'
import { useLayoutState, MIN_RIGHT_SIDEBAR_WIDTH, type ObjectEditorPresentation } from './features/workspace/useLayoutState'
import {
  cloneUserIcons,
  cloneWorldDocument,
  getProjectExportUserIcons,
  normalizeUserIconDefinitions,
  replaceIconReferences,
  restoreSelectedIconReferences,
} from './features/icons/iconSessionHelpers'
import {
  getPaintActionLabel,
} from './features/surface/paintHistory'
import {
  clamp,
  moveLayer,
  normalizeSidebarNameScale,
  sanitizeGridValue,
} from './utils/appUtilities'
import {
  migrateLoadedLayers,
  relabelLayers,
  type LayerControl,
  type LayerId,
} from './features/world/layerControls'
import {
  describeAssignedLabelGroup as describeAssignedLabelGroupText,
  describeLabelAnchor,
  getAssignedLabelDrafts,
  reorderLabelGroupsState,
} from './features/labels/labelHelpers'
import {
  applyCountryDraftDerivedColorsState,
  beginCreateCountryState,
  beginCreateProvinceState,
  getCountryProvinceDefaultColorValue,
  pickNextColor,
} from './features/political/creationHelpers'
import { mergeMessages } from './utils/messageHelpers'
import {
  getMoveAnchorCell,
  getMoveTargetEntries,
} from './features/move/moveHelpers'
import {
  applyMoveOperationState,
  getCellInteractionPreviewState,
  handleCellInteractState,
  handleCellsInteractBatchState,
  handleMoveSelectionCompleteState,
  handleSubmapSelectionCompleteState,
} from './features/move/interactionHelpers'
import {
  buildWorldNumberDrafts,
  getAlignedMoveLabelGroups,
  getSyncedWorldNumberDrafts,
  prependRecentSelectionId,
  pruneCanvasViewStates,
  pruneRecentSelectionIds,
} from './features/editor/stateSyncHelpers'
import { useAppDerivedState } from './features/editor/useAppDerivedState'
import { useEditorSaveHandlers } from './features/editor/useEditorSaveHandlers'
import {
  hasCityLevelUsage,
} from './features/political/editorCommandHelpers'
import {
  adjustTerrainBrushElevationState,
  applyModeShortcutKeyState,
  cyclePendingModeShortcutState,
  cycleTerrainBrushKindState,
  cycleTerrainPaintModeState,
  cycleZSupportedShortcutState,
  getCurrentModeShortcutKeyValue,
} from './features/shortcuts/shortcutRuleHelpers'
import { buildShortcutHintSections } from './features/shortcuts/shortcutHints'
import { useAltShortcutInteractions } from './features/shortcuts/useAltShortcutInteractions'
import { useAltRadialActions } from './features/shortcuts/useAltRadialActions'
import {
  getAltRadialPreviewItems,
  useAltRadialItems,
} from './features/shortcuts/useAltRadialItems'
import { useAltRadialLayout } from './features/shortcuts/useAltRadialLayout'
import { useInspectorSectionShortcuts } from './features/shortcuts/useInspectorSectionShortcuts'
import { useObjectEditorController } from './features/workspace/useObjectEditorController'
import { usePaintController } from './features/surface/usePaintController'
import { useWorkspaceChromeController } from './features/workspace/useWorkspaceChromeController'
import {
  useIconManagerController,
} from './features/icons/useIconManagerController'
import {
  useLabelDialogController,
} from './features/labels/useLabelDialogController'
import { useLabelManagementController } from './features/labels/useLabelManagementController'
import { usePoliticalWorkspaceController } from './features/political/usePoliticalWorkspaceController'
import { useSessionPersistence } from './features/session/useSessionPersistence'
import { ObjectEditorLayer } from './app/ObjectEditorLayer'
import { FloatingPanels } from './app/FloatingPanels'
import { LeftSidebar } from './app/LeftSidebar'
import { MainWorkspace } from './app/MainWorkspace'
import {
  openCityLevelEditor,
  useCityEditorLifecycleController,
} from './features/political/editors/cityEditorLifecycle'
import { deriveCountryPaletteFromFill } from './features/political/countryPalette'
import { useCityEditorCommands } from './features/political/editors/useCityEditorCommands'
import {
  openCityEditor,
  openCountryEditor,
  openGovernmentTypeEditor,
} from './features/political/editors/objectEditorOpeners'
import { useCanvasDoubleActivateController } from './features/workspace/useCanvasDoubleActivateController'
import { useEditorMode } from './features/workspace/useEditorMode'
import { useGridConfig, DEFAULT_GRID } from './features/workspace/useGridConfig'
import { useActiveEntities } from './features/workspace/useActiveEntities'
import { useRenderFlags } from './features/workspace/useRenderFlags'
import { useSidebarInteraction } from './features/workspace/useSidebarInteraction'
import { WorldContext, type WorldContextValue } from './state/WorldContext'
import { EditorModeContext, type EditorModeContextValue } from './state/EditorModeContext'
import { TerrainBrushContext, type TerrainBrushContextValue } from './state/TerrainBrushContext'
import { TerrainStyleContext, type TerrainStyleContextValue } from './state/TerrainStyleContext'
import { RenderFlagsContext, type RenderFlagsContextValue } from './state/RenderFlagsContext'
import { PoliticalStyleContext, type PoliticalStyleContextValue } from './state/PoliticalStyleContext'
import { ActiveEntityContext, type ActiveEntityContextValue } from './state/ActiveEntityContext'
import {
  activateFullSubmapViewState,
  beginCreateSubmapSelectionState,
  cycleWorldLabelGroupTargetState,
  cycleWorldLayerTargetState,
  cycleWorldSubmapTargetState,
  toggleLabelGroupVisibilityByIdState,
  toggleLayerVisibilityByIdState,
  toggleWorldLabelGroupShortcutTargetState,
  toggleWorldLayerShortcutTargetState,
} from './features/world/worldShortcutHelpers'
import {
  closeObjectEditorsState,
  closeTransientUiState,
} from './features/workspace/transientUiHelpers'
import {
  cyclePoliticalPaintModeState,
  cyclePoliticalToolState,
  cyclePoliticalCountryTargetState,
  cyclePoliticalProvinceTargetState,
  getNextExpandedCityToolSections,
  handleCityLevelSortChangeState,
  handleCitySortChangeState,
  handleCountrySortChangeState,
  handleProvinceSortChangeState,
  handleSetCityToolModeState,
  resetCityLevelSectionState,
  resetCityManagementSectionState,
  resetCountrySectionState,
} from './features/political/sectionHelpers'
import {
  applySubmapDraftToSubmap,
  buildSidebarDeleteConfirmation,
  deleteSubmapState,
  discardSubmapDraftState,
  startEditingSubmapState,
} from './features/submaps/submapDraftHelpers'
import { RightInspector } from './app/RightInspector'

const LABEL_INTERACTION_CONFIG = {
  confirmAssignedLabelDelete: true,
} as const

const PAINT_HISTORY_LIMIT = 30
const DEFAULT_WESTERN_SIDEBAR_NAME_SCALE = 1
const DEFAULT_CHINESE_SIDEBAR_NAME_SCALE = 0.82

const POLITICAL_SUB_MODE_IDS = ['country', 'province', 'city'] as const

const PROJECT_FILE_VERSION = 1
const AUTO_PROJECT_STORAGE_KEY = 'hex-map-editor:auto-project'
const AUTO_CONFIG_STORAGE_KEY = 'hex-map-editor:auto-config'

function App() {
  const {
    activeUiLanguage, setActiveUiLanguage,
    activeThemeId, setActiveThemeId,
    fontFamilyOverride, setFontFamilyOverride,
    westernSidebarNameScale, setWesternSidebarNameScale,
    chineseSidebarNameScale, setChineseSidebarNameScale,
    uiIconInvert, setUiIconInvert,
    localFontLookupStatus, setLocalFontLookupStatus,
    localFontLookupEntries, setLocalFontLookupEntries,
    localFontLookupError, setLocalFontLookupError,
    localFontLookupFilter, setLocalFontLookupFilter,
    localFontCopyError, setLocalFontCopyError,
    recentlyCopiedFontFamily, setRecentlyCopiedFontFamily,
    previewCellsPerFrame, setPreviewCellsPerFrame,
    embedIconsInProjectFile, setEmbedIconsInProjectFile,
  } = useUiPreferences()
  const ui = useMemo(
    () => mergeMessages(messages.en, multilingualMessageOverrides[activeUiLanguage]),
    [activeUiLanguage],
  )
  const activeTheme = getThemeById(activeThemeId)
  const activeThemeVars = useMemo<CSSProperties>(() => {
    const baseVars = getThemeCssVars(activeTheme)
    const trimmedOverride = fontFamilyOverride.trim()
    if (!trimmedOverride) {
      return baseVars
    }
    return {
      ...baseVars,
      '--theme-font-family-base': `${trimmedOverride}, ${activeTheme.typography.fontFamilyBase}`,
      '--theme-font-family-display': `${trimmedOverride}, ${activeTheme.typography.fontFamilyDisplay}`,
    }
  }, [activeTheme, fontFamilyOverride])
  const activeSidebarNameScale =
    activeUiLanguage === 'zh-CN' ? chineseSidebarNameScale : westernSidebarNameScale
  const sideTableNameColumnVars = useMemo(() => {
    const normalizedScale = normalizeSidebarNameScale(activeSidebarNameScale, 1)
    return {
      '--side-table-name-col-min': `${Math.round(156 * normalizedScale)}px`,
      '--side-table-name-col-country-fr': `${(1.16 * normalizedScale).toFixed(3)}fr`,
      '--side-table-name-col-province-fr': `${(1.16 * normalizedScale).toFixed(3)}fr`,
      '--side-table-name-col-city-fr': `${(1.18 * normalizedScale).toFixed(3)}fr`,
      '--side-table-label-group-name-col-fr': `${(1.08 * normalizedScale).toFixed(3)}fr`,
      '--side-table-label-name-col-fr': `${(1 * normalizedScale).toFixed(3)}fr`,
    } as CSSProperties
  }, [activeSidebarNameScale])
  const {
    localFontLookupStatusText,
    filteredLocalFontLookupEntries,
    handleQueryLocalFonts,
    handleRescanLocalFonts,
    handleCopyFontFamily,
  } = useLocalFontLookup({
    localFontLookupStatus, setLocalFontLookupStatus,
    localFontLookupEntries, setLocalFontLookupEntries,
    localFontLookupError, setLocalFontLookupError,
    localFontLookupFilter, setLocalFontLookupFilter,
    localFontCopyError, setLocalFontCopyError,
    recentlyCopiedFontFamily, setRecentlyCopiedFontFamily,
    ui,
  })
  const politicalSubModes = POLITICAL_SUB_MODE_IDS.map((subMode) => ({
    id: subMode,
    label: ui.politicalSubMode[subMode],
  }))
  const {
    editorMode, setEditorMode,
    politicalSubMode, setPoliticalSubMode,
    countryToolMode, setCountryToolMode,
    provinceToolMode, setProvinceToolMode,
    politicalPaintMode, setPoliticalPaintMode,
    restrictProvinceBrushToOwnerCountry, setRestrictProvinceBrushToOwnerCountry,
    cityToolMode, setCityToolMode,
  } = useEditorMode()
  const {
    draftGridConfig, setDraftGridConfig,
    draftGridColsInput, setDraftGridColsInput,
    draftGridRowsInput, setDraftGridRowsInput,
    draftGridHexSizeInput, setDraftGridHexSizeInput,
    worldNumberDrafts, setWorldNumberDrafts,
    lastSyncedWorldNumberDraftsRef,
    appliedGridConfig, setAppliedGridConfig,
  } = useGridConfig()
  const {
    hoveredCellId, setHoveredCellId,
    activeSubmapId, setActiveSubmapId,
    submapRecentSelectionIds, setSubmapRecentSelectionIds,
    isSubmapSelectionMode, setIsSubmapSelectionMode,
    labelGroupFilter, setLabelGroupFilter,
    activeCountryId, setActiveCountryId,
    countryRecentSelectionIds, setCountryRecentSelectionIds,
    activeProvinceId, setActiveProvinceId,
    provinceRecentSelectionIds, setProvinceRecentSelectionIds,
    activeCityId, setActiveCityId,
    activeLabelId, setActiveLabelId,
    activeManagedLabelGroupId, setActiveManagedLabelGroupId,
    activeCityLevelId, setActiveCityLevelId,
    cityBrushLevelId, setCityBrushLevelId,
    activeGovernmentTypeId, setActiveGovernmentTypeId,
  } = useActiveEntities()
  const {
    showEmptySurface, setShowEmptySurface,
    showLandEmptyEdges, setShowLandEmptyEdges,
    showWaterEmptyEdges, setShowWaterEmptyEdges,
    colorWaterInCountryLayer, setColorWaterInCountryLayer,
  } = useRenderFlags()
  const {
    iconManagerSearch, setIconManagerSearch,
    iconManagerTagFilter, setIconManagerTagFilter,
    iconManagerSortMode, setIconManagerSortMode,
    selectedIconManagerKey, setSelectedIconManagerKey,
    brandDockRef,
    brandDockPopoverRef,
    brandDockCloseTimerRef,
    brandDockPopoverRect, setBrandDockPopoverRect,
    pendingSubmapDeleteId, setPendingSubmapDeleteId,
    draggedSidebarLayerId, setDraggedSidebarLayerId,
    sidebarLayerDropTargetId, setSidebarLayerDropTargetId,
    draggedSidebarLabelGroupId, setDraggedSidebarLabelGroupId,
    sidebarLabelGroupDropTargetId, setSidebarLabelGroupDropTargetId,
    worldLayerShortcutTargetId, setWorldLayerShortcutTargetId,
    worldLabelGroupShortcutTargetId, setWorldLabelGroupShortcutTargetId,
    uniqueLevelConflict, setUniqueLevelConflict,
    pendingAssignedLabelRemoval, setPendingAssignedLabelRemoval,
    pendingSidebarDeleteConfirmation, setPendingSidebarDeleteConfirmation,
    skipAssignedLabelRemovalConfirm, setSkipAssignedLabelRemovalConfirm,
    iconManagerSessionSnapshotRef,
    iconManagerOriginKeyByCurrentRef,
    politicalWorkspaceCacheRef,
  } = useSidebarInteraction()
  const [world, setWorld] = useState<WorldDocument>(() => createInitialWorld(DEFAULT_GRID))
  const [userIcons, setUserIcons] = useState<UserIconDefinition[]>([])
  const iconRegistryEntries = useMemo(() => mergeIconRegistry(userIcons), [userIcons])
  const iconSourceMap = useMemo(() => createIconSourceMap(iconRegistryEntries), [iconRegistryEntries])
  const defaultIconKey = iconRegistryEntries[0]?.key ?? ''
  const {
    editingSubmapId, setEditingSubmapId,
    editingSubmapSnapshot, setEditingSubmapSnapshot,
    submapDraftName, setSubmapDraftName,
    submapDraftUseWorldTitlePrefix, setSubmapDraftUseWorldTitlePrefix,
    submapDraftUseDefaultStyle, setSubmapDraftUseDefaultStyle,
    submapDraftSubtitle, setSubmapDraftSubtitle,
    submapDraftPageMarginTop, setSubmapDraftPageMarginTop,
    submapDraftFrameTop, setSubmapDraftFrameTop,
    submapDraftFrameRight, setSubmapDraftFrameRight,
    submapDraftFrameBottom, setSubmapDraftFrameBottom,
    submapDraftFrameLeft, setSubmapDraftFrameLeft,
    submapDraftFrameColor, setSubmapDraftFrameColor,
    submapDraftTitleFontSize, setSubmapDraftTitleFontSize,
    submapDraftSubtitleFontSize, setSubmapDraftSubtitleFontSize,
    submapDraftBylineFontSize, setSubmapDraftBylineFontSize,
    submapDraftTitleGap, setSubmapDraftTitleGap,
    submapDraftByGap, setSubmapDraftByGap,
  } = useSubmapDraft()
  const {
    objectEditorPresentation, setObjectEditorPresentation,
    objectEditorSidecarAnchor, setObjectEditorSidecarAnchor,
    labelAnchorDisplayMode, setLabelAnchorDisplayMode,
    labelDoubleOpenMode, setLabelDoubleOpenMode,
    cityDoubleOpenMode, setCityDoubleOpenMode,
    countryDoubleOpenMode, setCountryDoubleOpenMode,
    provinceDoubleOpenMode, setProvinceDoubleOpenMode,
    leftSidebarWidth, setLeftSidebarWidth,
    rightSidebarWidth, setRightSidebarWidth,
    canvasViewStates, setCanvasViewStates,
    expandedTableId, setExpandedTableId,
    expandedCountriesSearch, setExpandedCountriesSearch,
    expandedProvincesSearch, setExpandedProvincesSearch,
    expandedCitiesSearch, setExpandedCitiesSearch,
    expandedLabelGroupsSearch, setExpandedLabelGroupsSearch,
    expandedLabelsSearch, setExpandedLabelsSearch,
    floatingTableWidth, setFloatingTableWidth,
    iconManagerWidth, setIconManagerWidth,
    iconManagerHeightOffset, setIconManagerHeightOffset,
    activeSidebarResize, setActiveSidebarResize,
    submapEditorCardOffsetTop, setSubmapEditorCardOffsetTop,
    submapEditorLeft, setSubmapEditorLeft,
    submapConfirmPosition, setSubmapConfirmPosition,
    sidebarRef,
    submapRowRefs,
    projectFileInputRef,
    configFileInputRef,
    iconFileInputRef,
    suppressSidebarRowClickRef,
    FLOATING_TABLE_WIDTH_STORAGE_KEY,
    ICON_MANAGER_WIDTH_STORAGE_KEY,
    ICON_MANAGER_HEIGHT_OFFSET_STORAGE_KEY,
  } = useLayoutState()
  const {
    isCountryEditorOpen, setIsCountryEditorOpen,
    editingCountryId, setEditingCountryId,
    countryDraftName, setCountryDraftName,
    countryDraftSecondName, setCountryDraftSecondName,
    countryDraftIconKey, setCountryDraftIconKey,
    countryDraftColor, setCountryDraftColor,
    countryDraftBorderColor, setCountryDraftBorderColor,
    countryDraftProvinceDefaultColor, setCountryDraftProvinceDefaultColor,
    countryDraftProvinceBorderColor, setCountryDraftProvinceBorderColor,
    countryDraftGovernmentTypeId, setCountryDraftGovernmentTypeId,
    countryDraftIsCityState, setCountryDraftIsCityState,
    countryDraftDescription, setCountryDraftDescription,
    countryAssignedLabelDrafts, setCountryAssignedLabelDrafts,
    countryPreviewColor, setCountryPreviewColor,
    countryPreviewBorderColor, setCountryPreviewBorderColor,
    countryPreviewProvinceBorderColor, setCountryPreviewProvinceBorderColor,
    defaultCountryDraftPalette,
  } = useCountryDraft()
  const {
    isProvinceEditorOpen, setIsProvinceEditorOpen,
    editingProvinceId, setEditingProvinceId,
    provinceDraftName, setProvinceDraftName,
    provinceDraftColor, setProvinceDraftColor,
    provincePreviewColor, setProvincePreviewColor,
    provinceDraftCountryId, setProvinceDraftCountryId,
    provinceDraftCapitalCityId, setProvinceDraftCapitalCityId,
    provinceDraftDescription, setProvinceDraftDescription,
    provinceAssignedLabelDrafts, setProvinceAssignedLabelDrafts,
  } = useProvinceDraft()
  const {
    isCityEditorOpen, setIsCityEditorOpen,
    editingCityId, setEditingCityId,
    pendingCityCellId, setPendingCityCellId,
    cityDraftName, setCityDraftName,
    cityDraftSecondName, setCityDraftSecondName,
    cityDraftCountryId, setCityDraftCountryId,
    cityDraftLevelId, setCityDraftLevelId,
    cityDraftDescription, setCityDraftDescription,
    cityAssignedLabelDrafts, setCityAssignedLabelDrafts,
  } = useCityDraft()
  const {
    isLabelEditorOpen, setIsLabelEditorOpen,
    editingLabelId, setEditingLabelId,
    editingAssignedLabelCountryFilter, setEditingAssignedLabelCountryFilter,
    isLabelGroupEditorOpen, setIsLabelGroupEditorOpen,
    editingLabelGroupId, setEditingLabelGroupId,
    labelEditorOpenSnapshotRef,
    labelGroupEditorOpenSnapshotRef,
  } = useLabelDraft()
  const {
    isCityLevelEditorOpen, setIsCityLevelEditorOpen,
    editingCityLevelId, setEditingCityLevelId,
    cityLevelDraftName, setCityLevelDraftName,
    cityLevelDraftRank, setCityLevelDraftRank,
    cityLevelDraftIconKey, setCityLevelDraftIconKey,
    cityLevelDraftIconScalePercent, setCityLevelDraftIconScalePercent,
    cityLevelDraftUniquePerCountry, setCityLevelDraftUniquePerCountry,
    cityLevelDraftDisplayInCountryInfo, setCityLevelDraftDisplayInCountryInfo,
  } = useCityLevelDraft()
  const {
    cityStatesFillTerritory, setCityStatesFillTerritory,
    countryFillOpacity, setCountryFillOpacity,
    countryBorderColor, setCountryBorderColor,
    countryBorderWidth, setCountryBorderWidth,
    countryBorderOpacity, setCountryBorderOpacity,
    countrySharedBorderOverridesOwn, setCountrySharedBorderOverridesOwn,
    countrySharedBorderMode, setCountrySharedBorderMode,
    provinceFillOpacity, setProvinceFillOpacity,
    provinceBorderColor, setProvinceBorderColor,
    provinceBorderWidth, setProvinceBorderWidth,
    provinceBorderOpacity, setProvinceBorderOpacity,
    provinceBorderOverridesCountryBorder, setProvinceBorderOverridesCountryBorder,
  } = usePoliticalStyle()
  const {
    terrainLandFillColor, setTerrainLandFillColor,
    terrainWaterFillColor, setTerrainWaterFillColor,
    terrainLandAnchors, setTerrainLandAnchors,
    terrainWaterAnchors, setTerrainWaterAnchors,
    terrainSnowLineElevation, setTerrainSnowLineElevation,
    terrainSnowColor, setTerrainSnowColor,
    showSnowOverride, setShowSnowOverride,
    terrainEmptyFillColor, setTerrainEmptyFillColor,
    terrainLandUnknownFillColor, setTerrainLandUnknownFillColor,
    terrainWaterUnknownFillColor, setTerrainWaterUnknownFillColor,
    terrainWaterDarkFillColor, setTerrainWaterDarkFillColor,
    landEdgeColor, setLandEdgeColor,
    landEdgeWidth, setLandEdgeWidth,
    landEmptyEdgeColor, setLandEmptyEdgeColor,
    landEmptyEdgeWidth, setLandEmptyEdgeWidth,
    coastEdgeColor, setCoastEdgeColor,
    coastEdgeWidth, setCoastEdgeWidth,
    waterEdgeColor, setWaterEdgeColor,
    waterEdgeWidth, setWaterEdgeWidth,
    waterEmptyEdgeColor, setWaterEmptyEdgeColor,
    waterEmptyEdgeWidth, setWaterEmptyEdgeWidth,
    darkWaterEdgeColor, setDarkWaterEdgeColor,
    darkWaterEdgeWidth, setDarkWaterEdgeWidth,
    snowEdgeColor, setSnowEdgeColor,
    snowEdgeWidth, setSnowEdgeWidth,
    snowBoundaryEdgeColor, setSnowBoundaryEdgeColor,
    snowBoundaryEdgeWidth, setSnowBoundaryEdgeWidth,
  } = useTerrainStyle()
  const {
    terrainBrushKind, setTerrainBrushKind,
    terrainBrushElevation, setTerrainBrushElevation,
    terrainPaintMode, setTerrainPaintMode,
    terrainDisplayMode, setTerrainDisplayMode,
    brushRadius, setBrushRadius,
  } = useTerrainBrush()
  const {
    movePayload, setMovePayload,
    moveOperation, setMoveOperation,
    isMoveSelectionMode, setIsMoveSelectionMode,
    moveSourceCellIds, setMoveSourceCellIds,
    moveSelectionRestrictToView, setMoveSelectionRestrictToView,
    moveRequireConfirm, setMoveRequireConfirm,
    pendingMoveTargetCellId, setPendingMoveTargetCellId,
    moveVacatedKind, setMoveVacatedKind,
    moveVacatedElevation, setMoveVacatedElevation,
    moveCities, setMoveCities,
    moveLabelGroups, setMoveLabelGroups,
  } = useMoveMode()
  const {
    countryGovernmentTypeFilter, setCountryGovernmentTypeFilter,
    provinceCountryFilter, setProvinceCountryFilter,
    cityCountryFilter, setCityCountryFilter,
    cityProvinceFilter, setCityProvinceFilter,
    cityLevelFilter, setCityLevelFilter,
    countrySortKey, setCountrySortKey,
    countrySortDirection, setCountrySortDirection,
    provinceSortKey, setProvinceSortKey,
    provinceSortDirection, setProvinceSortDirection,
    citySortKey, setCitySortKey,
    citySortDirection, setCitySortDirection,
    cityTypeSortMode, setCityTypeSortMode,
    cityLevelSortKey, setCityLevelSortKey,
    cityLevelSortDirection, setCityLevelSortDirection,
  } = useSortFilterState()
  const {
    isCountrySectionExpanded, setIsCountrySectionExpanded,
    isCountryListExpanded, setIsCountryListExpanded,
    isCountryInfoExpanded, setIsCountryInfoExpanded,
    isGovernmentTypesSectionExpanded, setIsGovernmentTypesSectionExpanded,
    isCountryStyleSectionExpanded, setIsCountryStyleSectionExpanded,
    isCityStyleSectionExpanded, setIsCityStyleSectionExpanded,
    isGovernmentTypeListExpanded, setIsGovernmentTypeListExpanded,
    isGovernmentTypeInfoExpanded, setIsGovernmentTypeInfoExpanded,
    isCityListExpanded, setIsCityListExpanded,
    isCityInfoExpanded, setIsCityInfoExpanded,
    isProvinceListExpanded, setIsProvinceListExpanded,
    isProvinceInfoExpanded, setIsProvinceInfoExpanded,
    isCityLevelListExpanded, setIsCityLevelListExpanded,
    isCityLevelInfoExpanded, setIsCityLevelInfoExpanded,
    isDebugSectionExpanded, setIsDebugSectionExpanded,
    isWorldInfoExpanded, setIsWorldInfoExpanded,
    isWorldStyleExpanded, setIsWorldStyleExpanded,
    isWorldGridExpanded, setIsWorldGridExpanded,
    isTerrainDisplayExpanded, setIsTerrainDisplayExpanded,
    isTerrainPaintExpanded, setIsTerrainPaintExpanded,
    isTerrainBaseStyleExpanded, setIsTerrainBaseStyleExpanded,
    isTerrainTopographyExpanded, setIsTerrainTopographyExpanded,
    isModeDockOpen, setIsModeDockOpen,
    isBrandDockOpen, setIsBrandDockOpen,
    isProjectDockOpen, setIsProjectDockOpen,
    isConfigDockOpen, setIsConfigDockOpen,
    isSidebarSubmapsExpanded, setIsSidebarSubmapsExpanded,
    isSidebarLayersExpanded, setIsSidebarLayersExpanded,
    isSidebarLabelsExpanded, setIsSidebarLabelsExpanded,
    isLabelGroupsSectionExpanded, setIsLabelGroupsSectionExpanded,
    isLabelGroupsListExpanded, setIsLabelGroupsListExpanded,
    isLabelGroupInfoExpanded, setIsLabelGroupInfoExpanded,
    isLabelsSectionExpanded, setIsLabelsSectionExpanded,
    isLabelsListExpanded, setIsLabelsListExpanded,
    isLabelInfoExpanded, setIsLabelInfoExpanded,
    expandedCityToolSections, setExpandedCityToolSections,
  } = useSidebarSections()
  const {
    isAltShortcutOverlayOpen, setIsAltShortcutOverlayOpen,
    altShortcutScope, setAltShortcutScope,
    altPendingModeKey, setAltPendingModeKey,
    altPendingSectionKey, setAltPendingSectionKey,
    altRadialMenu, setAltRadialMenu,
    isAltRadialSuppressed, setIsAltRadialSuppressed,
    isAltRadialMenuEnabled, setIsAltRadialMenuEnabled,
    lastPointerViewportPositionRef,
    altRadialOriginPosition, setAltRadialOriginPosition,
    suppressAltUntilReleaseRef,
  } = useAltShortcutState()
  const {
    isGovernmentTypeEditorOpen, setIsGovernmentTypeEditorOpen,
    editingGovernmentTypeId, setEditingGovernmentTypeId,
    governmentTypeDraftName, setGovernmentTypeDraftName,
    governmentTypeDraftColor, setGovernmentTypeDraftColor,
    governmentTypePreviewColor, setGovernmentTypePreviewColor,
  } = useGovernmentTypeDraft()
  const {
    cityColumnOrder, setCityColumnOrder,
    cityCompactColumns, setCityCompactColumns,
    countryColumnOrder, setCountryColumnOrder,
    countryCompactColumns, setCountryCompactColumns,
    provinceColumnOrder, setProvinceColumnOrder,
    provinceCompactColumns, setProvinceCompactColumns,
    labelGroupColumnOrder, setLabelGroupColumnOrder,
    labelGroupCompactColumns, setLabelGroupCompactColumns,
    CITY_COLUMN_ORDER_STORAGE_KEY,
    CITY_COMPACT_COLUMNS_STORAGE_KEY,
    COUNTRY_COLUMN_ORDER_STORAGE_KEY,
    COUNTRY_COMPACT_COLUMNS_STORAGE_KEY,
    PROVINCE_COLUMN_ORDER_STORAGE_KEY,
    PROVINCE_COMPACT_COLUMNS_STORAGE_KEY,
    LABEL_GROUP_COLUMN_ORDER_STORAGE_KEY,
    LABEL_GROUP_COMPACT_COLUMNS_STORAGE_KEY,
  } = useTableConfig()
  const [layers, setLayers] = useState<LayerControl[]>([
    { id: 'terrainFill', label: ui.layers.terrainFill, visible: true, meta: '' },
    { id: 'terrainEdge', label: ui.layers.terrainEdge, visible: true, meta: '' },
    { id: 'countryFill', label: ui.layers.countryFill, visible: true, meta: '' },
    { id: 'countryBorder', label: ui.layers.countryBorder, visible: true, meta: '' },
    { id: 'provinceFill', label: ui.layers.provinceFill, visible: true, meta: '' },
    { id: 'provinceBorder', label: ui.layers.provinceBorder, visible: true, meta: '' },
    { id: 'cities', label: ui.layers.cities, visible: true, meta: '' },
    { id: 'labels', label: ui.layers.labels, visible: true, meta: '' },
    { id: 'overlay', label: ui.layers.overlay, visible: true, meta: '' },
  ])

  const baseSetup = useMemo(
    () => ({
      grid: appliedGridConfig,
      world,
      canvasKey: `${appliedGridConfig.cols}-${appliedGridConfig.rows}-${appliedGridConfig.hexSize}`,
    }),
    [appliedGridConfig, world],
  )
  const derived = useAppDerivedState({
    world,
    ui,
    iconRegistryEntries,
    iconSourceMap,
    terrainBrushKind,
    terrainBrushElevation,
    terrainDisplayMode,
    terrainLandFillColor,
    terrainLandAnchors,
    terrainWaterFillColor,
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
    editorMode,
    showEmptySurface,
    showLandEmptyEdges,
    showWaterEmptyEdges,
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
    editingGovernmentTypeId,
    governmentTypePreviewColor,
    editingCountryId,
    countryPreviewColor,
    countryPreviewBorderColor,
    countryPreviewProvinceBorderColor,
    editingProvinceId,
    provincePreviewColor,
    activeCountryId,
    activeProvinceId,
    activeCityId,
    activeSubmapId,
    activeCityLevelId,
    activeGovernmentTypeId,
    activeLabelId,
    activeManagedLabelGroupId,
    countrySortDirection,
    provinceSortKey,
    provinceSortDirection,
    citySortKey,
    citySortDirection,
    cityTypeSortMode,
    cityLevelSortKey,
    cityLevelSortDirection,
    countryGovernmentTypeFilter,
    provinceCountryFilter,
    cityCountryFilter,
    cityProvinceFilter,
    cityLevelFilter,
    labelGroupFilter,
    iconManagerSearch,
    iconManagerTagFilter,
    iconManagerSortMode,
    canvasViewStates,
    worldCellCount: world.cells.length,
  })
  const {
    surfaceBrush,
    politicalCanvasStyle,
    terrainCanvasStyle,
    displayGovernmentTypesById,
    displayCountriesById,
    displayProvincesById,
    countries,
    provinces,
    governmentTypes,
    submaps,
    cities,
    cityLevels,
    iconUsageCountByKey,
    displayLabelGroupsById,
    labelGroups,
    iconManagerTags,
    filteredIconManagerEntries,
    sortedCountries,
    sortedProvinces,
    cityProvinceNameById,
    cityProvinceIdById,
    sortedCities,
    sortedCityLevels,
    filteredCountries,
    filteredCities,
    filteredProvinces,
    activeCountry,
    activeProvince,
    activeCity,
    displayWorldMetadata,
    displayWorldFrame,
    activeCanvasViewKey,
    activeCanvasZoom,
    activeSubmapCellIdSet,
    activeCityLevel,
    activeCityLevelUsageCount,
    activeGovernmentTypeUsageCount,
    activeCountryAssignmentCount,
    countryAssignmentCountById,
    activeProvinceCellCount,
    activeCountryProvinceCount,
    countryProvinceCountById,
    activeProvinceCapital,
    activeCityProvince,
    cityByCellId,
    visibleCellCount,
    activeLabel,
    activeLabelGroup,
    activeManagedLabelGroup,
    activeLabelText,
    filteredLabels,
    splitFilteredLabels,
    expandedLabelRows,
    labelCountByGroupId,
    countryAssignedLabelGroups,
    cityAssignedLabelGroups,
    provinceAssignedLabelGroups,
    paintableCountries,
    canPaintCountries,
    canPaintProvinces,
    defaultPaintCountryId,
    defaultPaintProvinceId,
    effectiveCountryGovernmentTypeFilter,
    effectiveProvinceCountryFilter,
    effectiveCityCountryFilter,
    effectiveCityProvinceFilter,
    effectiveCityLevelFilter,
  } = derived
  const iconManagerBaseHeight = useMemo(() => {
    const totalCount = iconRegistryEntries.length
    if (totalCount <= 8) {
      return 620
    }
    if (totalCount <= 16) {
      return 720
    }
    if (totalCount <= 24) {
      return 800
    }
    if (totalCount <= 32) {
      return 880
    }
    return 940
  }, [iconRegistryEntries.length])
  const iconManagerHeight = useMemo(() => {
    const viewportHeight = typeof window === 'undefined' ? 960 : window.innerHeight
    return Math.min(Math.max(iconManagerBaseHeight + iconManagerHeightOffset, 620), viewportHeight - 48)
  }, [iconManagerBaseHeight, iconManagerHeightOffset])
  useEffect(() => {
    if (filteredIconManagerEntries.length === 0) {
      setSelectedIconManagerKey(null)
      return
    }

    if (!selectedIconManagerKey || !filteredIconManagerEntries.some((entry) => entry.key === selectedIconManagerKey)) {
      setSelectedIconManagerKey(filteredIconManagerEntries[0].key)
    }
  }, [filteredIconManagerEntries, selectedIconManagerKey])
  const effectiveCityBrushLevelId =
    cityBrushLevelId && world.cityLevels[cityBrushLevelId]
      ? cityBrushLevelId
      : null
  const handleSetCityToolMode = useCallback((mode: CityToolMode) => {
    handleSetCityToolModeState({
      activeCityLevelId,
      cityLevels: world.cityLevels,
      mode,
      setActiveCityLevelId,
      setCityBrushLevelId,
      setCityToolMode,
    })
  }, [activeCityLevelId, world.cityLevels])
  const editingSubmap = editingSubmapId ? world.submaps[editingSubmapId] ?? null : null
  const editingProvince = editingProvinceId ? world.provinces[editingProvinceId] ?? null : null
  const editingProvinceCities = useMemo(
    () => (editingProvinceId ? getProvinceCities(world, editingProvinceId) : []),
    [editingProvinceId, world],
  )
  const provinceCapitalCandidates = editingProvinceId ? editingProvinceCities : []
  const cellById = useMemo(() => createCellMap(baseSetup.world.cells), [baseSetup.world.cells])
  const cellsByCoordinates = useMemo(
    () => createCoordinateCellMap(baseSetup.world.cells),
    [baseSetup.world.cells],
  )
  const hoveredCell = useMemo(
    () => (hoveredCellId ? cellById.get(hoveredCellId) ?? null : null),
    [cellById, hoveredCellId],
  )
  const pendingMoveTargetCell = useMemo(
    () => (pendingMoveTargetCellId ? cellById.get(pendingMoveTargetCellId) ?? null : null),
    [cellById, pendingMoveTargetCellId],
  )
  const effectiveMoveTargetCell =
    editorMode === 'move' && moveRequireConfirm && pendingMoveTargetCell ? pendingMoveTargetCell : hoveredCell
  const moveSourceCells = useMemo(
    () => moveSourceCellIds.map((cellId) => cellById.get(cellId)).filter(Boolean) as HexCell[],
    [cellById, moveSourceCellIds],
  )
  const moveSourceAnchorCell = useMemo(
    () => getMoveAnchorCell(moveSourceCells),
    [moveSourceCells],
  )
  const moveSourceCellIdSet = useMemo(() => new Set(moveSourceCellIds), [moveSourceCellIds])
  const hoveredCountryId = hoveredCellId ? world.countryAssignments[hoveredCellId] : null
  const hoveredCountry = hoveredCountryId ? displayCountriesById[hoveredCountryId] ?? null : null
  const hoveredCity = hoveredCellId ? cityByCellId.get(hoveredCellId) ?? null : null
  const layersWithMeta = useMemo(
    () =>
      layers.map((layer) => {
        if (layer.id === 'terrainFill') {
          return {
            ...layer,
            meta: '',
          }
        }

        if (layer.id === 'terrainEdge') {
          return {
            ...layer,
            meta: '',
          }
        }

        if (layer.id === 'countryFill' || layer.id === 'countryBorder') {
          return {
            ...layer,
            meta: `${countries.length}`,
          }
        }

        if (layer.id === 'provinceFill' || layer.id === 'provinceBorder') {
          return {
            ...layer,
            meta: `${provinces.length}`,
          }
        }

        if (layer.id === 'cities') {
          return { ...layer, meta: `${cities.length}` }
        }

        if (layer.id === 'labels') {
          return { ...layer, meta: `${Object.keys(world.labels).length}` }
        }

        return { ...layer, meta: '' }
      }),
    [
      countries.length,
      provinces.length,
      layers,
      cities.length,
      world.labels,
    ],
  )

  useEffect(() => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(activeThemeVars)) {
      root.style.setProperty(key, String(value))
    }
    root.dataset.themeId = activeTheme.id
  }, [activeTheme.id, activeThemeVars])

  useEffect(() => {
    if (activeSubmapId && !world.submaps[activeSubmapId]) {
      setActiveSubmapId(null)
      setEditingSubmapId(null)
      setIsSubmapSelectionMode(false)
    }
  }, [activeSubmapId, world.submaps])

  useLayoutEffect(() => {
    if (!isBrandDockOpen) {
      return
    }

    const updateBrandDockPopoverRect = () => {
      const rect = brandDockRef.current?.getBoundingClientRect()
      if (!rect) {
        setBrandDockPopoverRect(null)
        return
      }

      const viewportPadding = 12
      const maxWidth = Math.min(300, window.innerWidth - viewportPadding * 2)
      const width = Math.min(Math.max(220, rect.width - 18), maxWidth)
      const projectedPopoverWidth = width + (isProjectDockOpen || isConfigDockOpen ? 346 : 0)
      const left = Math.min(
        Math.max(rect.left + 8, viewportPadding),
        Math.max(viewportPadding, window.innerWidth - projectedPopoverWidth - viewportPadding),
      )

      setBrandDockPopoverRect({
        top: rect.bottom - 2,
        left,
        width,
      })
    }

    updateBrandDockPopoverRect()

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateBrandDockPopoverRect()
          })

    if (resizeObserver && brandDockRef.current) {
      resizeObserver.observe(brandDockRef.current)
    }

    window.addEventListener('resize', updateBrandDockPopoverRect)
    window.addEventListener('scroll', updateBrandDockPopoverRect, true)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateBrandDockPopoverRect)
      window.removeEventListener('scroll', updateBrandDockPopoverRect, true)
    }
  }, [isBrandDockOpen, leftSidebarWidth, isProjectDockOpen, isConfigDockOpen])

  useEffect(() => {
    const updateSubmapOverlayPositions = () => {
      if (editingSubmapId) {
        const row = submapRowRefs.current[editingSubmapId]
        if (row) {
          const rect = row.getBoundingClientRect()
          const viewportTop = 24
          setSubmapEditorCardOffsetTop(Math.max(rect.top - viewportTop, 40))
          setSubmapEditorLeft(rect.right + 18)
        } else {
          setSubmapEditorLeft(null)
        }
      } else {
        setSubmapEditorLeft(null)
      }

      if (pendingSubmapDeleteId) {
        const row = submapRowRefs.current[pendingSubmapDeleteId]
        if (row) {
          const rect = row.getBoundingClientRect()
          setSubmapConfirmPosition({
            top: rect.top + rect.height / 2,
            left: rect.right + 8,
          })
        } else {
          setSubmapConfirmPosition(null)
        }
      } else {
        setSubmapConfirmPosition(null)
      }
    }

    updateSubmapOverlayPositions()

    const sidebar = sidebarRef.current
    window.addEventListener('resize', updateSubmapOverlayPositions)
    sidebar?.addEventListener('scroll', updateSubmapOverlayPositions)
    return () => {
      window.removeEventListener('resize', updateSubmapOverlayPositions)
      sidebar?.removeEventListener('scroll', updateSubmapOverlayPositions)
    }
  }, [editingSubmapId, pendingSubmapDeleteId, leftSidebarWidth, submaps])

  useEffect(() => {
    setCanvasViewStates((current) => {
      return pruneCanvasViewStates(current, world.submaps)
    })
  }, [world.submaps])

  useEffect(() => {
    if (hoveredCellId && activeSubmapCellIdSet && !activeSubmapCellIdSet.has(hoveredCellId)) {
      setHoveredCellId(null)
    }
  }, [activeSubmapCellIdSet, hoveredCellId])

  useEffect(() => {
    if (activeLabelId && !world.labels[activeLabelId]) {
      setActiveLabelId(null)
    }
  }, [activeLabelId, world.labels])

  useEffect(() => {
    if (editingLabelId && !world.labels[editingLabelId]) {
      setEditingLabelId(null)
      setIsLabelEditorOpen(false)
      labelEditorOpenSnapshotRef.current = null
    }
  }, [editingLabelId, world.labels])

  useEffect(() => {
    if (editingLabelGroupId && !world.labelGroups[editingLabelGroupId]) {
      setEditingLabelGroupId(null)
      setIsLabelGroupEditorOpen(false)
      labelGroupEditorOpenSnapshotRef.current = null
    }
  }, [editingLabelGroupId, world.labelGroups])

  useEffect(() => {
    const nextSyncedDrafts = buildWorldNumberDrafts({
      axes: world.axes,
      frame: world.frame,
      metadata: world.metadata,
      submapStyle: world.submapStyle,
    })
    const previousSyncedDrafts = lastSyncedWorldNumberDraftsRef.current

    setWorldNumberDrafts((current) => {
      return getSyncedWorldNumberDrafts(
        current,
        previousSyncedDrafts,
        nextSyncedDrafts,
      )
    })

    lastSyncedWorldNumberDraftsRef.current = nextSyncedDrafts
  }, [
    world.axes,
    world.frame,
    world.metadata,
    world.submapStyle,
  ])

  useEffect(() => {
    if (activeManagedLabelGroupId && !world.labelGroups[activeManagedLabelGroupId]) {
      setActiveManagedLabelGroupId(null)
    }
  }, [activeManagedLabelGroupId, world.labelGroups])

  useEffect(() => {
    if (!activeManagedLabelGroupId && labelGroups.length > 0) {
      setActiveManagedLabelGroupId(labelGroups[0].id)
    }
  }, [activeManagedLabelGroupId, labelGroups])

  useEffect(() => {
    setMoveLabelGroups((current) => {
      return getAlignedMoveLabelGroups(current, labelGroups)
    })
  }, [labelGroups])

  useEffect(() => {
    if (activeCityId && !world.cities[activeCityId]) {
      setActiveCityId(null)
    }
  }, [activeCityId, world.cities])

  useEffect(() => {
    if (activeCountryId && !world.countries[activeCountryId]) {
      setActiveCountryId(null)
    }
  }, [activeCountryId, world.countries])

  useEffect(() => {
    setSubmapRecentSelectionIds((current) => {
      return pruneRecentSelectionIds(current, (submapId) =>
        Boolean(world.submaps[submapId]),
      )
    })
  }, [world.submaps])

  useEffect(() => {
    if (!activeSubmapId || !world.submaps[activeSubmapId]) {
      return
    }
    setSubmapRecentSelectionIds((current) => {
      return prependRecentSelectionId(
        current,
        activeSubmapId,
        (submapId) => Boolean(world.submaps[submapId]),
        6,
      )
    })
  }, [activeSubmapId, world.submaps])

  useEffect(() => {
    setCountryRecentSelectionIds((current) => {
      return pruneRecentSelectionIds(current, (countryId) =>
        Boolean(world.countries[countryId]),
      )
    })
  }, [world.countries])

  useEffect(() => {
    if (!activeCountryId || !world.countries[activeCountryId]) {
      return
    }
    setCountryRecentSelectionIds((current) => {
      return prependRecentSelectionId(
        current,
        activeCountryId,
        (countryId) => Boolean(world.countries[countryId]),
        5,
      )
    })
  }, [activeCountryId, world.countries])

  useEffect(() => {
    if (activeProvinceId && !world.provinces[activeProvinceId]) {
      setActiveProvinceId(null)
    }
  }, [activeProvinceId, world.provinces])

  useEffect(() => {
    setProvinceRecentSelectionIds((current) => {
      return pruneRecentSelectionIds(current, (provinceId) =>
        Boolean(world.provinces[provinceId]),
      )
    })
  }, [world.provinces])

  useEffect(() => {
    if (!activeProvinceId || !world.provinces[activeProvinceId]) {
      return
    }
    setProvinceRecentSelectionIds((current) => {
      return prependRecentSelectionId(
        current,
        activeProvinceId,
        (provinceId) => Boolean(world.provinces[provinceId]),
        8,
      )
    })
  }, [activeProvinceId, world.provinces])

  const {
    paintHistoryRevision,
    paintActionLog,
    undoPaintHistory,
    redoPaintHistory,
    handlePaintCellInteract,
    getPaintCellInteractionPreview,
    handlePaintCellsInteractBatch,
    handlePaintInteractionEnd,
  } = usePaintController({
    world,
    setWorld,
    cellById,
    cellsByCoordinates,
    surfaceBrush,
    editorMode,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    politicalPaintMode,
    restrictProvinceBrushToOwnerCountry,
    terrainPaintMode,
    activeCountryId,
    setActiveCountryId,
    defaultPaintCountryId,
    activeProvinceId,
    setActiveProvinceId,
    defaultPaintProvinceId,
    historyLimit: PAINT_HISTORY_LIMIT,
  })

  const handleCellInteract = (cellId: string) => {
    handleCellInteractState({
      actions: {
        setActiveCityId,
        setCityAssignedLabelDrafts,
        setCityDraftCountryId,
        setCityDraftDescription,
        setCityDraftLevelId,
        setCityDraftName,
        setCityDraftSecondName,
        setEditingCityId,
        setIsCityEditorOpen,
        setPendingCityCellId,
        setPendingMoveTargetCellId,
        setUniqueLevelConflict,
      },
      applyMoveOperation,
      cellById,
      cellId,
      cityAssignedLabelGroups,
      cityByCellId,
      cityToolMode,
      cities,
      closeObjectEditors,
      editorMode,
      effectiveCityBrushLevelId,
      handlePaintCellInteract,
      moveRequireConfirm,
      moveSourceCellIds,
      politicalSubMode,
      ui,
      world,
    })
  }

  const getCellInteractionPreview = (cellId: string) => {
    return getCellInteractionPreviewState({
      cellId,
      editorMode,
      getPaintCellInteractionPreview,
      politicalSubMode,
    })
  }

  const handleCellsInteractBatch = (cellIds: string[]) => {
    handleCellsInteractBatchState({
      applyMoveOperation,
      cellById,
      cellIds,
      editorMode,
      handleCellInteract,
      handlePaintCellsInteractBatch,
      moveRequireConfirm,
      moveSourceCellIds,
      politicalSubMode,
      setPendingMoveTargetCellId,
    })
  }

  const handleInteractionEnd = handlePaintInteractionEnd

  const handleSubmapSelectionComplete = (cellIds: string[]) => {
    handleSubmapSelectionCompleteState({
      cellIds,
      setActiveSubmapId,
      setEditingSubmapId,
      setIsSubmapSelectionMode,
      setSubmapDraftName,
      setWorld,
      submaps,
      ui,
    })
  }

  const handleMoveSelectionComplete = (cellIds: string[]) => {
    handleMoveSelectionCompleteState({
      cellIds,
      setIsMoveSelectionMode,
      setMoveSourceCellIds,
      setPendingMoveTargetCellId,
    })
  }

  const applyMoveOperation = (targetCellOverride?: HexCell | null) => {
    applyMoveOperationState({
      baseGridHexSize: baseSetup.grid.hexSize,
      cellsByCoordinates,
      editorMode,
      moveCities,
      moveDeltaWorld,
      moveLabelGroups,
      moveOperation,
      movePayload,
      moveSourceAnchorCell,
      moveSourceCellIdSet,
      moveSourceCellIds,
      moveSourceCells,
      moveTargetCells,
      moveVacatedSurface,
      setIsMoveSelectionMode,
      setMoveSourceCellIds,
      setPendingMoveTargetCellId,
      setWorld,
      targetCellOverride,
      world,
    })
  }

  const startEditingSubmap = (submap: Submap) => {
    startEditingSubmapState({
      actions: {
        setEditingSubmapId,
        setEditingSubmapSnapshot,
        setPendingSubmapDeleteId,
        setSubmapDraftByGap,
        setSubmapDraftBylineFontSize,
        setSubmapDraftFrameBottom,
        setSubmapDraftFrameColor,
        setSubmapDraftFrameLeft,
        setSubmapDraftFrameRight,
        setSubmapDraftFrameTop,
        setSubmapDraftName,
        setSubmapDraftPageMarginTop,
        setSubmapDraftSubtitle,
        setSubmapDraftSubtitleFontSize,
        setSubmapDraftTitleFontSize,
        setSubmapDraftTitleGap,
        setSubmapDraftUseDefaultStyle,
        setSubmapDraftUseWorldTitlePrefix,
      },
      submap,
      submapStyle: world.submapStyle,
    })
  }

  const handleSaveSubmap = () => {
    if (!editingSubmapId) {
      return
    }

    const currentSubmap = world.submaps[editingSubmapId]
    if (!currentSubmap) {
      setEditingSubmapId(null)
      setSubmapDraftName('')
      return
    }

    const trimmedName = submapDraftName.trim()
    if (!trimmedName) {
      return
    }

    setWorld((current) => {
      const nextSubmap = current.submaps[editingSubmapId]
      if (!nextSubmap) {
        return current
      }

      return upsertSubmap(current, applySubmapDraftToSubmap({
        currentSubmap: nextSubmap,
        draft: {
          byGap: submapDraftByGap,
          bylineFontSize: submapDraftBylineFontSize,
          frameBottom: submapDraftFrameBottom,
          frameColor: submapDraftFrameColor,
          frameLeft: submapDraftFrameLeft,
          frameRight: submapDraftFrameRight,
          frameTop: submapDraftFrameTop,
          name: submapDraftName,
          pageMarginTop: submapDraftPageMarginTop,
          subtitle: submapDraftSubtitle,
          subtitleFontSize: submapDraftSubtitleFontSize,
          titleFontSize: submapDraftTitleFontSize,
          titleGap: submapDraftTitleGap,
          useDefaultStyle: submapDraftUseDefaultStyle,
          useWorldTitlePrefix: submapDraftUseWorldTitlePrefix,
        },
        submapStyle: current.submapStyle,
      }))
    })
    setEditingSubmapId(null)
    setEditingSubmapSnapshot(null)
    setSubmapDraftName('')
    setSubmapDraftSubtitle('')
  }

  const applySubmapDraft = (patch?: Partial<Submap>) => {
    if (!editingSubmapId) {
      return
    }

    setWorld((current) => {
      const currentSubmap = current.submaps[editingSubmapId]
      if (!currentSubmap) {
        return current
      }

      return upsertSubmap(current, applySubmapDraftToSubmap({
        currentSubmap,
        draft: {
          byGap: submapDraftByGap,
          bylineFontSize: submapDraftBylineFontSize,
          frameBottom: submapDraftFrameBottom,
          frameColor: submapDraftFrameColor,
          frameLeft: submapDraftFrameLeft,
          frameRight: submapDraftFrameRight,
          frameTop: submapDraftFrameTop,
          name: submapDraftName,
          pageMarginTop: submapDraftPageMarginTop,
          subtitle: submapDraftSubtitle,
          subtitleFontSize: submapDraftSubtitleFontSize,
          titleFontSize: submapDraftTitleFontSize,
          titleGap: submapDraftTitleGap,
          useDefaultStyle: submapDraftUseDefaultStyle,
          useWorldTitlePrefix: submapDraftUseWorldTitlePrefix,
        },
        patch,
        submapStyle: current.submapStyle,
      }))
    })
  }

  const discardSubmapDraft = () => {
    discardSubmapDraftState({
      actions: {
        setEditingSubmapId,
        setEditingSubmapSnapshot,
        setSubmapDraftFrameColor,
        setSubmapDraftName,
        setSubmapDraftSubtitle,
        setSubmapDraftUseDefaultStyle,
        setSubmapDraftUseWorldTitlePrefix,
      },
      editingSubmapSnapshot,
      setWorld,
    })
  }

  const handleDeleteSubmap = (submapId: string) => {
    deleteSubmapState({
      activeSubmapId,
      editingSubmapId,
      pendingSubmapDeleteId,
      setActiveSubmapId,
      setEditingSubmapId,
      setPendingSubmapDeleteId,
      setSubmapDraftName,
      setSubmapDraftSubtitle,
      setWorld,
      submapId,
    })
  }

  const openSidebarDeleteConfirmation = (title: string, onConfirm: () => void) => {
    setPendingSidebarDeleteConfirmation(buildSidebarDeleteConfirmation({
      onConfirm,
      pointer: lastPointerViewportPositionRef.current,
      rightSidebarWidth: Math.max(rightSidebarWidth, MIN_RIGHT_SIDEBAR_WIDTH),
      title,
      viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 720,
      viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
    }))
  }

  const closeSidebarDeleteConfirmation = () => {
    setPendingSidebarDeleteConfirmation(null)
  }

  const commitDraftGridConfig = ({
    colsInput = draftGridColsInput,
    rowsInput = draftGridRowsInput,
    hexSizeInput = draftGridHexSizeInput,
  }: {
    colsInput?: string
    rowsInput?: string
    hexSizeInput?: string
  } = {}) => {
    setDraftGridConfig((current) => {
      const nextConfig = {
        ...current,
        cols: sanitizeGridValue(colsInput, current.cols, 2, 256),
        rows: sanitizeGridValue(rowsInput, current.rows, 2, 256),
        hexSize: sanitizeGridValue(hexSizeInput, current.hexSize, 12, 64),
      }

      setDraftGridColsInput(String(nextConfig.cols))
      setDraftGridRowsInput(String(nextConfig.rows))
      setDraftGridHexSizeInput(String(nextConfig.hexSize))

      return nextConfig
    })
  }

  const resetCountrySection = () => {
    resetCountrySectionState({
      setBrushRadius,
      setCountryGovernmentTypeFilter,
      setCountryToolMode,
      setPoliticalPaintMode,
    })
  }

  const resetCityLevelSection = () => {
    resetCityLevelSectionState({
      setActiveCityLevelId,
      setCityLevelDraftDisplayInCountryInfo,
      setCityLevelDraftIconKey,
      setCityLevelDraftIconScalePercent,
      setCityLevelDraftName,
      setCityLevelDraftRank,
      setCityLevelDraftUniquePerCountry,
      setCityLevelSortDirection,
      setCityLevelSortKey,
      setEditingCityLevelId,
      setIsCityLevelEditorOpen,
      setIsCityLevelListExpanded,
    })
  }

  const resetCityManagementSection = () => {
    resetCityManagementSectionState({
      setActiveCityId,
      setCityAssignedLabelDrafts,
      setCityCountryFilter,
      setCityDraftCountryId,
      setCityDraftDescription,
      setCityDraftLevelId,
      setCityDraftName,
      setCityDraftSecondName,
      setCityLevelFilter,
      setCitySortDirection,
      setCitySortKey,
      setCityToolMode,
      setCityTypeSortMode,
      setEditingCityId,
      setIsCityEditorOpen,
      setIsCityListExpanded,
      setPendingCityCellId,
    })
  }

  const {
    clearMoveSelection,
    clearPoliticalInteraction,
    cachePoliticalWorkspaceSnapshot,
    restoreCountrySectionWorkspace,
    restoreCityLevelsSectionWorkspace,
    restoreCityManagementSectionWorkspace,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
  } = usePoliticalWorkspaceController({
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
        setEditorMode,
        setPoliticalSubMode,
        setCountryToolMode,
        setProvinceToolMode,
        setPoliticalPaintMode,
        setCityToolMode,
      },
      terrainBrush: {
        setBrushRadius,
      },
      activeEntity: {
        setActiveCountryId,
        setActiveProvinceId,
        setActiveCityLevelId,
        setActiveCityId,
        setCityBrushLevelId,
        activeCountryId,
        activeProvinceId,
        activeCityLevelId,
        activeCityId,
        cityBrushLevelId,
      },
    },
    politicalWorkspaceCacheRef,
    snapshotSource: {
      governmentTypeFilter: countryGovernmentTypeFilter,
      provinceCountryFilter,
      countrySortKey,
      countrySortDirection,
      isCountryListExpanded,
      provinceSortKey,
      provinceSortDirection,
      isProvinceListExpanded,
      cityLevelSortKey,
      cityLevelSortDirection,
      isCityLevelListExpanded,
      cityCountryFilter,
      cityProvinceFilter,
      cityLevelFilter,
      citySortKey,
      citySortDirection,
      cityTypeSortMode,
      isCityListExpanded,
    },
    actions: {
      setCountryGovernmentTypeFilter,
      setCountrySortKey,
      setCountrySortDirection,
      setIsCountryListExpanded,
      setProvinceCountryFilter,
      setProvinceSortKey,
      setProvinceSortDirection,
      setIsProvinceListExpanded,
      setCityLevelSortKey,
      setCityLevelSortDirection,
      setIsCityLevelListExpanded,
      setCityCountryFilter,
      setCityProvinceFilter,
      setCityLevelFilter,
      setCitySortKey,
      setCitySortDirection,
      setCityTypeSortMode,
      setIsCityListExpanded,
      setMoveSourceCellIds,
      setIsMoveSelectionMode,
      setPendingMoveTargetCellId,
    },
  })

  const handleCityToolSectionToggle = (sectionId: CityToolSectionId) => {
    setExpandedCityToolSections((current) => {
      return getNextExpandedCityToolSections({
        cachePoliticalWorkspaceSnapshot,
        current,
        politicalWorkspaceSnapshot: politicalWorkspaceCacheRef.current,
        resetCityLevelSection,
        resetCityManagementSection,
        restoreCityLevelsSectionWorkspace,
        restoreCityManagementSectionWorkspace,
        sectionId,
      })
    })
  }

  const provinceChooserCountryId = activeCountryId ?? activeProvince?.countryId ?? sortedCountries[0]?.id ?? null
  const defaultProvinceDefaultColor = defaultCountryDraftPalette.provinceDefaultColor
  const applyCountryDraftDerivedColors = useCallback((fillColor: string) => {
    return applyCountryDraftDerivedColorsState({
      fillColor,
      setCountryDraftBorderColor,
      setCountryDraftProvinceBorderColor,
      setCountryDraftProvinceDefaultColor,
    })
  }, [])
  const getCountryProvinceDefaultColor = useCallback((countryId: string | null) => {
    return getCountryProvinceDefaultColorValue({
      countriesById: world.countries,
      countryId,
      defaultProvinceDefaultColor,
    })
  }, [defaultProvinceDefaultColor, world.countries])
  const provinceChooserProvinces = useMemo(
    () => sortedProvinces.filter((province) => province.countryId === provinceChooserCountryId),
    [provinceChooserCountryId, sortedProvinces],
  )

  const cyclePoliticalCountryTarget = useCallback((delta: number) => {
    cyclePoliticalCountryTargetState({
      activeCountryId,
      delta,
      politicalSubMode,
      provinceChooserCountryId,
      setActiveCountryId,
      setActiveProvinceId,
      sortedCountries,
      sortedProvinces,
    })
  }, [
    activeCountryId,
    politicalSubMode,
    provinceChooserCountryId,
    sortedCountries,
    sortedProvinces,
  ])

  const cyclePoliticalProvinceTarget = useCallback((delta: number) => {
    cyclePoliticalProvinceTargetState({
      activeProvinceId,
      delta,
      provinceChooserProvinces,
      setActiveProvinceId,
    })
  }, [activeProvinceId, provinceChooserProvinces])

  const activateFullSubmapView = useCallback(() => {
    activateFullSubmapViewState({
      setActiveSubmapId,
      setEditingSubmapId,
      setIsSubmapSelectionMode,
      setSubmapDraftName,
    })
  }, [])

  const beginCreateSubmapSelection = useCallback(() => {
    beginCreateSubmapSelectionState({
      setActiveSubmapId,
      setEditingSubmapId,
      setIsSubmapSelectionMode,
      setSubmapDraftName,
    })
  }, [])

  const cycleWorldSubmapTarget = useCallback((delta: number) => {
    cycleWorldSubmapTargetState({
      activeSubmapId,
      activateFullSubmapView,
      delta,
      setActiveSubmapId,
      setIsSubmapSelectionMode,
      submaps,
    })
  }, [activateFullSubmapView, activeSubmapId, submaps])

  const cycleWorldLayerTarget = useCallback((delta: number) => {
    cycleWorldLayerTargetState({
      delta,
      layersWithMeta,
      setWorldLayerShortcutTargetId,
      worldLayerShortcutTargetId,
    })
  }, [layersWithMeta, worldLayerShortcutTargetId])

  const toggleWorldLayerShortcutTarget = useCallback(() => {
    return toggleWorldLayerShortcutTargetState({
      setLayers,
      worldLayerShortcutTargetId,
    })
  }, [worldLayerShortcutTargetId])

  const cycleWorldLabelGroupTarget = useCallback((delta: number) => {
    cycleWorldLabelGroupTargetState({
      delta,
      labelGroups,
      setWorldLabelGroupShortcutTargetId,
      worldLabelGroupShortcutTargetId,
    })
  }, [labelGroups, worldLabelGroupShortcutTargetId])

  const toggleWorldLabelGroupShortcutTarget = useCallback(() => {
    return toggleWorldLabelGroupShortcutTargetState({
      setWorld,
      worldLabelGroupShortcutTargetId,
    })
  }, [worldLabelGroupShortcutTargetId])

  const toggleLayerVisibilityById = useCallback((layerId: LayerId) => {
    toggleLayerVisibilityByIdState({
      layerId,
      setLayers,
    })
  }, [])

  const toggleLabelGroupVisibilityById = useCallback((groupId: string) => {
    toggleLabelGroupVisibilityByIdState({
      groupId,
      setWorld,
    })
  }, [])

  const getCurrentModeShortcutKey = useCallback(() => {
    return getCurrentModeShortcutKeyValue(editorMode, politicalSubMode)
  }, [editorMode, politicalSubMode])

  const applyModeShortcutKey = useCallback((key: string) => {
    applyModeShortcutKeyState({
      handleEditorModeChange,
      handlePoliticalSubModeChange,
      key,
    })
  }, [handleEditorModeChange, handlePoliticalSubModeChange])

  const cyclePendingModeShortcut = useCallback((delta: number) => {
    cyclePendingModeShortcutState({
      altPendingModeKey,
      applyModeShortcutKey,
      delta,
      setAltPendingModeKey,
    })
  }, [altPendingModeKey, applyModeShortcutKey])

  const cyclePoliticalPaintMode = useCallback((delta: number) => {
    cyclePoliticalPaintModeState({
      delta,
      politicalPaintMode,
      setBrushRadius,
      setPoliticalPaintMode,
    })
  }, [politicalPaintMode])

  const cyclePoliticalTool = useCallback((delta: number) => {
    cyclePoliticalToolState({
      cityToolMode,
      countryToolMode,
      delta,
      handleSetCityToolMode,
      politicalSubMode,
      provinceToolMode,
      setCityToolMode,
      setCountryToolMode,
      setProvinceToolMode,
    })
  }, [
    cityToolMode,
    countryToolMode,
    handleSetCityToolMode,
    politicalSubMode,
    provinceToolMode,
  ])

  const {
    activateShortcutSection,
    cycleInspectorSections,
    getCurrentSectionShortcutKey,
    focusTerrainSection,
    cycleTerrainDisplayMode,
    cycleShortcutSection,
    commitSectionShortcutKey,
  } = useInspectorSectionShortcuts({
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
      },
      terrainBrush: {
        terrainDisplayMode,
        setTerrainDisplayMode,
      },
    },
    state: {
      altPendingSectionKey,
      expandedCityToolSections,
      isCityStyleSectionExpanded,
      isCountrySectionExpanded,
      isCountryStyleSectionExpanded,
      isGovernmentTypesSectionExpanded,
      isLabelGroupsSectionExpanded,
      isLabelsSectionExpanded,
      isProvinceInfoExpanded,
      isProvinceListExpanded,
      isTerrainBaseStyleExpanded,
      isTerrainDisplayExpanded,
      isTerrainPaintExpanded,
      isTerrainTopographyExpanded,
      isWorldGridExpanded,
      isWorldInfoExpanded,
      isWorldStyleExpanded,
    },
    actions: {
      setAltPendingSectionKey,
      setAltShortcutScope,
      setExpandedCityToolSections,
      setIsCityStyleSectionExpanded,
      setIsCountrySectionExpanded,
      setIsCountryStyleSectionExpanded,
      setIsGovernmentTypesSectionExpanded,
      setIsLabelGroupsSectionExpanded,
      setIsLabelsSectionExpanded,
      setIsProvinceInfoExpanded,
      setIsProvinceListExpanded,
      setIsTerrainBaseStyleExpanded,
      setIsTerrainDisplayExpanded,
      setIsTerrainPaintExpanded,
      setIsTerrainTopographyExpanded,
      setIsWorldGridExpanded,
      setIsWorldInfoExpanded,
      setIsWorldStyleExpanded,
    },
    controllers: {
      cyclePoliticalTool,
    },
  })

  const commitPendingSection = useCallback(() => {
    commitSectionShortcutKey(altPendingSectionKey)
  }, [altPendingSectionKey, commitSectionShortcutKey])

  const commitPendingMode = useCallback(() => {
    applyModeShortcutKey(altPendingModeKey)
  }, [altPendingModeKey, applyModeShortcutKey])

  const cycleTerrainBrushKind = useCallback((delta: number) => {
    cycleTerrainBrushKindState({
      delta,
      focusTerrainSection,
      setTerrainBrushElevation,
      setTerrainBrushKind,
      terrainBrushKind,
    })
  }, [focusTerrainSection, terrainBrushKind])

  const cycleTerrainPaintMode = useCallback((delta: number) => {
    cycleTerrainPaintModeState({
      delta,
      focusTerrainSection,
      setBrushRadius,
      setTerrainPaintMode,
      terrainPaintMode,
    })
  }, [focusTerrainSection, terrainPaintMode])

  const adjustTerrainBrushElevation = useCallback((delta: number) => {
    adjustTerrainBrushElevationState({
      delta,
      setTerrainBrushElevation,
      terrainBrushKind,
    })
  }, [terrainBrushKind])

  const cycleZSupportedShortcut = useCallback(() => {
    return cycleZSupportedShortcutState({
      activeSubmapId,
      altPendingSectionKey,
      altShortcutScope,
      cyclePoliticalCountryTarget,
      cyclePoliticalPaintMode,
      cyclePoliticalProvinceTarget,
      cyclePoliticalTool,
      cycleTerrainBrushKind,
      cycleTerrainDisplayMode,
      cycleTerrainPaintMode,
      cycleWorldSubmapTarget,
      editorMode,
      politicalSubMode,
      provinceChooserProvinceCount: provinceChooserProvinces.length,
      sortedCountryCount: sortedCountries.length,
      submapCount: submaps.length,
      toggleWorldLabelGroupShortcutTarget,
      toggleWorldLayerShortcutTarget,
    })
  }, [
    activeSubmapId,
    altPendingSectionKey,
    altShortcutScope,
    cyclePoliticalCountryTarget,
    cyclePoliticalPaintMode,
    cyclePoliticalProvinceTarget,
    cyclePoliticalTool,
    cycleTerrainBrushKind,
    cycleTerrainDisplayMode,
    cycleTerrainPaintMode,
    cycleWorldSubmapTarget,
    editorMode,
    politicalSubMode,
    provinceChooserProvinces.length,
    sortedCountries.length,
    submaps.length,
    toggleWorldLabelGroupShortcutTarget,
    toggleWorldLayerShortcutTarget,
  ])

  const handleCountrySortChange = (nextKey: CountrySortKey) => {
    handleCountrySortChangeState({
      countrySortKey,
      nextKey,
      setCountrySortDirection,
      setCountrySortKey,
    })
  }

  const handleProvinceSortChange = (nextKey: ProvinceSortKey) => {
    handleProvinceSortChangeState({
      nextKey,
      provinceSortKey,
      setProvinceSortDirection,
      setProvinceSortKey,
    })
  }

  const handleCitySortChange = (nextKey: CitySortKey) => {
    handleCitySortChangeState({
      citySortKey,
      nextKey,
      setCitySortDirection,
      setCitySortKey,
      setCityTypeSortMode,
    })
  }

  const handleCityLevelSortChange = (nextKey: CityLevelSortKey) => {
    handleCityLevelSortChangeState({
      cityLevelSortKey,
      nextKey,
      setCityLevelSortDirection,
      setCityLevelSortKey,
    })
  }

  useEffect(() => {
    if (!activeSidebarResize) {
      return
    }

    const handlePointerMove = (event: MouseEvent) => {
      if (activeSidebarResize === 'floating-table') {
        setFloatingTableWidth(
          Math.min(Math.max(window.innerWidth - event.clientX + 12, 760), 1440),
        )
        return
      }

      if (activeSidebarResize === 'icon-manager-width') {
        setIconManagerWidth(
          Math.min(
            Math.max(event.clientX - leftSidebarWidth - 20, 640),
            1080,
          ),
        )
        return
      }

      if (activeSidebarResize === 'icon-manager-height') {
        setIconManagerHeightOffset(
          Math.min(Math.max(event.clientY - 24 - iconManagerBaseHeight, -160), 320),
        )
        return
      }

      if (activeSidebarResize === 'left') {
        setLeftSidebarWidth(Math.min(Math.max(event.clientX, 240), 640))
        return
      }

      setRightSidebarWidth(
        Math.max(window.innerWidth - event.clientX, MIN_RIGHT_SIDEBAR_WIDTH),
      )
    }

    const stopResize = () => {
      setActiveSidebarResize(null)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', stopResize)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', stopResize)
    }
  }, [activeSidebarResize, iconManagerBaseHeight, leftSidebarWidth])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      FLOATING_TABLE_WIDTH_STORAGE_KEY,
      String(floatingTableWidth),
    )
  }, [floatingTableWidth])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      ICON_MANAGER_WIDTH_STORAGE_KEY,
      String(iconManagerWidth),
    )
  }, [iconManagerWidth])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      ICON_MANAGER_HEIGHT_OFFSET_STORAGE_KEY,
      String(iconManagerHeightOffset),
    )
  }, [iconManagerHeightOffset])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      CITY_COLUMN_ORDER_STORAGE_KEY,
      JSON.stringify(cityColumnOrder),
    )
  }, [cityColumnOrder])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      CITY_COMPACT_COLUMNS_STORAGE_KEY,
      JSON.stringify(cityCompactColumns),
    )
  }, [cityCompactColumns])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      COUNTRY_COLUMN_ORDER_STORAGE_KEY,
      JSON.stringify(countryColumnOrder),
    )
  }, [countryColumnOrder])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      COUNTRY_COMPACT_COLUMNS_STORAGE_KEY,
      JSON.stringify(countryCompactColumns),
    )
  }, [countryCompactColumns])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      PROVINCE_COLUMN_ORDER_STORAGE_KEY,
      JSON.stringify(provinceColumnOrder),
    )
  }, [provinceColumnOrder])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      PROVINCE_COMPACT_COLUMNS_STORAGE_KEY,
      JSON.stringify(provinceCompactColumns),
    )
  }, [provinceCompactColumns])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      LABEL_GROUP_COLUMN_ORDER_STORAGE_KEY,
      JSON.stringify(labelGroupColumnOrder),
    )
  }, [labelGroupColumnOrder])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(
      LABEL_GROUP_COMPACT_COLUMNS_STORAGE_KEY,
      JSON.stringify(labelGroupCompactColumns),
    )
  }, [labelGroupCompactColumns])

  useEffect(() => {
    setLayers((current) => relabelLayers(current, ui))
  }, [ui])

  const hoveredCellText = hoveredCell
    ? ui.political.hoveredCellCoords(hoveredCell.id, hoveredCell.q, hoveredCell.r)
    : ui.political.moveToInspect
  const hoveredDetailsText = hoveredCity
    ? ui.political.hoveredCity(
        hoveredCity.name,
        getCityLevelName(hoveredCity.levelId, world.cityLevels, ui),
      )
    : hoveredCountry
      ? ui.political.hoveredCountry(hoveredCountry.name)
      : hoveredCell
        ? ui.common.unassigned
        : ui.political.noHoveredCell
  const hoveredSurfaceText = hoveredCell
    ? getSurfaceSummary(ui, world.cellSurfaces[hoveredCell.id])
    : ui.political.noHoveredCell
  const moveTargetCells = useMemo(() => {
    if (editorMode !== 'move') {
      return [] as Array<{ sourceCellId: string; targetCellId: string; blocked: boolean }>
    }

    return getMoveTargetEntries(
      moveSourceCells,
      moveSourceAnchorCell,
      effectiveMoveTargetCell,
      cellsByCoordinates,
      movePayload,
      world.cellSurfaces,
    )
  }, [
    cellsByCoordinates,
    editorMode,
    effectiveMoveTargetCell,
    movePayload,
    moveSourceAnchorCell,
    moveSourceCells,
    world.cellSurfaces,
  ])
  const movePreviewCellIds = useMemo(
    () => moveTargetCells.filter((entry) => !entry.blocked && entry.targetCellId).map((entry) => entry.targetCellId),
    [moveTargetCells],
  )
  const moveBlockedCellIds = useMemo(
    () => moveTargetCells.filter((entry) => entry.blocked && entry.targetCellId).map((entry) => entry.targetCellId),
    [moveTargetCells],
  )
  const movePreviewStyles = useMemo(() => {
    if (editorMode !== 'move' || movePayload !== 'political') {
      return {} as Record<string, { fillColor: string; strokeColor: string }>
    }

    const styles: Record<string, { fillColor: string; strokeColor: string }> = {}

    for (const entry of moveTargetCells) {
      if (entry.blocked || !entry.targetCellId) {
        continue
      }

      const sourceProvinceId = world.provinceAssignments[entry.sourceCellId] ?? null
      const sourceCountryId = world.countryAssignments[entry.sourceCellId] ?? null

      if (sourceProvinceId) {
        const sourceProvince = displayProvincesById[sourceProvinceId]
        const sourceCountry = sourceProvince?.countryId
          ? displayCountriesById[sourceProvince.countryId]
          : null
        styles[entry.targetCellId] = {
          fillColor: sourceProvince?.color ?? sourceCountry?.color ?? '#f6a3c8',
          strokeColor:
            sourceCountry?.provinceBorderColor ??
            sourceCountry?.borderColor ??
            sourceCountry?.color ??
            sourceProvince?.color ??
            '#f6a3c8',
        }
        continue
      }

      if (sourceCountryId) {
        const sourceCountry = displayCountriesById[sourceCountryId]
        styles[entry.targetCellId] = {
          fillColor: sourceCountry?.color ?? '#f6a3c8',
          strokeColor: sourceCountry?.borderColor ?? sourceCountry?.color ?? '#f6a3c8',
        }
      }
    }

    return styles
  }, [
    displayCountriesById,
    displayProvincesById,
    editorMode,
    movePayload,
    moveTargetCells,
    world.countryAssignments,
    world.provinceAssignments,
  ])
  const moveDeltaWorld = useMemo(() => {
    if (!moveSourceAnchorCell || !effectiveMoveTargetCell || editorMode !== 'move') {
      return { x: 0, y: 0 }
    }

    return {
      x: effectiveMoveTargetCell.centerX - moveSourceAnchorCell.centerX,
      y: effectiveMoveTargetCell.centerY - moveSourceAnchorCell.centerY,
    }
  }, [editorMode, effectiveMoveTargetCell, moveSourceAnchorCell])
  const moveDeltaGrid = useMemo(() => {
    if (!moveSourceAnchorCell || !effectiveMoveTargetCell || editorMode !== 'move') {
      return null
    }

    return {
      q: effectiveMoveTargetCell.q - moveSourceAnchorCell.q,
      r: effectiveMoveTargetCell.r - moveSourceAnchorCell.r,
    }
  }, [editorMode, effectiveMoveTargetCell, moveSourceAnchorCell])
  const isBrushRadiusActive =
    (editorMode === 'surface' && terrainPaintMode.startsWith('radius_')) ||
    (editorMode === 'political' &&
      ((politicalSubMode === 'country' && countryToolMode !== 'view' && politicalPaintMode.startsWith('radius_')) ||
        (politicalSubMode === 'province' && provinceToolMode !== 'view' && politicalPaintMode.startsWith('radius_'))))
  const politicalToolText =
    politicalSubMode === 'country'
      ? ui.politicalTool[countryToolMode]
      : politicalSubMode === 'province'
        ? ui.politicalTool[provinceToolMode]
        : politicalSubMode === 'city'
          ? ui.politicalTool[cityToolMode]
          : ui.politicalTool.view
  const politicalPaintModeText =
    politicalPaintMode.startsWith('radius_')
      ? ui.sidebar.radiusLabel(Number(politicalPaintMode.slice(-1)))
      : politicalPaintMode === 'fill_type'
        ? ui.surface.fillType
        : ui.surface.fillHeight
  const brushRadiusText = ui.sidebar.radiusLabel(brushRadius)
  const moveToolText =
    movePayload === 'terrain'
      ? `${ui.move.terrain} ${ui.move[moveOperation]}`
      : `${ui.move.political} ${ui.move.move}`
  const moveVacatedSurface = useMemo(
    () =>
      moveVacatedKind === 'empty'
        ? createSurfaceState('empty')
        : createSurfaceState(
            moveVacatedKind,
            clampSurfaceElevation(moveVacatedKind, moveVacatedElevation),
          ),
    [moveVacatedElevation, moveVacatedKind],
  )
  const cityBrushText = effectiveCityBrushLevelId
    ? getCityLevelName(effectiveCityBrushLevelId, world.cityLevels, ui)
    : ui.common.none
  const recentPaintActionItems = paintActionLog.slice(0, 12).map((entry) => {
    const operationLabel =
      entry.operation === 'undo'
        ? ui.debug.undoOp
        : entry.operation === 'redo'
          ? ui.debug.redoOp
          : ui.debug.paintOp
    const actionLabel = getPaintActionLabel(ui, entry.kind)
    const timestampLabel = new Date(entry.timestamp).toLocaleTimeString()
    return {
      id: entry.id,
      primaryText: `${operationLabel} · ${actionLabel}`,
      secondaryText: `${timestampLabel} · ${ui.debug.cellsChanged}: ${entry.changedCellCount} · ${ui.debug.undoDepth}: ${entry.undoDepth} · ${ui.debug.redoDepth}: ${entry.redoDepth}`,
    }
  })

  function closeObjectEditorsProxy() {
    closeObjectEditors()
  }

  function closeGovernmentTypeEditorWithPreviewResetProxy() {
    closeGovernmentTypeEditorWithPreviewReset()
  }

  function restoreCountrySectionWorkspaceProxy() {
    restoreCountrySectionWorkspace(politicalWorkspaceCacheRef.current.countrySection)
  }

  function closeCountryEditorWithPreviewResetProxy() {
    closeCountryEditorWithPreviewReset()
  }

  const editingLabelManagedGroup = editingLabelGroupId
    ? world.labelGroups[editingLabelGroupId] ?? null
    : null
  const editingLabel = editingLabelId ? world.labels[editingLabelId] ?? null : null
  const editingLabelGroup = editingLabel ? world.labelGroups[editingLabel.groupId] ?? null : null

  useEffect(() => {
    if (!worldLayerShortcutTargetId && layersWithMeta.length > 0) {
      setWorldLayerShortcutTargetId(layersWithMeta[0].id)
    }
  }, [layersWithMeta, worldLayerShortcutTargetId])

  useEffect(() => {
    if (worldLayerShortcutTargetId && !layersWithMeta.some((layer) => layer.id === worldLayerShortcutTargetId)) {
      setWorldLayerShortcutTargetId(layersWithMeta[0]?.id ?? null)
    }
  }, [layersWithMeta, worldLayerShortcutTargetId])

  useEffect(() => {
    if (!worldLabelGroupShortcutTargetId && labelGroups.length > 0) {
      setWorldLabelGroupShortcutTargetId(labelGroups[0].id)
    }
  }, [labelGroups, worldLabelGroupShortcutTargetId])

  useEffect(() => {
    if (worldLabelGroupShortcutTargetId && !labelGroups.some((group) => group.id === worldLabelGroupShortcutTargetId)) {
      setWorldLabelGroupShortcutTargetId(labelGroups[0]?.id ?? null)
    }
  }, [labelGroups, worldLabelGroupShortcutTargetId])

  const radialWorldSubmaps = useMemo(
    () => getAltRadialPreviewItems(submaps, activeSubmapId, 6),
    [activeSubmapId, submaps],
  )
  const recentWorldSubmaps = useMemo(() => {
    const nextSubmapIds: string[] = []
    if (activeSubmapId && world.submaps[activeSubmapId]) {
      nextSubmapIds.push(activeSubmapId)
    }
    for (const submapId of submapRecentSelectionIds) {
      if (!world.submaps[submapId]) {
        continue
      }
      if (nextSubmapIds.includes(submapId)) {
        continue
      }
      nextSubmapIds.push(submapId)
    }
    return nextSubmapIds.slice(0, 4).map((submapId) => world.submaps[submapId]!)
  }, [activeSubmapId, submapRecentSelectionIds, world.submaps])
  const radialWorldLayers = useMemo(
    () => getAltRadialPreviewItems(layersWithMeta, worldLayerShortcutTargetId, 8),
    [layersWithMeta, worldLayerShortcutTargetId],
  )
  const radialWorldLabelGroups = useMemo(
    () => getAltRadialPreviewItems(labelGroups, worldLabelGroupShortcutTargetId, 8),
    [labelGroups, worldLabelGroupShortcutTargetId],
  )
  const radialPoliticalCountries = useMemo(
    () =>
      getAltRadialPreviewItems(
        sortedCountries,
        politicalSubMode === 'country' ? activeCountryId : provinceChooserCountryId,
        7,
      ),
    [activeCountryId, politicalSubMode, provinceChooserCountryId, sortedCountries],
  )
  const recentPoliticalCountries = useMemo(() => {
    const nextCountryIds: string[] = []
    if (activeCountryId && displayCountriesById[activeCountryId]) {
      nextCountryIds.push(activeCountryId)
    }
    for (const countryId of countryRecentSelectionIds) {
      if (!displayCountriesById[countryId]) {
        continue
      }
      if (nextCountryIds.includes(countryId)) {
        continue
      }
      nextCountryIds.push(countryId)
    }
    return nextCountryIds.slice(0, 4).map((countryId) => displayCountriesById[countryId]!)
  }, [activeCountryId, countryRecentSelectionIds, displayCountriesById])
  const radialPoliticalProvinces = useMemo(
    () => getAltRadialPreviewItems(provinceChooserProvinces, activeProvinceId, 7),
    [activeProvinceId, provinceChooserProvinces],
  )
  const recentPoliticalProvinces = useMemo(() => {
    if (!provinceChooserCountryId) {
      return []
    }
    const nextProvinceIds: string[] = []
    if (
      activeProvinceId &&
      displayProvincesById[activeProvinceId] &&
      displayProvincesById[activeProvinceId]!.countryId === provinceChooserCountryId
    ) {
      nextProvinceIds.push(activeProvinceId)
    }
    for (const provinceId of provinceRecentSelectionIds) {
      const province = displayProvincesById[provinceId]
      if (!province || province.countryId !== provinceChooserCountryId) {
        continue
      }
      if (nextProvinceIds.includes(provinceId)) {
        continue
      }
      nextProvinceIds.push(provinceId)
    }
    return nextProvinceIds.slice(0, 4).map((provinceId) => displayProvincesById[provinceId]!)
  }, [
    activeProvinceId,
    displayProvincesById,
    provinceChooserCountryId,
    provinceRecentSelectionIds,
  ])
  const radialCityLevels = useMemo(
    () => getAltRadialPreviewItems(sortedCityLevels, effectiveCityBrushLevelId ?? activeCityLevelId, 8),
    [activeCityLevelId, effectiveCityBrushLevelId, sortedCityLevels],
  )
  const radialLabelGroups = useMemo(
    () => getAltRadialPreviewItems(labelGroups, activeManagedLabelGroupId, 5),
    [activeManagedLabelGroupId, labelGroups],
  )
  const {
    finalizeCityCreationFromDraft,
    handleDeleteEditingCity,
    handleSaveCityEditor,
  } = useCityEditorCommands({
    state: {
      activeCityId,
      cityAssignedLabelDrafts,
      cityAssignedLabelGroups,
      cityDraftCountryId,
      cityDraftDescription,
      cityDraftLevelId,
      cityDraftName,
      cityDraftSecondName,
      editingCityId,
      pendingCityCellId,
      world,
    },
    actions: {
      setActiveCityId,
      setCityAssignedLabelDrafts,
      setCityDraftCountryId,
      setCityDraftDescription,
      setCityDraftLevelId,
      setCityDraftName,
      setCityDraftSecondName,
      setEditingCityId,
      setIsCityEditorOpen,
      setPendingCityCellId,
      setUniqueLevelConflict,
      setWorld,
    },
  })

  const {
    handleCloseLabelEditor,
    handleCloseLabelGroupEditor,
    handleDeleteEditingLabel,
    handleDeleteEditingLabelGroup,
    handleCloseAssignedLabelRemovalDialog,
    handleConfirmAssignedLabelRemoval,
    handleCloseUniqueLevelConflictDialog,
    handleConfirmUniqueLevelConflict,
  } = useLabelDialogController({
    state: {
      activeLabelId,
      activeManagedLabelGroupId,
      editingCityId,
      editingLabel,
      editingLabelManagedGroup,
      pendingAssignedLabelRemoval,
      skipAssignedLabelRemovalConfirm,
      uniqueLevelConflict,
    },
    refs: {
      labelEditorOpenSnapshotRef,
      labelGroupEditorOpenSnapshotRef,
    },
    actions: {
      finalizeCityCreationFromDraft,
      setActiveLabelId,
      setActiveManagedLabelGroupId,
      setEditingLabelId,
      setEditingLabelGroupId,
      setIsLabelEditorOpen,
      setIsLabelGroupEditorOpen,
      setPendingAssignedLabelRemoval,
      setSkipAssignedLabelRemovalConfirm,
      setUniqueLevelConflict,
      setWorld,
    },
  })

  const describeAssignedLabelGroup = (group: LabelGroup) => {
    return describeAssignedLabelGroupText(ui, group)
  }

  const reorderLabelGroups = (sourceGroupId: string, targetGroupId: string) => {
    setWorld((current) => {
      return reorderLabelGroupsState(
        current,
        sourceGroupId,
        targetGroupId,
      )
    })
  }

  const closeObjectEditors = useCallback(() => {
    closeObjectEditorsState({
      labelEditorOpenSnapshotRef,
      labelGroupEditorOpenSnapshotRef,
      setCountryPreviewBorderColor,
      setCountryPreviewColor,
      setCountryPreviewProvinceBorderColor,
      setEditingCityId,
      setEditingCityLevelId,
      setEditingCountryId,
      setEditingGovernmentTypeId,
      setEditingLabelGroupId,
      setEditingLabelId,
      setEditingProvinceId,
      setGovernmentTypePreviewColor,
      setIsCityEditorOpen,
      setIsCityLevelEditorOpen,
      setIsCountryEditorOpen,
      setIsGovernmentTypeEditorOpen,
      setIsLabelEditorOpen,
      setIsLabelGroupEditorOpen,
      setIsProvinceEditorOpen,
      setObjectEditorSidecarAnchor,
      setProvincePreviewColor,
    })
  }, [])

  const {
    openLabelEditor,
    openLabelGroupEditor,
    handleCanvasDoubleActivate,
  } = useCanvasDoubleActivateController({
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
        countryToolMode,
        provinceToolMode,
      },
      world: {
        world,
      },
      activeEntity: {
        setActiveCityId,
        setActiveCountryId,
        setActiveManagedLabelGroupId,
        setActiveProvinceId,
        setActiveLabelId,
      },
    },
    state: {
      cityByCellId,
      cityDoubleOpenMode,
      countryDoubleOpenMode,
      labelDoubleOpenMode,
      provinceDoubleOpenMode,
    },
    refs: {
      labelEditorOpenSnapshotRef,
      labelGroupEditorOpenSnapshotRef,
    },
    actions: {
      closeObjectEditors,
      setCityAssignedLabelDrafts,
      setCityDraftCountryId,
      setCityDraftDescription,
      setCityDraftLevelId,
      setCityDraftName,
      setCityDraftSecondName,
      setCountryAssignedLabelDrafts,
      setCountryDraftBorderColor,
      setCountryDraftColor,
      setCountryDraftDescription,
      setCountryDraftGovernmentTypeId,
      setCountryDraftIconKey,
      setCountryDraftIsCityState,
      setCountryDraftName,
      setCountryDraftProvinceBorderColor,
      setCountryDraftProvinceDefaultColor,
      setCountryDraftSecondName,
      setEditingCityId,
      setEditingCountryId,
      setEditingLabelGroupId,
      setEditingLabelId,
      setEditingProvinceId,
      setIsCityEditorOpen,
      setIsCountryEditorOpen,
      setIsLabelEditorOpen,
      setIsLabelGroupEditorOpen,
      setIsProvinceEditorOpen,
      setPendingCityCellId,
      setProvinceAssignedLabelDrafts,
      setProvinceDraftCapitalCityId,
      setProvinceDraftColor,
      setProvinceDraftCountryId,
      setProvinceDraftDescription,
      setProvinceDraftName,
    },
  })

  const {
    updateAssignedLabelGroupAssignment,
    syncDraftDefaultIfNeeded,
    requestAssignedLabelRemoval,
    createOrSelectCityLabel,
    createOrSelectCountryLabel,
    createOrSelectCountryIconLabel,
    createOrSelectProvinceLabel,
    createNewFreeLabel,
    createNewFreeIconLabel,
    createAndEditLabelGroup,
  } = useLabelManagementController({
    state: {
      activeCity,
      activeCountry,
      activeCountryId,
      activeManagedLabelGroup,
      activeProvince,
      activeSubmapCellIdSet,
      confirmAssignedLabelDelete: LABEL_INTERACTION_CONFIG.confirmAssignedLabelDelete,
      gridHexSize: baseSetup.grid.hexSize,
      hoveredCellId,
      labelGroups,
      sortedCountries,
      ui,
      world,
    },
    actions: {
      openLabelGroupEditor,
      setActiveLabelId,
      setPendingAssignedLabelRemoval,
      setSkipAssignedLabelRemovalConfirm,
      setWorld,
    },
  })

  const beginCreateCountry = useCallback(() => {
    beginCreateCountryState({
      applyCountryDraftDerivedColors,
      closeObjectEditors,
      countries,
      countryAssignedLabelGroups,
      setCountryAssignedLabelDrafts,
      setCountryDraftColor,
      setCountryDraftDescription,
      setCountryDraftGovernmentTypeId,
      setCountryDraftIconKey,
      setCountryDraftIsCityState,
      setCountryDraftName,
      setCountryDraftSecondName,
      setEditingCountryId,
      setIsCountryEditorOpen,
      ui,
    })
  }, [
    applyCountryDraftDerivedColors,
    closeObjectEditors,
    countries,
    countryAssignedLabelGroups,
    ui,
  ])

  const beginCreateProvince = useCallback(() => {
    beginCreateProvinceState({
      closeObjectEditors,
      getCountryProvinceDefaultColor,
      provinceAssignedLabelGroups,
      provinceChooserCountryId,
      provincesLength: provinces.length,
      setEditingProvinceId,
      setIsProvinceEditorOpen,
      setProvinceAssignedLabelDrafts,
      setProvinceDraftCapitalCityId,
      setProvinceDraftColor,
      setProvinceDraftCountryId,
      setProvinceDraftDescription,
      setProvinceDraftName,
      ui,
    })
  }, [
    closeObjectEditors,
    getCountryProvinceDefaultColor,
    provinceAssignedLabelGroups,
    provinceChooserCountryId,
    provinces.length,
    ui,
  ])

  const {
    setAltRadialMenuInPlace,
    handleAltRadialAction,
  } = useAltRadialActions({
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
        countryToolMode,
        provinceToolMode,
        setCityToolMode,
        setCountryToolMode,
        setPoliticalPaintMode,
        setProvinceToolMode,
      },
      terrainBrush: {
        terrainBrushKind,
        setBrushRadius,
        setTerrainBrushElevation,
        setTerrainBrushKind,
        setTerrainDisplayMode,
        setTerrainPaintMode,
      },
      terrainStyle: {
        terrainSnowLineElevation,
      },
      world: {
        world,
      },
      activeEntity: {
        setActiveCountryId,
        setActiveManagedLabelGroupId,
        setActiveProvinceId,
        setActiveSubmapId,
        setCityBrushLevelId,
        setActiveCityLevelId,
        setIsSubmapSelectionMode,
      },
    },
    state: {
      altRadialMenu,
      effectiveMoveTargetCell,
      movePayload,
      sortedProvinces,
    },
    refs: {
      suppressAltUntilReleaseRef,
    },
    actions: {
      activateFullSubmapView,
      activateShortcutSection,
      adjustTerrainBrushElevation,
      applyMoveOperation,
      beginCreateCountry,
      beginCreateProvince,
      beginCreateSubmapSelection,
      clearMoveSelection,
      createAndEditLabelGroup,
      createNewFreeIconLabel,
      createNewFreeLabel,
      createOrSelectCityLabel,
      createOrSelectCountryIconLabel,
      createOrSelectCountryLabel,
      createOrSelectProvinceLabel,
      focusTerrainSection,
      handleEditorModeChange,
      handlePoliticalSubModeChange,
      handleSetCityToolMode,
      toggleLabelGroupVisibilityById,
      toggleLayerVisibilityById,
      setAltRadialMenu,
      setAltShortcutScope,
      setExpandedTableId,
      setIsAltRadialSuppressed,
      setIsAltShortcutOverlayOpen,
      setIsLabelGroupsSectionExpanded,
      setIsLabelsSectionExpanded,
      setIsMoveSelectionMode,
      setLabelAnchorDisplayMode,
      setMoveOperation,
      setMovePayload,
      setPendingMoveTargetCellId,
      setWorldLabelGroupShortcutTargetId,
      setWorldLayerShortcutTargetId,
      setMoveSourceCellIds,
    },
  })

  const {
    closeCountryEditorWithPreviewReset,
    autoComputeCountryDraftColorsFromFill,
    closeProvinceEditorWithPreviewReset,
    closeGovernmentTypeEditorWithPreviewReset,
    isAnyObjectEditorOpen,
    closeExpandedTable,
    openCountryEditorFromExpandedTable,
    openProvinceEditorFromExpandedTable,
    openCityEditorFromExpandedTable,
    openLabelGroupEditorFromExpandedTable,
    openLabelEditorFromExpandedTable,
  } = useObjectEditorController({
    contexts: {
      activeEntity: {
        setActiveCityId,
        setActiveCountryId,
        setActiveLabelId,
        setActiveManagedLabelGroupId,
        setActiveProvinceId,
      },
    },
    state: {
      countryDraftColor,
      expandedTableId,
      isCityEditorOpen,
      isCityLevelEditorOpen,
      isCountryEditorOpen,
      isGovernmentTypeEditorOpen,
      isLabelEditorOpen,
      isLabelGroupEditorOpen,
      isProvinceEditorOpen,
      objectEditorSidecarAnchor,
      world,
    },
    refs: {
      iconManagerOriginKeyByCurrentRef,
      iconManagerSessionSnapshotRef,
    },
    actions: {
      applyCountryDraftDerivedColors,
      closeObjectEditors,
      deriveCountryPaletteFromFill,
      openLabelEditor,
      setCityAssignedLabelDrafts,
      setCityDraftCountryId,
      setCityDraftDescription,
      setCityDraftLevelId,
      setCityDraftName,
      setCityDraftSecondName,
      setCountryAssignedLabelDrafts,
      setCountryDraftBorderColor,
      setCountryDraftColor,
      setCountryDraftDescription,
      setCountryDraftGovernmentTypeId,
      setCountryDraftIconKey,
      setCountryDraftIsCityState,
      setCountryDraftName,
      setCountryDraftProvinceBorderColor,
      setCountryDraftProvinceDefaultColor,
      setCountryDraftSecondName,
      setCountryPreviewBorderColor,
      setCountryPreviewColor,
      setCountryPreviewProvinceBorderColor,
      setEditingCityId,
      setEditingCountryId,
      setEditingGovernmentTypeId,
      setEditingLabelGroupId,
      setEditingProvinceId,
      setExpandedTableId,
      setGovernmentTypeDraftColor,
      setGovernmentTypeDraftName,
      setGovernmentTypePreviewColor,
      setIsCityEditorOpen,
      setIsCountryEditorOpen,
      setIsGovernmentTypeEditorOpen,
      setIsLabelGroupEditorOpen,
      setIsProvinceEditorOpen,
      setObjectEditorSidecarAnchor,
      setPendingCityCellId,
      setProvinceAssignedLabelDrafts,
      setProvinceDraftCapitalCityId,
      setProvinceDraftColor,
      setProvinceDraftCountryId,
      setProvinceDraftDescription,
      setProvinceDraftName,
      setProvincePreviewColor,
    },
  })

  const effectiveObjectEditorPresentation: ObjectEditorPresentation = 'sidecar'

  useAltShortcutInteractions({
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
        setCountryToolMode,
        setCityToolMode,
        setPoliticalPaintMode,
        setProvinceToolMode,
      },
      terrainBrush: {
        terrainBrushKind,
        setTerrainBrushElevation,
        setTerrainBrushKind,
        setTerrainDisplayMode,
        setTerrainPaintMode,
        setBrushRadius,
      },
      terrainStyle: {
        terrainSnowLineElevation,
      },
      activeEntity: {
        setActiveCountryId,
        setActiveProvinceId,
        setActiveSubmapId,
        setIsSubmapSelectionMode,
      },
    },
    state: {
      altShortcutScope,
      isAltShortcutOverlayOpen,
      isAnyObjectEditorOpen,
      isMoveSelectionMode,
      labelGroups,
      layersWithMeta,
      moveSourceCount: moveSourceCellIds.length,
      provinceChooserProvinces,
      sortedCountries,
      sortedProvinces,
      submaps,
      suppressAltUntilReleaseRef,
      lastPointerViewportPositionRef,
    },
    actions: {
      adjustTerrainBrushElevation,
      activateFullSubmapView,
      applyModeShortcutKey,
      beginCreateCountry,
      beginCreateProvince,
      beginCreateSubmapSelection,
      clearMoveSelection,
      closeObjectEditors,
      commitPendingMode,
      commitPendingSection,
      commitSectionShortcutKey,
      cycleInspectorSections,
      cyclePendingModeShortcut,
      cycleShortcutSection,
      cyclePoliticalCountryTarget,
      cyclePoliticalPaintMode,
      cyclePoliticalProvinceTarget,
      cyclePoliticalTool,
      cycleTerrainBrushKind,
      cycleTerrainDisplayMode,
      cycleTerrainPaintMode,
      cycleWorldLabelGroupTarget,
      cycleWorldLayerTarget,
      cycleWorldSubmapTarget,
      cycleZSupportedShortcut,
      focusTerrainSection,
      getCurrentModeShortcutKey,
      getCurrentSectionShortcutKey,
      handleSetCityToolMode,
      redoPaintHistory,
      toggleLabelGroupVisibilityById,
      toggleLayerVisibilityById: (layerId) => toggleLayerVisibilityById(layerId as LayerId),
      undoPaintHistory,
      setAltPendingModeKey,
      setAltPendingSectionKey,
      setAltRadialMenu,
      setAltRadialOriginPosition,
      setAltShortcutScope,
      setIsAltRadialSuppressed,
      setIsAltShortcutOverlayOpen,
      setWorldLabelGroupShortcutTargetId,
      setWorldLayerShortcutTargetId: (layerId) =>
        setWorldLayerShortcutTargetId(layerId as LayerId | null),
    },
  })

  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      lastPointerViewportPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      }
    }

    window.addEventListener('mousemove', handlePointerMove)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (brandDockCloseTimerRef.current !== null) {
        window.clearTimeout(brandDockCloseTimerRef.current)
        brandDockCloseTimerRef.current = null
      }
    }
  }, [])

  const altRadialItems = useAltRadialItems({
    ui,
    altRadialMenu,
    editorMode,
    politicalSubMode,
    world,
    worldState: {
      activeSubmapId,
      isSubmapSelectionMode,
      recentWorldSubmaps,
      radialWorldSubmaps,
      radialWorldLayers,
      radialWorldLabelGroups,
      isWorldInfoExpanded,
      isWorldStyleExpanded,
      isWorldGridExpanded,
    },
    surfaceState: {
      terrainDisplayMode,
      terrainBrushKind,
      terrainBrushElevation,
      terrainPaintMode,
      terrainSnowLineElevation,
    },
    politicalState: {
      countryToolMode,
      provinceToolMode,
      cityToolMode,
      politicalPaintMode,
      canPaintCountries,
      canPaintProvinces,
      activeCountryId,
      activeProvinceId,
      provinceChooserCountryId,
      radialPoliticalCountries,
      recentPoliticalCountries,
      recentPoliticalProvinces,
      radialPoliticalProvinces,
      radialCityLevels,
      effectiveCityBrushLevelId,
    },
    labelState: {
      labelAnchorDisplayMode,
      radialLabelGroups,
      activeManagedLabelGroupId,
      hasAnyCountry: sortedCountries.length > 0,
    },
    moveState: {
      moveOperation,
      movePayload,
      moveSourceCount: moveSourceCellIds.length,
      movePreviewCount: movePreviewCellIds.length,
      hasEffectiveMoveTargetCell: Boolean(effectiveMoveTargetCell),
      isMoveSelectionMode,
    },
  })

  const {
    altMouseStackedMenuLayout,
    altRadialItemById,
    altMouseStackedMenuPosition,
    isWesternUiLanguage,
    isRootSplitMouseStackedMenu,
  } = useAltRadialLayout({
    activeUiLanguage,
    altRadialItems,
    altRadialMenu,
    altRadialOriginPosition,
    editorMode,
    politicalSubMode,
    ui,
  })

  const currentModeShortcutKey = getCurrentModeShortcutKey()
  /* eslint-disable react-hooks/refs */
  const shortcutHintSections = useMemo(() => buildShortcutHintSections({
    ui,
    altShortcutScope,
    altPendingModeKey,
    altPendingSectionKey,
    currentModeKey: currentModeShortcutKey,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    cityToolMode,
    activeCountryId,
    activeProvinceId,
    provinceChooserCountryId,
    provinceChooserProvinces,
    sortedCountries,
    sortedProvinces,
    politicalPaintMode,
    terrainDisplayMode,
    terrainBrushKind,
    terrainPaintMode,
    terrainBrushElevation,
    terrainSnowLineElevation,
    submaps,
    activeSubmapId,
    isSubmapSelectionMode,
    layersWithMeta,
    worldLayerShortcutTargetId,
    labelGroups,
    worldLabelGroupShortcutTargetId,
    setAltShortcutScope,
    applyModeShortcutKey,
    commitSectionShortcutKey,
    cyclePoliticalTool,
    handleSetCityToolMode,
    setCityToolMode,
    setCountryToolMode,
    setProvinceToolMode,
    beginCreateCountry,
    beginCreateProvince,
    setActiveCountryId,
    setActiveProvinceId,
    setPoliticalPaintMode,
    setBrushRadius,
    cycleTerrainDisplayMode,
    setTerrainDisplayMode,
    setTerrainBrushKind,
    setTerrainPaintMode,
    activateFullSubmapView,
    beginCreateSubmapSelection,
    setActiveSubmapId,
    setIsSubmapSelectionMode,
    toggleLayerVisibilityById: (layerId) => toggleLayerVisibilityById(layerId as LayerId),
    toggleLabelGroupVisibilityById,
    activateShortcutSection,
  }), [
    altShortcutScope,
    altPendingModeKey,
    altPendingSectionKey,
    currentModeShortcutKey,
    activateFullSubmapView,
    activateShortcutSection,
    applyModeShortcutKey,
    cityToolMode,
    activeCountryId,
    activeProvinceId,
    countryToolMode,
    isSubmapSelectionMode,
    activeSubmapId,
    beginCreateCountry,
    beginCreateProvince,
    beginCreateSubmapSelection,
    cyclePoliticalTool,
    cycleTerrainDisplayMode,
    handleSetCityToolMode,
    labelGroups,
    layersWithMeta,
    provinceChooserCountryId,
    provinceChooserProvinces,
    politicalPaintMode,
    politicalSubMode,
    provinceToolMode,
    sortedCountries,
    sortedProvinces,
    commitSectionShortcutKey,
    terrainBrushElevation,
    terrainBrushKind,
    terrainDisplayMode,
    terrainPaintMode,
    terrainSnowLineElevation,
    toggleLabelGroupVisibilityById,
    toggleLayerVisibilityById,
    worldLabelGroupShortcutTargetId,
    worldLayerShortcutTargetId,
    submaps,
    setAltShortcutScope,
    ui,
  ])
  /* eslint-enable react-hooks/refs */

  const closeTransientUi = () => {
    closeTransientUiState({
      closeObjectEditors,
      setExpandedTableId,
      setPendingAssignedLabelRemoval,
      setUniqueLevelConflict,
    })
  }

  const {
    handleClearCache,
    handleSaveProject,
    handleSaveConfig,
    handleLoadProjectFile,
    handleLoadConfigFile,
  } = useSessionPersistence({
    autoProjectStorageKey: AUTO_PROJECT_STORAGE_KEY,
    autoConfigStorageKey: AUTO_CONFIG_STORAGE_KEY,
    projectVersion: PROJECT_FILE_VERSION,
    projectState: {
      appliedGridConfig,
      world,
      userIcons,
      embedIconsInProjectFile,
      activeSubmapId,
      canvasViewStates,
    },
    configState: {
      previewCellsPerFrame,
      uiLanguage: activeUiLanguage,
      westernSidebarNameScale,
      chineseSidebarNameScale,
      activeThemeId,
      fontFamilyOverride,
      altRadialMenuEnabled: isAltRadialMenuEnabled,
      userIcons,
      uiIconInvert,
      leftSidebarWidth,
      rightSidebarWidth,
      floatingTableWidth,
      embedIconsInProjectFile,
      objectEditorPresentation,
      labelAnchorDisplayMode,
      labelDoubleOpenMode,
      cityDoubleOpenMode,
      countryDoubleOpenMode,
      provinceDoubleOpenMode,
      layers,
      countryColumnOrder,
      countryCompactColumns,
      provinceColumnOrder,
      provinceCompactColumns,
      cityColumnOrder,
      cityCompactColumns,
      labelGroupColumnOrder,
      labelGroupCompactColumns,
    },
    configContextState: {
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
    },
    getProjectExportUserIcons,
    projectSnapshotActions: {
      closeTransientUi,
      setAppliedGridConfig,
      setDraftGridConfig,
      setDraftGridColsInput,
      setDraftGridRowsInput,
      setDraftGridHexSizeInput,
      setWorld,
      normalizeWorldDocument,
      setHoveredCellId,
      setActiveCountryId,
      setActiveProvinceId,
      setActiveCityId,
      setActiveLabelId,
      setActiveManagedLabelGroupId,
      setActiveGovernmentTypeId,
      setEditingSubmapId,
      setSubmapDraftName,
      setUserIcons,
      normalizeUserIconDefinitions,
      setActiveSubmapId,
      setCanvasViewStates,
    },
    configSnapshotActions: {
      ui,
      languageOptions,
      normalizeUserIconDefinitions,
      normalizeSidebarNameScale,
      defaultWesternSidebarNameScale: DEFAULT_WESTERN_SIDEBAR_NAME_SCALE,
      defaultChineseSidebarNameScale: DEFAULT_CHINESE_SIDEBAR_NAME_SCALE,
      minRightSidebarWidth: MIN_RIGHT_SIDEBAR_WIDTH,
      migrateLoadedLayers,
      setPreviewCellsPerFrame,
      setActiveUiLanguage,
      setWesternSidebarNameScale,
      setChineseSidebarNameScale,
      setActiveThemeId,
      setFontFamilyOverride,
      setIsAltRadialMenuEnabled,
      setUserIcons,
      setUiIconInvert,
      setLeftSidebarWidth,
      setRightSidebarWidth,
      setFloatingTableWidth,
      setEmbedIconsInProjectFile,
      setObjectEditorPresentation,
      setLabelAnchorDisplayMode,
      setLabelDoubleOpenMode,
      setCityDoubleOpenMode,
      setCountryDoubleOpenMode,
      setProvinceDoubleOpenMode,
      setLayers: (value) => setLayers(value as LayerControl[]),
      setCountryColumnOrder: (value) => setCountryColumnOrder(value as CountryColumnId[]),
      setCountryCompactColumns: (value) => setCountryCompactColumns(value as CountryColumnId[]),
      setProvinceColumnOrder: (value) => setProvinceColumnOrder(value as ProvinceColumnId[]),
      setProvinceCompactColumns: (value) => setProvinceCompactColumns(value as ProvinceColumnId[]),
      setCityColumnOrder: (value) => setCityColumnOrder(value as CityColumnId[]),
      setCityCompactColumns: (value) => setCityCompactColumns(value as CityColumnId[]),
      setLabelGroupColumnOrder: (value) =>
        setLabelGroupColumnOrder(value as LabelGroupCompactColumnId[]),
      setLabelGroupCompactColumns: (value) =>
        setLabelGroupCompactColumns(value as LabelGroupCompactColumnId[]),
    },
    configContextActions: {
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
    },
  })

  const commitWorldNumberDraft = (
    key: keyof typeof worldNumberDrafts,
    fallbackValue: number,
    min: number,
    max: number,
    updater: (nextValue: number) => void,
  ) => {
    const raw = worldNumberDrafts[key]
    const parsed = Number(raw)
    const nextValue = Number.isFinite(parsed) ? clamp(parsed, min, max) : fallbackValue
    updater(nextValue)
    setWorldNumberDrafts((current) => ({
      ...current,
      [key]: String(nextValue),
    }))
  }

  const handleCommitOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const {
    handleUploadIconFile,
    handleRemoveUserIcon,
    handleUpdateUserIconLabel,
    handleUpdateUserIconTags,
    handleRenameUserIconKey,
    handleOpenIconManager,
    handleOpenFontLookupPanel,
    handleRestoreBuiltInIcon,
    handleRevertSelectedIcon,
  } = useIconManagerController({
    state: {
      cityLevelDraftIconKey,
      countryDraftIconKey,
      defaultIconKey,
      iconRegistryEntries,
      iconSourceMap,
      iconUsageCountByKey,
      selectedIconManagerKey,
      userIcons,
      world,
    },
    refs: {
      iconManagerOriginKeyByCurrentRef,
      iconManagerSessionSnapshotRef,
    },
    actions: {
      cloneUserIcons,
      cloneWorldDocument,
      replaceIconReferences,
      restoreSelectedIconReferences,
      setCityLevelDraftIconKey,
      setCountryDraftIconKey,
      setExpandedTableId,
      setIconManagerSearch,
      setIconManagerTagFilter,
      setIsBrandDockOpen,
      setIsConfigDockOpen,
      setIsProjectDockOpen,
      setSelectedIconManagerKey,
      setUserIcons,
      setWorld,
    },
  })

  const {
    clearBrandDockCloseTimer,
    closeBrandDockNow,
    scheduleBrandDockClose,
    handleToggleProjectDock,
    handleToggleConfigDock,
    handleWesternSidebarNameScaleInput,
    handleChineseSidebarNameScaleInput,
    handlePreviewCellsPerFrameInput,
    handleThemeChange,
    handleShowFullMap,
    handleToggleSubmapSelectionMode,
    handleSelectSidebarSubmap,
    handleToggleSidebarPendingSubmapDelete,
    handleToggleSidebarLayerVisibility,
    handleMoveSidebarLayer,
    handleToggleSidebarLabelGroupVisibility,
    handleToggleSidebarLabelGroupLocked,
    handleOpenModeDock,
    handleCloseModeDock,
    handleToggleModeDock,
    activeModeDockLabel,
    handleSelectPoliticalSubModeFromDock,
    brandDockDoubleOpenRows,
  } = useWorkspaceChromeController({
    ui,
    contexts: {
      editorMode: {
        editorMode,
        politicalSubMode,
      },
      activeEntity: {
        setActiveSubmapId,
        setIsSubmapSelectionMode,
      },
    },
    refs: {
      brandDockCloseTimerRef,
    },
    state: {
      labelDoubleOpenMode,
      cityDoubleOpenMode,
      countryDoubleOpenMode,
      provinceDoubleOpenMode,
      worldLabelGroups: world.labelGroups,
    },
    actions: {
      getThemeById,
      handleEditorModeChange,
      handlePoliticalSubModeChange,
      moveLayer: (layers, fromIndex, toIndex) =>
        moveLayer(layers as LayerControl[], fromIndex, toIndex),
      normalizeSidebarNameScale,
      setEditingSubmapId,
      setSubmapDraftName,
      setPendingSubmapDeleteId,
      setLayers: (value) => setLayers(value as LayerControl[]),
      setWorld,
      upsertLabelGroup: (currentWorld, group) =>
        upsertLabelGroup(currentWorld, group as LabelGroup),
      setIsModeDockOpen,
      setIsBrandDockOpen,
      setIsProjectDockOpen,
      setIsConfigDockOpen,
      setWesternSidebarNameScale,
      setChineseSidebarNameScale,
      setPreviewCellsPerFrame,
      setActiveThemeId,
      setUiIconInvert,
      setLabelDoubleOpenMode,
      setCityDoubleOpenMode,
      setCountryDoubleOpenMode,
      setProvinceDoubleOpenMode,
      defaultWesternSidebarNameScale: DEFAULT_WESTERN_SIDEBAR_NAME_SCALE,
      defaultChineseSidebarNameScale: DEFAULT_CHINESE_SIDEBAR_NAME_SCALE,
    },
  })

  const {
    handleCloseCityEditor,
    handleCloseCityLevelEditor,
  } = useCityEditorLifecycleController({
    actions: {
      setIsCityEditorOpen,
      setEditingCityId,
      setPendingCityCellId,
      setCityDraftName,
      setCityDraftSecondName,
      setCityDraftCountryId,
      setCityDraftLevelId,
      setCityDraftDescription,
      setCityAssignedLabelDrafts,
      setIsCityLevelEditorOpen,
      setEditingCityLevelId,
      setCityLevelDraftName,
      setCityLevelDraftRank,
      setCityLevelDraftIconKey,
      setCityLevelDraftIconScalePercent,
      setCityLevelDraftUniquePerCountry,
      setCityLevelDraftDisplayInCountryInfo,
    },
  })

  const isEditingCityLevelInUse = hasCityLevelUsage(world, editingCityLevelId)

  const {
    handleOpenProvinceCapitalCity,
    handleDeleteEditingProvince,
    handleSaveProvinceEditor,
    handleDeleteEditingCountry,
    handleSaveCountryEditor,
    handleDeleteEditingGovernmentType,
    handleSaveGovernmentTypeEditor,
    handleDeleteEditingCityLevel,
    handleSaveCityLevel,
    handleProvinceExistingAssignedLabelToggle,
    handleProvinceDraftAssignedLabelToggle,
    handleCountryAssignedLabelVisibilityToggle,
    handleCountryExistingAssignedLabelToggle,
    handleCountryDraftAssignedLabelToggle,
    handleCityExistingAssignedLabelToggle,
    handleCityDraftAssignedLabelToggle,
  } = useEditorSaveHandlers({
    world,
    setWorld,
    activeProvinceId,
    setActiveProvinceId,
    activeCountryId,
    setActiveCountryId,
    activeGovernmentTypeId,
    setActiveGovernmentTypeId,
    setActiveCityLevelId,
    setActiveLabelId,
    editingProvinceId,
    editingCountryId,
    editingGovernmentTypeId,
    editingCityLevelId,
    editingCityId,
    editingProvince,
    provinceDraftCapitalCityId,
    provinceDraftColor,
    provinceDraftCountryId,
    provinceDraftDescription,
    provinceDraftName,
    provinceAssignedLabelDrafts,
    setProvinceAssignedLabelDrafts,
    provinceAssignedLabelGroups,
    countryDraftBorderColor,
    countryDraftColor,
    countryDraftDescription,
    countryDraftGovernmentTypeId,
    countryDraftIconKey,
    countryDraftIsCityState,
    countryDraftName,
    countryDraftProvinceBorderColor,
    countryDraftProvinceDefaultColor,
    countryDraftSecondName,
    countryAssignedLabelDrafts,
    setCountryAssignedLabelDrafts,
    countryAssignedLabelGroups,
    governmentTypeDraftColor,
    governmentTypeDraftName,
    governmentTypesLength: governmentTypes.length,
    cityLevelDraftDisplayInCountryInfo,
    cityLevelDraftIconKey,
    cityLevelDraftIconScalePercent,
    cityLevelDraftName,
    cityLevelDraftRank,
    cityLevelDraftUniquePerCountry,
    cityLevelsLength: cityLevels.length,
    setCityAssignedLabelDrafts,
    setCityDraftCountryId,
    setCityDraftDescription,
    setCityDraftLevelId,
    setCityDraftName,
    setCityDraftSecondName,
    setEditingCityId,
    setIsCityEditorOpen,
    setPendingCityCellId,
    closeProvinceEditorWithPreviewReset,
    closeCountryEditorWithPreviewReset,
    closeGovernmentTypeEditorWithPreviewReset,
    handleCloseCityLevelEditor,
    requestAssignedLabelRemoval,
    syncDraftDefaultIfNeeded,
    iconSourceMap,
  })

  const editorModeContextValue = useMemo<EditorModeContextValue>(
    () => ({
      editorMode, setEditorMode,
      politicalSubMode, setPoliticalSubMode,
      countryToolMode, setCountryToolMode,
      provinceToolMode, setProvinceToolMode,
      politicalPaintMode, setPoliticalPaintMode,
      restrictProvinceBrushToOwnerCountry, setRestrictProvinceBrushToOwnerCountry,
      cityToolMode, setCityToolMode,
    }),
    [
      editorMode, politicalSubMode, countryToolMode, provinceToolMode,
      politicalPaintMode, restrictProvinceBrushToOwnerCountry, cityToolMode,
    ],
  )

  const terrainBrushContextValue = useMemo<TerrainBrushContextValue>(
    () => ({
      terrainBrushKind, setTerrainBrushKind,
      terrainBrushElevation, setTerrainBrushElevation,
      terrainPaintMode, setTerrainPaintMode,
      terrainDisplayMode, setTerrainDisplayMode,
      brushRadius, setBrushRadius,
    }),
    [terrainBrushKind, terrainBrushElevation, terrainPaintMode, terrainDisplayMode, brushRadius],
  )

  const terrainStyleContextValue = useMemo<TerrainStyleContextValue>(
    () => ({
      terrainLandFillColor, setTerrainLandFillColor,
      terrainWaterFillColor, setTerrainWaterFillColor,
      terrainLandAnchors, setTerrainLandAnchors,
      terrainWaterAnchors, setTerrainWaterAnchors,
      terrainSnowLineElevation, setTerrainSnowLineElevation,
      terrainSnowColor, setTerrainSnowColor,
      showSnowOverride, setShowSnowOverride,
      terrainEmptyFillColor, setTerrainEmptyFillColor,
      terrainLandUnknownFillColor, setTerrainLandUnknownFillColor,
      terrainWaterUnknownFillColor, setTerrainWaterUnknownFillColor,
      terrainWaterDarkFillColor, setTerrainWaterDarkFillColor,
      landEdgeColor, setLandEdgeColor,
      landEdgeWidth, setLandEdgeWidth,
      landEmptyEdgeColor, setLandEmptyEdgeColor,
      landEmptyEdgeWidth, setLandEmptyEdgeWidth,
      coastEdgeColor, setCoastEdgeColor,
      coastEdgeWidth, setCoastEdgeWidth,
      waterEdgeColor, setWaterEdgeColor,
      waterEdgeWidth, setWaterEdgeWidth,
      waterEmptyEdgeColor, setWaterEmptyEdgeColor,
      waterEmptyEdgeWidth, setWaterEmptyEdgeWidth,
      darkWaterEdgeColor, setDarkWaterEdgeColor,
      darkWaterEdgeWidth, setDarkWaterEdgeWidth,
      snowEdgeColor, setSnowEdgeColor,
      snowEdgeWidth, setSnowEdgeWidth,
      snowBoundaryEdgeColor, setSnowBoundaryEdgeColor,
      snowBoundaryEdgeWidth, setSnowBoundaryEdgeWidth,
    }),
    [
      terrainLandFillColor, terrainWaterFillColor, terrainLandAnchors, terrainWaterAnchors,
      terrainSnowLineElevation, terrainSnowColor, showSnowOverride, terrainEmptyFillColor,
      terrainLandUnknownFillColor, terrainWaterUnknownFillColor, terrainWaterDarkFillColor,
      landEdgeColor, landEdgeWidth, landEmptyEdgeColor, landEmptyEdgeWidth,
      coastEdgeColor, coastEdgeWidth, waterEdgeColor, waterEdgeWidth,
      waterEmptyEdgeColor, waterEmptyEdgeWidth, darkWaterEdgeColor, darkWaterEdgeWidth,
      snowEdgeColor, snowEdgeWidth, snowBoundaryEdgeColor, snowBoundaryEdgeWidth,
    ],
  )

  const renderFlagsContextValue = useMemo<RenderFlagsContextValue>(
    () => ({
      showEmptySurface, setShowEmptySurface,
      showLandEmptyEdges, setShowLandEmptyEdges,
      showWaterEmptyEdges, setShowWaterEmptyEdges,
      colorWaterInCountryLayer, setColorWaterInCountryLayer,
    }),
    [showEmptySurface, showLandEmptyEdges, showWaterEmptyEdges, colorWaterInCountryLayer],
  )

  const politicalStyleContextValue = useMemo<PoliticalStyleContextValue>(
    () => ({
      cityStatesFillTerritory, setCityStatesFillTerritory,
      countryFillOpacity, setCountryFillOpacity,
      countryBorderColor, setCountryBorderColor,
      countryBorderWidth, setCountryBorderWidth,
      countryBorderOpacity, setCountryBorderOpacity,
      countrySharedBorderOverridesOwn, setCountrySharedBorderOverridesOwn,
      countrySharedBorderMode, setCountrySharedBorderMode,
      provinceFillOpacity, setProvinceFillOpacity,
      provinceBorderColor, setProvinceBorderColor,
      provinceBorderWidth, setProvinceBorderWidth,
      provinceBorderOpacity, setProvinceBorderOpacity,
      provinceBorderOverridesCountryBorder, setProvinceBorderOverridesCountryBorder,
    }),
    [
      cityStatesFillTerritory, countryFillOpacity, countryBorderColor, countryBorderWidth,
      countryBorderOpacity, countrySharedBorderOverridesOwn, countrySharedBorderMode,
      provinceFillOpacity, provinceBorderColor, provinceBorderWidth, provinceBorderOpacity,
      provinceBorderOverridesCountryBorder,
    ],
  )

  const activeEntityContextValue = useMemo<ActiveEntityContextValue>(
    () => ({
      hoveredCellId, setHoveredCellId,
      activeSubmapId, setActiveSubmapId,
      isSubmapSelectionMode, setIsSubmapSelectionMode,
      activeCountryId, setActiveCountryId,
      activeProvinceId, setActiveProvinceId,
      activeCityId, setActiveCityId,
      activeLabelId, setActiveLabelId,
      activeManagedLabelGroupId, setActiveManagedLabelGroupId,
      activeCityLevelId, setActiveCityLevelId,
      cityBrushLevelId, setCityBrushLevelId,
      activeGovernmentTypeId, setActiveGovernmentTypeId,
    }),
    [
      hoveredCellId, activeSubmapId, isSubmapSelectionMode, activeCountryId, activeProvinceId,
      activeCityId, activeLabelId, activeManagedLabelGroupId, activeCityLevelId,
      cityBrushLevelId, activeGovernmentTypeId,
    ],
  )

  const worldContextValue = useMemo<WorldContextValue>(
    () => ({
      world,
      setWorld,
      userIcons,
      setUserIcons,
      iconRegistryEntries,
      iconSourceMap,
      defaultIconKey,
    }),
    [world, userIcons, iconRegistryEntries, iconSourceMap, defaultIconKey],
  )

  return (
    <UiMessagesContext.Provider value={ui}>
    <WorldContext.Provider value={worldContextValue}>
    <EditorModeContext.Provider value={editorModeContextValue}>
    <TerrainBrushContext.Provider value={terrainBrushContextValue}>
    <TerrainStyleContext.Provider value={terrainStyleContextValue}>
    <RenderFlagsContext.Provider value={renderFlagsContextValue}>
    <PoliticalStyleContext.Provider value={politicalStyleContextValue}>
    <ActiveEntityContext.Provider value={activeEntityContextValue}>
    <div
      className="app-shell"
      data-theme-id={activeTheme.id}
      data-ui-language={activeUiLanguage}
      style={
        {
          '--left-sidebar-width': `${leftSidebarWidth}px`,
          '--right-sidebar-width': `${Math.max(rightSidebarWidth, MIN_RIGHT_SIDEBAR_WIDTH)}px`,
          '--floating-table-width-global': `${floatingTableWidth}px`,
          '--ui-icon-filter': uiIconInvert ? 'brightness(0) invert(1)' : 'none',
          ...sideTableNameColumnVars,
          ...activeThemeVars,
        } as CSSProperties
      }
    >
      <LeftSidebar
        sidebarRef={sidebarRef}
        onStartSidebarResize={() => {
          setActiveSidebarResize('left')
        }}
        brandDockProps={{
          brandDockRef,
          brandDockPopoverRef,
          popoverRect: brandDockPopoverRect,
          isOpen: isBrandDockOpen,
          isProjectOpen: isProjectDockOpen,
          isConfigOpen: isConfigDockOpen,
          isFontLookupOpen: expandedTableId === 'fonts',
          embedIconsInProjectFile,
          activeThemeId,
          fontFamilyOverride,
          activeUiLanguage,
          westernSidebarNameScale,
          chineseSidebarNameScale,
          previewCellsPerFrame,
          uiIconInvert,
          isAltRadialMenuEnabled,
          doubleOpenRows: brandDockDoubleOpenRows,
          onClearCloseTimer: clearBrandDockCloseTimer,
          onOpen: () => {
            setIsBrandDockOpen(true)
          },
          onCloseNow: closeBrandDockNow,
          onScheduleClose: scheduleBrandDockClose,
          onToggleProject: handleToggleProjectDock,
          onToggleConfig: handleToggleConfigDock,
          onOpenFontLookup: handleOpenFontLookupPanel,
          onOpenIconManager: handleOpenIconManager,
          onSaveProject: handleSaveProject,
          onEmbedIconsInProjectFileChange: setEmbedIconsInProjectFile,
          onSaveConfig: handleSaveConfig,
          onThemeChange: handleThemeChange,
          onFontFamilyOverrideChange: setFontFamilyOverride,
          onUiLanguageChange: setActiveUiLanguage,
          onWesternSidebarNameScaleInput: handleWesternSidebarNameScaleInput,
          onChineseSidebarNameScaleInput: handleChineseSidebarNameScaleInput,
          onPreviewCellsPerFrameInput: handlePreviewCellsPerFrameInput,
          onUiIconInvertChange: setUiIconInvert,
          onAltRadialMenuEnabledChange: setIsAltRadialMenuEnabled,
        }}
        projectFileInputRef={projectFileInputRef}
        configFileInputRef={configFileInputRef}
        iconFileInputRef={iconFileInputRef}
        onLoadProjectFile={handleLoadProjectFile}
        onLoadConfigFile={handleLoadConfigFile}
        onUploadIconFile={handleUploadIconFile}
        sidebarToolSectionsProps={{
          isSubmapsExpanded: isSidebarSubmapsExpanded,
          onToggleSubmapsExpanded: () => {
            setIsSidebarSubmapsExpanded((current) => !current)
          },
          submaps,
          submapRowRefs,
          onShowFullMap: handleShowFullMap,
          onToggleSubmapSelectionMode: handleToggleSubmapSelectionMode,
          onSelectSubmap: handleSelectSidebarSubmap,
          onEditSubmap: startEditingSubmap,
          onToggleSubmapDelete: handleToggleSidebarPendingSubmapDelete,
          isLayersExpanded: isSidebarLayersExpanded,
          onToggleLayersExpanded: () => {
            setIsSidebarLayersExpanded((current) => !current)
          },
          layers: layersWithMeta,
          draggedLayerId: draggedSidebarLayerId,
          layerDropTargetId: sidebarLayerDropTargetId,
          onDraggedLayerChange: setDraggedSidebarLayerId,
          onLayerDropTargetChange: setSidebarLayerDropTargetId,
          onToggleLayerVisibility: handleToggleSidebarLayerVisibility,
          onMoveLayer: handleMoveSidebarLayer,
          isLabelGroupsExpanded: isSidebarLabelsExpanded,
          onToggleLabelGroupsExpanded: () => {
            setIsSidebarLabelsExpanded((current) => !current)
          },
          labelGroups,
          labelCountByGroupId,
          draggedLabelGroupId: draggedSidebarLabelGroupId,
          labelGroupDropTargetId: sidebarLabelGroupDropTargetId,
          onDraggedLabelGroupChange: setDraggedSidebarLabelGroupId,
          onLabelGroupDropTargetChange: setSidebarLabelGroupDropTargetId,
          onToggleLabelGroupVisibility: handleToggleSidebarLabelGroupVisibility,
          onToggleLabelGroupLocked: handleToggleSidebarLabelGroupLocked,
          onMoveLabelGroup: reorderLabelGroups,
          suppressSidebarRowClickRef,
        }}
      />

      <MainWorkspace
        isAltShortcutOverlayOpen={isAltShortcutOverlayOpen}
        shortcutHintSections={shortcutHintSections}
        isAltRadialMenuEnabled={isAltRadialMenuEnabled}
        isAltRadialSuppressed={isAltRadialSuppressed}
        altMouseStackedMenuPosition={altMouseStackedMenuPosition}
        altMouseStackedMenuLayout={altMouseStackedMenuLayout}
        altRadialItemById={altRadialItemById}
        isWesternUiLanguage={isWesternUiLanguage}
        isRootSplitMouseStackedMenu={isRootSplitMouseStackedMenu}
        onAltRadialModeClick={() => {
          setAltRadialMenuInPlace('switch-mode')
        }}
        onAltRadialBackClick={() => {
          setAltRadialMenuInPlace('root')
        }}
        onAltRadialItemClick={(itemId) => {
          handleAltRadialAction(itemId)
        }}
        canvasKey={`${baseSetup.canvasKey}-${activeCanvasViewKey}`}
        canvasProps={{
          grid: baseSetup.grid,
          cells: baseSetup.world.cells,
          countries: displayCountriesById,
          cities: baseSetup.world.cities,
          cityLevels: baseSetup.world.cityLevels,
          iconSourceMap,
          provinces: displayProvincesById,
          labelGroups: baseSetup.world.labelGroups,
          labels: baseSetup.world.labels,
          worldMetadata: displayWorldMetadata,
          worldFrame: displayWorldFrame,
          worldAxes: baseSetup.world.axes,
          labelAnchorDisplayMode,
          cellSurfaces: baseSetup.world.cellSurfaces,
          countryAssignments: baseSetup.world.countryAssignments,
          provinceAssignments: baseSetup.world.provinceAssignments,
          politicalColorMode: 'country',
          politicalStyle: politicalCanvasStyle,
          terrainStyle: terrainCanvasStyle,
          colorWaterInCountryLayer,
          cityStatesFillTerritory,
          layers: layersWithMeta,
          visibleCellIds: activeSubmapCellIdSet,
          interactiveCellIds: activeSubmapCellIdSet,
          selectedLabelId: activeLabelId,
          hoveredCellId,
          onHoverCell: setHoveredCellId,
          onSelectLabel: setActiveLabelId,
          onDoubleActivate: handleCanvasDoubleActivate,
          onMoveLabel: (labelId, deltaX, deltaY) => {
            setWorld((current) => nudgeLabelAnchor(current, labelId, deltaX, deltaY))
          },
          onCellInteract: handleCellInteract,
          onCellsInteractBatch: handleCellsInteractBatch,
          getCellInteractionPreview,
          onInteractionEnd: handleInteractionEnd,
          brushRadius: isBrushRadiusActive ? brushRadius : 0,
          previewCellsPerFrame,
          selectionMode: isSubmapSelectionMode ? 'submap_rect' : isMoveSelectionMode ? 'move_rect' : 'none',
          onSelectionComplete: isSubmapSelectionMode
            ? handleSubmapSelectionComplete
            : isMoveSelectionMode
              ? handleMoveSelectionComplete
              : undefined,
          moveSourceCellIds: editorMode === 'move' ? moveSourceCellIds : [],
          movePreviewCellIds: editorMode === 'move' ? movePreviewCellIds : [],
          moveBlockedCellIds: editorMode === 'move' ? moveBlockedCellIds : [],
          movePreviewStyles: editorMode === 'move' ? movePreviewStyles : {},
          paintHistoryRevision,
          selectionVisibleCellIds:
            editorMode === 'move' && !moveSelectionRestrictToView ? null : activeSubmapCellIdSet,
          initialViewState: canvasViewStates[activeCanvasViewKey] ?? null,
          onViewStateChange: (viewState) => {
            setCanvasViewStates((current) => {
              const previous = current[activeCanvasViewKey]

              if (
                previous &&
                previous.baseScale === viewState.baseScale &&
                previous.zoom === viewState.zoom &&
                previous.positionX === viewState.positionX &&
                previous.positionY === viewState.positionY
              ) {
                return current
              }

              return {
                ...current,
                [activeCanvasViewKey]: viewState,
              }
            })
          },
        }}
        gridCols={baseSetup.grid.cols}
        gridRows={baseSetup.grid.rows}
        visibleCellCount={visibleCellCount}
        hoveredCell={hoveredCell}
        activeCountry={activeCountry}
        terrainPaintMode={terrainPaintMode}
        surfaceBrush={surfaceBrush}
        brushRadiusText={brushRadiusText}
        politicalToolText={politicalToolText}
        politicalPaintModeText={politicalPaintModeText}
        moveToolText={moveToolText}
        ui={ui}
      />

      {effectiveObjectEditorPresentation === 'sidecar' && isAnyObjectEditorOpen && (
        <button
          className={`editor-sidecar-dismiss-scrim${objectEditorSidecarAnchor === 'expanded-table' ? ' is-expanded-table-anchor' : ''}`}
          type="button"
          aria-label={ui.common.close}
          onClick={() => {
            closeObjectEditors()
          }}
        />
      )}
      <div id={APP_FLOATING_PORTAL_ROOT_ID} className="app-floating-portal-root" />

      {editingSubmap && (
        <EditorChrome
          presentation="sidecar"
          sidecarAnchor="left-sidebar"
          cardOffsetTop={submapEditorCardOffsetTop}
          shellLeft={submapEditorLeft}
          closeZoneLabel={ui.common.closeEditor}
          onClose={discardSubmapDraft}
        >
          <SubmapEditorForm
            title={`${ui.common.edit} ${ui.common.submaps}`}
            name={submapDraftName}
            subtitle={submapDraftSubtitle}
            useWorldTitlePrefix={submapDraftUseWorldTitlePrefix}
            useDefaultStyle={submapDraftUseDefaultStyle}
            titleFontSize={submapDraftTitleFontSize}
            subtitleFontSize={submapDraftSubtitleFontSize}
            bylineFontSize={submapDraftBylineFontSize}
            pageMarginTop={submapDraftPageMarginTop}
            titleGap={submapDraftTitleGap}
            byGap={submapDraftByGap}
            frameTop={submapDraftFrameTop}
            frameRight={submapDraftFrameRight}
            frameBottom={submapDraftFrameBottom}
            frameLeft={submapDraftFrameLeft}
            frameColor={submapDraftFrameColor}
            frameColorFallback={world.submapStyle.frameColor}
            onClose={discardSubmapDraft}
            onNameChange={setSubmapDraftName}
            onSubtitleChange={setSubmapDraftSubtitle}
            onUseWorldTitlePrefixChange={(checked) => {
              setSubmapDraftUseWorldTitlePrefix(checked)
              setWorld((current) => {
                const currentSubmap = current.submaps[editingSubmapId ?? '']
                if (!currentSubmap) {
                  return current
                }
                return upsertSubmap(current, {
                  ...currentSubmap,
                  useWorldTitlePrefix: checked,
                })
              })
            }}
            onUseDefaultStyleChange={(checked) => {
              setSubmapDraftUseDefaultStyle(checked)
              setWorld((current) => {
                const currentSubmap = current.submaps[editingSubmapId ?? '']
                if (!currentSubmap) {
                  return current
                }

                return upsertSubmap(current, {
                  ...currentSubmap,
                  useDefaultStyle: checked,
                  pageMarginTop: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftPageMarginTop,
                        current.submapStyle.pageMarginTop,
                        0,
                        160,
                      ),
                  frameTop: checked
                    ? undefined
                    : sanitizeGridValue(submapDraftFrameTop, current.submapStyle.frameTop, 0, 512),
                  frameRight: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftFrameRight,
                        current.submapStyle.frameRight,
                        0,
                        512,
                      ),
                  frameBottom: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftFrameBottom,
                        current.submapStyle.frameBottom,
                        0,
                        512,
                      ),
                  frameLeft: checked
                    ? undefined
                    : sanitizeGridValue(submapDraftFrameLeft, current.submapStyle.frameLeft, 0, 512),
                  frameColor: checked
                    ? undefined
                    : submapDraftFrameColor || current.submapStyle.frameColor,
                  titleFontSize: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftTitleFontSize,
                        current.submapStyle.titleFontSize,
                        8,
                        320,
                      ),
                  subtitleFontSize: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftSubtitleFontSize,
                        current.submapStyle.subtitleFontSize,
                        8,
                        240,
                      ),
                  bylineFontSize: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftBylineFontSize,
                        current.submapStyle.bylineFontSize,
                        8,
                        180,
                      ),
                  titleSubtitleGap: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftTitleGap,
                        current.submapStyle.titleSubtitleGap,
                        0,
                        48,
                      ),
                  subtitleBylineGap: checked
                    ? undefined
                    : sanitizeGridValue(
                        submapDraftByGap,
                        current.submapStyle.subtitleBylineGap,
                        0,
                        48,
                      ),
                })
              })
            }}
            onTitleFontSizeChange={setSubmapDraftTitleFontSize}
            onSubtitleFontSizeChange={setSubmapDraftSubtitleFontSize}
            onBylineFontSizeChange={setSubmapDraftBylineFontSize}
            onPageMarginTopChange={setSubmapDraftPageMarginTop}
            onTitleGapChange={setSubmapDraftTitleGap}
            onByGapChange={setSubmapDraftByGap}
            onFrameTopChange={setSubmapDraftFrameTop}
            onFrameRightChange={setSubmapDraftFrameRight}
            onFrameBottomChange={setSubmapDraftFrameBottom}
            onFrameLeftChange={setSubmapDraftFrameLeft}
            onFrameColorApply={(value) => {
              setSubmapDraftFrameColor(value)
              applySubmapDraft({ frameColor: value })
            }}
            onCommitDraft={() => {
              applySubmapDraft()
            }}
            onCommitOnEnter={handleCommitOnEnter}
            onDelete={() => {
              handleDeleteSubmap(editingSubmap.id)
            }}
            onSave={handleSaveSubmap}
          />
        </EditorChrome>
      )}

      {pendingSubmapDeleteId && submapConfirmPosition && (
        <SubmapFloatingConfirm
          top={submapConfirmPosition.top}
          left={submapConfirmPosition.left}
          onConfirm={() => {
            handleDeleteSubmap(pendingSubmapDeleteId)
          }}
          onCancel={() => {
            setPendingSubmapDeleteId(null)
          }}
        />
      )}

      <SidebarDeleteConfirmation
        confirmation={pendingSidebarDeleteConfirmation}
        onClose={closeSidebarDeleteConfirmation}
      />

      <FloatingPanels
        expandedTableId={expandedTableId}
        floatingTableWidth={floatingTableWidth}
        onResizeStart={() => {
          setActiveSidebarResize('floating-table')
        }}
        onCloseExpandedTable={closeExpandedTable}
        filteredCities={filteredCities}
        totalCitiesCount={cities.length}
        cityProvinceNameById={cityProvinceNameById}
        cityProvinceIdById={cityProvinceIdById}
        cityColumnOrder={cityColumnOrder}
        setCityColumnOrder={setCityColumnOrder}
        cityCompactColumns={cityCompactColumns}
        setCityCompactColumns={setCityCompactColumns}
        effectiveCityCountryFilter={effectiveCityCountryFilter}
        effectiveCityProvinceFilter={effectiveCityProvinceFilter}
        effectiveCityLevelFilter={effectiveCityLevelFilter}
        citySortKey={citySortKey}
        citySortDirection={citySortDirection}
        cityTypeSortMode={cityTypeSortMode}
        expandedCitiesSearch={expandedCitiesSearch}
        setExpandedCitiesSearch={setExpandedCitiesSearch}
        setCityCountryFilter={setCityCountryFilter}
        setCityProvinceFilter={setCityProvinceFilter}
        setCityLevelFilter={setCityLevelFilter}
        onCitySortChange={handleCitySortChange}
        onSelectCity={setActiveCityId}
        onEditCity={openCityEditorFromExpandedTable}
        filteredCountries={filteredCountries}
        totalCountriesCount={countries.length}
        governmentTypesById={displayGovernmentTypesById}
        effectiveCountryGovernmentTypeFilter={effectiveCountryGovernmentTypeFilter}
        countryAssignmentCountById={countryAssignmentCountById}
        countryProvinceCountById={countryProvinceCountById}
        countrySortKey={countrySortKey}
        countrySortDirection={countrySortDirection}
        expandedCountriesSearch={expandedCountriesSearch}
        setExpandedCountriesSearch={setExpandedCountriesSearch}
        countryColumnOrder={countryColumnOrder}
        setCountryColumnOrder={setCountryColumnOrder}
        countryCompactColumns={countryCompactColumns}
        setCountryCompactColumns={setCountryCompactColumns}
        setCountryGovernmentTypeFilter={setCountryGovernmentTypeFilter}
        onCountrySortChange={handleCountrySortChange}
        onSelectCountry={setActiveCountryId}
        onEditCountry={openCountryEditorFromExpandedTable}
        filteredProvinces={filteredProvinces}
        totalProvincesCount={provinces.length}
        displayCountriesById={displayCountriesById}
        provinceSortKey={provinceSortKey}
        provinceSortDirection={provinceSortDirection}
        effectiveProvinceCountryFilter={effectiveProvinceCountryFilter}
        expandedProvincesSearch={expandedProvincesSearch}
        setExpandedProvincesSearch={setExpandedProvincesSearch}
        provinceColumnOrder={provinceColumnOrder}
        setProvinceColumnOrder={setProvinceColumnOrder}
        provinceCompactColumns={provinceCompactColumns}
        setProvinceCompactColumns={setProvinceCompactColumns}
        setProvinceCountryFilter={setProvinceCountryFilter}
        onProvinceSortChange={handleProvinceSortChange}
        onSelectProvince={setActiveProvinceId}
        onEditProvince={openProvinceEditorFromExpandedTable}
        labelGroups={labelGroups}
        labelCountByGroupId={labelCountByGroupId}
        expandedLabelGroupsSearch={expandedLabelGroupsSearch}
        setExpandedLabelGroupsSearch={setExpandedLabelGroupsSearch}
        labelGroupColumnOrder={labelGroupColumnOrder}
        setLabelGroupColumnOrder={setLabelGroupColumnOrder}
        labelGroupCompactColumns={labelGroupCompactColumns}
        setLabelGroupCompactColumns={setLabelGroupCompactColumns}
        onSelectLabelGroup={setActiveManagedLabelGroupId}
        onEditLabelGroup={openLabelGroupEditorFromExpandedTable}
        expandedLabelRows={expandedLabelRows}
        displayLabelGroupsById={displayLabelGroupsById}
        labelGroupFilter={labelGroupFilter}
        setLabelGroupFilter={setLabelGroupFilter}
        expandedLabelsSearch={expandedLabelsSearch}
        setExpandedLabelsSearch={setExpandedLabelsSearch}
        onSelectLabel={setActiveLabelId}
        onEditLabel={openLabelEditorFromExpandedTable}
        localFontLookupStatus={localFontLookupStatus}
        filteredLocalFontLookupEntries={filteredLocalFontLookupEntries}
        localFontLookupEntryCount={localFontLookupEntries.length}
        localFontLookupFilter={localFontLookupFilter}
        localFontLookupStatusText={localFontLookupStatusText}
        localFontCopyError={localFontCopyError}
        recentlyCopiedFontFamily={recentlyCopiedFontFamily}
        onLocalFontClose={closeExpandedTable}
        onLocalFontQuery={() => {
          void handleQueryLocalFonts()
        }}
        onLocalFontRescan={() => {
          void handleRescanLocalFonts()
        }}
        onLocalFontFilterChange={setLocalFontLookupFilter}
        onLocalFontCopy={(fontFamily) => {
          void handleCopyFontFamily(fontFamily)
        }}
        iconManagerWidth={iconManagerWidth}
        iconManagerHeight={iconManagerHeight}
        onIconManagerClose={closeExpandedTable}
        onIconManagerResizeWidthStart={() => {
          setActiveSidebarResize('icon-manager-width')
        }}
        onIconManagerResizeHeightStart={() => {
          setActiveSidebarResize('icon-manager-height')
        }}
        iconManagerEntries={filteredIconManagerEntries}
        selectedIconManagerKey={selectedIconManagerKey}
        iconUsageCountByKey={iconUsageCountByKey}
        iconManagerSearch={iconManagerSearch}
        iconManagerTagFilter={iconManagerTagFilter}
        iconManagerSortMode={iconManagerSortMode}
        iconManagerTags={iconManagerTags}
        onIconManagerSearchChange={setIconManagerSearch}
        onIconManagerSelectTag={setIconManagerTagFilter}
        onIconManagerChangeSortMode={setIconManagerSortMode}
        onIconManagerSelectIcon={setSelectedIconManagerKey}
        onIconManagerUpload={() => {
          iconFileInputRef.current?.click()
        }}
        onIconManagerRenameKey={handleRenameUserIconKey}
        onIconManagerUpdateLabel={handleUpdateUserIconLabel}
        onIconManagerUpdateTags={handleUpdateUserIconTags}
        onIconManagerRestoreBuiltIn={handleRestoreBuiltInIcon}
        onIconManagerRevert={handleRevertSelectedIcon}
        onIconManagerRemove={handleRemoveUserIcon}
      />

      <RightInspector
        onStartRightSidebarResize={() => {
          setActiveSidebarResize('right')
        }}
        isModeDockOpen={isModeDockOpen}
        activeModeDockLabel={activeModeDockLabel}
        politicalSubModes={politicalSubModes}
        onOpenModeDock={handleOpenModeDock}
        onCloseModeDock={handleCloseModeDock}
        onToggleModeDock={handleToggleModeDock}
        onEditorModeChangeWorld={() => {
          handleEditorModeChange('world')
        }}
        onEditorModeChangeSurface={() => {
          handleEditorModeChange('surface')
        }}
        onSelectPoliticalSubModeFromDock={handleSelectPoliticalSubModeFromDock}
        onEditorModeChangeLabel={() => {
          handleEditorModeChange('label')
        }}
        onEditorModeChangeMove={() => {
          handleEditorModeChange('move')
        }}
        worldModeProps={{
          appliedGridConfig,
          infoExpanded: isWorldInfoExpanded,
          setInfoExpanded: setIsWorldInfoExpanded,
          styleExpanded: isWorldStyleExpanded,
          setStyleExpanded: setIsWorldStyleExpanded,
          gridExpanded: isWorldGridExpanded,
          setGridExpanded: setIsWorldGridExpanded,
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
          onClearPoliticalInteraction: clearPoliticalInteraction,
          onCloseCityEditor: handleCloseCityEditor,
          onCloseCityLevelEditor: handleCloseCityLevelEditor,
          onCloseTransientUi: closeTransientUi,
          onCommitDraftGridConfig: commitDraftGridConfig,
          setEditingSubmapSnapshot,
          setSubmapDraftSubtitle,
          setSubmapDraftFrameColor,
          onCommitOnEnter: handleCommitOnEnter,
          worldNumberDrafts,
          setWorldNumberDrafts,
          onCommitWorldNumberDraft: commitWorldNumberDraft,
        }}
        surfaceModeProps={{
          isTerrainDisplayExpanded,
          setIsTerrainDisplayExpanded,
          isTerrainPaintExpanded,
          setIsTerrainPaintExpanded,
          isTerrainBaseStyleExpanded,
          setIsTerrainBaseStyleExpanded,
          isTerrainTopographyExpanded,
          setIsTerrainTopographyExpanded,
        }}
        moveModeProps={{
          moveOperation,
          setMoveOperation,
          movePayload,
          setMovePayload,
          moveVacatedKind,
          setMoveVacatedKind,
          moveVacatedElevation,
          setMoveVacatedElevation,
          moveCities,
          setMoveCities,
          labelGroups,
          moveLabelGroups,
          setMoveLabelGroups,
          isMoveSelectionMode,
          setIsMoveSelectionMode,
          onClearMoveSelection: clearMoveSelection,
          moveSelectionRestrictToView,
          setMoveSelectionRestrictToView,
          moveRequireConfirm,
          setMoveRequireConfirm,
          setPendingMoveTargetCellId,
          moveSourceCellIds,
          movePreviewCellIds,
          moveBlockedCellIds,
          moveSourceAnchorCell,
          effectiveMoveTargetCell,
          moveDeltaGrid,
          onApplyMoveOperation: applyMoveOperation,
        }}
        countryModeProps={{
          governmentTypesSection: {
            isSectionExpanded: isGovernmentTypesSectionExpanded,
            setIsSectionExpanded: setIsGovernmentTypesSectionExpanded,
            governmentTypes,
            activeGovernmentTypeUsageCount,
            isInfoExpanded: isGovernmentTypeInfoExpanded,
            setIsInfoExpanded: setIsGovernmentTypeInfoExpanded,
            isListExpanded: isGovernmentTypeListExpanded,
            setIsListExpanded: setIsGovernmentTypeListExpanded,
            editingGovernmentTypeId,
            worldGovernmentTypes: world.governmentTypes,
            setWorld,
            closeObjectEditors: closeObjectEditorsProxy,
            closeGovernmentTypeEditorWithPreviewReset:
              closeGovernmentTypeEditorWithPreviewResetProxy,
            openSidebarDeleteConfirmation,
            setIsGovernmentTypeEditorOpen,
            setEditingGovernmentTypeId,
            setGovernmentTypeDraftName,
            setGovernmentTypeDraftColor,
          },
          countrySection: {
            isSectionExpanded: isCountrySectionExpanded,
            setIsSectionExpanded: setIsCountrySectionExpanded,
            onCacheWorkspace: cachePoliticalWorkspaceSnapshot,
            onRestoreWorkspace: restoreCountrySectionWorkspaceProxy,
            activeCountry,
            activeCountryAssignmentCount,
            isInfoExpanded: isCountryInfoExpanded,
            setIsInfoExpanded: setIsCountryInfoExpanded,
            filteredCountries,
            iconSourceMap,
            governmentTypes: displayGovernmentTypesById,
            countryColumnOrder,
            countryCompactColumns,
            effectiveGovernmentTypeFilter: effectiveCountryGovernmentTypeFilter,
            countrySortKey,
            countrySortDirection,
            isListExpanded: isCountryListExpanded,
            setIsListExpanded: setIsCountryListExpanded,
            setBrushRadius,
            paintableCountries,
            onChangeSort: handleCountrySortChange,
            setCountryGovernmentTypeFilter,
            closeObjectEditors: closeObjectEditorsProxy,
            countries,
            setIsCountryEditorOpen,
            editingCountryId,
            setEditingCountryId,
            setCountryDraftName,
            setCountryDraftSecondName,
            setCountryDraftIconKey,
            setCountryDraftColor,
            setCountryDraftBorderColor,
            setCountryDraftProvinceDefaultColor,
            setCountryDraftProvinceBorderColor,
            setCountryDraftGovernmentTypeId,
            setCountryDraftIsCityState,
            setCountryDraftDescription,
            setCountryAssignedLabelDrafts,
            getCountryAssignedLabelGroups: () => countryAssignedLabelGroups,
            setWorld,
            openSidebarDeleteConfirmation,
            closeCountryEditorWithPreviewReset:
              closeCountryEditorWithPreviewResetProxy,
            onOpenExpandedTable: () => {
              setExpandedTableId('countries')
            },
            onResetToolMode: resetCountrySection,
            activeCountryProvinceCount,
            cities,
            worldCityLevels: world.cityLevels,
          },
          countryStyleSection: {
            isSectionExpanded: isCountryStyleSectionExpanded,
            setIsSectionExpanded: setIsCountryStyleSectionExpanded,
          },
          helpers: {
            pickNextColor,
            applyCountryDraftDerivedColors,
            getAssignedLabelDrafts,
            openGovernmentTypeEditor,
            openCountryEditor,
          },
        }}
        provinceModeProps={{
          provinceStyleSection: {
            isSectionExpanded: isCountryStyleSectionExpanded,
            setIsSectionExpanded: setIsCountryStyleSectionExpanded,
          },
          provinceSection: {
            activeProvince,
            activeProvinceCellCount,
            activeProvinceCapital,
            isInfoExpanded: isProvinceInfoExpanded,
            setIsInfoExpanded: setIsProvinceInfoExpanded,
            provinces: sortedProvinces,
            countries: displayCountriesById,
            cities: world.cities,
            provinceColumnOrder,
            provinceCompactColumns,
            provinceSortKey,
            provinceSortDirection,
            isListExpanded: isProvinceListExpanded,
            setIsListExpanded: setIsProvinceListExpanded,
            setBrushRadius,
            onChangeSort: handleProvinceSortChange,
            closeObjectEditors: closeObjectEditorsProxy,
            setIsProvinceEditorOpen,
            setEditingProvinceId,
            setProvinceDraftName,
            getCountryProvinceDefaultColor,
            activeCountryId,
            setProvinceDraftColor,
            setProvinceDraftCountryId,
            setProvinceDraftCapitalCityId,
            setProvinceDraftDescription,
            setProvinceAssignedLabelDrafts,
            getProvinceAssignedLabelGroups: () => provinceAssignedLabelGroups,
            setWorld,
            openSidebarDeleteConfirmation,
            onOpenExpandedTable: () => {
              setExpandedTableId('provinces')
            },
          },
          helpers: {
            getAssignedLabelDrafts,
          },
        }}
        cityModeProps={{
          cityStyleSection: {
            isSectionExpanded: isCityStyleSectionExpanded,
            setIsSectionExpanded: setIsCityStyleSectionExpanded,
          },
          cityLevelsSection: {
            isSectionExpanded: expandedCityToolSections.city_levels,
            onToggleSection: () => {
              handleCityToolSectionToggle('city_levels')
            },
            activeCityLevel,
            activeCityLevelUsageCount,
            iconSourceMap,
            isInfoExpanded: isCityLevelInfoExpanded,
            setIsInfoExpanded: setIsCityLevelInfoExpanded,
            sortedCityLevels,
            cityLevelSortKey,
            cityLevelSortDirection,
            isListExpanded: isCityLevelListExpanded,
            setIsListExpanded: setIsCityLevelListExpanded,
            onChangeSort: handleCityLevelSortChange,
            onSetCityToolMode: handleSetCityToolMode,
            closeObjectEditors: closeObjectEditorsProxy,
            defaultIconKey,
            setIsCityLevelEditorOpen,
            setEditingCityLevelId,
            setCityLevelDraftName,
            setCityLevelDraftRank,
            setCityLevelDraftIconKey,
            setCityLevelDraftIconScalePercent,
            setCityLevelDraftUniquePerCountry,
            setCityLevelDraftDisplayInCountryInfo,
            openSidebarDeleteConfirmation,
            setWorld,
          },
          cityAutomationSection: {
            isSectionExpanded: expandedCityToolSections.city_automation,
            onToggleSection: () => {
              handleCityToolSectionToggle('city_automation')
            },
            assignedLabelGroups: cityAssignedLabelGroups,
            onChangeAutoCreateMode: (groupId, mode) => {
              updateAssignedLabelGroupAssignment(groupId, (assignment) => ({
                ...assignment,
                autoCreateMode: mode,
              }))
            },
            onChangeAutoCreateDefault: (groupId, value) => {
              updateAssignedLabelGroupAssignment(groupId, (assignment) => ({
                ...assignment,
                autoCreateDefault: value,
              }))
            },
            onChangeConfirmOnRemove: (groupId, value) => {
              updateAssignedLabelGroupAssignment(groupId, (assignment) => ({
                ...assignment,
                confirmOnRemove: value,
              }))
            },
          },
          citiesSection: {
            isSectionExpanded: expandedCityToolSections.city_management,
            onToggleSection: () => {
              handleCityToolSectionToggle('city_management')
            },
            worldCityLevels: world.cityLevels,
            iconSourceMap,
            countries: world.countries,
            provinces: world.provinces,
            cityProvinceIdById,
            cityProvinceNameById,
            cityColumnOrder,
            cityCompactColumns,
            activeCityProvinceName: activeCityProvince?.name ?? null,
            activeCity,
            isInfoExpanded: isCityInfoExpanded,
            setIsInfoExpanded: setIsCityInfoExpanded,
            filteredCities,
            effectiveCityCountryFilter,
            effectiveCityProvinceFilter,
            effectiveCityLevelFilter,
            citySortKey,
            citySortDirection,
            cityTypeSortMode,
            isListExpanded: isCityListExpanded,
            setIsListExpanded: setIsCityListExpanded,
            onSetCityToolMode: handleSetCityToolMode,
            setCityCountryFilter,
            setCityProvinceFilter,
            setCityLevelFilter,
            onChangeSort: handleCitySortChange,
            closeObjectEditors: closeObjectEditorsProxy,
            openSidebarDeleteConfirmation,
            setWorld,
            onOpenExpandedTable: () => {
              setExpandedTableId('cities')
            },
            setIsCityEditorOpen,
            setEditingCityId,
            setPendingCityCellId,
            setCityDraftName,
            setCityDraftSecondName,
            setCityDraftCountryId,
            setCityDraftLevelId,
            setCityDraftDescription,
            setCityAssignedLabelDrafts,
          },
          helpers: {
            openCityLevelEditor,
            openCityEditor,
          },
        }}
        labelModeProps={{
          isLabelGroupsSectionExpanded,
          setIsLabelGroupsSectionExpanded,
          isLabelGroupInfoExpanded,
          setIsLabelGroupInfoExpanded,
          activeManagedLabelGroup,
          labelCountByGroupId,
          describeAssignedLabelGroup,
          createAndEditLabelGroup,
          openLabelGroupEditor,
          openSidebarDeleteConfirmation,
          onOpenLabelGroupsFullTable: () => {
            setExpandedTableId('label-groups')
          },
          isLabelGroupsListExpanded,
          setIsLabelGroupsListExpanded,
          labelGroups,
          labelGroupColumnOrder,
          labelGroupCompactColumns,
          isLabelsSectionExpanded,
          setIsLabelsSectionExpanded,
          isLabelInfoExpanded,
          setIsLabelInfoExpanded,
          activeLabel,
          activeLabelText,
          activeLabelGroup,
          describeLabelAnchor,
          openLabelEditor,
          labelAnchorDisplayMode,
          setLabelAnchorDisplayMode,
          canCreateCityNameLabel: Boolean(activeCity),
          canCreateCountryNameLabel: Boolean(activeCountry),
          canCreateProvinceNameLabel: Boolean(activeProvince),
          canCreateCountryIconLabel: Boolean(activeCountry),
          onCreateCityNameLabel: createOrSelectCityLabel,
          onCreateCountryNameLabel: createOrSelectCountryLabel,
          onCreateProvinceNameLabel: createOrSelectProvinceLabel,
          onCreateCountryIconLabel: createOrSelectCountryIconLabel,
          onCreateFreeLabel: createNewFreeLabel,
          onOpenTextLabelsFullTable: () => {
            setExpandedTableId('text-labels')
          },
          onOpenIconLabelsFullTable: () => {
            setExpandedTableId('icon-labels')
          },
          isLabelsListExpanded,
          setIsLabelsListExpanded,
          labelGroupFilter,
          setLabelGroupFilter,
          filteredLabels,
          splitFilteredLabels,
          worldLabelGroups: displayLabelGroupsById,
        }}
        isDebugSectionExpanded={isDebugSectionExpanded}
        onToggleDebugSection={() => {
          setIsDebugSectionExpanded((current) => !current)
        }}
        hoveredCellText={hoveredCellText}
        hoveredDetailsText={hoveredDetailsText}
        hoveredSurfaceText={hoveredSurfaceText}
        politicalToolText={politicalToolText}
        cityBrushText={cityBrushText}
        recentPaintActionItems={recentPaintActionItems}
        onClearCache={handleClearCache}
      />

      <ObjectEditorLayer
        effectiveObjectEditorPresentation={effectiveObjectEditorPresentation}
        objectEditorSidecarAnchor={objectEditorSidecarAnchor}
        activeThemeId={activeTheme.id}
        world={world}
        isLabelGroupEditorOpen={isLabelGroupEditorOpen}
        editingLabelManagedGroup={editingLabelManagedGroup}
        labelGroupEditorOpenSnapshotRef={labelGroupEditorOpenSnapshotRef}
        labelCountByGroupId={labelCountByGroupId}
        describeAssignedLabelGroup={describeAssignedLabelGroup}
        handleCloseLabelGroupEditor={handleCloseLabelGroupEditor}
        handleDeleteEditingLabelGroup={handleDeleteEditingLabelGroup}
        isLabelEditorOpen={isLabelEditorOpen}
        editingLabel={editingLabel}
        editingLabelGroup={editingLabelGroup}
        labelGroups={labelGroups}
        sortedCountries={sortedCountries}
        sortedProvinces={sortedProvinces}
        sortedCities={sortedCities}
        activeCityId={activeCityId}
        activeCountryId={activeCountryId}
        activeProvinceId={activeProvinceId}
        activeCanvasZoom={activeCanvasZoom}
        editingAssignedLabelCountryFilter={editingAssignedLabelCountryFilter}
        setEditingAssignedLabelCountryFilter={setEditingAssignedLabelCountryFilter}
        labelEditorOpenSnapshotRef={labelEditorOpenSnapshotRef}
        handleCloseLabelEditor={handleCloseLabelEditor}
        handleDeleteEditingLabel={handleDeleteEditingLabel}
        isProvinceEditorOpen={isProvinceEditorOpen}
        editingProvinceId={editingProvinceId}
        editingProvince={editingProvince}
        provinceDraftName={provinceDraftName}
        provinceDraftCountryId={provinceDraftCountryId}
        provinceDraftCapitalCityId={provinceDraftCapitalCityId}
        provinceDraftColor={provinceDraftColor}
        provinceDraftDescription={provinceDraftDescription}
        provinceCapitalCandidates={provinceCapitalCandidates}
        provinceAssignedLabelGroups={provinceAssignedLabelGroups}
        provinceAssignedLabelDrafts={provinceAssignedLabelDrafts}
        closeProvinceEditorWithPreviewReset={closeProvinceEditorWithPreviewReset}
        setProvinceDraftName={setProvinceDraftName}
        setProvinceDraftCountryId={setProvinceDraftCountryId}
        setProvinceDraftCapitalCityId={setProvinceDraftCapitalCityId}
        setProvinceDraftColor={setProvinceDraftColor}
        setProvincePreviewColor={setProvincePreviewColor}
        setProvinceDraftDescription={setProvinceDraftDescription}
        getCountryProvinceDefaultColor={getCountryProvinceDefaultColor}
        handleProvinceExistingAssignedLabelToggle={handleProvinceExistingAssignedLabelToggle}
        handleProvinceDraftAssignedLabelToggle={handleProvinceDraftAssignedLabelToggle}
        handleOpenProvinceCapitalCity={handleOpenProvinceCapitalCity}
        handleDeleteEditingProvince={handleDeleteEditingProvince}
        handleSaveProvinceEditor={handleSaveProvinceEditor}
        isCountryEditorOpen={isCountryEditorOpen}
        editingCountryId={editingCountryId}
        countryDraftName={countryDraftName}
        countryDraftSecondName={countryDraftSecondName}
        countryDraftIconKey={countryDraftIconKey}
        countryDraftColor={countryDraftColor}
        countryDraftBorderColor={countryDraftBorderColor}
        countryDraftProvinceDefaultColor={countryDraftProvinceDefaultColor}
        countryDraftProvinceBorderColor={countryDraftProvinceBorderColor}
        countryDraftGovernmentTypeId={countryDraftGovernmentTypeId}
        countryDraftIsCityState={countryDraftIsCityState}
        countryDraftDescription={countryDraftDescription}
        governmentTypes={governmentTypes}
        countryAssignedLabelGroups={countryAssignedLabelGroups}
        countryAssignedLabelDrafts={countryAssignedLabelDrafts}
        closeCountryEditorWithPreviewReset={closeCountryEditorWithPreviewReset}
        setCountryDraftName={setCountryDraftName}
        setCountryDraftSecondName={setCountryDraftSecondName}
        setCountryDraftIconKey={setCountryDraftIconKey}
        autoComputeCountryDraftColorsFromFill={autoComputeCountryDraftColorsFromFill}
        setCountryDraftColor={setCountryDraftColor}
        setCountryPreviewColor={setCountryPreviewColor}
        setCountryDraftBorderColor={setCountryDraftBorderColor}
        setCountryPreviewBorderColor={setCountryPreviewBorderColor}
        setCountryDraftProvinceDefaultColor={setCountryDraftProvinceDefaultColor}
        setCountryDraftProvinceBorderColor={setCountryDraftProvinceBorderColor}
        setCountryPreviewProvinceBorderColor={setCountryPreviewProvinceBorderColor}
        setCountryDraftGovernmentTypeId={setCountryDraftGovernmentTypeId}
        setCountryDraftIsCityState={setCountryDraftIsCityState}
        setCountryDraftDescription={setCountryDraftDescription}
        setActiveLabelId={setActiveLabelId}
        openLabelEditor={openLabelEditor}
        handleCountryAssignedLabelVisibilityToggle={handleCountryAssignedLabelVisibilityToggle}
        handleCountryExistingAssignedLabelToggle={handleCountryExistingAssignedLabelToggle}
        handleCountryDraftAssignedLabelToggle={handleCountryDraftAssignedLabelToggle}
        handleDeleteEditingCountry={handleDeleteEditingCountry}
        handleSaveCountryEditor={handleSaveCountryEditor}
        isGovernmentTypeEditorOpen={isGovernmentTypeEditorOpen}
        editingGovernmentTypeId={editingGovernmentTypeId}
        governmentTypeDraftName={governmentTypeDraftName}
        governmentTypeDraftColor={governmentTypeDraftColor}
        activeGovernmentTypeUsageCount={activeGovernmentTypeUsageCount}
        closeGovernmentTypeEditorWithPreviewReset={closeGovernmentTypeEditorWithPreviewReset}
        setGovernmentTypeDraftName={setGovernmentTypeDraftName}
        setGovernmentTypeDraftColor={setGovernmentTypeDraftColor}
        setGovernmentTypePreviewColor={setGovernmentTypePreviewColor}
        handleDeleteEditingGovernmentType={handleDeleteEditingGovernmentType}
        handleSaveGovernmentTypeEditor={handleSaveGovernmentTypeEditor}
        isCityEditorOpen={isCityEditorOpen}
        editingCityId={editingCityId}
        pendingCityCellId={pendingCityCellId}
        cityDraftName={cityDraftName}
        cityDraftSecondName={cityDraftSecondName}
        cityDraftLevelId={cityDraftLevelId}
        cityDraftCountryId={cityDraftCountryId}
        cityDraftDescription={cityDraftDescription}
        cityLevels={cityLevels}
        cityAssignedLabelGroups={cityAssignedLabelGroups}
        cityAssignedLabelDrafts={cityAssignedLabelDrafts}
        handleCloseCityEditor={handleCloseCityEditor}
        setCityDraftName={setCityDraftName}
        setCityDraftSecondName={setCityDraftSecondName}
        setCityDraftLevelId={setCityDraftLevelId}
        setCityDraftCountryId={setCityDraftCountryId}
        setCityDraftDescription={setCityDraftDescription}
        handleCityExistingAssignedLabelToggle={handleCityExistingAssignedLabelToggle}
        handleCityDraftAssignedLabelToggle={handleCityDraftAssignedLabelToggle}
        handleDeleteEditingCity={handleDeleteEditingCity}
        handleSaveCityEditor={handleSaveCityEditor}
        isCityLevelEditorOpen={isCityLevelEditorOpen}
        editingCityLevelId={editingCityLevelId}
        cityLevelDraftName={cityLevelDraftName}
        cityLevelDraftRank={cityLevelDraftRank}
        cityLevelDraftIconKey={cityLevelDraftIconKey}
        defaultIconKey={defaultIconKey}
        cityLevelDraftIconScalePercent={cityLevelDraftIconScalePercent}
        cityLevelDraftUniquePerCountry={cityLevelDraftUniquePerCountry}
        cityLevelDraftDisplayInCountryInfo={cityLevelDraftDisplayInCountryInfo}
        isEditingCityLevelInUse={isEditingCityLevelInUse}
        handleCloseCityLevelEditor={handleCloseCityLevelEditor}
        setCityLevelDraftName={setCityLevelDraftName}
        setCityLevelDraftRank={setCityLevelDraftRank}
        setCityLevelDraftIconKey={setCityLevelDraftIconKey}
        setCityLevelDraftIconScalePercent={setCityLevelDraftIconScalePercent}
        setCityLevelDraftUniquePerCountry={setCityLevelDraftUniquePerCountry}
        setCityLevelDraftDisplayInCountryInfo={setCityLevelDraftDisplayInCountryInfo}
        handleDeleteEditingCityLevel={handleDeleteEditingCityLevel}
        handleSaveCityLevel={handleSaveCityLevel}
        pendingAssignedLabelRemoval={pendingAssignedLabelRemoval}
        skipAssignedLabelRemovalConfirm={skipAssignedLabelRemovalConfirm}
        handleCloseAssignedLabelRemovalDialog={handleCloseAssignedLabelRemovalDialog}
        setSkipAssignedLabelRemovalConfirm={setSkipAssignedLabelRemovalConfirm}
        handleConfirmAssignedLabelRemoval={handleConfirmAssignedLabelRemoval}
        uniqueLevelConflict={uniqueLevelConflict}
        handleCloseUniqueLevelConflictDialog={handleCloseUniqueLevelConflictDialog}
        handleConfirmUniqueLevelConflict={handleConfirmUniqueLevelConflict}
      />
    </div>
    </ActiveEntityContext.Provider>
    </PoliticalStyleContext.Provider>
    </RenderFlagsContext.Provider>
    </TerrainStyleContext.Provider>
    </TerrainBrushContext.Provider>
    </EditorModeContext.Provider>
    </WorldContext.Provider>
    </UiMessagesContext.Provider>
  )
}

export default App
