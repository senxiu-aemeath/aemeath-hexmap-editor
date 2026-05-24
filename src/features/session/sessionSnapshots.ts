import type { HexGridConfig } from '../../domain/grid'
import type { WorldDocument } from '../../domain/world'
import type { AppMessages } from '../../i18n'
import type { UiLanguageId } from '../../i18n_multilingual_latest'
import type { UserIconDefinition } from '../icons/iconRegistry'
import type {
  CityToolMode,
  CountryToolMode,
  PoliticalPaintMode,
  PoliticalSubMode,
  ProvinceToolMode,
} from '../../political/types'
import type { CanvasViewState } from '../../render/HexMapCanvas'
import type { TerrainColorAnchor } from '../../components/TerrainAnchorField'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type ObjectEditorPresentation = 'sidecar'
type LabelAnchorDisplayMode = 'none' | 'all' | 'selected'
type DoubleOpenMode = 'always' | 'matched' | 'never'
type TerrainDisplayMode = 'surface' | 'topography'
type TerrainBrushKind = 'empty' | 'unknown' | 'land' | 'water' | 'dark_water'
type TerrainPaintMode =
  | 'radius_0'
  | 'radius_1'
  | 'radius_2'
  | 'radius_3'
  | 'fill_type'
  | 'fill_height'

interface LayerSnapshot {
  id: string
  label: string
  visible: boolean
  meta: string
}

export interface SavedProjectFile {
  kind: 'hex-map-project'
  version: number
  grid: HexGridConfig
  world: WorldDocument
  userIcons: UserIconDefinition[]
  activeSubmapId: string | null
  canvasViewStates: Record<string, CanvasViewState>
}

export interface SavedConfigFile {
  kind: 'hex-map-config'
  version: number
  editorMode: EditorMode
  politicalSubMode: PoliticalSubMode
  countryToolMode: CountryToolMode
  provinceToolMode: ProvinceToolMode
  politicalPaintMode: PoliticalPaintMode
  restrictProvinceBrushToOwnerCountry: boolean
  cityToolMode: CityToolMode
  brushRadius: number
  previewCellsPerFrame: number
  uiLanguage: UiLanguageId
  westernSidebarNameScale: number
  chineseSidebarNameScale: number
  activeThemeId: string
  fontFamilyOverride: string
  altRadialMenuEnabled: boolean
  userIcons: UserIconDefinition[]
  uiIconInvert: boolean
  leftSidebarWidth: number
  rightSidebarWidth: number
  floatingTableWidth: number
  objectEditorPresentation: ObjectEditorPresentation
  labelAnchorDisplayMode: LabelAnchorDisplayMode
  labelDoubleOpenMode: DoubleOpenMode
  cityDoubleOpenMode: DoubleOpenMode
  countryDoubleOpenMode: DoubleOpenMode
  provinceDoubleOpenMode: DoubleOpenMode
  terrainDisplayMode: TerrainDisplayMode
  terrainPaintMode: TerrainPaintMode
  terrainBrushKind: TerrainBrushKind
  terrainBrushElevation: number
  cityStatesFillTerritory: boolean
  countryFillOpacity: number
  countryBorderColor: string
  countryBorderWidth: number
  countryBorderOpacity: number
  countrySharedBorderOverridesOwn: boolean
  countrySharedBorderMode: 'uniform' | 'mixed'
  provinceFillOpacity: number
  provinceBorderColor: string
  provinceBorderWidth: number
  provinceBorderOpacity: number
  provinceBorderOverridesCountryBorder: boolean
  terrainLandFillColor: string
  terrainWaterFillColor: string
  terrainLandAnchors: TerrainColorAnchor[]
  terrainWaterAnchors: TerrainColorAnchor[]
  terrainSnowLineElevation: number
  terrainSnowColor: string
  showSnowOverride: boolean
  terrainEmptyFillColor: string
  terrainLandUnknownFillColor: string
  terrainWaterUnknownFillColor: string
  terrainWaterDarkFillColor: string
  landEdgeColor: string
  landEdgeWidth: number
  landEmptyEdgeColor: string
  landEmptyEdgeWidth: number
  coastEdgeColor: string
  coastEdgeWidth: number
  waterEdgeColor: string
  waterEdgeWidth: number
  waterEmptyEdgeColor: string
  waterEmptyEdgeWidth: number
  darkWaterEdgeColor: string
  darkWaterEdgeWidth: number
  snowEdgeColor: string
  snowEdgeWidth: number
  snowBoundaryEdgeColor: string
  snowBoundaryEdgeWidth: number
  showEmptySurface: boolean
  showLandEmptyEdges: boolean
  showWaterEmptyEdges: boolean
  colorWaterInCountryLayer: boolean
  layers: LayerSnapshot[]
  countryColumnOrder: string[]
  countryCompactColumns: string[]
  provinceColumnOrder: string[]
  provinceCompactColumns: string[]
  cityColumnOrder: string[]
  cityCompactColumns: string[]
  labelGroupColumnOrder: string[]
  labelGroupCompactColumns: string[]
  embedIconsInProjectFile: boolean
}

interface ApplyProjectSnapshotActions {
  closeTransientUi: () => void
  setAppliedGridConfig: (grid: HexGridConfig) => void
  setDraftGridConfig: (grid: HexGridConfig) => void
  setDraftGridColsInput: (value: string) => void
  setDraftGridRowsInput: (value: string) => void
  setDraftGridHexSizeInput: (value: string) => void
  setWorld: (world: WorldDocument) => void
  normalizeWorldDocument: (world: WorldDocument) => WorldDocument
  setHoveredCellId: (cellId: string | null) => void
  setActiveCountryId: (countryId: string | null) => void
  setActiveProvinceId: (provinceId: string | null) => void
  setActiveCityId: (cityId: string | null) => void
  setActiveLabelId: (labelId: string | null) => void
  setActiveManagedLabelGroupId: (groupId: string | null) => void
  setActiveGovernmentTypeId: (governmentTypeId: string | null) => void
  setEditingSubmapId: (submapId: string | null) => void
  setSubmapDraftName: (value: string) => void
  setUserIcons: (icons: UserIconDefinition[]) => void
  normalizeUserIconDefinitions: (input: unknown) => UserIconDefinition[]
  setActiveSubmapId: (submapId: string | null) => void
  setCanvasViewStates: (states: Record<string, CanvasViewState>) => void
}

interface ApplyConfigSnapshotActions {
  ui: AppMessages
  languageOptions: ReadonlyArray<{ id: UiLanguageId }>
  normalizeUserIconDefinitions: (input: unknown) => UserIconDefinition[]
  normalizeSidebarNameScale: (value: number, fallback: number) => number
  defaultWesternSidebarNameScale: number
  defaultChineseSidebarNameScale: number
  minRightSidebarWidth: number
  migrateLoadedLayers: (layers: LayerSnapshot[] | undefined, ui: AppMessages) => LayerSnapshot[] | null
  setEditorMode: (value: EditorMode) => void
  setPoliticalSubMode: (value: PoliticalSubMode) => void
  setCountryToolMode: (value: CountryToolMode) => void
  setProvinceToolMode: (value: ProvinceToolMode) => void
  setPoliticalPaintMode: (value: PoliticalPaintMode) => void
  setRestrictProvinceBrushToOwnerCountry: (value: boolean) => void
  setCityToolMode: (value: CityToolMode) => void
  setBrushRadius: (value: number) => void
  setPreviewCellsPerFrame: (value: number) => void
  setActiveUiLanguage: (value: UiLanguageId) => void
  setWesternSidebarNameScale: (value: number) => void
  setChineseSidebarNameScale: (value: number) => void
  setActiveThemeId: (value: string) => void
  setFontFamilyOverride: (value: string) => void
  setIsAltRadialMenuEnabled: (value: boolean) => void
  setUserIcons: (value: UserIconDefinition[]) => void
  setUiIconInvert: (value: boolean) => void
  setLeftSidebarWidth: (value: number) => void
  setRightSidebarWidth: (value: number) => void
  setFloatingTableWidth: (value: number) => void
  setEmbedIconsInProjectFile: (value: boolean) => void
  setObjectEditorPresentation: (value: ObjectEditorPresentation) => void
  setLabelAnchorDisplayMode: (value: LabelAnchorDisplayMode) => void
  setLabelDoubleOpenMode: (value: DoubleOpenMode) => void
  setCityDoubleOpenMode: (value: DoubleOpenMode) => void
  setCountryDoubleOpenMode: (value: DoubleOpenMode) => void
  setProvinceDoubleOpenMode: (value: DoubleOpenMode) => void
  setTerrainDisplayMode: (value: TerrainDisplayMode) => void
  setTerrainPaintMode: (value: TerrainPaintMode) => void
  setTerrainBrushKind: (value: TerrainBrushKind) => void
  setTerrainBrushElevation: (value: number) => void
  setCityStatesFillTerritory: (value: boolean) => void
  setCountryFillOpacity: (value: number) => void
  setCountryBorderColor: (value: string) => void
  setCountryBorderWidth: (value: number) => void
  setCountryBorderOpacity: (value: number) => void
  setCountrySharedBorderOverridesOwn: (value: boolean) => void
  setCountrySharedBorderMode: (value: 'uniform' | 'mixed') => void
  setProvinceFillOpacity: (value: number) => void
  setProvinceBorderColor: (value: string) => void
  setProvinceBorderWidth: (value: number) => void
  setProvinceBorderOpacity: (value: number) => void
  setProvinceBorderOverridesCountryBorder: (value: boolean) => void
  setTerrainLandFillColor: (value: string) => void
  setTerrainWaterFillColor: (value: string) => void
  setTerrainLandAnchors: (value: TerrainColorAnchor[]) => void
  setTerrainWaterAnchors: (value: TerrainColorAnchor[]) => void
  setTerrainSnowLineElevation: (value: number) => void
  setTerrainSnowColor: (value: string) => void
  setShowSnowOverride: (value: boolean) => void
  setTerrainEmptyFillColor: (value: string) => void
  setTerrainLandUnknownFillColor: (value: string) => void
  setTerrainWaterUnknownFillColor: (value: string) => void
  setTerrainWaterDarkFillColor: (value: string) => void
  setLandEdgeColor: (value: string) => void
  setLandEdgeWidth: (value: number) => void
  setLandEmptyEdgeColor: (value: string) => void
  setLandEmptyEdgeWidth: (value: number) => void
  setCoastEdgeColor: (value: string) => void
  setCoastEdgeWidth: (value: number) => void
  setWaterEdgeColor: (value: string) => void
  setWaterEdgeWidth: (value: number) => void
  setWaterEmptyEdgeColor: (value: string) => void
  setWaterEmptyEdgeWidth: (value: number) => void
  setDarkWaterEdgeColor: (value: string) => void
  setDarkWaterEdgeWidth: (value: number) => void
  setSnowEdgeColor: (value: string) => void
  setSnowEdgeWidth: (value: number) => void
  setSnowBoundaryEdgeColor: (value: string) => void
  setSnowBoundaryEdgeWidth: (value: number) => void
  setShowEmptySurface: (value: boolean) => void
  setShowLandEmptyEdges: (value: boolean) => void
  setShowWaterEmptyEdges: (value: boolean) => void
  setColorWaterInCountryLayer: (value: boolean) => void
  setLayers: (value: LayerSnapshot[]) => void
  setCountryColumnOrder: (value: string[]) => void
  setCountryCompactColumns: (value: string[]) => void
  setProvinceColumnOrder: (value: string[]) => void
  setProvinceCompactColumns: (value: string[]) => void
  setCityColumnOrder: (value: string[]) => void
  setCityCompactColumns: (value: string[]) => void
  setLabelGroupColumnOrder: (value: string[]) => void
  setLabelGroupCompactColumns: (value: string[]) => void
}

interface RestoreStoredSessionOptions {
  autoProjectStorageKey: string
  autoConfigStorageKey: string
  applyProjectSnapshot: (parsed: Partial<SavedProjectFile>) => void
  applyConfigSnapshot: (parsed: Partial<SavedConfigFile>) => void
}

export function applyProjectSnapshot(
  parsed: Partial<SavedProjectFile>,
  actions: ApplyProjectSnapshotActions,
) {
  if (parsed.kind !== 'hex-map-project' || !parsed.grid || !parsed.world) {
    return
  }

  actions.closeTransientUi()
  actions.setAppliedGridConfig(parsed.grid)
  actions.setDraftGridConfig(parsed.grid)
  actions.setDraftGridColsInput(String(parsed.grid.cols))
  actions.setDraftGridRowsInput(String(parsed.grid.rows))
  actions.setDraftGridHexSizeInput(String(parsed.grid.hexSize))
  actions.setWorld(actions.normalizeWorldDocument(parsed.world as WorldDocument))
  actions.setHoveredCellId(null)
  actions.setActiveCountryId(null)
  actions.setActiveProvinceId(null)
  actions.setActiveCityId(null)
  actions.setActiveLabelId(null)
  actions.setActiveManagedLabelGroupId(null)
  actions.setActiveGovernmentTypeId(null)
  actions.setEditingSubmapId(null)
  actions.setSubmapDraftName('')
  actions.setUserIcons(actions.normalizeUserIconDefinitions(parsed.userIcons))
  actions.setActiveSubmapId(
    parsed.activeSubmapId && parsed.world.submaps[parsed.activeSubmapId]
      ? parsed.activeSubmapId
      : null,
  )
  actions.setCanvasViewStates(parsed.canvasViewStates ?? {})
}

export function applyConfigSnapshot(
  parsed: Partial<SavedConfigFile>,
  actions: ApplyConfigSnapshotActions,
) {
  if (parsed.kind !== 'hex-map-config') {
    return
  }

  if (parsed.editorMode) actions.setEditorMode(parsed.editorMode)
  if (parsed.politicalSubMode) actions.setPoliticalSubMode(parsed.politicalSubMode)
  if (
    parsed.countryToolMode === 'view' ||
    parsed.countryToolMode === 'paint' ||
    parsed.countryToolMode === 'erase'
  ) {
    actions.setCountryToolMode(parsed.countryToolMode)
  }
  if (
    parsed.provinceToolMode === 'view' ||
    parsed.provinceToolMode === 'paint' ||
    parsed.provinceToolMode === 'erase'
  ) {
    actions.setProvinceToolMode(parsed.provinceToolMode)
  }
  if (
    parsed.politicalPaintMode === 'radius_0' ||
    parsed.politicalPaintMode === 'radius_1' ||
    parsed.politicalPaintMode === 'radius_2' ||
    parsed.politicalPaintMode === 'radius_3' ||
    parsed.politicalPaintMode === 'fill_type' ||
    parsed.politicalPaintMode === 'fill_height'
  ) {
    actions.setPoliticalPaintMode(parsed.politicalPaintMode)
    if (parsed.politicalPaintMode.startsWith('radius_')) {
      actions.setBrushRadius(Number(parsed.politicalPaintMode.slice(-1)))
    }
  }
  if (typeof parsed.restrictProvinceBrushToOwnerCountry === 'boolean') {
    actions.setRestrictProvinceBrushToOwnerCountry(parsed.restrictProvinceBrushToOwnerCountry)
  }
  if (parsed.cityToolMode === 'view' || parsed.cityToolMode === 'place_city') {
    actions.setCityToolMode(parsed.cityToolMode)
  }
  if (typeof parsed.brushRadius === 'number') actions.setBrushRadius(parsed.brushRadius)
  if (typeof parsed.previewCellsPerFrame === 'number') {
    actions.setPreviewCellsPerFrame(
      Math.max(1, Math.min(240, Math.round(parsed.previewCellsPerFrame))),
    )
  }
  if (
    parsed.uiLanguage &&
    actions.languageOptions.some((option) => option.id === parsed.uiLanguage)
  ) {
    actions.setActiveUiLanguage(parsed.uiLanguage)
  }
  if (typeof parsed.westernSidebarNameScale === 'number') {
    actions.setWesternSidebarNameScale(
      actions.normalizeSidebarNameScale(
        parsed.westernSidebarNameScale,
        actions.defaultWesternSidebarNameScale,
      ),
    )
  }
  if (typeof parsed.chineseSidebarNameScale === 'number') {
    actions.setChineseSidebarNameScale(
      actions.normalizeSidebarNameScale(
        parsed.chineseSidebarNameScale,
        actions.defaultChineseSidebarNameScale,
      ),
    )
  }
  if (typeof parsed.activeThemeId === 'string') actions.setActiveThemeId(parsed.activeThemeId)
  if (typeof parsed.fontFamilyOverride === 'string') {
    actions.setFontFamilyOverride(parsed.fontFamilyOverride)
  }
  if (typeof parsed.altRadialMenuEnabled === 'boolean') {
    actions.setIsAltRadialMenuEnabled(parsed.altRadialMenuEnabled)
  }
  if (Array.isArray(parsed.userIcons)) {
    actions.setUserIcons(actions.normalizeUserIconDefinitions(parsed.userIcons))
  }
  if (typeof parsed.uiIconInvert === 'boolean') actions.setUiIconInvert(parsed.uiIconInvert)
  if (typeof parsed.leftSidebarWidth === 'number') actions.setLeftSidebarWidth(parsed.leftSidebarWidth)
  if (typeof parsed.rightSidebarWidth === 'number') {
    actions.setRightSidebarWidth(
      Math.max(parsed.rightSidebarWidth, actions.minRightSidebarWidth),
    )
  }
  if (typeof parsed.floatingTableWidth === 'number') {
    actions.setFloatingTableWidth(parsed.floatingTableWidth)
  }
  if (typeof parsed.embedIconsInProjectFile === 'boolean') {
    actions.setEmbedIconsInProjectFile(parsed.embedIconsInProjectFile)
  }
  if (parsed.objectEditorPresentation === 'sidecar') {
    actions.setObjectEditorPresentation(parsed.objectEditorPresentation)
  }
  if (
    parsed.labelAnchorDisplayMode === 'none' ||
    parsed.labelAnchorDisplayMode === 'all' ||
    parsed.labelAnchorDisplayMode === 'selected'
  ) {
    actions.setLabelAnchorDisplayMode(parsed.labelAnchorDisplayMode)
  }
  if (
    parsed.labelDoubleOpenMode === 'always' ||
    parsed.labelDoubleOpenMode === 'matched' ||
    parsed.labelDoubleOpenMode === 'never'
  ) {
    actions.setLabelDoubleOpenMode(parsed.labelDoubleOpenMode)
  }
  if (
    parsed.cityDoubleOpenMode === 'always' ||
    parsed.cityDoubleOpenMode === 'matched' ||
    parsed.cityDoubleOpenMode === 'never'
  ) {
    actions.setCityDoubleOpenMode(parsed.cityDoubleOpenMode)
  }
  if (
    parsed.countryDoubleOpenMode === 'always' ||
    parsed.countryDoubleOpenMode === 'matched' ||
    parsed.countryDoubleOpenMode === 'never'
  ) {
    actions.setCountryDoubleOpenMode(parsed.countryDoubleOpenMode)
  }
  if (
    parsed.provinceDoubleOpenMode === 'always' ||
    parsed.provinceDoubleOpenMode === 'matched' ||
    parsed.provinceDoubleOpenMode === 'never'
  ) {
    actions.setProvinceDoubleOpenMode(parsed.provinceDoubleOpenMode)
  }
  if (
    parsed.terrainDisplayMode === 'surface' ||
    parsed.terrainDisplayMode === 'topography'
  ) {
    actions.setTerrainDisplayMode(parsed.terrainDisplayMode)
  }
  if (
    parsed.terrainPaintMode === 'radius_0' ||
    parsed.terrainPaintMode === 'radius_1' ||
    parsed.terrainPaintMode === 'radius_2' ||
    parsed.terrainPaintMode === 'radius_3' ||
    parsed.terrainPaintMode === 'fill_type' ||
    parsed.terrainPaintMode === 'fill_height'
  ) {
    actions.setTerrainPaintMode(parsed.terrainPaintMode)
    if (parsed.terrainPaintMode.startsWith('radius_')) {
      actions.setBrushRadius(Number(parsed.terrainPaintMode.slice(-1)))
    }
  }
  if (
    parsed.terrainBrushKind === 'empty' ||
    parsed.terrainBrushKind === 'unknown' ||
    parsed.terrainBrushKind === 'land' ||
    parsed.terrainBrushKind === 'water' ||
    parsed.terrainBrushKind === 'dark_water'
  ) {
    actions.setTerrainBrushKind(parsed.terrainBrushKind)
  }
  if (typeof parsed.terrainBrushElevation === 'number') {
    actions.setTerrainBrushElevation(parsed.terrainBrushElevation)
  }
  if (typeof parsed.cityStatesFillTerritory === 'boolean') {
    actions.setCityStatesFillTerritory(parsed.cityStatesFillTerritory)
  }
  if (typeof parsed.countryFillOpacity === 'number') {
    actions.setCountryFillOpacity(parsed.countryFillOpacity)
  }
  if (typeof parsed.countryBorderColor === 'string') {
    actions.setCountryBorderColor(parsed.countryBorderColor)
  }
  if (typeof parsed.countryBorderWidth === 'number') {
    actions.setCountryBorderWidth(parsed.countryBorderWidth)
  }
  if (typeof parsed.countryBorderOpacity === 'number') {
    actions.setCountryBorderOpacity(parsed.countryBorderOpacity)
  }
  if (typeof parsed.countrySharedBorderOverridesOwn === 'boolean') {
    actions.setCountrySharedBorderOverridesOwn(parsed.countrySharedBorderOverridesOwn)
  }
  if (
    parsed.countrySharedBorderMode === 'uniform' ||
    parsed.countrySharedBorderMode === 'mixed'
  ) {
    actions.setCountrySharedBorderMode(parsed.countrySharedBorderMode)
  }
  if (typeof parsed.provinceFillOpacity === 'number') {
    actions.setProvinceFillOpacity(parsed.provinceFillOpacity)
  }
  if (typeof parsed.provinceBorderColor === 'string') {
    actions.setProvinceBorderColor(parsed.provinceBorderColor)
  }
  if (typeof parsed.provinceBorderWidth === 'number') {
    actions.setProvinceBorderWidth(parsed.provinceBorderWidth)
  }
  if (typeof parsed.provinceBorderOpacity === 'number') {
    actions.setProvinceBorderOpacity(parsed.provinceBorderOpacity)
  }
  if (typeof parsed.provinceBorderOverridesCountryBorder === 'boolean') {
    actions.setProvinceBorderOverridesCountryBorder(
      parsed.provinceBorderOverridesCountryBorder,
    )
  }
  if (typeof parsed.terrainLandFillColor === 'string') {
    actions.setTerrainLandFillColor(parsed.terrainLandFillColor)
  }
  if (typeof parsed.terrainWaterFillColor === 'string') {
    actions.setTerrainWaterFillColor(parsed.terrainWaterFillColor)
  }
  if (Array.isArray(parsed.terrainLandAnchors)) {
    actions.setTerrainLandAnchors(parsed.terrainLandAnchors as TerrainColorAnchor[])
  }
  if (Array.isArray(parsed.terrainWaterAnchors)) {
    actions.setTerrainWaterAnchors(parsed.terrainWaterAnchors as TerrainColorAnchor[])
  }
  if (typeof parsed.terrainSnowLineElevation === 'number') {
    actions.setTerrainSnowLineElevation(parsed.terrainSnowLineElevation)
  }
  if (typeof parsed.terrainSnowColor === 'string') {
    actions.setTerrainSnowColor(parsed.terrainSnowColor)
  }
  if (typeof parsed.showSnowOverride === 'boolean') {
    actions.setShowSnowOverride(parsed.showSnowOverride)
  }
  if (typeof parsed.terrainEmptyFillColor === 'string') {
    actions.setTerrainEmptyFillColor(parsed.terrainEmptyFillColor)
  }
  if (typeof parsed.terrainLandUnknownFillColor === 'string') {
    actions.setTerrainLandUnknownFillColor(parsed.terrainLandUnknownFillColor)
  }
  if (typeof parsed.terrainWaterUnknownFillColor === 'string') {
    actions.setTerrainWaterUnknownFillColor(parsed.terrainWaterUnknownFillColor)
  }
  if (typeof parsed.terrainWaterDarkFillColor === 'string') {
    actions.setTerrainWaterDarkFillColor(parsed.terrainWaterDarkFillColor)
  }
  if (typeof parsed.landEdgeColor === 'string') actions.setLandEdgeColor(parsed.landEdgeColor)
  if (typeof parsed.landEdgeWidth === 'number') actions.setLandEdgeWidth(parsed.landEdgeWidth)
  if (typeof parsed.landEmptyEdgeColor === 'string') {
    actions.setLandEmptyEdgeColor(parsed.landEmptyEdgeColor)
  }
  if (typeof parsed.landEmptyEdgeWidth === 'number') {
    actions.setLandEmptyEdgeWidth(parsed.landEmptyEdgeWidth)
  }
  if (typeof parsed.coastEdgeColor === 'string') {
    actions.setCoastEdgeColor(parsed.coastEdgeColor)
  }
  if (typeof parsed.coastEdgeWidth === 'number') {
    actions.setCoastEdgeWidth(parsed.coastEdgeWidth)
  }
  if (typeof parsed.waterEdgeColor === 'string') {
    actions.setWaterEdgeColor(parsed.waterEdgeColor)
  }
  if (typeof parsed.waterEdgeWidth === 'number') {
    actions.setWaterEdgeWidth(parsed.waterEdgeWidth)
  }
  if (typeof parsed.waterEmptyEdgeColor === 'string') {
    actions.setWaterEmptyEdgeColor(parsed.waterEmptyEdgeColor)
  }
  if (typeof parsed.waterEmptyEdgeWidth === 'number') {
    actions.setWaterEmptyEdgeWidth(parsed.waterEmptyEdgeWidth)
  }
  if (typeof parsed.darkWaterEdgeColor === 'string') {
    actions.setDarkWaterEdgeColor(parsed.darkWaterEdgeColor)
  }
  if (typeof parsed.darkWaterEdgeWidth === 'number') {
    actions.setDarkWaterEdgeWidth(parsed.darkWaterEdgeWidth)
  }
  if (typeof parsed.snowEdgeColor === 'string') {
    actions.setSnowEdgeColor(parsed.snowEdgeColor)
  }
  if (typeof parsed.snowEdgeWidth === 'number') {
    actions.setSnowEdgeWidth(parsed.snowEdgeWidth)
  }
  if (typeof parsed.snowBoundaryEdgeColor === 'string') {
    actions.setSnowBoundaryEdgeColor(parsed.snowBoundaryEdgeColor)
  }
  if (typeof parsed.snowBoundaryEdgeWidth === 'number') {
    actions.setSnowBoundaryEdgeWidth(parsed.snowBoundaryEdgeWidth)
  }
  if (typeof parsed.showEmptySurface === 'boolean') {
    actions.setShowEmptySurface(parsed.showEmptySurface)
  }
  if (typeof parsed.showLandEmptyEdges === 'boolean') {
    actions.setShowLandEmptyEdges(parsed.showLandEmptyEdges)
  }
  if (typeof parsed.showWaterEmptyEdges === 'boolean') {
    actions.setShowWaterEmptyEdges(parsed.showWaterEmptyEdges)
  }
  if (typeof parsed.colorWaterInCountryLayer === 'boolean') {
    actions.setColorWaterInCountryLayer(parsed.colorWaterInCountryLayer)
  }
  const migratedLayers = actions.migrateLoadedLayers(parsed.layers, actions.ui)
  if (migratedLayers) actions.setLayers(migratedLayers)
  if (Array.isArray(parsed.countryColumnOrder)) {
    actions.setCountryColumnOrder(parsed.countryColumnOrder)
  }
  if (Array.isArray(parsed.countryCompactColumns)) {
    actions.setCountryCompactColumns(parsed.countryCompactColumns)
  }
  if (Array.isArray(parsed.provinceColumnOrder)) {
    actions.setProvinceColumnOrder(parsed.provinceColumnOrder)
  }
  if (Array.isArray(parsed.provinceCompactColumns)) {
    actions.setProvinceCompactColumns(parsed.provinceCompactColumns)
  }
  if (Array.isArray(parsed.cityColumnOrder)) {
    actions.setCityColumnOrder(parsed.cityColumnOrder)
  }
  if (Array.isArray(parsed.cityCompactColumns)) {
    actions.setCityCompactColumns(parsed.cityCompactColumns)
  }
  if (Array.isArray(parsed.labelGroupColumnOrder)) {
    actions.setLabelGroupColumnOrder(parsed.labelGroupColumnOrder)
  }
  if (Array.isArray(parsed.labelGroupCompactColumns)) {
    actions.setLabelGroupCompactColumns(parsed.labelGroupCompactColumns)
  }
}

export function restoreStoredSession({
  autoProjectStorageKey,
  autoConfigStorageKey,
  applyProjectSnapshot,
  applyConfigSnapshot,
}: RestoreStoredSessionOptions) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const storedProject = window.localStorage.getItem(autoProjectStorageKey)
    if (storedProject) {
      applyProjectSnapshot(JSON.parse(storedProject) as Partial<SavedProjectFile>)
    }
  } catch {
    // Ignore invalid cached project.
  }

  try {
    const storedConfig = window.localStorage.getItem(autoConfigStorageKey)
    if (storedConfig) {
      applyConfigSnapshot(JSON.parse(storedConfig) as Partial<SavedConfigFile>)
    }
  } catch {
    // Ignore invalid cached config.
  }
}
