import { useEffect, useMemo, useRef, useState } from 'react'
import { Application, Assets, Container, Graphics, Sprite, Text, Texture } from 'pixi.js'
import {
  buildHexEdges,
  createCellMap,
  createCoordinateCellMap,
  findCellAtPoint,
  getCellsAlongLine,
  getCellsWithinRadius,
  getGridBounds,
  getPointyHexEdge,
  getPointyHexPolygon,
  type HexEdge,
  type HexCell,
  type HexGridConfig,
} from '../domain/grid'
import {
  DEFAULT_SURFACE_STATE,
  areSurfaceStatesEqual,
  getEffectiveLabelStyle,
  getLabelAnchorOffsetState,
  getSortedLabelGroups,
  isSurfaceLand,
  resolveLabelText,
  isCityStateCountry,
  normalizeSurfaceState,
  type CellSurfaceState,
  type City,
  type CityLevel,
  type Country,
  type Label,
  type LabelGroup,
  type Province,
  type WorldAxes,
  type WorldFrame,
  type WorldMetadata,
} from '../domain/world'
import { DEFAULT_THEME } from '../theme'
type LayerId =
  | 'terrainFill'
  | 'terrainEdge'
  | 'countryFill'
  | 'countryBorder'
  | 'provinceFill'
  | 'provinceBorder'
  | 'cities'
  | 'labels'
  | 'overlay'

interface HexMapCanvasProps {
  grid: HexGridConfig
  cells: HexCell[]
  countries: Record<string, Country>
  cities: Record<string, City>
  cityLevels: Record<string, CityLevel>
  iconSourceMap: Record<string, string>
  provinces: Record<string, Province>
  labelGroups: Record<string, LabelGroup>
  labels: Record<string, Label>
  worldMetadata: WorldMetadata
  worldFrame: WorldFrame
  worldAxes: WorldAxes
  labelAnchorDisplayMode: 'none' | 'all' | 'selected'
  cellSurfaces: Record<string, CellSurfaceState>
  countryAssignments: Record<string, string | null>
  provinceAssignments: Record<string, string | null>
  politicalColorMode?: 'country' | 'province'
  politicalStyle: {
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
  }
  terrainStyle: {
    displayMode: 'surface' | 'topography'
    landFillColor: string
    landAnchors: Array<{ elevation: number; color: string }>
    waterFillColor: string
    waterAnchors: Array<{ elevation: number; color: string }>
    snowLineElevation: number
    snowColor: string
    showSnowOverride: boolean
    emptyFillColor: string
    landUnknownFillColor: string
    waterUnknownFillColor: string
    waterDarkFillColor: string
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
    showEmptyCells: boolean
    showLandEmptyEdges: boolean
    showWaterEmptyEdges: boolean
  }
  colorWaterInCountryLayer: boolean
  cityStatesFillTerritory: boolean
  layers: Array<{
    id: LayerId
    label: string
    visible: boolean
    meta: string
  }>
  visibleCellIds: Set<string> | null
  interactiveCellIds: Set<string> | null
  selectedLabelId: string | null
  hoveredCellId: string | null
  onHoverCell: (cellId: string | null) => void
  onSelectLabel?: (labelId: string | null) => void
  onDoubleActivate?: (target: { labelId?: string; cellId?: string }) => void
  onMoveLabel?: (labelId: string, deltaX: number, deltaY: number) => void
  onCellInteract: (cellId: string) => void
  onCellsInteractBatch?: (cellIds: string[]) => void
  getCellInteractionPreview?: (
    cellId: string,
  ) => { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null
  onInteractionEnd?: () => void
  brushRadius?: number
  previewCellsPerFrame?: number
  selectionMode?: 'none' | 'submap_rect' | 'move_rect'
  selectionVisibleCellIds?: Set<string> | null
  onSelectionComplete?: (cellIds: string[]) => void
  moveSourceCellIds?: string[]
  movePreviewCellIds?: string[]
  moveBlockedCellIds?: string[]
  movePreviewStyles?: Record<string, { fillColor: string; strokeColor: string }>
  paintHistoryRevision?: number
  initialViewState?: CanvasViewState | null
  onViewStateChange?: (viewState: CanvasViewState) => void
}

interface ResolvedTerrainAnchor {
  elevation: number
  color: string
  colorValue: number
}

interface ResolvedTerrainStyleColors {
  landFillColor: number
  waterFillColor: number
  snowColor: number
  emptyFillColor: number
  landUnknownFillColor: number
  waterUnknownFillColor: number
  waterDarkFillColor: number
  landEdgeColor: number
  landEmptyEdgeColor: number
  coastEdgeColor: number
  waterEdgeColor: number
  waterEmptyEdgeColor: number
  darkWaterEdgeColor: number
  snowEdgeColor: number
  snowBoundaryEdgeColor: number
}

interface WorldRect {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

type PointerLikeEvent = Pick<PointerEvent, 'clientX' | 'clientY'>

type TerrainEdgeStyleKey =
  | 'land_inner'
  | 'water_inner'
  | 'dark_water_inner'
  | 'snow_inner'
  | 'coast'
  | 'snow_boundary'
  | 'land_empty'
  | 'water_empty'

const TERRAIN_EDGE_STYLE_KEYS: TerrainEdgeStyleKey[] = [
  'land_inner',
  'water_inner',
  'dark_water_inner',
  'snow_inner',
  'coast',
  'snow_boundary',
  'land_empty',
  'water_empty',
]

export interface CanvasViewState {
  baseScale: number
  zoom: number
  positionX: number
  positionY: number
}

function areCanvasViewStatesEqual(
  left: CanvasViewState | null | undefined,
  right: CanvasViewState | null | undefined,
) {
  if (!left || !right) {
    return left === right
  }

  return (
    left.baseScale === right.baseScale &&
    left.zoom === right.zoom &&
    left.positionX === right.positionX &&
    left.positionY === right.positionY
  )
}

const MAP_BACKGROUND = 0x000000
const CELL_HOVER_FILL = 0xf0d377
const CELL_HOVER_STROKE = 0x4c3d1f
const STROKE_OVERLAY_ALPHA = 0.38
const TERRAIN_FILL_CHUNK_SIZE = 8
const TERRAIN_EDGE_CHUNK_SIZE = 8
const ERASE_OVERLAY_FILL = 0x8b8b8b
const LABEL_ANCHOR_COLOR = parseInt(DEFAULT_THEME.colors.anchor.slice(1), 16)
const LABEL_ANCHOR_SELECTED_COLOR = parseInt(DEFAULT_THEME.colors.anchorSelected.slice(1), 16)

interface SceneRefs {
  mapRoot: Container
  cellById: Map<string, HexCell>
  cellsByCoordinates: Map<string, HexCell>
  edgeById: Map<string, HexEdge>
  layerContainers: Record<'terrainFill' | 'terrainEdge' | 'cities' | 'labels' | 'overlay', Container>
  countryFillBatchLayer: Container
  countryFillLayer: Container
  countryBorderBatchLayer: Container
  countryBorderLayer: Container
  provinceFillBatchLayer: Container
  provinceFillLayer: Container
  provinceBorderBatchLayer: Container
  provinceBorderLayer: Container
  terrainFillGraphics: Map<string, Graphics>
  terrainFillChunkGraphics: Map<string, Graphics>
  terrainFillChunkCells: Map<string, HexCell[]>
  terrainFillCellChunks: Map<string, string>
  terrainFillChunkBounds: Map<string, WorldRect>
  terrainEdgeChunkGraphics: Map<string, Record<TerrainEdgeStyleKey, Graphics>>
  terrainEdgeChunkEdges: Map<string, HexEdge[]>
  terrainEdgeCellChunks: Map<string, Set<string>>
  terrainEdgeChunkBounds: Map<string, WorldRect>
  countryFillBatchGraphics: Map<string, Graphics>
  countryFillGraphics: Map<string, Graphics>
  countryBorderBatchGraphics: Map<string, Graphics>
  provinceFillBatchGraphics: Map<string, Graphics>
  provinceFillGraphics: Map<string, Graphics>
  provinceBorderBatchGraphics: Map<string, Graphics>
  countryBorderGraphics: Map<string, Graphics>
  provinceBorderGraphics: Map<string, Graphics>
  citiesGraphics: Map<string, Container>
  labelsLayer: Container
  labelAnchorsLayer: Container
  labelGroupContainers: Map<string, Container>
  labelTexts: Map<string, Container>
  orderedLabelIds: string[]
  overlayGraphics: Map<string, Graphics>
  worldDecorLayer: Container
  worldDecorGraphic: Graphics
  worldDecorTextLayer: Container
  paintPreviewLayer: Container
  strokeOverlayGraphic: Graphics
  moveSourceGraphic: Graphics
  movePreviewGraphic: Graphics
  selectionGraphic: Graphics
}

interface CameraState {
  baseScale: number
  zoom: number
  positionX: number
  positionY: number
  isPanning: boolean
  lastClientX: number
  lastClientY: number
  isDrawing: boolean
  lastDrawnCellId: string | null
  isDraggingLabel: boolean
  draggingLabelId: string | null
  lastDragWorldX: number
  lastDragWorldY: number
  isSelecting: boolean
  selectionStartX: number
  selectionStartY: number
}

export function HexMapCanvas({
  grid,
  cells,
  countries,
  cities,
  cityLevels,
  iconSourceMap,
  provinces,
  labelGroups,
  labels,
  worldMetadata,
  worldFrame,
  worldAxes,
  labelAnchorDisplayMode,
  cellSurfaces,
  countryAssignments,
  provinceAssignments,
  politicalColorMode = 'country',
  politicalStyle,
  terrainStyle,
  colorWaterInCountryLayer,
  cityStatesFillTerritory,
  layers,
  hoveredCellId,
  selectedLabelId,
  onHoverCell,
  onSelectLabel,
  onDoubleActivate,
  onMoveLabel,
  onCellInteract,
  onCellsInteractBatch,
  getCellInteractionPreview,
  onInteractionEnd,
  brushRadius = 0,
  previewCellsPerFrame = 24,
  visibleCellIds,
  interactiveCellIds,
  selectionMode = 'none',
  selectionVisibleCellIds,
  onSelectionComplete,
  moveSourceCellIds = [],
  movePreviewCellIds = [],
  moveBlockedCellIds = [],
  movePreviewStyles = {},
  paintHistoryRevision = 0,
  initialViewState = null,
  onViewStateChange,
}: HexMapCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [sceneReadyTick, setSceneReadyTick] = useState(0)
  const resolvedTerrainLandAnchors = useMemo(
    () => resolveTerrainAnchors(terrainStyle.landAnchors),
    [terrainStyle.landAnchors],
  )
  const resolvedTerrainWaterAnchors = useMemo(
    () => resolveTerrainAnchors(terrainStyle.waterAnchors),
    [terrainStyle.waterAnchors],
  )
  const resolvedTerrainStyleColors = useMemo<ResolvedTerrainStyleColors>(
    () => ({
      landFillColor: parseHexColor(terrainStyle.landFillColor),
      waterFillColor: parseHexColor(terrainStyle.waterFillColor),
      snowColor: parseHexColor(terrainStyle.snowColor),
      emptyFillColor: parseHexColor(terrainStyle.emptyFillColor),
      landUnknownFillColor: parseHexColor(terrainStyle.landUnknownFillColor),
      waterUnknownFillColor: parseHexColor(terrainStyle.waterUnknownFillColor),
      waterDarkFillColor: parseHexColor(terrainStyle.waterDarkFillColor),
      landEdgeColor: parseHexColor(terrainStyle.landEdgeColor),
      landEmptyEdgeColor: parseHexColor(terrainStyle.landEmptyEdgeColor),
      coastEdgeColor: parseHexColor(terrainStyle.coastEdgeColor),
      waterEdgeColor: parseHexColor(terrainStyle.waterEdgeColor),
      waterEmptyEdgeColor: parseHexColor(terrainStyle.waterEmptyEdgeColor),
      darkWaterEdgeColor: parseHexColor(terrainStyle.darkWaterEdgeColor),
      snowEdgeColor: parseHexColor(terrainStyle.snowEdgeColor),
      snowBoundaryEdgeColor: parseHexColor(terrainStyle.snowBoundaryEdgeColor),
    }),
    [
      terrainStyle.coastEdgeColor,
      terrainStyle.darkWaterEdgeColor,
      terrainStyle.emptyFillColor,
      terrainStyle.landEdgeColor,
      terrainStyle.landEmptyEdgeColor,
      terrainStyle.landFillColor,
      terrainStyle.landUnknownFillColor,
      terrainStyle.snowBoundaryEdgeColor,
      terrainStyle.snowColor,
      terrainStyle.snowEdgeColor,
      terrainStyle.waterDarkFillColor,
      terrainStyle.waterEdgeColor,
      terrainStyle.waterEmptyEdgeColor,
      terrainStyle.waterFillColor,
      terrainStyle.waterUnknownFillColor,
    ],
  )
  const hoverRef = useRef(onHoverCell)
  const selectLabelRef = useRef(onSelectLabel)
  const moveLabelRef = useRef(onMoveLabel)
  const doubleActivateRef = useRef(onDoubleActivate)
  const interactRef = useRef(onCellInteract)
  const interactBatchRef = useRef(onCellsInteractBatch)
  const previewRef = useRef(getCellInteractionPreview)
  const interactionEndRef = useRef(onInteractionEnd)
  const brushRadiusRef = useRef(brushRadius)
  const previewCellsPerFrameRef = useRef(previewCellsPerFrame)
  const countriesRef = useRef(countries)
  const provincesRef = useRef(provinces)
  const labelGroupsRef = useRef(labelGroups)
  const labelsRef = useRef(labels)
  const labelAnchorDisplayModeRef = useRef(labelAnchorDisplayMode)
  const cellSurfacesRef = useRef(cellSurfaces)
  const countryAssignmentsRef = useRef(countryAssignments)
  const provinceAssignmentsRef = useRef(provinceAssignments)
  const colorWaterInCountryLayerRef = useRef(colorWaterInCountryLayer)
  const cityStatesFillTerritoryRef = useRef(cityStatesFillTerritory)
  const terrainStyleRef = useRef(terrainStyle)
  const resolvedTerrainLandAnchorsRef = useRef<ResolvedTerrainAnchor[]>(
    resolvedTerrainLandAnchors,
  )
  const resolvedTerrainWaterAnchorsRef = useRef<ResolvedTerrainAnchor[]>(
    resolvedTerrainWaterAnchors,
  )
  const resolvedTerrainStyleColorsRef = useRef<ResolvedTerrainStyleColors>(
    resolvedTerrainStyleColors,
  )
  const previousTerrainCommittedSurfacesRef = useRef(cellSurfaces)
  const previousTerrainStyleRef = useRef(terrainStyle)
  const previousTerrainVisibleCellIdsRef = useRef<Set<string> | null>(visibleCellIds)
  const previousTerrainHexSizeRef = useRef(grid.hexSize)
  const previousPoliticalSurfacesRef = useRef(cellSurfaces)
  const previousPoliticalCountryAssignmentsRef = useRef(countryAssignments)
  const previousPoliticalProvinceAssignmentsRef = useRef(provinceAssignments)
  const previousPoliticalVisibleCellIdsRef = useRef<Set<string> | null>(visibleCellIds)
  const previousPoliticalHexSizeRef = useRef(grid.hexSize)
  const previousPoliticalColorModeRef = useRef(politicalColorMode)
  const previousPoliticalStyleRef = useRef(politicalStyle)
  const previousPaintHistoryRevisionRef = useRef(paintHistoryRevision)
  const politicalStyleRef = useRef(politicalStyle)
  const sceneRef = useRef<SceneRefs | null>(null)
  const hoveredCellIdRef = useRef<string | null>(hoveredCellId)
  const selectedLabelIdRef = useRef<string | null>(selectedLabelId)
  const visibleCellIdsRef = useRef<Set<string> | null>(visibleCellIds)
  const interactiveCellIdsRef = useRef<Set<string> | null>(interactiveCellIds)
  const selectionModeRef = useRef(selectionMode)
  const selectionVisibleCellIdsRef = useRef<Set<string> | null>(selectionVisibleCellIds)
  const selectionCompleteRef = useRef(onSelectionComplete)
  const viewStateChangeRef = useRef(onViewStateChange)
  const initialViewStateRef = useRef<CanvasViewState | null>(initialViewState)
  const worldFrameRef = useRef(worldFrame)
  const lastRenderedHoveredCellIdRef = useRef<string | null>(null)
  const hoveredOverlayCellIdsRef = useRef<Set<string>>(new Set())
  const pendingHoverCellIdRef = useRef<string | null>(hoveredCellId)
  const hoverSyncTimeoutRef = useRef<number | null>(null)
  const lastPointerWorldXRef = useRef(0)
  const lastPointerWorldYRef = useRef(0)
  const pendingDrawCellIdsRef = useRef<string[]>([])
  const pendingDrawCellIdSetRef = useRef<Set<string>>(new Set())
  const pendingPreviewCacheRef = useRef<
    Map<string, { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null>
  >(new Map())
  const strokeOverlayCellIdsRef = useRef<Set<string>>(new Set())
  const drawFrameRef = useRef<number | null>(null)
  const surfacePreviewOverridesRef = useRef<Map<string, CellSurfaceState>>(new Map())
  const countryPreviewOverridesRef = useRef<Map<string, string | null>>(new Map())
  const provincePreviewOverridesRef = useRef<Map<string, string | null>>(new Map())
  const radiusCellsCacheRef = useRef<Map<string, string[]>>(new Map())
  const moveSourceCellIdsRef = useRef(moveSourceCellIds)
  const movePreviewCellIdsRef = useRef(movePreviewCellIds)
  const moveBlockedCellIdsRef = useRef(moveBlockedCellIds)
  const movePreviewStylesRef = useRef(movePreviewStyles)
  const cameraRef = useRef<CameraState>({
    baseScale: 1,
    zoom: 1,
    positionX: 0,
    positionY: 0,
    isPanning: false,
    lastClientX: 0,
    lastClientY: 0,
    isDrawing: false,
    lastDrawnCellId: null,
    isDraggingLabel: false,
    draggingLabelId: null,
    lastDragWorldX: 0,
    lastDragWorldY: 0,
    isSelecting: false,
    selectionStartX: 0,
    selectionStartY: 0,
  })
  
  const [textures, setTextures] = useState<Record<string, Texture>>({})

  useEffect(() => {
    hoverRef.current = onHoverCell
  }, [onHoverCell])

  useEffect(() => {
    selectLabelRef.current = onSelectLabel
  }, [onSelectLabel])

  useEffect(() => {
    moveLabelRef.current = onMoveLabel
  }, [onMoveLabel])

  useEffect(() => {
    doubleActivateRef.current = onDoubleActivate
  }, [onDoubleActivate])

  useEffect(() => {
    interactRef.current = onCellInteract
  }, [onCellInteract])

  useEffect(() => {
    interactBatchRef.current = onCellsInteractBatch
  }, [onCellsInteractBatch])

  useEffect(() => {
    previewRef.current = getCellInteractionPreview
  }, [getCellInteractionPreview])

  useEffect(() => {
    interactionEndRef.current = onInteractionEnd
  }, [onInteractionEnd])

  useEffect(() => {
    brushRadiusRef.current = brushRadius
  }, [brushRadius])

  useEffect(() => {
    previewCellsPerFrameRef.current = previewCellsPerFrame
  }, [previewCellsPerFrame])

  useEffect(() => {
    moveSourceCellIdsRef.current = moveSourceCellIds
  }, [moveSourceCellIds])

  useEffect(() => {
    movePreviewCellIdsRef.current = movePreviewCellIds
  }, [movePreviewCellIds])

  useEffect(() => {
    moveBlockedCellIdsRef.current = moveBlockedCellIds
  }, [moveBlockedCellIds])

  useEffect(() => {
    movePreviewStylesRef.current = movePreviewStyles
  }, [movePreviewStyles])

  useEffect(() => {
    radiusCellsCacheRef.current.clear()
  }, [cells, brushRadius])

  useEffect(() => {
    countriesRef.current = countries
  }, [countries])

  useEffect(() => {
    provincesRef.current = provinces
  }, [provinces])

  useEffect(() => {
    labelGroupsRef.current = labelGroups
  }, [labelGroups])

  useEffect(() => {
    labelsRef.current = labels
  }, [labels])

  useEffect(() => {
    labelAnchorDisplayModeRef.current = labelAnchorDisplayMode
  }, [labelAnchorDisplayMode])

  useEffect(() => {
    cellSurfacesRef.current = cellSurfaces
  }, [cellSurfaces])

  useEffect(() => {
    countryAssignmentsRef.current = countryAssignments
  }, [countryAssignments])

  useEffect(() => {
    provinceAssignmentsRef.current = provinceAssignments
  }, [provinceAssignments])

  useEffect(() => {
    colorWaterInCountryLayerRef.current = colorWaterInCountryLayer
  }, [colorWaterInCountryLayer])

  useEffect(() => {
    cityStatesFillTerritoryRef.current = cityStatesFillTerritory
  }, [cityStatesFillTerritory])

  useEffect(() => {
    terrainStyleRef.current = terrainStyle
  }, [terrainStyle])

  useEffect(() => {
    resolvedTerrainLandAnchorsRef.current = resolvedTerrainLandAnchors
  }, [resolvedTerrainLandAnchors])

  useEffect(() => {
    resolvedTerrainWaterAnchorsRef.current = resolvedTerrainWaterAnchors
  }, [resolvedTerrainWaterAnchors])

  useEffect(() => {
    resolvedTerrainStyleColorsRef.current = resolvedTerrainStyleColors
  }, [resolvedTerrainStyleColors])

  useEffect(() => {
    politicalStyleRef.current = politicalStyle
  }, [politicalStyle])

  useEffect(() => {
    hoveredCellIdRef.current = hoveredCellId
  }, [hoveredCellId])

  useEffect(() => {
    selectedLabelIdRef.current = selectedLabelId
  }, [selectedLabelId])

  useEffect(() => {
    visibleCellIdsRef.current = visibleCellIds
  }, [visibleCellIds])

  useEffect(() => {
    interactiveCellIdsRef.current = interactiveCellIds
  }, [interactiveCellIds])

  useEffect(() => {
    selectionModeRef.current = selectionMode
  }, [selectionMode])

  useEffect(() => {
    selectionVisibleCellIdsRef.current = selectionVisibleCellIds
  }, [selectionVisibleCellIds])

  useEffect(() => {
    selectionCompleteRef.current = onSelectionComplete
  }, [onSelectionComplete])

  useEffect(() => {
    viewStateChangeRef.current = onViewStateChange
  }, [onViewStateChange])

  useEffect(() => {
    initialViewStateRef.current = initialViewState
  }, [initialViewState])

  useEffect(() => {
    worldFrameRef.current = worldFrame
  }, [worldFrame])

  useEffect(() => {
    let active = true

    const loadTextures = async () => {
      const entries = Object.entries(iconSourceMap).filter(([, src]) => Boolean(src))

      try {
        const loadedTextures = await Promise.all(
          entries.map(([, src]) => Assets.load(src)),
        )

        if (!active) {
          return
        }

        const textureMap: Record<string, Texture> = {}
        entries.forEach(([iconKey], index) => {
          textureMap[iconKey] = loadedTextures[index]
        })
        setTextures(textureMap)
      } catch (error) {
        console.error('Failed to load icon textures:', error)
      }
    }

    void loadTextures()

    return () => {
      active = false
    }
  }, [iconSourceMap])

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    let disposed = false
    let pixiApp: Application | null = null
    const pendingDrawCellIds = pendingDrawCellIdsRef.current
    const pendingDrawCellIdSet = pendingDrawCellIdSetRef.current
    const resizeObserver = new ResizeObserver(() => {
      if (!pixiApp || !sceneRef.current) {
        return
      }

      applyCameraTransform(sceneRef.current.mapRoot, cameraRef.current)
      updateTerrainChunkVisibility(sceneRef.current, host, cameraRef.current, grid.hexSize * 4)
    })

    const mount = async () => {
      const app = new Application()

      await app.init({
        antialias: true,
        autoDensity: true,
        background: MAP_BACKGROUND,
        resizeTo: host,
      })

      if (disposed) {
        await app.destroy(true, { children: true })
        return
      }

      pixiApp = app
      host.appendChild(app.canvas)
      sceneRef.current = drawScene(app.stage, cells, grid.hexSize)
      setSceneReadyTick((current) => current + 1)
      lastRenderedHoveredCellIdRef.current = null
      pendingHoverCellIdRef.current = hoveredCellIdRef.current
      const targetCells =
        visibleCellIdsRef.current === null
          ? cells
          : cells.filter((cell) => visibleCellIdsRef.current?.has(cell.id))
      const fitCells = targetCells.length > 0 ? targetCells : cells

      if (initialViewStateRef.current) {
        cameraRef.current.baseScale = initialViewStateRef.current.baseScale
        cameraRef.current.zoom = initialViewStateRef.current.zoom
        cameraRef.current.positionX = initialViewStateRef.current.positionX
        cameraRef.current.positionY = initialViewStateRef.current.positionY
        applyCameraTransform(sceneRef.current.mapRoot, cameraRef.current)
        updateTerrainChunkVisibility(sceneRef.current, host, cameraRef.current, grid.hexSize * 4)
      } else {
        fitSceneToHost(
          sceneRef.current.mapRoot,
          host,
          grid,
          fitCells,
          worldFrameRef.current,
          cameraRef.current,
        )
        updateTerrainChunkVisibility(sceneRef.current, host, cameraRef.current, grid.hexSize * 4)
      }
      resizeObserver.observe(host)
    }

    void mount()

    const scheduleHoverSync = (nextHoveredId: string | null) => {
      pendingHoverCellIdRef.current = nextHoveredId

      const shouldSyncImmediately =
        selectionModeRef.current === 'move_rect' ||
        moveSourceCellIdsRef.current.length > 0

      if (shouldSyncImmediately) {
        if (hoverSyncTimeoutRef.current !== null) {
          window.clearTimeout(hoverSyncTimeoutRef.current)
          hoverSyncTimeoutRef.current = null
        }
        if (nextHoveredId !== hoveredCellIdRef.current) {
          hoverRef.current(nextHoveredId)
        }
        return
      }

      if (hoverSyncTimeoutRef.current !== null) {
        return
      }

      hoverSyncTimeoutRef.current = window.setTimeout(() => {
        hoverSyncTimeoutRef.current = null
        const pendingHoveredId = pendingHoverCellIdRef.current

        if (pendingHoveredId !== hoveredCellIdRef.current) {
          hoverRef.current(pendingHoveredId)
        }
      }, 50)
    }

    const emitViewStateChange = () => {
      viewStateChangeRef.current?.({
        baseScale: cameraRef.current.baseScale,
        zoom: cameraRef.current.zoom,
        positionX: cameraRef.current.positionX,
        positionY: cameraRef.current.positionY,
      })
    }

    const scheduleDrawFlush = () => {
      if (drawFrameRef.current !== null) {
        return
      }

      drawFrameRef.current = window.requestAnimationFrame(() => {
        drawFrameRef.current = null
        const cellIds = pendingDrawCellIdsRef.current.splice(
          0,
          previewCellsPerFrameRef.current,
        )
        for (const cellId of cellIds) {
          pendingDrawCellIdSetRef.current.delete(cellId)
        }

        if (cellIds.length === 0) {
          return
        }

        applyPreviewOverrides(
          sceneRef.current,
          cellIds,
          grid.hexSize,
          previewRef.current,
          pendingPreviewCacheRef.current,
          surfacePreviewOverridesRef.current,
          countryPreviewOverridesRef.current,
          provincePreviewOverridesRef.current,
          countriesRef.current,
          provincesRef.current,
          cellSurfacesRef.current,
          countryAssignmentsRef.current,
          provinceAssignmentsRef.current,
          colorWaterInCountryLayerRef.current,
          cityStatesFillTerritoryRef.current,
          terrainStyleRef.current,
          resolvedTerrainLandAnchorsRef.current,
          resolvedTerrainWaterAnchorsRef.current,
          resolvedTerrainStyleColorsRef.current,
          politicalStyleRef.current,
        )

        if (interactBatchRef.current) {
          interactBatchRef.current(cellIds)
        } else {
          for (const cellId of cellIds) {
            interactRef.current(cellId)
          }
        }

        for (const cellId of cellIds) {
          pendingPreviewCacheRef.current.delete(cellId)
        }

        if (pendingDrawCellIdsRef.current.length > 0) {
          scheduleDrawFlush()
        }
      })
    }

    const expandCellIdsByRadius = (cellIds: string[]) => {
      const scene = sceneRef.current
      if (!scene) {
        return cellIds
      }

      const radius = brushRadiusRef.current
      if (radius <= 0) {
        return cellIds
      }

      const expandedCellIds: string[] = []
      const seenCellIds = new Set<string>()

      for (const cellId of cellIds) {
        for (const expandedCellId of getExpandedCellIdsForRadius(
          scene,
          cellId,
          radius,
          radiusCellsCacheRef.current,
        )) {
          if (seenCellIds.has(expandedCellId)) {
            continue
          }
          seenCellIds.add(expandedCellId)
          expandedCellIds.push(expandedCellId)
        }
      }

      return expandedCellIds
    }

    const queueCellInteractions = (cellIds: string[]) => {
      const expandedCellIds = expandCellIdsByRadius(cellIds)
      const appendedStrokeCellIds: string[] = []
      const interactiveCellIds = interactiveCellIdsRef.current

      for (const cellId of expandedCellIds) {
        if (interactiveCellIds && !interactiveCellIds.has(cellId)) {
          continue
        }
        if (pendingDrawCellIdSetRef.current.has(cellId)) {
          continue
        }

        pendingDrawCellIdSetRef.current.add(cellId)
        pendingDrawCellIdsRef.current.push(cellId)
        if (!pendingPreviewCacheRef.current.has(cellId)) {
          pendingPreviewCacheRef.current.set(cellId, previewRef.current?.(cellId) ?? null)
        }
        if (!strokeOverlayCellIdsRef.current.has(cellId)) {
          strokeOverlayCellIdsRef.current.add(cellId)
          appendedStrokeCellIds.push(cellId)
        }
      }

      if (appendedStrokeCellIds.length > 0) {
        appendStrokeOverlay(
          sceneRef.current,
          appendedStrokeCellIds,
          grid.hexSize,
          previewRef.current,
          pendingPreviewCacheRef.current,
          countriesRef.current,
          terrainStyleRef.current,
          resolvedTerrainLandAnchorsRef.current,
          resolvedTerrainWaterAnchorsRef.current,
          resolvedTerrainStyleColorsRef.current,
        )
      }
      scheduleDrawFlush()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const scene = sceneRef.current

      if (!scene || cameraRef.current.isPanning) {
        return
      }

      const localPoint = toWorldPoint(event, host, scene.mapRoot)
      lastPointerWorldXRef.current = localPoint.x
      lastPointerWorldYRef.current = localPoint.y

      if (cameraRef.current.isDraggingLabel && cameraRef.current.draggingLabelId) {
        const deltaX = localPoint.x - cameraRef.current.lastDragWorldX
        const deltaY = localPoint.y - cameraRef.current.lastDragWorldY

        cameraRef.current.lastDragWorldX = localPoint.x
        cameraRef.current.lastDragWorldY = localPoint.y

        if (deltaX !== 0 || deltaY !== 0) {
          moveLabelRef.current?.(cameraRef.current.draggingLabelId, deltaX, deltaY)
        }
        return
      }

      const hitCell = findCellAtPoint(
        scene.cellsByCoordinates,
        grid.hexSize,
        localPoint.x,
        localPoint.y,
      )
      const allowedHoveredCell =
        hitCell && (!interactiveCellIdsRef.current || interactiveCellIdsRef.current.has(hitCell.id))
          ? hitCell
          : null
      const nextHoveredId = allowedHoveredCell?.id ?? null

      if (nextHoveredId !== lastRenderedHoveredCellIdRef.current) {
        updateHoveredOverlay(
          scene,
          nextHoveredId,
          grid.hexSize,
          lastRenderedHoveredCellIdRef,
          hoveredOverlayCellIdsRef,
          brushRadiusRef.current,
          radiusCellsCacheRef.current,
          cameraRef.current.isDrawing,
        )
      }

      if (nextHoveredId !== hoveredCellIdRef.current) {
        scheduleHoverSync(nextHoveredId)
      }

      if (cameraRef.current.isSelecting) {
        redrawSelectionRect(
          scene,
          cameraRef.current.selectionStartX,
          cameraRef.current.selectionStartY,
          localPoint.x,
          localPoint.y,
        )
        return
      }

      if (
        cameraRef.current.isDrawing &&
        allowedHoveredCell &&
        allowedHoveredCell.id !== cameraRef.current.lastDrawnCellId
      ) {
        const previousCell =
          cameraRef.current.lastDrawnCellId !== null
            ? scene.cellById.get(cameraRef.current.lastDrawnCellId) ?? null
            : null

        cameraRef.current.lastDrawnCellId = allowedHoveredCell.id
        queueCellInteractions(
          previousCell
            ? getCellsAlongLine(previousCell, allowedHoveredCell, scene.cellsByCoordinates).map((cell) => cell.id)
            : [allowedHoveredCell.id],
        )
      }
    }

    const handlePointerLeave = () => {
      const scene = sceneRef.current

      if (scene && lastRenderedHoveredCellIdRef.current !== null) {
        updateHoveredOverlay(
          scene,
          null,
          grid.hexSize,
          lastRenderedHoveredCellIdRef,
          hoveredOverlayCellIdsRef,
          brushRadiusRef.current,
          radiusCellsCacheRef.current,
          false,
        )
      }

      if (hoveredCellIdRef.current !== null) {
        scheduleHoverSync(null)
      }
      if (scene) {
        redrawSelectionRect(scene, 0, 0, 0, 0, true)
      }
    }

    const handlePointerDown = (event: PointerEvent) => {
      const scene = sceneRef.current

      if (!scene || event.button !== 0) {
        return
      }

      const localPoint = toWorldPoint(event, host, scene.mapRoot)
      lastPointerWorldXRef.current = localPoint.x
      lastPointerWorldYRef.current = localPoint.y

      if (selectionModeRef.current !== 'none') {
        cameraRef.current.isSelecting = true
        cameraRef.current.selectionStartX = localPoint.x
        cameraRef.current.selectionStartY = localPoint.y
        redrawSelectionRect(
          scene,
          localPoint.x,
          localPoint.y,
          localPoint.x,
          localPoint.y,
        )
        return
      }

      const screenPoint = toScreenPoint(event, host)
      const hitLabelId = findTopmostLabelAtPoint(scene, screenPoint.x, screenPoint.y)
      if (hitLabelId) {
        selectLabelRef.current?.(hitLabelId)
        const hitLabel = labelsRef.current[hitLabelId]
        const hitGroup = hitLabel ? labelGroupsRef.current[hitLabel.groupId] : null
        const isLocked = hitLabel?.locked === true || hitGroup?.locked === true

        if (!isLocked) {
          const localPoint = toWorldPoint(event, host, scene.mapRoot)
          cameraRef.current.isDraggingLabel = true
          cameraRef.current.draggingLabelId = hitLabelId
          cameraRef.current.lastDragWorldX = localPoint.x
          cameraRef.current.lastDragWorldY = localPoint.y
        }
        return
      }

      if (selectedLabelIdRef.current !== null) {
        selectLabelRef.current?.(null)
      }

      const hitCell = findCellAtPoint(
        scene.cellsByCoordinates,
        grid.hexSize,
        localPoint.x,
        localPoint.y,
      )

      if (hitCell && (!interactiveCellIdsRef.current || interactiveCellIdsRef.current.has(hitCell.id))) {
        cameraRef.current.isDrawing = true
        cameraRef.current.lastDrawnCellId = hitCell.id
        updateHoveredOverlay(
          scene,
          null,
          grid.hexSize,
          lastRenderedHoveredCellIdRef,
          hoveredOverlayCellIdsRef,
          brushRadiusRef.current,
          radiusCellsCacheRef.current,
          true,
        )
        updateHoveredOverlay(
          scene,
          hitCell.id,
          grid.hexSize,
          lastRenderedHoveredCellIdRef,
          hoveredOverlayCellIdsRef,
          brushRadiusRef.current,
          radiusCellsCacheRef.current,
          true,
        )
        queueCellInteractions([hitCell.id])
      }
    }

    const handleWheel = (event: WheelEvent) => {
      const scene = sceneRef.current

      if (!scene) {
        return
      }

      event.preventDefault()
      const hostRect = host.getBoundingClientRect()
      const isPointerInsideHost =
        event.clientX >= hostRect.left &&
        event.clientX <= hostRect.right &&
        event.clientY >= hostRect.top &&
        event.clientY <= hostRect.bottom
      const anchorScreenX = isPointerInsideHost ? event.clientX - hostRect.left : host.clientWidth / 2
      const anchorScreenY = isPointerInsideHost ? event.clientY - hostRect.top : host.clientHeight / 2
      const direction = event.deltaY > 0 ? -1 : 1
      const nextZoom = clamp(
        cameraRef.current.zoom * (direction > 0 ? 1.12 : 0.9),
        0.35,
        6,
      )
      zoomCameraAroundScreenPoint(cameraRef.current, anchorScreenX, anchorScreenY, nextZoom)

      applyCameraTransform(scene.mapRoot, cameraRef.current)
      updateTerrainChunkVisibility(scene, host, cameraRef.current, grid.hexSize * 4)
      emitViewStateChange()
    }

    const handleDoubleClick = (event: MouseEvent) => {
      const scene = sceneRef.current

      if (!scene || event.button !== 0) {
        return
      }

      const screenPoint = toScreenPoint(event as PointerLikeEvent, host)
      const hitLabelId = findTopmostLabelAtPoint(scene, screenPoint.x, screenPoint.y)
      if (hitLabelId) {
        doubleActivateRef.current?.({ labelId: hitLabelId })
        return
      }

      const localPoint = toWorldPoint(event as PointerLikeEvent, host, scene.mapRoot)
      const hitCell = findCellAtPoint(
        scene.cellsByCoordinates,
        grid.hexSize,
        localPoint.x,
        localPoint.y,
      )

      if (hitCell && (!interactiveCellIdsRef.current || interactiveCellIdsRef.current.has(hitCell.id))) {
        doubleActivateRef.current?.({ cellId: hitCell.id })
      }
    }

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 1) {
        return
      }

      event.preventDefault()
      cameraRef.current.isPanning = true
      cameraRef.current.lastClientX = event.clientX
      cameraRef.current.lastClientY = event.clientY
      host.classList.add('is-panning')
    }

    const handleMouseMove = (event: MouseEvent) => {
      const scene = sceneRef.current

      if (!scene || !cameraRef.current.isPanning) {
        return
      }

      const deltaX = event.clientX - cameraRef.current.lastClientX
      const deltaY = event.clientY - cameraRef.current.lastClientY

      cameraRef.current.lastClientX = event.clientX
      cameraRef.current.lastClientY = event.clientY
      cameraRef.current.positionX += deltaX
      cameraRef.current.positionY += deltaY
      applyCameraTransform(scene.mapRoot, cameraRef.current)
      updateTerrainChunkVisibility(scene, host, cameraRef.current, grid.hexSize * 4)
      emitViewStateChange()
    }

    const stopPanning = () => {
      cameraRef.current.isPanning = false
      host.classList.remove('is-panning')
    }

    const stopDrawing = () => {
      if (cameraRef.current.isDraggingLabel) {
        cameraRef.current.isDraggingLabel = false
        cameraRef.current.draggingLabelId = null
        return
      }

      if (cameraRef.current.isSelecting) {
        cameraRef.current.isSelecting = false
        const scene = sceneRef.current

        if (scene) {
          const selectedCellIds = getCellIdsInSelectionRect(
            scene,
            cameraRef.current.selectionStartX,
            cameraRef.current.selectionStartY,
            lastPointerWorldXRef.current,
            lastPointerWorldYRef.current,
            selectionVisibleCellIdsRef.current ?? visibleCellIdsRef.current,
          )
          redrawSelectionRect(scene, 0, 0, 0, 0, true)
          selectionCompleteRef.current?.(selectedCellIds)
        }
        return
      }

      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current)
        drawFrameRef.current = null

        const cellIds = pendingDrawCellIdsRef.current.splice(0)
        pendingDrawCellIdSetRef.current.clear()

        if (cellIds.length > 0) {
          applyPreviewOverrides(
            sceneRef.current,
            cellIds,
            grid.hexSize,
            previewRef.current,
            pendingPreviewCacheRef.current,
            surfacePreviewOverridesRef.current,
            countryPreviewOverridesRef.current,
            provincePreviewOverridesRef.current,
            countriesRef.current,
            provincesRef.current,
            cellSurfacesRef.current,
            countryAssignmentsRef.current,
            provinceAssignmentsRef.current,
            colorWaterInCountryLayerRef.current,
            cityStatesFillTerritoryRef.current,
            terrainStyleRef.current,
            resolvedTerrainLandAnchorsRef.current,
            resolvedTerrainWaterAnchorsRef.current,
            resolvedTerrainStyleColorsRef.current,
            politicalStyleRef.current,
          )

          if (interactBatchRef.current) {
            interactBatchRef.current(cellIds)
          } else {
            for (const cellId of cellIds) {
              interactRef.current(cellId)
            }
          }

          for (const cellId of cellIds) {
            pendingPreviewCacheRef.current.delete(cellId)
          }
        }
      }

      cameraRef.current.isDrawing = false
      cameraRef.current.lastDrawnCellId = null
      pendingPreviewCacheRef.current.clear()
      strokeOverlayCellIdsRef.current.clear()
      redrawStrokeOverlay(
        sceneRef.current,
        strokeOverlayCellIdsRef.current,
        grid.hexSize,
        previewRef.current,
        pendingPreviewCacheRef.current,
        countriesRef.current,
        terrainStyleRef.current,
        resolvedTerrainLandAnchorsRef.current,
        resolvedTerrainWaterAnchorsRef.current,
        resolvedTerrainStyleColorsRef.current,
      )
      if (sceneRef.current) {
        updateHoveredOverlay(
          sceneRef.current,
          pendingHoverCellIdRef.current,
          grid.hexSize,
          lastRenderedHoveredCellIdRef,
          hoveredOverlayCellIdsRef,
          brushRadiusRef.current,
          radiusCellsCacheRef.current,
          false,
        )
      }
      interactionEndRef.current?.()
    }

    host.addEventListener('pointermove', handlePointerMove)
    host.addEventListener('pointerleave', handlePointerLeave)
    host.addEventListener('pointerdown', handlePointerDown)
    host.addEventListener('dblclick', handleDoubleClick)
    host.addEventListener('wheel', handleWheel, { passive: false })
    host.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', stopPanning)
    window.addEventListener('pointerup', stopDrawing)

    return () => {
      disposed = true
      resizeObserver.disconnect()
      if (hoverSyncTimeoutRef.current !== null) {
        window.clearTimeout(hoverSyncTimeoutRef.current)
        hoverSyncTimeoutRef.current = null
      }
      if (drawFrameRef.current !== null) {
        window.cancelAnimationFrame(drawFrameRef.current)
        drawFrameRef.current = null
      }
      pendingDrawCellIds.length = 0
      pendingDrawCellIdSet.clear()
      host.removeEventListener('pointermove', handlePointerMove)
      host.removeEventListener('pointerleave', handlePointerLeave)
      host.removeEventListener('pointerdown', handlePointerDown)
      host.removeEventListener('dblclick', handleDoubleClick)
      host.removeEventListener('wheel', handleWheel)
      host.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopPanning)
      window.removeEventListener('pointerup', stopDrawing)

      if (!pixiApp) {
        return
      }

      void pixiApp.destroy(true, { children: true })
      sceneRef.current = null
      host.replaceChildren()
    }
  }, [cells, grid])

  useEffect(() => {
    const scene = sceneRef.current
    const host = hostRef.current

    if (!scene || !host || !initialViewState) {
      return
    }

    const currentViewState: CanvasViewState = {
      baseScale: cameraRef.current.baseScale,
      zoom: cameraRef.current.zoom,
      positionX: cameraRef.current.positionX,
      positionY: cameraRef.current.positionY,
    }

    if (areCanvasViewStatesEqual(initialViewState, currentViewState)) {
      return
    }

    cameraRef.current.baseScale = initialViewState.baseScale
    cameraRef.current.zoom = initialViewState.zoom
    cameraRef.current.positionX = initialViewState.positionX
    cameraRef.current.positionY = initialViewState.positionY
    applyCameraTransform(scene.mapRoot, cameraRef.current)
    updateTerrainChunkVisibility(scene, host, cameraRef.current, grid.hexSize * 4)
  }, [grid.hexSize, initialViewState, sceneReadyTick])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    ensureCountryFillBatchGraphics(scene, countries)
    ensureCountryBorderBatchGraphics(scene, countries)
    ensureProvinceFillBatchGraphics(scene, provinces)
    ensureProvinceBorderBatchGraphics(scene, provinces)

    syncPreviewOverridesWithCommittedState(
      surfacePreviewOverridesRef.current,
      countryPreviewOverridesRef.current,
      provincePreviewOverridesRef.current,
      cellSurfaces,
      countryAssignments,
      provinceAssignments,
    )

    const effectiveCellSurfaces = buildEffectiveSurfaceAssignments(
      cellSurfaces,
      surfacePreviewOverridesRef.current,
    )
    const visibleCellIds = visibleCellIdsRef.current
    const changedCommittedCellIds =
      previousTerrainStyleRef.current === terrainStyle &&
      previousTerrainHexSizeRef.current === grid.hexSize &&
      previousTerrainVisibleCellIdsRef.current === visibleCellIds
        ? getChangedSurfaceCellIds(previousTerrainCommittedSurfacesRef.current, cellSurfaces)
        : null
    const shouldDoPartialFillRedraw =
      changedCommittedCellIds !== null &&
      changedCommittedCellIds.size > 0 &&
      changedCommittedCellIds.size <= Math.max(24, Math.floor(scene.terrainFillGraphics.size * 0.18))
    const viewportBounds =
      shouldDoPartialFillRedraw && hostRef.current
        ? getViewportWorldRect(hostRef.current, cameraRef.current, grid.hexSize * 2)
        : null

    redrawTerrainFillLayerChunked({
      scene,
      hexSize: grid.hexSize,
      cellSurfaces: effectiveCellSurfaces,
      terrainStyle,
      resolvedLandAnchors: resolvedTerrainLandAnchors,
      resolvedWaterAnchors: resolvedTerrainWaterAnchors,
      resolvedColors: resolvedTerrainStyleColors,
      visibleCellIds,
      dirtyCellIds: shouldDoPartialFillRedraw ? changedCommittedCellIds : null,
      viewportBounds,
    })

    if (shouldDoPartialFillRedraw) {
      for (const cellId of changedCommittedCellIds) {
        if (!surfacePreviewOverridesRef.current.has(cellId)) {
          scene.terrainFillGraphics.get(cellId)?.clear()
        }
      }
    } else {
      for (const [cellId, graphic] of scene.terrainFillGraphics) {
        if (!surfacePreviewOverridesRef.current.has(cellId)) {
          graphic.clear()
        }
      }
    }

    redrawTerrainEdgeLayerBatched({
      scene,
      cellSurfaces: effectiveCellSurfaces,
      displayMode: terrainStyle.displayMode,
      snowLineElevation: terrainStyle.snowLineElevation,
      snowColor: terrainStyle.snowColor,
      showSnowOverride: terrainStyle.showSnowOverride,
      landEdgeColor: terrainStyle.landEdgeColor,
      landEdgeWidth: terrainStyle.landEdgeWidth,
      landEdgeColorValue: resolvedTerrainStyleColors.landEdgeColor,
      landEmptyEdgeColor: terrainStyle.landEmptyEdgeColor,
      landEmptyEdgeWidth: terrainStyle.landEmptyEdgeWidth,
      landEmptyEdgeColorValue: resolvedTerrainStyleColors.landEmptyEdgeColor,
      coastEdgeColor: terrainStyle.coastEdgeColor,
      coastEdgeWidth: terrainStyle.coastEdgeWidth,
      coastEdgeColorValue: resolvedTerrainStyleColors.coastEdgeColor,
      waterEdgeColor: terrainStyle.waterEdgeColor,
      waterEdgeWidth: terrainStyle.waterEdgeWidth,
      waterEdgeColorValue: resolvedTerrainStyleColors.waterEdgeColor,
      waterEmptyEdgeColor: terrainStyle.waterEmptyEdgeColor,
      waterEmptyEdgeWidth: terrainStyle.waterEmptyEdgeWidth,
      waterEmptyEdgeColorValue: resolvedTerrainStyleColors.waterEmptyEdgeColor,
      darkWaterEdgeColor: terrainStyle.darkWaterEdgeColor,
      darkWaterEdgeWidth: terrainStyle.darkWaterEdgeWidth,
      darkWaterEdgeColorValue: resolvedTerrainStyleColors.darkWaterEdgeColor,
      snowEdgeColor: terrainStyle.snowEdgeColor,
      snowEdgeWidth: terrainStyle.snowEdgeWidth,
      snowEdgeColorValue: resolvedTerrainStyleColors.snowEdgeColor,
      snowBoundaryEdgeColor: terrainStyle.snowBoundaryEdgeColor,
      snowBoundaryEdgeWidth: terrainStyle.snowBoundaryEdgeWidth,
      snowBoundaryEdgeColorValue: resolvedTerrainStyleColors.snowBoundaryEdgeColor,
      showLandEmptyEdges: terrainStyle.showLandEmptyEdges,
      showWaterEmptyEdges: terrainStyle.showWaterEmptyEdges,
      visibleCellIds,
      dirtyCellIds: shouldDoPartialFillRedraw ? changedCommittedCellIds : null,
      viewportBounds,
    })

    previousTerrainCommittedSurfacesRef.current = cellSurfaces
    previousTerrainStyleRef.current = terrainStyle
    previousTerrainVisibleCellIdsRef.current = visibleCellIds
    previousTerrainHexSizeRef.current = grid.hexSize
  }, [
    cellSurfaces,
    countries,
    countryAssignments,
    provinces,
    provinceAssignments,
    grid.hexSize,
    resolvedTerrainLandAnchors,
    resolvedTerrainStyleColors,
    resolvedTerrainWaterAnchors,
    terrainStyle,
    visibleCellIds,
    sceneReadyTick,
  ])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    syncPreviewOverridesWithCommittedState(
      surfacePreviewOverridesRef.current,
      countryPreviewOverridesRef.current,
      provincePreviewOverridesRef.current,
      cellSurfaces,
      countryAssignments,
      provinceAssignments,
    )

    const effectiveCellSurfaces = buildEffectiveSurfaceAssignments(
      cellSurfaces,
      surfacePreviewOverridesRef.current,
    )
    const effectiveCountryAssignments = buildEffectiveCountryAssignments(
      countryAssignments,
      countryPreviewOverridesRef.current,
    )
    const effectiveProvinceAssignments = buildEffectiveProvinceAssignments(
      provinceAssignments,
      provincePreviewOverridesRef.current,
    )
    const visibleCellIds = visibleCellIdsRef.current
    const forceFullPoliticalRedraw = previousPaintHistoryRevisionRef.current !== paintHistoryRevision
    const changedPoliticalCellIds =
      !forceFullPoliticalRedraw &&
      previousPoliticalColorModeRef.current === politicalColorMode &&
      previousPoliticalStyleRef.current === politicalStyle &&
      previousPoliticalHexSizeRef.current === grid.hexSize &&
      previousPoliticalVisibleCellIdsRef.current === visibleCellIds
        ? getChangedPoliticalCellIds(
            previousPoliticalSurfacesRef.current,
            cellSurfaces,
            previousPoliticalCountryAssignmentsRef.current,
            countryAssignments,
            previousPoliticalProvinceAssignmentsRef.current,
            provinceAssignments,
          )
        : null
    const shouldDoPartialPoliticalFillRedraw =
      changedPoliticalCellIds !== null &&
      changedPoliticalCellIds.size > 0 &&
      changedPoliticalCellIds.size <= Math.max(24, Math.floor(scene.cellById.size * 0.18))
    const dirtyCountryIds =
      shouldDoPartialPoliticalFillRedraw
        ? collectDirtyAssignedIds(
            changedPoliticalCellIds,
            previousPoliticalCountryAssignmentsRef.current,
            effectiveCountryAssignments,
          )
        : null
    const dirtyProvinceIds =
      shouldDoPartialPoliticalFillRedraw
        ? collectDirtyAssignedIds(
            changedPoliticalCellIds,
            previousPoliticalProvinceAssignmentsRef.current,
            effectiveProvinceAssignments,
          )
        : null

    redrawCountryFillLayerBatched({
      scene,
      hexSize: grid.hexSize,
      countries,
      provinces,
      cellSurfaces: effectiveCellSurfaces,
      countryAssignments: effectiveCountryAssignments,
      provinceAssignments: effectiveProvinceAssignments,
      politicalColorMode,
      colorWaterInCountryLayer,
      cityStatesFillTerritory,
      visibleCellIds,
      alpha: politicalStyle.countryFillOpacity,
      dirtyCountryIds,
    })

    for (const [cellId, graphic] of scene.countryFillGraphics) {
      if (!countryPreviewOverridesRef.current.has(cellId)) {
        graphic.clear()
      }
    }

    redrawProvinceFillLayerBatched({
      scene,
      hexSize: grid.hexSize,
      provinces,
      cellSurfaces: effectiveCellSurfaces,
      provinceAssignments: effectiveProvinceAssignments,
      colorWaterInCountryLayer,
      visibleCellIds,
      alpha: politicalStyle.provinceFillOpacity,
      dirtyProvinceIds,
    })

    for (const [cellId, graphic] of scene.provinceFillGraphics) {
      if (!provincePreviewOverridesRef.current.has(cellId)) {
        graphic.clear()
      }
    }

    redrawCountryBorderLayerBatched({
      scene,
      countries,
      assignments: effectiveCountryAssignments,
      sharedColor: parseHexColor(politicalStyle.countryBorderColor),
      width: politicalStyle.countryBorderWidth,
      opacity: politicalStyle.countryBorderOpacity,
      sharedBorderOverridesOwn: politicalStyle.countrySharedBorderOverridesOwn,
      sharedBorderMode: politicalStyle.countrySharedBorderMode,
    })

    for (const graphic of scene.countryBorderGraphics.values()) {
      graphic.clear()
    }

    redrawProvinceBorderLayerBatched({
      scene,
      countries,
      provinces,
      cellSurfaces: effectiveCellSurfaces,
      countryAssignments: effectiveCountryAssignments,
      assignments: effectiveProvinceAssignments,
      color: parseHexColor(politicalStyle.provinceBorderColor),
      width: politicalStyle.provinceBorderWidth,
      opacity: politicalStyle.provinceBorderOpacity,
      borderOverridesCountryBorder: politicalStyle.provinceBorderOverridesCountryBorder,
    })

    for (const graphic of scene.provinceBorderGraphics.values()) {
      graphic.clear()
    }

    previousPoliticalSurfacesRef.current = cellSurfaces
    previousPoliticalCountryAssignmentsRef.current = countryAssignments
    previousPoliticalProvinceAssignmentsRef.current = provinceAssignments
    previousPoliticalVisibleCellIdsRef.current = visibleCellIds
    previousPoliticalHexSizeRef.current = grid.hexSize
    previousPoliticalColorModeRef.current = politicalColorMode
    previousPoliticalStyleRef.current = politicalStyle
    previousPaintHistoryRevisionRef.current = paintHistoryRevision
  }, [
    cellSurfaces,
    colorWaterInCountryLayer,
    countries,
    countryAssignments,
    resolvedTerrainLandAnchors,
    resolvedTerrainStyleColors,
    resolvedTerrainWaterAnchors,
    provinces,
    provinceAssignments,
    grid.hexSize,
    politicalColorMode,
    politicalStyle,
    cityStatesFillTerritory,
    visibleCellIds,
    paintHistoryRevision,
    sceneReadyTick,
  ])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    const visibleCellIds = visibleCellIdsRef.current

    redrawMovePreview(
      scene,
      grid.hexSize,
      moveSourceCellIdsRef.current,
      movePreviewCellIdsRef.current,
      moveBlockedCellIdsRef.current,
      movePreviewStylesRef.current,
      visibleCellIds,
    )

    updateHoveredOverlay(
      scene,
      visibleCellIds && pendingHoverCellIdRef.current && !visibleCellIds.has(pendingHoverCellIdRef.current)
        ? null
        : pendingHoverCellIdRef.current,
      grid.hexSize,
      lastRenderedHoveredCellIdRef,
      hoveredOverlayCellIdsRef,
      brushRadiusRef.current,
      radiusCellsCacheRef.current,
      cameraRef.current.isDrawing,
    )
  }, [
    grid.hexSize,
    moveSourceCellIds,
    movePreviewCellIds,
    moveBlockedCellIds,
    movePreviewStyles,
    visibleCellIds,
    sceneReadyTick,
  ])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    const visibleCellIds = visibleCellIdsRef.current
    const cityByCellId = new Map(
      Object.values(cities).map((city) => [city.cellId, city] as const),
    )

    for (const [cellId, container] of scene.citiesGraphics) {
      if (visibleCellIds && !visibleCellIds.has(cellId)) {
        container.removeChildren()
        continue
      }

      const city = cityByCellId.get(cellId)
      redrawCitiesGraphic({
        container,
        cell: scene.cellById.get(cellId),
        hexSize: grid.hexSize,
        city,
        cityLevel: city ? cityLevels[city.levelId] : undefined,
        texture: city ? textures[cityLevels[city.levelId]?.iconKey ?? ''] : undefined,
      })
    }
  }, [cities, cityLevels, grid.hexSize, sceneReadyTick, textures, visibleCellIds])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    redrawLabelsLayer({
      scene,
      cells,
      countries,
      provinces,
      cities,
      iconSourceMap,
      countryAssignments,
      provinceAssignments,
      labelGroups,
      labels,
      labelAnchorDisplayMode,
      selectedLabelId,
      textures,
      zoom: cameraRef.current.zoom,
      visibleCellIds: visibleCellIdsRef.current,
    })
  }, [
    cells,
    countries,
    provinces,
    cities,
    iconSourceMap,
    countryAssignments,
    provinceAssignments,
    labelGroups,
    labels,
    labelAnchorDisplayMode,
    selectedLabelId,
    sceneReadyTick,
    textures,
    visibleCellIds,
  ])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    redrawWorldDecorations(
      scene,
      cells,
      grid.hexSize,
      worldMetadata,
      worldFrame,
      worldAxes,
      visibleCellIdsRef.current,
    )
  }, [cells, grid.hexSize, sceneReadyTick, visibleCellIds, worldAxes, worldFrame, worldMetadata])

  useEffect(() => {
    const scene = sceneRef.current

    if (!scene) {
      return
    }

    applyLayerConfiguration(scene, layers, politicalStyle.provinceBorderOverridesCountryBorder)
  }, [layers, politicalStyle.provinceBorderOverridesCountryBorder, sceneReadyTick])

  return <div className="map-canvas" ref={hostRef} />
}

function drawScene(stage: Container, cells: HexCell[], hexSize: number) {
  stage.removeChildren()

  const mapRoot = new Container()
  const worldDecorLayer = new Container()
  const terrainFillLayer = new Container()
  const terrainEdgeLayer = new Container()
  const countryFillBatchLayer = new Container()
  const countryFillLayer = new Container()
  const countryBorderBatchLayer = new Container()
  const countryBorderLayer = new Container()
  const provinceFillBatchLayer = new Container()
  const provinceFillLayer = new Container()
  const provinceBorderBatchLayer = new Container()
  const provinceBorderLayer = new Container()
  const citiesLayer = new Container()
  const labelsLayer = new Container()
  const labelAnchorsLayer = new Container()
  const overlayLayer = new Container()
  const paintPreviewLayer = new Container()
  const worldDecorGraphic = new Graphics()
  const worldDecorTextLayer = new Container()
  const strokeOverlayGraphic = new Graphics()
  const moveSourceGraphic = new Graphics()
  const movePreviewGraphic = new Graphics()
  const selectionGraphic = new Graphics()
  const terrainFillGraphics = new Map<string, Graphics>()
  const terrainFillChunkGraphics = new Map<string, Graphics>()
  const terrainFillChunkCells = new Map<string, HexCell[]>()
  const terrainFillCellChunks = new Map<string, string>()
  const terrainFillChunkBounds = new Map<string, WorldRect>()
  const terrainEdgeChunkGraphics = new Map<string, Record<TerrainEdgeStyleKey, Graphics>>()
  const terrainEdgeChunkEdges = new Map<string, HexEdge[]>()
  const terrainEdgeCellChunks = new Map<string, Set<string>>()
  const terrainEdgeChunkBounds = new Map<string, WorldRect>()
  const countryFillBatchGraphics = new Map<string, Graphics>()
  const countryFillGraphics = new Map<string, Graphics>()
  const countryBorderBatchGraphics = new Map<string, Graphics>()
  const provinceFillBatchGraphics = new Map<string, Graphics>()
  const provinceFillGraphics = new Map<string, Graphics>()
  const provinceBorderBatchGraphics = new Map<string, Graphics>()
  const countryBorderGraphics = new Map<string, Graphics>()
  const provinceBorderGraphics = new Map<string, Graphics>()
  const citiesGraphics = new Map<string, Container>()
  const overlayGraphics = new Map<string, Graphics>()
  const cellById = createCellMap(cells)
  const cellsByCoordinates = createCoordinateCellMap(cells)
  const edges = buildHexEdges(cells, hexSize)
  const edgeById = new Map(edges.map((edge) => [edge.id, edge]))

  for (const cell of cells) {
    const fillChunkKey = getTerrainFillChunkKey(cell.q, cell.r)
    const chunkCells = terrainFillChunkCells.get(fillChunkKey)
    if (chunkCells) {
      chunkCells.push(cell)
    } else {
      terrainFillChunkCells.set(fillChunkKey, [cell])
    }
    terrainFillCellChunks.set(cell.id, fillChunkKey)

    const fillGraphic = new Graphics()
    const countryFillGraphic = new Graphics()
    const provinceFillGraphic = new Graphics()
    const cityContainer = new Container()
    const overlayGraphic = new Graphics()

    terrainFillLayer.addChild(fillGraphic)
    countryFillLayer.addChild(countryFillGraphic)
    provinceFillLayer.addChild(provinceFillGraphic)
    citiesLayer.addChild(cityContainer)
    overlayLayer.addChild(overlayGraphic)

    terrainFillGraphics.set(cell.id, fillGraphic)
    countryFillGraphics.set(cell.id, countryFillGraphic)
    provinceFillGraphics.set(cell.id, provinceFillGraphic)
    citiesGraphics.set(cell.id, cityContainer)
    overlayGraphics.set(cell.id, overlayGraphic)
  }

  for (const chunkKey of terrainFillChunkCells.keys()) {
    const chunkGraphic = new Graphics()
    terrainFillLayer.addChildAt(chunkGraphic, 0)
    terrainFillChunkGraphics.set(chunkKey, chunkGraphic)
    const chunkCells = terrainFillChunkCells.get(chunkKey) ?? []
    terrainFillChunkBounds.set(chunkKey, getChunkBoundsFromCells(chunkCells, hexSize))
  }

  worldDecorLayer.addChild(worldDecorGraphic, worldDecorTextLayer)
  paintPreviewLayer.addChild(strokeOverlayGraphic)
  overlayLayer.addChild(moveSourceGraphic, movePreviewGraphic, selectionGraphic)

  for (const edge of edges) {
    const ownerCell = cellById.get(edge.cellId)
    if (ownerCell) {
      const chunkKey = getTerrainEdgeChunkKey(ownerCell.q, ownerCell.r)
      const chunkEdges = terrainEdgeChunkEdges.get(chunkKey)
      if (chunkEdges) {
        chunkEdges.push(edge)
      } else {
        terrainEdgeChunkEdges.set(chunkKey, [edge])
      }
      addTerrainEdgeCellChunk(terrainEdgeCellChunks, edge.cellId, chunkKey)
      if (edge.neighborId !== null) {
        addTerrainEdgeCellChunk(terrainEdgeCellChunks, edge.neighborId, chunkKey)
      }
    }
    const countryBorderGraphic = new Graphics()
    const provinceBorderGraphic = new Graphics()
    countryBorderLayer.addChild(countryBorderGraphic)
    provinceBorderLayer.addChild(provinceBorderGraphic)
    countryBorderGraphics.set(edge.id, countryBorderGraphic)
    provinceBorderGraphics.set(edge.id, provinceBorderGraphic)
  }

  for (const chunkKey of terrainEdgeChunkEdges.keys()) {
    const chunkGraphics = Object.fromEntries(
      TERRAIN_EDGE_STYLE_KEYS.map((key) => [key, new Graphics()]),
    ) as Record<TerrainEdgeStyleKey, Graphics>
    TERRAIN_EDGE_STYLE_KEYS.forEach((key) => {
      terrainEdgeLayer.addChild(chunkGraphics[key])
    })
    terrainEdgeChunkGraphics.set(chunkKey, chunkGraphics)
    terrainEdgeChunkBounds.set(chunkKey, getChunkBoundsFromEdges(terrainEdgeChunkEdges.get(chunkKey) ?? []))
  }

  labelsLayer.addChild(labelAnchorsLayer)
  mapRoot.addChild(
    worldDecorLayer,
    terrainFillLayer,
    terrainEdgeLayer,
    countryFillBatchLayer,
    countryFillLayer,
    countryBorderBatchLayer,
    countryBorderLayer,
    provinceFillBatchLayer,
    provinceFillLayer,
    provinceBorderBatchLayer,
    provinceBorderLayer,
    citiesLayer,
    labelsLayer,
    paintPreviewLayer,
    overlayLayer,
  )
  stage.addChild(mapRoot)

  return {
    mapRoot,
    cellById,
    cellsByCoordinates,
    edgeById,
    countryFillBatchLayer,
    countryFillLayer,
    countryBorderBatchLayer,
    countryBorderLayer,
    provinceFillBatchLayer,
    provinceFillLayer,
    provinceBorderBatchLayer,
    provinceBorderLayer,
    layerContainers: {
      terrainFill: terrainFillLayer,
      terrainEdge: terrainEdgeLayer,
      countryFill: countryFillBatchLayer,
      countryBorder: countryBorderBatchLayer,
      provinceFill: provinceFillBatchLayer,
      provinceBorder: provinceBorderBatchLayer,
      cities: citiesLayer,
      labels: labelsLayer,
      overlay: overlayLayer,
    },
    terrainFillGraphics,
    terrainFillChunkGraphics,
    terrainFillChunkCells,
    terrainFillCellChunks,
    terrainFillChunkBounds,
    terrainEdgeChunkGraphics,
    terrainEdgeChunkEdges,
    terrainEdgeCellChunks,
    terrainEdgeChunkBounds,
    countryFillBatchGraphics,
    countryFillGraphics,
    countryBorderBatchGraphics,
    provinceFillBatchGraphics,
    provinceFillGraphics,
    provinceBorderBatchGraphics,
    countryBorderGraphics,
    provinceBorderGraphics,
    citiesGraphics,
    labelsLayer,
    labelAnchorsLayer,
    labelGroupContainers: new Map(),
    labelTexts: new Map(),
    orderedLabelIds: [],
    overlayGraphics,
    worldDecorLayer,
    worldDecorGraphic,
    worldDecorTextLayer,
    paintPreviewLayer,
    strokeOverlayGraphic,
    moveSourceGraphic,
    movePreviewGraphic,
    selectionGraphic,
  }
}

function applyLayerConfiguration(
  scene: SceneRefs,
  layers: Array<{ id: LayerId; visible: boolean }>,
  provinceBorderOverridesCountryBorder: boolean,
) {
  if (!scene.countryFillBatchLayer) {
    ;(scene as SceneRefs & { countryFillBatchLayer: Container }).countryFillBatchLayer = new Container()
  }
  if (!scene.countryBorderBatchLayer) {
    ;(scene as SceneRefs & { countryBorderBatchLayer: Container }).countryBorderBatchLayer = new Container()
  }
  if (!scene.provinceFillBatchLayer) {
    ;(scene as SceneRefs & { provinceFillBatchLayer: Container }).provinceFillBatchLayer = new Container()
  }
  if (!scene.provinceBorderBatchLayer) {
    ;(scene as SceneRefs & { provinceBorderBatchLayer: Container }).provinceBorderBatchLayer = new Container()
  }
  const layerContainers = scene.layerContainers as Record<string, Container>
  if (!layerContainers.countryFill) {
    layerContainers.countryFill = scene.countryFillBatchLayer
  }
  if (!layerContainers.countryBorder) {
    layerContainers.countryBorder = scene.countryBorderBatchLayer
  }
  if (!layerContainers.provinceFill) {
    layerContainers.provinceFill = scene.provinceFillBatchLayer
  }
  if (!layerContainers.provinceBorder) {
    layerContainers.provinceBorder = scene.provinceBorderBatchLayer
  }
  scene.mapRoot.removeChildren()
  scene.mapRoot.addChild(scene.worldDecorLayer)

  for (const layer of layers) {
    if (layer.id === 'countryFill') {
      scene.countryFillBatchLayer.visible = layer.visible
      scene.countryFillLayer.visible = layer.visible
      scene.mapRoot.addChild(
        scene.countryFillBatchLayer,
        scene.countryFillLayer,
      )
      continue
    }

    if (layer.id === 'countryBorder') {
      scene.countryBorderBatchLayer.visible = layer.visible
      scene.countryBorderLayer.visible = layer.visible
      scene.mapRoot.addChild(
        scene.countryBorderBatchLayer,
        scene.countryBorderLayer,
      )
      continue
    }

    if (layer.id === 'provinceFill') {
      scene.provinceFillBatchLayer.visible = layer.visible
      scene.provinceFillLayer.visible = layer.visible
      scene.mapRoot.addChild(
        scene.provinceFillBatchLayer,
        scene.provinceFillLayer,
      )
      continue
    }

    if (layer.id === 'provinceBorder') {
      scene.provinceBorderBatchLayer.visible = layer.visible
      scene.provinceBorderLayer.visible = layer.visible
      scene.mapRoot.addChild(
        scene.provinceBorderBatchLayer,
        scene.provinceBorderLayer,
      )
      continue
    }

    if (layer.id === 'overlay') {
      scene.mapRoot.addChild(scene.paintPreviewLayer)
    }

    const container = layerContainers[layer.id]
    if (!container) {
      continue
    }
    container.visible = layer.visible
    scene.mapRoot.addChild(container)
  }

  syncPoliticalBorderLayerOrder(scene, provinceBorderOverridesCountryBorder)
}

function syncPoliticalBorderLayerOrder(
  scene: SceneRefs,
  provinceBorderOverridesCountryBorder: boolean,
) {
  const borderLayers = [
    scene.countryBorderBatchLayer,
    scene.countryBorderLayer,
    scene.provinceBorderBatchLayer,
    scene.provinceBorderLayer,
  ]

  if (borderLayers.some((layer) => !scene.mapRoot.children.includes(layer))) {
    return
  }

  const baseIndex = Math.min(...borderLayers.map((layer) => scene.mapRoot.getChildIndex(layer)))
  const orderedLayers = provinceBorderOverridesCountryBorder
    ? [
        scene.countryBorderBatchLayer,
        scene.countryBorderLayer,
        scene.provinceBorderBatchLayer,
        scene.provinceBorderLayer,
      ]
    : [
        scene.provinceBorderBatchLayer,
        scene.provinceBorderLayer,
        scene.countryBorderBatchLayer,
        scene.countryBorderLayer,
      ]

  orderedLayers.forEach((layer, index) => {
    scene.mapRoot.setChildIndex(layer, baseIndex + index)
  })
}

function formatAxisLetter(index: number, minimumDigits: number) {
  if (minimumDigits <= 1) {
    return String.fromCharCode(65 + (index % 26))
  }

  const chars = Array.from({ length: minimumDigits }, () => 'A')
  let value = index

  for (let position = minimumDigits - 1; position >= 0; position -= 1) {
    chars[position] = String.fromCharCode(65 + (value % 26))
    value = Math.floor(value / 26)
  }

  return chars.join('')
}

function redrawWorldDecorations(
  scene: SceneRefs,
  cells: HexCell[],
  hexSize: number,
  metadata: WorldMetadata,
  frame: WorldFrame,
  axes: WorldAxes,
  visibleCellIds: Set<string> | null,
) {
  const decorCells =
    visibleCellIds === null ? cells : cells.filter((cell) => visibleCellIds.has(cell.id))
  const decorationScale = visibleCellIds === null ? 1 : 0.82

  if (decorCells.length === 0) {
    scene.worldDecorGraphic.clear()
    scene.worldDecorTextLayer.removeChildren()
    return
  }

  const bounds = getGridBounds(decorCells, hexSize)
  const frameColor = parseHexColor(frame.color)
  const left = bounds.minX - frame.left
  const top = bounds.minY - frame.top
  const right = bounds.maxX + frame.right
  const bottom = bounds.maxY + frame.bottom
  const sortedColumns = [...new Set(decorCells.map((cell) => cell.q))].sort((a, b) => a - b)
  const sortedRows = [...new Set(decorCells.map((cell) => cell.r))].sort((a, b) => a - b)
  const allColumns = [...new Set(cells.map((cell) => cell.q))].sort((a, b) => a - b)
  const allRows = [...new Set(cells.map((cell) => cell.r))].sort((a, b) => a - b)
  const minColumnDigits =
    allColumns.length > 26 ? (allColumns.length > 26 * 26 ? 3 : 2) : 1
  const maxRowDigits = String((allRows.at(-1) ?? 0) + 1).length > 1 ? String((allRows.at(-1) ?? 0) + 1).length : 0
  const axisFontSize = Math.max(Math.round(axes.fontSize * decorationScale), 10)
  const estimatedRowLabelWidth =
    (maxRowDigits > 0 ? maxRowDigits : 1) * Math.max(axisFontSize * 0.64, 7)
  const leftAxisTextLeft = sortedRows.length > 0
    ? Math.min(
        ...sortedRows.map((r, index) => {
          const rowCells = decorCells.filter((cell) => cell.r === r)
          const leftCell = [...rowCells].sort((a, b) => a.centerX - b.centerX)[0]
          const edge = getPointyHexEdge(leftCell.centerX, leftCell.centerY, hexSize, 3)
          const x = (edge.x1 + edge.x2) / 2 - 6 - (index % 2 === 0 ? 0 : axisFontSize * 0.28)
          return x - estimatedRowLabelWidth
        }),
      )
    : left + 14
  const rightAxisTextRight = axes.showRight && sortedRows.length > 0
    ? Math.max(
        ...sortedRows.map((r, index) => {
          const rowCells = decorCells.filter((cell) => cell.r === r)
          const rightCell = [...rowCells].sort((a, b) => b.centerX - a.centerX)[0]
          const rightEdge = getPointyHexEdge(rightCell.centerX, rightCell.centerY, hexSize, 0)
          const x =
            (rightEdge.x1 + rightEdge.x2) / 2 + 6 + (index % 2 === 0 ? 0 : axisFontSize * 0.28)
          return x + estimatedRowLabelWidth
        }),
      )
    : right - 14

  scene.worldDecorGraphic
    .clear()
    .rect(left, top, right - left, bottom - top)
    .fill({ color: frameColor, alpha: 1 })

  scene.worldDecorTextLayer.removeChildren()
  const worldAuthor = metadata.author.trim()
  const brandOwnerText = 'AEMEATH'

  const hasVisibleTitle = metadata.title.trim() && metadata.showTitle
  const hasVisibleSubtitle = metadata.subtitle.trim() && metadata.showSubtitle
  const hasVisibleByline = metadata.showByline && worldAuthor.length > 0

  if (hasVisibleTitle || hasVisibleSubtitle || hasVisibleByline) {
    const titleColor = metadata.titleColor || '#20150f'
    const subtitleColor = metadata.subtitleColor || '#4e3b34'
    const authorColor = metadata.bylineColor || '#7a6971'
    const titleLeft = leftAxisTextLeft - 2
    const headerFontFamily = metadata.headerFontFamily || axes.fontFamily
    const headerTop = top + 8 + metadata.pageMarginTop
    const titleFontSize = Math.max(Math.round(metadata.titleFontSize * decorationScale), 12)
    const subtitleFontSize = Math.max(Math.round(metadata.subtitleFontSize * decorationScale), 10)
    const bylineFontSize = Math.max(Math.round(metadata.bylineFontSize * decorationScale), 9)
    const titleSubtitleGap = Math.max(Math.round(metadata.titleSubtitleGap * decorationScale), 2)
    const subtitleBylineGap = Math.max(Math.round(metadata.subtitleBylineGap * decorationScale), 2)
    let nextY = headerTop

    if (hasVisibleTitle) {
      const title = new Text({
        text: metadata.title.trim(),
        style: {
          fontFamily: headerFontFamily,
          fontSize: titleFontSize,
          fontWeight: '700',
          fill: titleColor,
        } as never,
      })
      title.anchor.set(0, 0)
      title.position.set(titleLeft, nextY)
      scene.worldDecorTextLayer.addChild(title)
      nextY = title.y + title.height + titleSubtitleGap
    }

    if (hasVisibleSubtitle) {
      const subtitle = new Text({
        text: metadata.subtitle.trim(),
        style: {
          fontFamily: headerFontFamily,
          fontSize: subtitleFontSize,
          fontWeight: '400',
          fill: subtitleColor,
        } as never,
      })
      subtitle.anchor.set(0, 0)
      subtitle.position.set(titleLeft, nextY)
      subtitle.alpha = 0.82
      scene.worldDecorTextLayer.addChild(subtitle)
      nextY = subtitle.y + subtitle.height + subtitleBylineGap
    }

    if (hasVisibleByline) {
      const byAuthor = new Text({
        text: `by ${worldAuthor}`,
        style: {
          fontFamily: headerFontFamily,
          fontSize: bylineFontSize,
          fontWeight: '500',
          fill: authorColor,
          letterSpacing: 0.3,
        } as never,
      })
      byAuthor.anchor.set(0, 0)
      byAuthor.position.set(titleLeft, nextY)
      byAuthor.alpha = 0.86
      scene.worldDecorTextLayer.addChild(byAuthor)
    }
  }

  if (metadata.showBranding) {
    const brandingScale = Math.min(Math.max(frame.top / 48, 0.72), 1.46)
    const effectiveBrandingScale = brandingScale * decorationScale
    const brandingRight = rightAxisTextRight + 4
    const brandingTop = top + 11 + metadata.pageMarginTop
    const brandTitle = new Text({
      text: 'AEMEATH',
      style: {
        fontFamily: axes.fontFamily,
        fontSize: Math.max(Math.round(axisFontSize * 1.55 * effectiveBrandingScale), 16),
        fontWeight: '700',
        fill: '#c88aa9',
        letterSpacing: 1.2,
      } as never,
    })
    const brandOwner = new Text({
      text: brandOwnerText,
      style: {
        fontFamily: axes.fontFamily,
        fontSize: Math.max(Math.round(axisFontSize * 0.86 * effectiveBrandingScale), 9),
        fontWeight: '500',
        fill: '#8f7d87',
        letterSpacing: 0.4,
      } as never,
    })
    brandOwner.anchor.set(1, 0)
    brandOwner.position.set(brandingRight, brandingTop)
    brandOwner.alpha = 0.5
    scene.worldDecorTextLayer.addChild(brandOwner)

    brandTitle.anchor.set(1, 0)
    brandTitle.position.set(brandingRight, brandOwner.y + brandOwner.height - 2)
    brandTitle.alpha = 0.56
    scene.worldDecorTextLayer.addChild(brandTitle)

    const brandSubtitleFontSize = Math.max(Math.round(axisFontSize * 0.58 * effectiveBrandingScale), 6)
    const brandSubtitleTop = brandTitle.y + brandTitle.height + Math.max(2, Math.round(2 * effectiveBrandingScale))
    const brandSubtitleLines = [
      [
        { initial: 'A', rest: 'dorable ' },
        { initial: 'E', rest: 'ditor for ' },
        { initial: 'M', rest: 'anaging and' },
      ],
      [
        { initial: 'E', rest: 'ngineering ' },
        { initial: 'A', rest: 'rknights-inspired ' },
        { initial: 'T', rest: 'iled ' },
        { initial: 'H', rest: 'exmaps' },
      ],
    ]

    brandSubtitleLines.forEach((segments, lineIndex) => {
      const lineContainer = new Container()
      let cursorX = 0

      segments.forEach((segment) => {
        const initial = new Text({
          text: segment.initial,
          style: {
            fontFamily: axes.fontFamily,
            fontSize: brandSubtitleFontSize,
            fontWeight: '600',
            fill: '#c88aa9',
          } as never,
        })
        initial.position.set(cursorX, 0)
        lineContainer.addChild(initial)
        cursorX += initial.width

        const rest = new Text({
          text: segment.rest,
          style: {
            fontFamily: axes.fontFamily,
            fontSize: brandSubtitleFontSize,
            fontWeight: '400',
            fill: '#9c8f95',
          } as never,
        })
        rest.position.set(cursorX, 0)
        lineContainer.addChild(rest)
        cursorX += rest.width
      })

      lineContainer.position.set(rightAxisTextRight + 4 - lineContainer.width, brandSubtitleTop + lineIndex * (brandSubtitleFontSize + 3))
      lineContainer.alpha = 0.58
      scene.worldDecorTextLayer.addChild(lineContainer)
    })
  }

  if (!axes.showTop && !axes.showRight && !axes.showBottom && !axes.showLeft) {
    return
  }

  const topAxisBaseline = Math.min(
    ...sortedColumns.map((columnQ) => {
      const cellsInColumn = decorCells.filter((cell) => cell.q === columnQ)
      const columnTopCell = [...cellsInColumn].sort((left, right) => left.centerY - right.centerY)[0]
      return columnTopCell.centerY - hexSize
    }),
  )
  const bottomAxisBaseline = Math.max(
    ...sortedColumns.map((columnQ) => {
      const cellsInColumn = decorCells.filter((cell) => cell.q === columnQ)
      const columnBottomCell = [...cellsInColumn].sort((left, right) => right.centerY - left.centerY)[0]
      return columnBottomCell.centerY + hexSize
    }),
  )

  sortedColumns.forEach((q) => {
    const columnCells = decorCells.filter((cell) => cell.q === q)
    if (columnCells.length === 0) {
      return
    }
    const topCell = [...columnCells].sort((left, right) => left.centerY - right.centerY)[0]
    const bottomCell = [...columnCells].sort((left, right) => right.centerY - left.centerY)[0]
    const topVertexY = topCell.centerY - hexSize
    const bottomVertexY = bottomCell.centerY + hexSize
    const x = topCell.centerX
    const y = topCell.centerY - hexSize - 4
    const labelText = formatAxisLetter(q, minColumnDigits)
    if (axes.showTop) {
      if (Math.abs(topVertexY - topAxisBaseline) > 0.01) {
        // Skip ragged partial edge columns so the top axis stays on one line.
      } else {
      const label = new Text({
        text: labelText,
        style: {
          fontFamily: axes.fontFamily,
          fontSize: axisFontSize,
          fontWeight: '600',
          fill: axes.color,
        } as never,
      })
      label.anchor.set(0.5, 1)
      label.position.set(x, y)
      label.alpha = 0.92
      scene.worldDecorTextLayer.addChild(label)
      }
    }

    if (axes.showBottom) {
      if (Math.abs(bottomVertexY - bottomAxisBaseline) > 0.01) {
        // Skip ragged partial edge columns so the bottom axis stays on one line.
      } else {
      const bottomLabel = new Text({
        text: labelText,
        style: {
          fontFamily: axes.fontFamily,
          fontSize: axisFontSize,
          fontWeight: '600',
          fill: axes.color,
        } as never,
      })
      bottomLabel.anchor.set(0.5, 0)
      bottomLabel.position.set(bottomCell.centerX, bottomCell.centerY + hexSize + 4)
      bottomLabel.alpha = 0.92
      scene.worldDecorTextLayer.addChild(bottomLabel)
      }
    }
  })

  sortedRows.forEach((r, index) => {
    const rowCells = decorCells.filter((cell) => cell.r === r)
    if (rowCells.length === 0) {
      return
    }
    const leftCell = [...rowCells].sort((left, right) => left.centerX - right.centerX)[0]
    const rightCell = [...rowCells].sort((left, right) => right.centerX - left.centerX)[0]
    const edge = getPointyHexEdge(leftCell.centerX, leftCell.centerY, hexSize, 3)
    const rightEdge = getPointyHexEdge(rightCell.centerX, rightCell.centerY, hexSize, 0)
    const x = (edge.x1 + edge.x2) / 2 - 6
    const y = (edge.y1 + edge.y2) / 2
    const labelValue =
      maxRowDigits > 0
        ? String(r + 1).padStart(maxRowDigits, '0')
        : String(r + 1)
    if (axes.showLeft) {
      const label = new Text({
        text: labelValue,
        style: {
          fontFamily: axes.fontFamily,
          fontSize: axisFontSize,
          fontWeight: '600',
          fill: axes.color,
        } as never,
      })
      label.anchor.set(1, 0.5)
      label.position.set(x - (index % 2 === 0 ? 0 : axisFontSize * 0.28), y)
      label.alpha = 0.92
      scene.worldDecorTextLayer.addChild(label)
    }

    if (axes.showRight) {
      const rightLabel = new Text({
        text: labelValue,
        style: {
          fontFamily: axes.fontFamily,
          fontSize: axisFontSize,
          fontWeight: '600',
          fill: axes.color,
        } as never,
      })
      rightLabel.anchor.set(0, 0.5)
      rightLabel.position.set((rightEdge.x1 + rightEdge.x2) / 2 + 6 + (index % 2 === 0 ? 0 : axisFontSize * 0.28), y)
      rightLabel.alpha = 0.92
      scene.worldDecorTextLayer.addChild(rightLabel)
    }
  })
}

function createEmptySurface(): CellSurfaceState {
  return {
    kind: 'empty',
    elevation: 0,
    special: 'none',
  }
}

function mixHexColors(leftHex: string, rightHex: string, ratio: number) {
  const left = parseHexColor(leftHex)
  const right = parseHexColor(rightHex)
  const clamped = Math.max(0, Math.min(1, ratio))
  const leftR = (left >> 16) & 0xff
  const leftG = (left >> 8) & 0xff
  const leftB = left & 0xff
  const rightR = (right >> 16) & 0xff
  const rightG = (right >> 8) & 0xff
  const rightB = right & 0xff

  const mixedR = Math.round(leftR + (rightR - leftR) * clamped)
  const mixedG = Math.round(leftG + (rightG - leftG) * clamped)
  const mixedB = Math.round(leftB + (rightB - leftB) * clamped)

  return (mixedR << 16) | (mixedG << 8) | mixedB
}

function resolveTerrainAnchors(
  anchors: Array<{ elevation: number; color: string }>,
) {
  return [...anchors]
    .sort((left, right) => left.elevation - right.elevation)
    .map((anchor) => ({
      elevation: anchor.elevation,
      color: anchor.color,
      colorValue: parseHexColor(anchor.color),
    }))
}

function getTerrainEdgeChunkKey(q: number, r: number) {
  return `${Math.floor(q / TERRAIN_EDGE_CHUNK_SIZE)}:${Math.floor(r / TERRAIN_EDGE_CHUNK_SIZE)}`
}

function addTerrainEdgeCellChunk(
  terrainEdgeCellChunks: Map<string, Set<string>>,
  cellId: string,
  chunkKey: string,
) {
  const chunkKeys = terrainEdgeCellChunks.get(cellId)
  if (chunkKeys) {
    chunkKeys.add(chunkKey)
  } else {
    terrainEdgeCellChunks.set(cellId, new Set([chunkKey]))
  }
}

function collectTerrainEdgeChunkKeys(
  terrainEdgeCellChunks: Map<string, Set<string>>,
  dirtyCellIds: Set<string>,
) {
  const chunkKeys = new Set<string>()
  for (const cellId of dirtyCellIds) {
    const cellChunkKeys = terrainEdgeCellChunks.get(cellId)
    if (!cellChunkKeys) {
      continue
    }
    for (const chunkKey of cellChunkKeys) {
      chunkKeys.add(chunkKey)
    }
  }
  return chunkKeys
}

function isSameSurfaceState(left: CellSurfaceState | undefined, right: CellSurfaceState | undefined) {
  if (left === right) {
    return true
  }
  if (!left || !right) {
    return false
  }
  return (
    left.kind === right.kind &&
    left.elevation === right.elevation &&
    left.special === right.special
  )
}

function getChangedSurfaceCellIds(
  previous: Record<string, CellSurfaceState>,
  next: Record<string, CellSurfaceState>,
) {
  const changed = new Set<string>()
  for (const cellId of Object.keys(next)) {
    if (!isSameSurfaceState(previous[cellId], next[cellId])) {
      changed.add(cellId)
    }
  }
  return changed
}

function getChangedPoliticalCellIds(
  previousSurfaces: Record<string, CellSurfaceState>,
  nextSurfaces: Record<string, CellSurfaceState>,
  previousCountryAssignments: Record<string, string | null>,
  nextCountryAssignments: Record<string, string | null>,
  previousProvinceAssignments: Record<string, string | null>,
  nextProvinceAssignments: Record<string, string | null>,
) {
  const changed = new Set<string>()
  const cellIds = new Set([
    ...Object.keys(nextSurfaces),
    ...Object.keys(previousSurfaces),
    ...Object.keys(nextCountryAssignments),
    ...Object.keys(previousCountryAssignments),
    ...Object.keys(nextProvinceAssignments),
    ...Object.keys(previousProvinceAssignments),
  ])
  for (const cellId of cellIds) {
    if (
      !isSameSurfaceState(previousSurfaces[cellId], nextSurfaces[cellId]) ||
      (previousCountryAssignments[cellId] ?? null) !== (nextCountryAssignments[cellId] ?? null) ||
      (previousProvinceAssignments[cellId] ?? null) !== (nextProvinceAssignments[cellId] ?? null)
    ) {
      changed.add(cellId)
    }
  }
  return changed
}

function collectDirtyAssignedIds(
  cellIds: Iterable<string>,
  previousAssignments: Record<string, string | null>,
  nextAssignments: Record<string, string | null>,
) {
  const dirty = new Set<string>()
  for (const cellId of cellIds) {
    const previousId = previousAssignments[cellId]
    const nextId = nextAssignments[cellId]
    if (previousId) {
      dirty.add(previousId)
    }
    if (nextId) {
      dirty.add(nextId)
    }
  }
  return dirty
}

function getTerrainFillChunkKey(q: number, r: number) {
  return `${Math.floor(q / TERRAIN_FILL_CHUNK_SIZE)}:${Math.floor(r / TERRAIN_FILL_CHUNK_SIZE)}`
}

function getChunkBoundsFromCells(cells: HexCell[], hexSize: number): WorldRect {
  if (cells.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const cell of cells) {
    minX = Math.min(minX, cell.centerX - hexSize)
    minY = Math.min(minY, cell.centerY - hexSize)
    maxX = Math.max(maxX, cell.centerX + hexSize)
    maxY = Math.max(maxY, cell.centerY + hexSize)
  }
  return { minX, minY, maxX, maxY }
}

function getChunkBoundsFromEdges(edges: HexEdge[]): WorldRect {
  if (edges.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const edge of edges) {
    minX = Math.min(minX, edge.x1, edge.x2)
    minY = Math.min(minY, edge.y1, edge.y2)
    maxX = Math.max(maxX, edge.x1, edge.x2)
    maxY = Math.max(maxY, edge.y1, edge.y2)
  }
  return { minX, minY, maxX, maxY }
}

function getViewportWorldRect(host: HTMLDivElement, camera: CameraState, overscan = 0): WorldRect {
  const scaleX = Math.max(camera.baseScale * camera.zoom, 0.0001)
  const scaleY = scaleX
  const minX = (-camera.positionX) / scaleX - overscan
  const minY = (-camera.positionY) / scaleY - overscan
  const maxX = (host.clientWidth - camera.positionX) / scaleX + overscan
  const maxY = (host.clientHeight - camera.positionY) / scaleY + overscan
  return { minX, minY, maxX, maxY }
}

function rectIntersects(a: WorldRect, b: WorldRect) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

function updateTerrainChunkVisibility(
  scene: SceneRefs,
  host: HTMLDivElement,
  camera: CameraState,
  overscan: number,
) {
  const viewportBounds = getViewportWorldRect(host, camera, overscan)

  for (const [chunkKey, graphic] of scene.terrainFillChunkGraphics) {
    const chunkBounds = scene.terrainFillChunkBounds.get(chunkKey)
    graphic.visible = !chunkBounds || rectIntersects(chunkBounds, viewportBounds)
  }

  for (const [chunkKey, chunkGraphics] of scene.terrainEdgeChunkGraphics) {
    const chunkBounds = scene.terrainEdgeChunkBounds.get(chunkKey)
    const visible = !chunkBounds || rectIntersects(chunkBounds, viewportBounds)
    for (const key of TERRAIN_EDGE_STYLE_KEYS) {
      chunkGraphics[key].visible = visible
    }
  }
}

function collectTerrainFillChunkKeys(
  scene: SceneRefs,
  dirtyCellIds: Iterable<string>,
) {
  const chunkKeys = new Set<string>()
  for (const cellId of dirtyCellIds) {
    const chunkKey = scene.terrainFillCellChunks.get(cellId)
    if (chunkKey) {
      chunkKeys.add(chunkKey)
    }
  }
  return chunkKeys
}

function getAnchoredColor(
  anchors: ResolvedTerrainAnchor[],
  elevation: number,
) {
  if (anchors.length === 0) {
    return 0x000000
  }
  const exact = anchors.find((anchor) => anchor.elevation === elevation)
  if (exact) {
    return exact.colorValue
  }
  const left = [...anchors].reverse().find((anchor) => anchor.elevation < elevation) ?? anchors[0]
  const right = anchors.find((anchor) => anchor.elevation > elevation) ?? anchors.at(-1) ?? anchors[0]
  if (left.elevation === right.elevation) {
    return left.colorValue
  }
  return mixHexColors(left.color, right.color, (elevation - left.elevation) / (right.elevation - left.elevation))
}

function getSurfaceFillColor(
  surface: CellSurfaceState,
  terrainStyle: Pick<
    HexMapCanvasProps['terrainStyle'],
    | 'displayMode'
    | 'landFillColor'
    | 'landAnchors'
    | 'waterFillColor'
    | 'waterAnchors'
    | 'snowLineElevation'
    | 'snowColor'
    | 'showSnowOverride'
    | 'emptyFillColor'
    | 'landUnknownFillColor'
    | 'waterUnknownFillColor'
    | 'waterDarkFillColor'
  > & {
    resolvedLandAnchors: ResolvedTerrainAnchor[]
    resolvedWaterAnchors: ResolvedTerrainAnchor[]
    resolvedColors: ResolvedTerrainStyleColors
  },
) {
  const normalized = normalizeSurfaceState(surface)

  if (normalized.kind === 'empty') {
    return terrainStyle.resolvedColors.emptyFillColor
  }

  if (normalized.special === 'unknown') {
    return (
      normalized.kind === 'water'
        ? terrainStyle.resolvedColors.waterUnknownFillColor
        : terrainStyle.resolvedColors.landUnknownFillColor
    )
  }

  if (normalized.special === 'dark' && normalized.kind === 'water') {
    return terrainStyle.resolvedColors.waterDarkFillColor
  }

  if (normalized.kind === 'water') {
    if (terrainStyle.displayMode === 'surface') {
      return terrainStyle.resolvedColors.waterFillColor
    }
    return getAnchoredColor(terrainStyle.resolvedWaterAnchors, normalized.elevation)
  }

  if (terrainStyle.displayMode === 'surface') {
    return terrainStyle.resolvedColors.landFillColor
  }
  if (terrainStyle.showSnowOverride && normalized.elevation >= terrainStyle.snowLineElevation) {
    return terrainStyle.resolvedColors.snowColor
  }
  return getAnchoredColor(terrainStyle.resolvedLandAnchors, normalized.elevation)
}

function redrawTerrainFillGraphic({
  graphic,
  cell,
  hexSize,
  surface,
  displayMode,
  landFillColor,
  landAnchors,
  waterFillColor,
  waterAnchors,
  resolvedLandAnchors,
  resolvedWaterAnchors,
  resolvedColors,
  snowLineElevation,
  snowColor,
  showSnowOverride,
  emptyFillColor,
  landUnknownFillColor,
  waterUnknownFillColor,
  waterDarkFillColor,
  showEmptyCells,
}: {
  graphic: Graphics
  cell: HexCell | undefined
  hexSize: number
  surface: CellSurfaceState
  displayMode: 'surface' | 'topography'
  landFillColor: string
  landAnchors: Array<{ elevation: number; color: string }>
  waterFillColor: string
  waterAnchors: Array<{ elevation: number; color: string }>
  resolvedLandAnchors: ResolvedTerrainAnchor[]
  resolvedWaterAnchors: ResolvedTerrainAnchor[]
  resolvedColors: ResolvedTerrainStyleColors
  snowLineElevation: number
  snowColor: string
  showSnowOverride: boolean
  emptyFillColor: string
  landUnknownFillColor: string
  waterUnknownFillColor: string
  waterDarkFillColor: string
  showEmptyCells: boolean
}): void {
  if (!cell) {
    return
  }

  graphic.clear()
  const polygon = getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)

  if (surface.kind === 'empty') {
    if (!showEmptyCells) {
      return
    }

    graphic.poly(polygon).fill({ color: resolvedColors.emptyFillColor, alpha: 0.52 })
    return
  }

  graphic.poly(polygon).fill(
    getSurfaceFillColor(surface, {
      displayMode,
      landFillColor,
      landAnchors,
      waterFillColor,
      waterAnchors,
      resolvedLandAnchors,
      resolvedWaterAnchors,
      resolvedColors,
      snowLineElevation,
      snowColor,
      showSnowOverride,
      emptyFillColor,
      landUnknownFillColor,
      waterUnknownFillColor,
      waterDarkFillColor,
    }),
  )
}

function redrawTerrainFillLayerChunked({
  scene,
  hexSize,
  cellSurfaces,
  terrainStyle,
  resolvedLandAnchors,
  resolvedWaterAnchors,
  resolvedColors,
  visibleCellIds,
  dirtyCellIds,
  viewportBounds,
}: {
  scene: SceneRefs
  hexSize: number
  cellSurfaces: Record<string, CellSurfaceState>
  terrainStyle: HexMapCanvasProps['terrainStyle']
  resolvedLandAnchors: ResolvedTerrainAnchor[]
  resolvedWaterAnchors: ResolvedTerrainAnchor[]
  resolvedColors: ResolvedTerrainStyleColors
  visibleCellIds: Set<string> | null
  dirtyCellIds: Set<string> | null
  viewportBounds?: WorldRect | null
}) {
  ensureTerrainFillChunkState(scene, hexSize)

  const chunkKeys = dirtyCellIds
    ? collectTerrainFillChunkKeys(scene, dirtyCellIds)
    : new Set(scene.terrainFillChunkGraphics.keys())

  for (const chunkKey of chunkKeys) {
    if (dirtyCellIds && viewportBounds) {
      const chunkBounds = scene.terrainFillChunkBounds.get(chunkKey)
      if (chunkBounds && !rectIntersects(chunkBounds, viewportBounds)) {
        continue
      }
    }
    const graphic = scene.terrainFillChunkGraphics.get(chunkKey)
    const chunkCells = scene.terrainFillChunkCells.get(chunkKey)
    if (!graphic || !chunkCells) {
      continue
    }
    graphic.clear()
    for (const cell of chunkCells) {
      if (visibleCellIds && !visibleCellIds.has(cell.id)) {
        continue
      }
      const surface = cellSurfaces[cell.id] ?? DEFAULT_SURFACE_STATE
      if (surface.kind === 'empty' && !terrainStyle.showEmptyCells) {
        continue
      }
      const polygon = getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)
      const fillColor = getSurfaceFillColor(surface, {
        displayMode: terrainStyle.displayMode,
        landFillColor: terrainStyle.landFillColor,
        landAnchors: terrainStyle.landAnchors,
        waterFillColor: terrainStyle.waterFillColor,
        waterAnchors: terrainStyle.waterAnchors,
        resolvedLandAnchors,
        resolvedWaterAnchors,
        resolvedColors,
        snowLineElevation: terrainStyle.snowLineElevation,
        snowColor: terrainStyle.snowColor,
        showSnowOverride: terrainStyle.showSnowOverride,
        emptyFillColor: terrainStyle.emptyFillColor,
        landUnknownFillColor: terrainStyle.landUnknownFillColor,
        waterUnknownFillColor: terrainStyle.waterUnknownFillColor,
        waterDarkFillColor: terrainStyle.waterDarkFillColor,
      })
      const alpha = surface.kind === 'empty' ? 0.52 : 1
      graphic.poly(polygon).fill({ color: fillColor, alpha })
    }
  }
}

function ensureTerrainFillChunkState(scene: SceneRefs, hexSize: number) {
  if (
    scene.terrainFillChunkGraphics &&
    scene.terrainFillChunkCells &&
    scene.terrainFillCellChunks &&
    scene.terrainFillChunkBounds
  ) {
    return
  }

  const terrainFillChunkGraphics = new Map<string, Graphics>()
  const terrainFillChunkCells = new Map<string, HexCell[]>()
  const terrainFillCellChunks = new Map<string, string>()
  const terrainFillChunkBounds = new Map<string, WorldRect>()

  for (const cell of scene.cellById.values()) {
    const chunkKey = getTerrainFillChunkKey(cell.q, cell.r)
    const chunkCells = terrainFillChunkCells.get(chunkKey)
    if (chunkCells) {
      chunkCells.push(cell)
    } else {
      terrainFillChunkCells.set(chunkKey, [cell])
    }
    terrainFillCellChunks.set(cell.id, chunkKey)
  }

  scene.layerContainers.terrainFill.removeChildren()

  for (const [chunkKey, chunkCells] of terrainFillChunkCells) {
    const chunkGraphic = new Graphics()
    scene.layerContainers.terrainFill.addChild(chunkGraphic)
    terrainFillChunkGraphics.set(chunkKey, chunkGraphic)
    terrainFillChunkBounds.set(chunkKey, getChunkBoundsFromCells(chunkCells, hexSize))
  }

  for (const [cellId, graphic] of scene.terrainFillGraphics) {
    scene.layerContainers.terrainFill.addChild(graphic)
    const chunkKey = terrainFillCellChunks.get(cellId)
    if (chunkKey) {
      const chunkGraphic = terrainFillChunkGraphics.get(chunkKey)
      if (chunkGraphic) {
        scene.layerContainers.terrainFill.setChildIndex(graphic, scene.layerContainers.terrainFill.children.length - 1)
      }
    }
  }

  ;(scene as SceneRefs & {
    terrainFillChunkGraphics: Map<string, Graphics>
    terrainFillChunkCells: Map<string, HexCell[]>
    terrainFillCellChunks: Map<string, string>
    terrainFillChunkBounds: Map<string, WorldRect>
  }).terrainFillChunkGraphics = terrainFillChunkGraphics
  ;(scene as SceneRefs & {
    terrainFillChunkGraphics: Map<string, Graphics>
    terrainFillChunkCells: Map<string, HexCell[]>
    terrainFillCellChunks: Map<string, string>
    terrainFillChunkBounds: Map<string, WorldRect>
  }).terrainFillChunkCells = terrainFillChunkCells
  ;(scene as SceneRefs & {
    terrainFillChunkGraphics: Map<string, Graphics>
    terrainFillChunkCells: Map<string, HexCell[]>
    terrainFillCellChunks: Map<string, string>
    terrainFillChunkBounds: Map<string, WorldRect>
  }).terrainFillCellChunks = terrainFillCellChunks
  ;(scene as SceneRefs & {
    terrainFillChunkGraphics: Map<string, Graphics>
    terrainFillChunkCells: Map<string, HexCell[]>
    terrainFillCellChunks: Map<string, string>
    terrainFillChunkBounds: Map<string, WorldRect>
  }).terrainFillChunkBounds = terrainFillChunkBounds
}

function redrawTerrainEdgeLayerBatched({
  scene,
  cellSurfaces,
  displayMode,
  snowLineElevation,
  snowColor,
  showSnowOverride,
  landEdgeColor,
  landEdgeWidth,
  landEdgeColorValue,
  landEmptyEdgeColor,
  landEmptyEdgeWidth,
  landEmptyEdgeColorValue,
  coastEdgeColor,
  coastEdgeWidth,
  coastEdgeColorValue,
  waterEdgeColor,
  waterEdgeWidth,
  waterEdgeColorValue,
  waterEmptyEdgeColor,
  waterEmptyEdgeWidth,
  waterEmptyEdgeColorValue,
  darkWaterEdgeColor,
  darkWaterEdgeWidth,
  darkWaterEdgeColorValue,
  snowEdgeColor,
  snowEdgeWidth,
  snowEdgeColorValue,
  snowBoundaryEdgeColor,
  snowBoundaryEdgeWidth,
  snowBoundaryEdgeColorValue,
  showLandEmptyEdges,
  showWaterEmptyEdges,
  visibleCellIds,
  dirtyCellIds,
  viewportBounds,
}: {
  scene: SceneRefs
  cellSurfaces: Record<string, CellSurfaceState>
  displayMode: 'surface' | 'topography'
  snowLineElevation: number
  snowColor: string
  showSnowOverride: boolean
  landEdgeColor: string
  landEdgeWidth: number
  landEdgeColorValue: number
  landEmptyEdgeColor: string
  landEmptyEdgeWidth: number
  landEmptyEdgeColorValue: number
  coastEdgeColor: string
  coastEdgeWidth: number
  coastEdgeColorValue: number
  waterEdgeColor: string
  waterEdgeWidth: number
  waterEdgeColorValue: number
  waterEmptyEdgeColor: string
  waterEmptyEdgeWidth: number
  waterEmptyEdgeColorValue: number
  darkWaterEdgeColor: string
  darkWaterEdgeWidth: number
  darkWaterEdgeColorValue: number
  snowEdgeColor: string
  snowEdgeWidth: number
  snowEdgeColorValue: number
  snowBoundaryEdgeColor: string
  snowBoundaryEdgeWidth: number
  snowBoundaryEdgeColorValue: number
  showLandEmptyEdges: boolean
  showWaterEmptyEdges: boolean
  visibleCellIds: Set<string> | null
  dirtyCellIds?: Set<string> | null
  viewportBounds?: WorldRect | null
}) {
  ensureTerrainEdgeChunkState(scene)

  const chunkKeys =
    dirtyCellIds && dirtyCellIds.size > 0
      ? collectTerrainEdgeChunkKeys(scene.terrainEdgeCellChunks, dirtyCellIds)
      : new Set(scene.terrainEdgeChunkGraphics.keys())

  for (const chunkKey of chunkKeys) {
    if (dirtyCellIds && viewportBounds) {
      const chunkBounds = scene.terrainEdgeChunkBounds.get(chunkKey)
      if (chunkBounds && !rectIntersects(chunkBounds, viewportBounds)) {
        continue
      }
    }
    const chunkGraphics = scene.terrainEdgeChunkGraphics.get(chunkKey)
    const chunkEdges = scene.terrainEdgeChunkEdges.get(chunkKey)
    if (!chunkGraphics || !chunkEdges) {
      continue
    }

    for (const key of TERRAIN_EDGE_STYLE_KEYS) {
      chunkGraphics[key].clear()
    }

    for (const edge of chunkEdges) {
      if (
        visibleCellIds &&
        (!visibleCellIds.has(edge.cellId) ||
          (edge.neighborId !== null && !visibleCellIds.has(edge.neighborId)))
      ) {
        continue
      }

      const surface = cellSurfaces[edge.cellId] ?? DEFAULT_SURFACE_STATE
      if (surface.kind === 'empty') {
        continue
      }

      const style = getEdgeStyle({
        displayMode,
        currentSurface: surface,
        neighborSurface:
          edge.neighborId !== null
            ? (cellSurfaces[edge.neighborId] ?? DEFAULT_SURFACE_STATE)
            : createEmptySurface(),
        snowLineElevation,
        snowColor,
        showSnowOverride,
        landEdgeColor,
        landEdgeWidth,
        landEdgeColorValue,
        landEmptyEdgeColor,
        landEmptyEdgeWidth,
        landEmptyEdgeColorValue,
        coastEdgeColor,
        coastEdgeWidth,
        coastEdgeColorValue,
        waterEdgeColor,
        waterEdgeWidth,
        waterEdgeColorValue,
        waterEmptyEdgeColor,
        waterEmptyEdgeWidth,
        waterEmptyEdgeColorValue,
        darkWaterEdgeColor,
        darkWaterEdgeWidth,
        darkWaterEdgeColorValue,
        snowEdgeColor,
        snowEdgeWidth,
        snowEdgeColorValue,
        snowBoundaryEdgeColor,
        snowBoundaryEdgeWidth,
        snowBoundaryEdgeColorValue,
        showLandEmptyEdges,
        showWaterEmptyEdges,
      })

      if (!style) {
        continue
      }

      const graphic = chunkGraphics[style.styleKey]
      graphic.moveTo(edge.x1, edge.y1)
      graphic.lineTo(edge.x2, edge.y2)
      graphic.stroke({
        color: style.colorValue,
        width: style.width,
        alpha: 0.94,
        cap: 'round',
        join: 'round',
      })
    }
  }
}

function ensureTerrainEdgeChunkState(scene: SceneRefs) {
  if (
    scene.terrainEdgeChunkGraphics &&
    scene.terrainEdgeChunkEdges &&
    scene.terrainEdgeCellChunks &&
    scene.terrainEdgeChunkBounds
  ) {
    return
  }

  const terrainEdgeChunkGraphics = new Map<string, Record<TerrainEdgeStyleKey, Graphics>>()
  const terrainEdgeChunkEdges = new Map<string, HexEdge[]>()
  const terrainEdgeCellChunks = new Map<string, Set<string>>()
  const terrainEdgeChunkBounds = new Map<string, WorldRect>()

  scene.layerContainers.terrainEdge.removeChildren()

  for (const edge of scene.edgeById.values()) {
    const ownerCell = scene.cellById.get(edge.cellId)
    if (!ownerCell) {
      continue
    }

    const chunkKey = getTerrainEdgeChunkKey(ownerCell.q, ownerCell.r)
    const chunkEdges = terrainEdgeChunkEdges.get(chunkKey)
    if (chunkEdges) {
      chunkEdges.push(edge)
    } else {
      terrainEdgeChunkEdges.set(chunkKey, [edge])
    }
    addTerrainEdgeCellChunk(terrainEdgeCellChunks, edge.cellId, chunkKey)
    if (edge.neighborId !== null) {
      addTerrainEdgeCellChunk(terrainEdgeCellChunks, edge.neighborId, chunkKey)
    }
  }

  for (const chunkKey of terrainEdgeChunkEdges.keys()) {
    const chunkGraphics = Object.fromEntries(
      TERRAIN_EDGE_STYLE_KEYS.map((key) => [key, new Graphics()]),
    ) as Record<TerrainEdgeStyleKey, Graphics>
    TERRAIN_EDGE_STYLE_KEYS.forEach((key) => {
      scene.layerContainers.terrainEdge.addChild(chunkGraphics[key])
    })
    terrainEdgeChunkGraphics.set(chunkKey, chunkGraphics)
    terrainEdgeChunkBounds.set(chunkKey, getChunkBoundsFromEdges(terrainEdgeChunkEdges.get(chunkKey) ?? []))
  }

  ;(scene as SceneRefs & {
    terrainEdgeChunkGraphics: Map<string, Record<TerrainEdgeStyleKey, Graphics>>
    terrainEdgeChunkEdges: Map<string, HexEdge[]>
    terrainEdgeCellChunks: Map<string, Set<string>>
    terrainEdgeChunkBounds: Map<string, WorldRect>
  }).terrainEdgeChunkGraphics = terrainEdgeChunkGraphics
  ;(scene as SceneRefs & {
    terrainEdgeChunkGraphics: Map<string, Record<TerrainEdgeStyleKey, Graphics>>
    terrainEdgeChunkEdges: Map<string, HexEdge[]>
    terrainEdgeCellChunks: Map<string, Set<string>>
    terrainEdgeChunkBounds: Map<string, WorldRect>
  }).terrainEdgeChunkEdges = terrainEdgeChunkEdges
  ;(scene as SceneRefs & {
    terrainEdgeChunkGraphics: Map<string, Record<TerrainEdgeStyleKey, Graphics>>
    terrainEdgeChunkEdges: Map<string, HexEdge[]>
    terrainEdgeCellChunks: Map<string, Set<string>>
    terrainEdgeChunkBounds: Map<string, WorldRect>
  }).terrainEdgeCellChunks = terrainEdgeCellChunks
  ;(scene as SceneRefs & {
    terrainEdgeChunkGraphics: Map<string, Record<TerrainEdgeStyleKey, Graphics>>
    terrainEdgeChunkEdges: Map<string, HexEdge[]>
    terrainEdgeCellChunks: Map<string, Set<string>>
    terrainEdgeChunkBounds: Map<string, WorldRect>
  }).terrainEdgeChunkBounds = terrainEdgeChunkBounds
}

function redrawPoliticalGraphic({
  graphic,
  cell,
  hexSize,
  fillColor,
  alpha = 0.72,
}: {
  graphic: Graphics
  cell: HexCell | undefined
  hexSize: number
  fillColor: number | null
  alpha?: number
}) {
  if (!cell) {
    return
  }

  graphic.clear()

  if (fillColor === null) {
    return
  }

  graphic
    .poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize))
    .fill({ color: fillColor, alpha })
}

function ensureCountryFillBatchGraphics(
  scene: SceneRefs,
  countries: Record<string, Country>,
) {
  if (!scene.countryFillBatchLayer) {
    ;(scene as SceneRefs & { countryFillBatchLayer: Container }).countryFillBatchLayer = new Container()
  }
  if (!scene.countryFillBatchGraphics) {
    ;(scene as SceneRefs & { countryFillBatchGraphics: Map<string, Graphics> }).countryFillBatchGraphics =
      new Map<string, Graphics>()
  }

  for (const [countryId] of Object.entries(countries)) {
    if (scene.countryFillBatchGraphics.has(countryId)) {
      continue
    }
    const graphic = new Graphics()
    scene.countryFillBatchLayer.addChild(graphic)
    scene.countryFillBatchGraphics.set(countryId, graphic)
  }
}

function redrawCountryFillLayerBatched({
  scene,
  hexSize,
  countries,
  provinces,
  cellSurfaces,
  countryAssignments,
  provinceAssignments,
  politicalColorMode,
  colorWaterInCountryLayer,
  cityStatesFillTerritory,
  visibleCellIds,
  alpha,
  dirtyCountryIds,
}: {
  scene: SceneRefs
  hexSize: number
  countries: Record<string, Country>
  provinces: Record<string, Province>
  cellSurfaces: Record<string, CellSurfaceState>
  countryAssignments: Record<string, string | null>
  provinceAssignments: Record<string, string | null>
  politicalColorMode: 'country' | 'province'
  colorWaterInCountryLayer: boolean
  cityStatesFillTerritory: boolean
  visibleCellIds: Set<string> | null
  alpha: number
  dirtyCountryIds?: Set<string> | null
}) {
  ensureCountryFillBatchGraphics(scene, countries)

  if (dirtyCountryIds && dirtyCountryIds.size > 0) {
    for (const countryId of dirtyCountryIds) {
      scene.countryFillBatchGraphics.get(countryId)?.clear()
    }
  } else {
    for (const graphic of scene.countryFillBatchGraphics.values()) {
      graphic.clear()
    }
  }

  for (const [cellId, cell] of scene.cellById) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }

    const fillColor = getPoliticalFillColor(
      cellId,
      countries,
      provinces,
      cellSurfaces,
      countryAssignments,
      provinceAssignments,
      politicalColorMode,
      colorWaterInCountryLayer,
      cityStatesFillTerritory,
    )
    if (fillColor === null) {
      continue
    }

    const countryId = countryAssignments[cellId]
    if (!countryId) {
      continue
    }
    if (dirtyCountryIds && dirtyCountryIds.size > 0 && !dirtyCountryIds.has(countryId)) {
      continue
    }
    const graphic = scene.countryFillBatchGraphics.get(countryId)
    if (!graphic) {
      continue
    }

    graphic
      .poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize))
      .fill({ color: fillColor, alpha })
  }
}

function ensureCountryBorderBatchGraphics(
  scene: SceneRefs,
  countries: Record<string, Country>,
) {
  if (!scene.countryBorderBatchLayer) {
    ;(scene as SceneRefs & { countryBorderBatchLayer: Container }).countryBorderBatchLayer = new Container()
  }
  if (!scene.countryBorderBatchGraphics) {
    ;(scene as SceneRefs & { countryBorderBatchGraphics: Map<string, Graphics> }).countryBorderBatchGraphics =
      new Map<string, Graphics>()
  }

  for (const [countryId] of Object.entries(countries)) {
    if (scene.countryBorderBatchGraphics.has(countryId)) {
      continue
    }
    const graphic = new Graphics()
    scene.countryBorderBatchLayer.addChild(graphic)
    scene.countryBorderBatchGraphics.set(countryId, graphic)
  }
}

function redrawCountryBorderLayerBatched({
  scene,
  countries,
  assignments,
  sharedColor,
  width,
  opacity,
  sharedBorderOverridesOwn,
  sharedBorderMode,
}: {
  scene: SceneRefs
  countries: Record<string, Country>
  assignments: Record<string, string | null>
  sharedColor: number
  width: number
  opacity: number
  sharedBorderOverridesOwn: boolean
  sharedBorderMode: 'uniform' | 'mixed'
}) {
  ensureCountryBorderBatchGraphics(scene, countries)

  for (const graphic of scene.countryBorderBatchGraphics.values()) {
    graphic.clear()
  }

  for (const edge of scene.edgeById.values()) {
    const currentAssignment = assignments[edge.cellId] ?? null
    const neighborAssignment =
      edge.neighborId !== null ? (assignments[edge.neighborId] ?? null) : null

    if (currentAssignment === neighborAssignment) {
      continue
    }

    const ownerAssignment =
      currentAssignment && !neighborAssignment
        ? currentAssignment
        : !currentAssignment && neighborAssignment
          ? neighborAssignment
          : currentAssignment && neighborAssignment
            ? [currentAssignment, neighborAssignment].sort()[0]
            : null

    if (!ownerAssignment) {
      continue
    }

    const graphic = scene.countryBorderBatchGraphics.get(ownerAssignment)
    if (!graphic) {
      continue
    }

    const color =
      currentAssignment && neighborAssignment && sharedBorderOverridesOwn
        ? sharedBorderMode === 'mixed'
          ? mixHexColors(
              countries[currentAssignment]?.borderColor ?? countries[currentAssignment]?.color ?? '#ffffff',
              countries[neighborAssignment]?.borderColor ?? countries[neighborAssignment]?.color ?? '#ffffff',
              0.5,
            )
          : sharedColor
        : parseHexColor(
            countries[ownerAssignment]?.borderColor ??
              countries[ownerAssignment]?.color ??
              '#ffffff',
          )

    graphic.moveTo(edge.x1, edge.y1)
    graphic.lineTo(edge.x2, edge.y2)
    graphic.stroke({
      color,
      width,
      alpha: opacity,
      cap: 'round',
      join: 'round',
    })
  }
}

function ensureProvinceFillBatchGraphics(
  scene: SceneRefs,
  provinces: Record<string, Province>,
) {
  if (!scene.provinceFillBatchLayer) {
    ;(scene as SceneRefs & { provinceFillBatchLayer: Container }).provinceFillBatchLayer = new Container()
  }
  if (!scene.provinceFillBatchGraphics) {
    ;(scene as SceneRefs & { provinceFillBatchGraphics: Map<string, Graphics> }).provinceFillBatchGraphics =
      new Map<string, Graphics>()
  }

  for (const [provinceId] of Object.entries(provinces)) {
    if (scene.provinceFillBatchGraphics.has(provinceId)) {
      continue
    }
    const graphic = new Graphics()
    scene.provinceFillBatchLayer.addChild(graphic)
    scene.provinceFillBatchGraphics.set(provinceId, graphic)
  }
}

function redrawProvinceFillLayerBatched({
  scene,
  hexSize,
  provinces,
  cellSurfaces,
  provinceAssignments,
  colorWaterInCountryLayer,
  visibleCellIds,
  alpha,
  dirtyProvinceIds,
}: {
  scene: SceneRefs
  hexSize: number
  provinces: Record<string, Province>
  cellSurfaces: Record<string, CellSurfaceState>
  provinceAssignments: Record<string, string | null>
  colorWaterInCountryLayer: boolean
  visibleCellIds: Set<string> | null
  alpha: number
  dirtyProvinceIds?: Set<string> | null
}) {
  ensureProvinceFillBatchGraphics(scene, provinces)

  if (dirtyProvinceIds && dirtyProvinceIds.size > 0) {
    for (const provinceId of dirtyProvinceIds) {
      scene.provinceFillBatchGraphics.get(provinceId)?.clear()
    }
  } else {
    for (const graphic of scene.provinceFillBatchGraphics.values()) {
      graphic.clear()
    }
  }

  for (const [cellId, cell] of scene.cellById) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }
    const fillColor = getProvinceFillColor(
      cellId,
      provinces,
      cellSurfaces,
      provinceAssignments,
      colorWaterInCountryLayer,
    )
    if (fillColor === null) {
      continue
    }
    const provinceId = provinceAssignments[cellId]
    if (!provinceId) {
      continue
    }
    if (dirtyProvinceIds && dirtyProvinceIds.size > 0 && !dirtyProvinceIds.has(provinceId)) {
      continue
    }
    const graphic = scene.provinceFillBatchGraphics.get(provinceId)
    if (!graphic) {
      continue
    }

    graphic
      .poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize))
      .fill({ color: fillColor, alpha })
  }
}

function ensureProvinceBorderBatchGraphics(
  scene: SceneRefs,
  provinces: Record<string, Province>,
) {
  if (!scene.provinceBorderBatchLayer) {
    ;(scene as SceneRefs & { provinceBorderBatchLayer: Container }).provinceBorderBatchLayer = new Container()
  }
  if (!scene.provinceBorderBatchGraphics) {
    ;(scene as SceneRefs & { provinceBorderBatchGraphics: Map<string, Graphics> }).provinceBorderBatchGraphics =
      new Map<string, Graphics>()
  }

  for (const [provinceId] of Object.entries(provinces)) {
    if (scene.provinceBorderBatchGraphics.has(provinceId)) {
      continue
    }
    const graphic = new Graphics()
    scene.provinceBorderBatchLayer.addChild(graphic)
    scene.provinceBorderBatchGraphics.set(provinceId, graphic)
  }
}

function redrawProvinceBorderLayerBatched({
  scene,
  countries,
  provinces,
  cellSurfaces,
  countryAssignments,
  assignments,
  color,
  width,
  opacity,
  borderOverridesCountryBorder,
}: {
  scene: SceneRefs
  countries: Record<string, Country>
  provinces: Record<string, Province>
  cellSurfaces: Record<string, CellSurfaceState>
  countryAssignments: Record<string, string | null>
  assignments: Record<string, string | null>
  color: number
  width: number
  opacity: number
  borderOverridesCountryBorder: boolean
}) {
  ensureProvinceBorderBatchGraphics(scene, provinces)

  for (const graphic of scene.provinceBorderBatchGraphics.values()) {
    graphic.clear()
  }

  for (const edge of scene.edgeById.values()) {
    const currentSurface = cellSurfaces[edge.cellId] ?? DEFAULT_SURFACE_STATE
    const neighborSurface =
      edge.neighborId !== null
        ? (cellSurfaces[edge.neighborId] ?? DEFAULT_SURFACE_STATE)
        : createEmptySurface()

    if (!isSurfaceLand(currentSurface) && !isSurfaceLand(neighborSurface)) {
      continue
    }

    const currentAssignment = assignments[edge.cellId] ?? null
    const neighborAssignment =
      edge.neighborId !== null ? (assignments[edge.neighborId] ?? null) : null

    if (currentAssignment === neighborAssignment) {
      continue
    }

    const ownerAssignment =
      currentAssignment && !neighborAssignment
        ? currentAssignment
        : !currentAssignment && neighborAssignment
          ? neighborAssignment
          : currentAssignment && neighborAssignment
            ? [currentAssignment, neighborAssignment].sort()[0]
            : null

    if (!ownerAssignment) {
      continue
    }

    const currentProvince = currentAssignment ? provinces[currentAssignment] : null
    const neighborProvince = neighborAssignment ? provinces[neighborAssignment] : null
    const currentCountryId = currentProvince?.countryId ?? null
    const neighborCountryId = neighborProvince?.countryId ?? null
    const currentCellCountryId = countryAssignments[edge.cellId] ?? null
    const neighborCellCountryId =
      edge.neighborId !== null ? (countryAssignments[edge.neighborId] ?? null) : null

    const graphic = scene.provinceBorderBatchGraphics.get(ownerAssignment)
    if (!graphic) {
      continue
    }

    const ownerCountryId =
      currentAssignment && ownerAssignment === currentAssignment
        ? currentCountryId
        : neighborAssignment && ownerAssignment === neighborAssignment
          ? neighborCountryId
          : currentCountryId ?? neighborCountryId

    // When country borders are meant to dominate, do not also draw
    // province borders on true country boundaries. A neighboring cell
    // without a province assignment should still show the province outline.
    if (!borderOverridesCountryBorder) {
      const touchesCountryBoundary =
        edge.neighborId === null ||
        !currentCellCountryId ||
        !neighborCellCountryId ||
        currentCellCountryId !== neighborCellCountryId

      if (touchesCountryBoundary) {
        continue
      }
    }

    const borderColor = borderOverridesCountryBorder
      ? color
      : parseHexColor(
          countries[ownerCountryId ?? '']?.provinceBorderColor ??
            countries[ownerCountryId ?? '']?.borderColor ??
            countries[ownerCountryId ?? '']?.color ??
            '#ffffff',
        )

    graphic.moveTo(edge.x1, edge.y1)
    graphic.lineTo(edge.x2, edge.y2)
    graphic.stroke({
      color: borderColor,
      width,
      alpha: opacity,
      cap: 'round',
      join: 'round',
    })
  }
}

function redrawCitiesGraphic({
  container,
  cell,
  hexSize,
  city,
  cityLevel,
  texture,
}: {
  container: Container
  cell: HexCell | undefined
  hexSize: number
  city: City | undefined
  cityLevel: CityLevel | undefined
  texture: Texture | undefined
}) {
  container.removeChildren()

  if (!cell || !city || !cityLevel || !texture) {
    return
  }

  const sprite = new Sprite(texture)
  const iconSize = hexSize * 1.2 * (cityLevel.iconScalePercent / 100)
  sprite.width = iconSize
  sprite.height = iconSize
  sprite.anchor.set(0.5)
  sprite.x = cell.centerX
  sprite.y = cell.centerY

  container.addChild(sprite)
}

function redrawLabelsLayer({
  scene,
  cells,
  countries,
  provinces,
  cities,
  iconSourceMap,
  countryAssignments,
  provinceAssignments,
  labelGroups,
  labels,
  labelAnchorDisplayMode,
  selectedLabelId,
  textures,
  zoom,
  visibleCellIds,
}: {
  scene: SceneRefs
  cells: HexCell[]
  countries: Record<string, Country>
  provinces: Record<string, Province>
  cities: Record<string, City>
  iconSourceMap: Record<string, string>
  countryAssignments: Record<string, string | null>
  provinceAssignments: Record<string, string | null>
  labelGroups: Record<string, LabelGroup>
  labels: Record<string, Label>
  labelAnchorDisplayMode: 'none' | 'all' | 'selected'
  selectedLabelId: string | null
  textures: Record<string, Texture>
  zoom: number
  visibleCellIds: Set<string> | null
}) {
  scene.labelsLayer.removeChildren()
  scene.labelAnchorsLayer.removeChildren()
  scene.labelGroupContainers.clear()
  scene.labelTexts.clear()
  scene.orderedLabelIds = []

  const cellsById = new Map(cells.map((cell) => [cell.id, cell]))
  const countryAnchorCache = new Map<string, { x: number; y: number } | null>()
  const provinceAnchorCache = new Map<string, { x: number; y: number } | null>()
  const visibleCountryIds = visibleCellIds
    ? new Set(
        cells
          .filter((cell) => visibleCellIds.has(cell.id))
          .map((cell) => countryAssignments[cell.id])
          .filter((countryId): countryId is string => Boolean(countryId)),
      )
    : null
  const visibleProvinceIds = visibleCellIds
    ? new Set(
        cells
          .filter((cell) => visibleCellIds.has(cell.id))
          .map((cell) => provinceAssignments[cell.id])
          .filter((provinceId): provinceId is string => Boolean(provinceId)),
      )
    : null
  const countryCellCounts = new Map<string, number>()
  const provinceCountryVotes = new Map<string, Map<string, number>>()

  for (const cell of cells) {
    const countryId = countryAssignments[cell.id]
    if (countryId) {
      countryCellCounts.set(countryId, (countryCellCounts.get(countryId) ?? 0) + 1)
    }

    const provinceId = provinceAssignments[cell.id]
    if (!provinceId || !countryId) {
      continue
    }

    const votes = provinceCountryVotes.get(provinceId) ?? new Map<string, number>()
    votes.set(countryId, (votes.get(countryId) ?? 0) + 1)
    provinceCountryVotes.set(provinceId, votes)
  }

  const inferredProvinceCountryIds = new Map<string, string | null>()
  for (const [provinceId, votes] of provinceCountryVotes.entries()) {
    let winningCountryId: string | null = null
    let winningCount = -1
    for (const [countryId, count] of votes.entries()) {
      if (count > winningCount) {
        winningCountryId = countryId
        winningCount = count
      }
    }
    inferredProvinceCountryIds.set(provinceId, winningCountryId)
  }

  const sortedCountryCellCounts = [...countryCellCounts.values()]
    .filter((count) => count > 0)
    .sort((left, right) => left - right)
  const countryScaleFloorCount = sortedCountryCellCounts[0] ?? 0
  const countryScaleCeilingCount =
    sortedCountryCellCounts.length > 0
      ? sortedCountryCellCounts[Math.max(0, Math.floor((sortedCountryCellCounts.length - 1) * 0.85))]
      : 0

  const getCountryAnchor = (countryId: string) => {
    if (countryAnchorCache.has(countryId)) {
      return countryAnchorCache.get(countryId) ?? null
    }

    let totalX = 0
    let totalY = 0
    let count = 0

    for (const cell of cells) {
      if (countryAssignments[cell.id] !== countryId) {
        continue
      }
      totalX += cell.centerX
      totalY += cell.centerY
      count += 1
    }

    const anchor = count > 0 ? { x: totalX / count, y: totalY / count } : null
    countryAnchorCache.set(countryId, anchor)
    return anchor
  }

  const getProvinceAnchor = (provinceId: string) => {
    if (provinceAnchorCache.has(provinceId)) {
      return provinceAnchorCache.get(provinceId) ?? null
    }

    let totalX = 0
    let totalY = 0
    let count = 0

    for (const cell of cells) {
      if (provinceAssignments[cell.id] !== provinceId) {
        continue
      }
      totalX += cell.centerX
      totalY += cell.centerY
      count += 1
    }

    const anchor = count > 0 ? { x: totalX / count, y: totalY / count } : null
    provinceAnchorCache.set(provinceId, anchor)
    return anchor
  }

  const getProvinceCountryId = (provinceId: string): string | null =>
    provinces[provinceId]?.countryId ?? inferredProvinceCountryIds.get(provinceId) ?? null

  const getBaseAnchorPosition = (label: Label): { x: number; y: number } | null => {
    switch (label.anchor.kind) {
      case 'world':
        return { x: label.anchor.x, y: label.anchor.y }
      case 'cell': {
        const cell = cellsById.get(label.anchor.cellId)
        return cell ? { x: cell.centerX, y: cell.centerY } : null
      }
      case 'city': {
        const city = cities[label.anchor.cityId]
        if (!city) {
          return null
        }
        const cell = cellsById.get(city.cellId)
        return cell ? { x: cell.centerX, y: cell.centerY } : null
      }
      case 'country':
        return getCountryAnchor(label.anchor.countryId)
      case 'province':
        return getProvinceAnchor(label.anchor.provinceId)
      case 'path':
        return null
    }
  }

  const getAnchorPosition = (label: Label, offsetScale = 1): { x: number; y: number } | null => {
    const base = getBaseAnchorPosition(label)
    if (!base) {
      return null
    }

    switch (label.anchor.kind) {
      case 'world':
        return base
      case 'cell':
      case 'city':
      case 'country':
      case 'province': {
        const offsetState = getLabelAnchorOffsetState(labelGroups[label.groupId], label.anchor)
        const effectiveOffsetX = offsetState?.effectiveX ?? label.anchor.offsetX
        const effectiveOffsetY = offsetState?.effectiveY ?? label.anchor.offsetY
        return {
          x: base.x + effectiveOffsetX * offsetScale,
          y: base.y + effectiveOffsetY * offsetScale,
        }
      }
      case 'path':
        return null
    }
  }

  const resolveLabelCountryIdByAnchor = (label: Label): string | null => {
    switch (label.anchor.kind) {
      case 'country':
        return label.anchor.countryId
      case 'city': {
        const city = cities[label.anchor.cityId]
        if (!city) {
          return null
        }
        return city.countryId ?? countryAssignments[city.cellId] ?? null
      }
      case 'province':
        return getProvinceCountryId(label.anchor.provinceId)
      case 'cell':
        return countryAssignments[label.anchor.cellId] ?? null
      case 'world':
      case 'path':
        return null
    }
  }

  const labelCountryIdCache = new Map<string, string | null>()
  const resolveLabelCountryId = (label: Label): string | null => {
    if (labelCountryIdCache.has(label.id)) {
      return labelCountryIdCache.get(label.id) ?? null
    }

    let countryId: string | null = null
    switch (label.source.kind) {
      case 'country':
        countryId = label.source.countryId
        break
      case 'city': {
        const city = cities[label.source.cityId]
        countryId = city ? (city.countryId ?? countryAssignments[city.cellId] ?? null) : null
        break
      }
      case 'province':
        countryId = getProvinceCountryId(label.source.provinceId)
        break
      case 'manual':
        countryId = resolveLabelCountryIdByAnchor(label)
        break
    }

    if (!countryId) {
      countryId = resolveLabelCountryIdByAnchor(label)
    }

    labelCountryIdCache.set(label.id, countryId)
    return countryId
  }

  const getLabelCountryScale = (label: Label, style: ReturnType<typeof getEffectiveLabelStyle>) => {
    if (!style.scaleWithCountrySize) {
      return 1
    }

    const countryId = resolveLabelCountryId(label)
    if (!countryId) {
      return 1
    }

    const countryCellCount = countryCellCounts.get(countryId)
    if (!countryCellCount || countryCellCount <= 0) {
      return 1
    }

    const requestedMin = Number.isFinite(style.countrySizeScaleMin) ? style.countrySizeScaleMin : 1
    const requestedMax = Number.isFinite(style.countrySizeScaleMax) ? style.countrySizeScaleMax : 1
    const scaleMin = clamp(Math.min(requestedMin, requestedMax), 0.1, 8)
    const scaleMax = clamp(Math.max(requestedMin, requestedMax), scaleMin, 8)

    if (Math.abs(scaleMax - scaleMin) < 0.0001) {
      return scaleMin
    }

    if (
      countryScaleFloorCount <= 0 ||
      countryScaleCeilingCount <= 0 ||
      countryScaleCeilingCount <= countryScaleFloorCount
    ) {
      return 1
    }

    const clampedCount = clamp(countryCellCount, countryScaleFloorCount, countryScaleCeilingCount)
    const floorLog = Math.log1p(countryScaleFloorCount)
    const ceilingLog = Math.log1p(countryScaleCeilingCount)
    const denominator = ceilingLog - floorLog
    if (denominator <= 0.000001) {
      return 1
    }

    const t = clamp((Math.log1p(clampedCount) - floorLog) / denominator, 0, 1)
    return scaleMin + (scaleMax - scaleMin) * t
  }

  const isLabelVisible = (label: Label) => {
    if (!visibleCellIds) {
      return true
    }

    switch (label.anchor.kind) {
      case 'cell':
        return visibleCellIds.has(label.anchor.cellId)
      case 'city': {
        const city = cities[label.anchor.cityId]
        return city ? visibleCellIds.has(city.cellId) : false
      }
      case 'country':
        return visibleCountryIds?.has(label.anchor.countryId) ?? false
      case 'province':
        return visibleProvinceIds?.has(label.anchor.provinceId) ?? false
      case 'world':
      case 'path':
        return true
    }
  }

  for (const group of getSortedLabelGroups(labelGroups)) {
    const container = new Container()
    container.visible = group.visible
    scene.labelGroupContainers.set(group.id, container)
    scene.labelsLayer.addChild(container)
  }

  const labelWorld = {
    cells,
    countries,
    provinces,
    cities,
    countryAssignments,
    provinceAssignments,
    labelGroups,
  }

  for (const label of Object.values(labels)) {
    const group = labelGroups[label.groupId]
    if (!group || !group.visible || !label.visible) {
      continue
    }

    if (!isLabelVisible(label)) {
      continue
    }

    const style = getEffectiveLabelStyle(group, label)
    if (style.minZoom !== null && zoom < style.minZoom) {
      continue
    }
    if (style.maxZoom !== null && zoom > style.maxZoom) {
      continue
    }

    const countryScale = getLabelCountryScale(label, style)
    const position = getAnchorPosition(label, countryScale)
    if (!position) {
      continue
    }

    if (
      labelAnchorDisplayMode === 'all' ||
      (labelAnchorDisplayMode === 'selected' && label.id === selectedLabelId)
    ) {
      const anchorGraphic = new Graphics()
      const color = label.id === selectedLabelId ? LABEL_ANCHOR_SELECTED_COLOR : LABEL_ANCHOR_COLOR
      const anchorScale = 1 / Math.sqrt(Math.max(zoom, 0.0001))
      const diamondRadius = 6 * anchorScale
      const lineWidth = Math.max(1, 1.2 * anchorScale)
      const baseAnchorPosition = getBaseAnchorPosition(label)

      if (
        label.id === selectedLabelId &&
        baseAnchorPosition &&
        (Math.abs(baseAnchorPosition.x - position.x) > 0.01 ||
          Math.abs(baseAnchorPosition.y - position.y) > 0.01)
      ) {
        anchorGraphic
          .moveTo(baseAnchorPosition.x, baseAnchorPosition.y)
          .lineTo(position.x, position.y)
          .stroke({ color, alpha: 0.5, width: Math.max(1, lineWidth * 0.9) })
      }

      anchorGraphic
        .poly([
          position.x,
          position.y - diamondRadius,
          position.x + diamondRadius,
          position.y,
          position.x,
          position.y + diamondRadius,
          position.x - diamondRadius,
          position.y,
        ])
        .fill({ color, alpha: 0.92 })
        .poly([
          position.x,
          position.y - diamondRadius,
          position.x + diamondRadius,
          position.y,
          position.x,
          position.y + diamondRadius,
          position.x - diamondRadius,
          position.y,
        ])
        .stroke({ color: 0xffffff, alpha: 0.28, width: lineWidth })
      scene.labelAnchorsLayer.addChild(anchorGraphic)
    }

    const textRenderFactor = style.scaleWithZoom ? getLabelTextRenderFactor(zoom) : 1
    if (label.renderKind === 'country-icon' && label.source.kind === 'country') {
      const country = countries[label.source.countryId]
      const iconKey = country?.iconKey ?? ''
      const texture = iconKey ? textures[iconKey] : undefined

      if (!texture || !iconSourceMap[iconKey]) {
        continue
      }

      const sprite = new Sprite(texture)
      const iconSize = style.fontSize * countryScale * textRenderFactor
      const textureWidth = Math.max(texture.width, 1)
      const textureHeight = Math.max(texture.height, 1)
      const baseScale = iconSize / Math.max(textureWidth, textureHeight)
      const zoomScale = style.scaleWithZoom ? 1 / textRenderFactor : 1 / Math.max(zoom, 0.0001)

      sprite.anchor.set(0.5)
      sprite.position.set(position.x, position.y)
      sprite.rotation = style.rotation
      sprite.alpha = label.id === selectedLabelId ? Math.min(1, style.opacity + 0.12) : style.opacity
      sprite.scale.set(baseScale * zoomScale)

      scene.labelTexts.set(label.id, sprite)
      scene.orderedLabelIds.push(label.id)
      scene.labelGroupContainers.get(group.id)?.addChild(sprite)
      continue
    }

    const value = applyTextTransform(resolveLabelText(labelWorld as never, label), style.textTransform)
    if (!value) {
      continue
    }

    const text = new Text({
      text: value,
      style: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize * countryScale * textRenderFactor,
        fontWeight: normalizePixiFontWeight(style.fontWeight),
        fontStyle: style.fontStyle,
        fill: style.fill,
        stroke: {
          color: style.stroke,
          width: style.strokeWidth * countryScale * textRenderFactor,
        },
        letterSpacing: style.letterSpacing * countryScale * textRenderFactor,
        align: style.textAlign,
        lineHeight: style.fontSize * style.lineHeight * countryScale * textRenderFactor,
        wordWrap: style.maxWidth !== null,
        wordWrapWidth: style.maxWidth !== null ? style.maxWidth * countryScale * textRenderFactor : 0,
      } as never,
    })

    text.anchor.set(style.textAlign === 'left' ? 0 : style.textAlign === 'right' ? 1 : 0.5, 0.5)
    text.position.set(position.x, position.y)
    text.rotation = style.rotation
    text.alpha = style.opacity
    text.scale.set(style.scaleWithZoom ? 1 / textRenderFactor : 1 / Math.max(zoom, 0.0001))

    if (label.id === selectedLabelId) {
      text.alpha = Math.min(1, style.opacity + 0.1)
      text.tint = CELL_HOVER_FILL
    }

    scene.labelTexts.set(label.id, text)
    scene.orderedLabelIds.push(label.id)
    scene.labelGroupContainers.get(group.id)?.addChild(text)
  }

  scene.labelsLayer.addChild(scene.labelAnchorsLayer)
}

function redrawOverlayGraphic({
  graphic,
  cell,
  hexSize,
  style,
  drawingFillColor,
}: {
  graphic: Graphics
  cell: HexCell | undefined
  hexSize: number
  style: 'hidden' | 'hover' | 'drawing'
  drawingFillColor?: number
}) {
  if (!cell) {
    return
  }

  graphic.clear()

  if (style === 'hidden') {
    return
  }

  const polygon = getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)

  if (style === 'drawing') {
    graphic.poly(polygon).fill({
      color: drawingFillColor ?? CELL_HOVER_FILL,
      alpha: STROKE_OVERLAY_ALPHA,
    })
    return
  }

  graphic.poly(polygon).fill({ color: CELL_HOVER_FILL, alpha: 0.22 }).stroke({
    color: CELL_HOVER_STROKE,
    width: 2.6,
    alpha: 0.95,
  })
}

function appendStrokeOverlay(
  scene: SceneRefs | null,
  strokeCellIds: Iterable<string>,
  hexSize: number,
  getCellInteractionPreview:
    | ((
        cellId: string,
      ) => { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null)
    | undefined,
  previewCache:
    | Map<string, { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null>
    | undefined,
  countries: Record<string, Country>,
  terrainStyle: HexMapCanvasProps['terrainStyle'],
  resolvedLandAnchors: ResolvedTerrainAnchor[],
  resolvedWaterAnchors: ResolvedTerrainAnchor[],
  resolvedColors: ResolvedTerrainStyleColors,
) {
  if (!scene) {
    return
  }

  const graphic = scene.strokeOverlayGraphic

  for (const cellId of strokeCellIds) {
    const cell = scene.cellById.get(cellId)

    if (!cell) {
      continue
    }

    const drawingFillColor = getDrawingFillColor(
      cellId,
      getCellInteractionPreview,
      previewCache,
      countries,
      terrainStyle,
      resolvedLandAnchors,
      resolvedWaterAnchors,
      resolvedColors,
    )

    graphic
      .poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize))
      .fill({ color: drawingFillColor, alpha: STROKE_OVERLAY_ALPHA })
  }
}

function redrawStrokeOverlay(
  scene: SceneRefs | null,
  strokeCellIds: Set<string>,
  hexSize: number,
  getCellInteractionPreview:
    | ((
        cellId: string,
      ) => { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null)
    | undefined,
  previewCache:
    | Map<string, { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null>
    | undefined,
  countries: Record<string, Country>,
  terrainStyle: HexMapCanvasProps['terrainStyle'],
  resolvedLandAnchors: ResolvedTerrainAnchor[],
  resolvedWaterAnchors: ResolvedTerrainAnchor[],
  resolvedColors: ResolvedTerrainStyleColors,
) {
  if (!scene) {
    return
  }

  const graphic = scene.strokeOverlayGraphic
  graphic.clear()

  if (strokeCellIds.size === 0) {
    return
  }

  appendStrokeOverlay(
    scene,
    strokeCellIds,
    hexSize,
    getCellInteractionPreview,
    previewCache,
    countries,
    terrainStyle,
    resolvedLandAnchors,
    resolvedWaterAnchors,
    resolvedColors,
  )
}

function redrawSelectionRect(
  scene: SceneRefs,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  clearOnly: boolean = false,
) {
  const graphic = scene.selectionGraphic
  graphic.clear()

  if (clearOnly) {
    return
  }

  const left = Math.min(startX, endX)
  const top = Math.min(startY, endY)
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)

  graphic.rect(left, top, width, height).fill({ color: 0xf0d377, alpha: 0.12 }).stroke({
    color: 0xf0d377,
    width: 1.8,
    alpha: 0.92,
  })
}

function redrawMovePreview(
  scene: SceneRefs,
  hexSize: number,
  sourceCellIds: string[],
  previewCellIds: string[],
  blockedCellIds: string[],
  movePreviewStyles: Record<string, { fillColor: string; strokeColor: string }>,
  visibleCellIds: Set<string> | null,
) {
  scene.moveSourceGraphic.clear()
  scene.movePreviewGraphic.clear()

  for (const cellId of sourceCellIds) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }

    const cell = scene.cellById.get(cellId)
    if (!cell) {
      continue
    }

    scene.moveSourceGraphic.poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)).fill({
      color: 0x5c8ec7,
      alpha: 0.16,
    }).stroke({
      color: 0x9cc4ef,
      width: 1.6,
      alpha: 0.82,
    })
  }

  for (const cellId of previewCellIds) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }

    const cell = scene.cellById.get(cellId)
    if (!cell) {
      continue
    }

    const previewStyle = movePreviewStyles[cellId]

    scene.movePreviewGraphic.poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)).fill({
      color: previewStyle ? parseHexColor(previewStyle.fillColor) : 0x79c98e,
      alpha: previewStyle ? 0.28 : 0.22,
    }).stroke({
      color: previewStyle ? parseHexColor(previewStyle.strokeColor) : 0xa9f0bc,
      width: 1.8,
      alpha: 0.9,
    })
  }

  for (const cellId of blockedCellIds) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }

    const cell = scene.cellById.get(cellId)
    if (!cell) {
      continue
    }

    scene.movePreviewGraphic.poly(getPointyHexPolygon(cell.centerX, cell.centerY, hexSize)).fill({
      color: 0x8b3d3d,
      alpha: 0.2,
    }).stroke({
      color: 0xe58a8a,
      width: 1.8,
      alpha: 0.88,
    })
  }
}

function getCellIdsInSelectionRect(
  scene: SceneRefs,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  visibleCellIds: Set<string> | null,
) {
  const left = Math.min(startX, endX)
  const right = Math.max(startX, endX)
  const top = Math.min(startY, endY)
  const bottom = Math.max(startY, endY)
  const selectedCellIds: string[] = []

  for (const [cellId, cell] of scene.cellById) {
    if (visibleCellIds && !visibleCellIds.has(cellId)) {
      continue
    }

    if (
      cell.centerX >= left &&
      cell.centerX <= right &&
      cell.centerY >= top &&
      cell.centerY <= bottom
    ) {
      selectedCellIds.push(cellId)
    }
  }

  return selectedCellIds
}

function getDrawingFillColor(
  cellId: string | null,
  getCellInteractionPreview:
    | ((
        cellId: string,
      ) => { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null)
    | undefined,
  previewCache:
    | Map<string, { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null>
    | undefined,
  countries: Record<string, Country>,
  terrainStyle: HexMapCanvasProps['terrainStyle'],
  resolvedLandAnchors: ResolvedTerrainAnchor[],
  resolvedWaterAnchors: ResolvedTerrainAnchor[],
  resolvedColors: ResolvedTerrainStyleColors,
) {
  if (!cellId) {
    return CELL_HOVER_FILL
  }

  const preview =
    previewCache && previewCache.has(cellId)
      ? previewCache.get(cellId) ?? null
      : getCellInteractionPreview?.(cellId) ?? null

  if (!preview) {
    return CELL_HOVER_FILL
  }

  if (preview.surface !== undefined) {
    return getSurfaceFillColor(preview.surface, {
      ...terrainStyle,
      resolvedLandAnchors,
      resolvedWaterAnchors,
      resolvedColors,
    })
  }

  if (preview.countryId !== undefined) {
    if (preview.countryId === null) {
      return ERASE_OVERLAY_FILL
    }

    const country = countries[preview.countryId]
    return parseHexColor(country?.color ?? '#ffffff')
  }

  if (preview.provinceId !== undefined) {
    return preview.provinceId === null ? ERASE_OVERLAY_FILL : CELL_HOVER_FILL
  }

  return CELL_HOVER_FILL
}

function applyPreviewOverrides(
  scene: SceneRefs | null,
  cellIds: string[],
  hexSize: number,
  getCellInteractionPreview:
    | ((
        cellId: string,
      ) => { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null)
    | undefined,
  previewCache:
    | Map<string, { surface?: CellSurfaceState; countryId?: string | null; provinceId?: string | null } | null>
    | undefined,
  surfacePreviewOverrides: Map<string, CellSurfaceState>,
  countryPreviewOverrides: Map<string, string | null>,
  provincePreviewOverrides: Map<string, string | null>,
  countries: Record<string, Country>,
  provinces: Record<string, Province>,
  cellSurfaces: Record<string, CellSurfaceState>,
  countryAssignments: Record<string, string | null>,
  provinceAssignments: Record<string, string | null>,
  colorWaterInCountryLayer: boolean,
  cityStatesFillTerritory: boolean,
  terrainStyle: HexMapCanvasProps['terrainStyle'],
  resolvedLandAnchors: ResolvedTerrainAnchor[],
  resolvedWaterAnchors: ResolvedTerrainAnchor[],
  resolvedColors: ResolvedTerrainStyleColors,
  politicalStyle: HexMapCanvasProps['politicalStyle'],
) {
  if (!scene || !getCellInteractionPreview) {
    return
  }

  let hasPoliticalPreview = false
  for (const cellId of cellIds) {
    const preview =
      previewCache && previewCache.has(cellId)
        ? previewCache.get(cellId) ?? null
        : getCellInteractionPreview(cellId)
    if (preview && (preview.countryId !== undefined || preview.provinceId !== undefined)) {
      hasPoliticalPreview = true
      break
    }
  }

  for (const cellId of cellIds) {
    const preview =
      previewCache && previewCache.has(cellId)
        ? previewCache.get(cellId) ?? null
        : getCellInteractionPreview(cellId)

    if (!preview) {
      continue
    }

    const isSurfacePaintPreview =
      preview.surface !== undefined &&
      preview.countryId === undefined &&
      preview.provinceId === undefined

    if (isSurfacePaintPreview) {
      surfacePreviewOverrides.delete(cellId)
      countryPreviewOverrides.delete(cellId)
      provincePreviewOverrides.delete(cellId)
      continue
    }

    if (preview.surface !== undefined) {
      surfacePreviewOverrides.set(cellId, preview.surface)

      const terrainGraphic = scene.terrainFillGraphics.get(cellId)
      if (terrainGraphic) {
        redrawTerrainFillGraphic({
          graphic: terrainGraphic,
          cell: scene.cellById.get(cellId),
          hexSize,
          surface: preview.surface,
          displayMode: terrainStyle.displayMode,
          landFillColor: terrainStyle.landFillColor,
          landAnchors: terrainStyle.landAnchors,
          waterFillColor: terrainStyle.waterFillColor,
          waterAnchors: terrainStyle.waterAnchors,
          resolvedLandAnchors,
          resolvedWaterAnchors,
          resolvedColors,
          snowLineElevation: terrainStyle.snowLineElevation,
          snowColor: terrainStyle.snowColor,
          showSnowOverride: terrainStyle.showSnowOverride,
          emptyFillColor: terrainStyle.emptyFillColor,
          landUnknownFillColor: terrainStyle.landUnknownFillColor,
          waterUnknownFillColor: terrainStyle.waterUnknownFillColor,
          waterDarkFillColor: terrainStyle.waterDarkFillColor,
          showEmptyCells: terrainStyle.showEmptyCells,
        })
      }
    }

    if (preview.countryId !== undefined) {
      countryPreviewOverrides.set(cellId, preview.countryId)
    }

    if (preview.provinceId !== undefined) {
      provincePreviewOverrides.set(cellId, preview.provinceId)
    }

    if (hasPoliticalPreview) {
      const politicalGraphic = scene.countryFillGraphics.get(cellId)
      if (politicalGraphic) {
        const effectiveSurface =
          preview.surface ??
          surfacePreviewOverrides.get(cellId) ??
          cellSurfaces[cellId] ??
          DEFAULT_SURFACE_STATE
        const effectiveCountryId =
          preview.countryId !== undefined
            ? preview.countryId
            : countryPreviewOverrides.get(cellId) ?? countryAssignments[cellId] ?? null

        redrawPoliticalGraphic({
          graphic: politicalGraphic,
          cell: scene.cellById.get(cellId),
          hexSize,
          fillColor:
            !effectiveCountryId || effectiveSurface.kind === 'empty'
              ? null
              : effectiveSurface.kind === 'water' && !colorWaterInCountryLayer
                ? null
                : !cityStatesFillTerritory && isCityStateCountry(countries[effectiveCountryId])
                  ? null
                  : parseHexColor(countries[effectiveCountryId]?.color ?? '#000000'),
        })
      }

      const provinceGraphic = scene.provinceFillGraphics.get(cellId)
      if (provinceGraphic) {
        const effectiveSurface =
          preview.surface ??
          surfacePreviewOverrides.get(cellId) ??
          cellSurfaces[cellId] ??
          DEFAULT_SURFACE_STATE
        const effectiveProvinceId =
          preview.provinceId !== undefined
            ? preview.provinceId
            : provincePreviewOverrides.get(cellId) ?? provinceAssignments[cellId] ?? null

        redrawPoliticalGraphic({
          graphic: provinceGraphic,
          cell: scene.cellById.get(cellId),
          hexSize,
          fillColor:
            !effectiveProvinceId || effectiveSurface.kind === 'empty'
              ? null
              : effectiveSurface.kind === 'water' && !colorWaterInCountryLayer
                ? null
                : parseHexColor(provinces[effectiveProvinceId]?.color ?? '#000000'),
          alpha: politicalStyle.provinceFillOpacity,
        })
      }
    }
  }
}

function syncPreviewOverridesWithCommittedState(
  surfacePreviewOverrides: Map<string, CellSurfaceState>,
  countryPreviewOverrides: Map<string, string | null>,
  provincePreviewOverrides: Map<string, string | null>,
  cellSurfaces: Record<string, CellSurfaceState>,
  countryAssignments: Record<string, string | null>,
  provinceAssignments: Record<string, string | null>,
) {
  for (const [cellId, surface] of surfacePreviewOverrides) {
    if (areSurfaceStatesEqual(cellSurfaces[cellId], surface)) {
      surfacePreviewOverrides.delete(cellId)
    }
  }

  for (const [cellId, countryId] of countryPreviewOverrides) {
    if ((countryAssignments[cellId] ?? null) === countryId) {
      countryPreviewOverrides.delete(cellId)
    }
  }

  for (const [cellId, provinceId] of provincePreviewOverrides) {
    if ((provinceAssignments[cellId] ?? null) === provinceId) {
      provincePreviewOverrides.delete(cellId)
    }
  }
}

function buildEffectiveSurfaceAssignments(
  cellSurfaces: Record<string, CellSurfaceState>,
  surfacePreviewOverrides: Map<string, CellSurfaceState>,
) {
  if (surfacePreviewOverrides.size === 0) {
    return cellSurfaces
  }

  return {
    ...cellSurfaces,
    ...Object.fromEntries(surfacePreviewOverrides),
  }
}

function buildEffectiveCountryAssignments(
  countryAssignments: Record<string, string | null>,
  countryPreviewOverrides: Map<string, string | null>,
) {
  if (countryPreviewOverrides.size === 0) {
    return countryAssignments
  }

  return {
    ...countryAssignments,
    ...Object.fromEntries(countryPreviewOverrides),
  }
}

function buildEffectiveProvinceAssignments(
  provinceAssignments: Record<string, string | null>,
  provincePreviewOverrides: Map<string, string | null>,
) {
  if (provincePreviewOverrides.size === 0) {
    return provinceAssignments
  }

  return {
    ...provinceAssignments,
    ...Object.fromEntries(provincePreviewOverrides),
  }
}

function getExpandedCellIdsForRadius(
  scene: SceneRefs,
  centerCellId: string,
  radius: number,
  cache: Map<string, string[]>,
) {
  if (radius <= 0) {
    return [centerCellId]
  }

  const cacheKey = `${centerCellId}|${radius}`
  const cached = cache.get(cacheKey)
  if (cached) {
    return cached
  }

  const centerCell = scene.cellById.get(centerCellId)
  if (!centerCell) {
    return []
  }

  const expandedCellIds = getCellsWithinRadius(centerCell, radius, scene.cellsByCoordinates).map(
    (cell) => cell.id,
  )
  cache.set(cacheKey, expandedCellIds)
  return expandedCellIds
}

function updateHoveredOverlay(
  scene: SceneRefs,
  nextHoveredCellId: string | null,
  hexSize: number,
  hoveredCellIdRef: { current: string | null },
  hoveredOverlayCellIdsRef: { current: Set<string> },
  radius: number,
  radiusCellsCache: Map<string, string[]>,
  isDrawing: boolean,
) {
  const previousHoveredCellIds = hoveredOverlayCellIdsRef.current
  const nextHoveredCellIds = new Set<string>(
    nextHoveredCellId
      ? getExpandedCellIdsForRadius(scene, nextHoveredCellId, radius, radiusCellsCache)
      : [],
  )
  for (const cellId of previousHoveredCellIds) {
    if (nextHoveredCellIds.has(cellId)) {
      continue
    }

    const previousGraphic = scene.overlayGraphics.get(cellId)
    if (previousGraphic) {
      redrawOverlayGraphic({
        graphic: previousGraphic,
        cell: scene.cellById.get(cellId),
        hexSize,
        style: 'hidden',
      })
    }
  }
  if (nextHoveredCellId) {
    for (const cellId of nextHoveredCellIds) {
      const nextGraphic = scene.overlayGraphics.get(cellId)
      if (nextGraphic) {
        redrawOverlayGraphic({
          graphic: nextGraphic,
          cell: scene.cellById.get(cellId),
          hexSize,
          style: isDrawing ? 'hidden' : 'hover',
          drawingFillColor: undefined,
        })
      }
    }
  }

  hoveredOverlayCellIdsRef.current = nextHoveredCellIds
  hoveredCellIdRef.current = nextHoveredCellId
}

function fitSceneToHost(
  mapRoot: Container,
  host: HTMLDivElement,
  grid: HexGridConfig,
  cells: HexCell[],
  frame: WorldFrame,
  camera: CameraState,
) {
  const bounds = getGridBounds(cells, grid.hexSize)
  const availableWidth = Math.max(host.clientWidth, 1)
  const availableHeight = Math.max(host.clientHeight, 1)
  const contentWidth = bounds.width + frame.left + frame.right
  const contentHeight = bounds.height + frame.top + frame.bottom
  const baseScale = Math.min(availableWidth / contentWidth, availableHeight / contentHeight)
  const scale = baseScale * camera.zoom

  camera.baseScale = baseScale
  camera.positionX =
    availableWidth / 2 - (bounds.minX - frame.left + contentWidth / 2) * scale
  camera.positionY =
    availableHeight / 2 - (bounds.minY - frame.top + contentHeight / 2) * scale

  applyCameraTransform(mapRoot, camera)
}

function applyCameraTransform(mapRoot: Container, camera: CameraState) {
  const scale = camera.baseScale * camera.zoom
  mapRoot.scale.set(scale)
  mapRoot.position.set(camera.positionX, camera.positionY)
}

function zoomCameraAroundScreenPoint(
  camera: CameraState,
  screenX: number,
  screenY: number,
  nextZoom: number,
) {
  const currentScale = Math.max(camera.baseScale * camera.zoom, 0.0001)
  const worldX = (screenX - camera.positionX) / currentScale
  const worldY = (screenY - camera.positionY) / currentScale
  camera.zoom = nextZoom
  const nextScale = Math.max(camera.baseScale * camera.zoom, 0.0001)
  camera.positionX = screenX - worldX * nextScale
  camera.positionY = screenY - worldY * nextScale
}

function toWorldPoint(event: PointerLikeEvent, host: HTMLDivElement, mapRoot: Container) {
  const rect = host.getBoundingClientRect()
  const screenX = event.clientX - rect.left
  const screenY = event.clientY - rect.top

  return {
    x: (screenX - mapRoot.position.x) / mapRoot.scale.x,
    y: (screenY - mapRoot.position.y) / mapRoot.scale.y,
  }
}

function toScreenPoint(event: PointerLikeEvent, host: HTMLDivElement) {
  const rect = host.getBoundingClientRect()

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function getPoliticalFillColor(
  cellId: string,
  countries: Record<string, Country>,
  provinces: Record<string, Province>,
  cellSurfaces: Record<string, CellSurfaceState>,
  countryAssignments: Record<string, string | null>,
  provinceAssignments: Record<string, string | null>,
  politicalColorMode: 'country' | 'province',
  colorWaterInCountryLayer: boolean,
  cityStatesFillTerritory: boolean,
) {
  const countryId = countryAssignments[cellId]
  const provinceId = provinceAssignments[cellId]
  const surface = cellSurfaces[cellId] ?? DEFAULT_SURFACE_STATE

  if (!countryId || surface.kind === 'empty') {
    return null
  }

  if (surface.kind === 'water' && !colorWaterInCountryLayer) {
    return null
  }

  if (!cityStatesFillTerritory && isCityStateCountry(countries[countryId])) {
    return null
  }

  if (politicalColorMode === 'province' && provinceId) {
    return parseHexColor(provinces[provinceId]?.color ?? countries[countryId]?.color ?? '#000000')
  }

  return parseHexColor(countries[countryId]?.color ?? '#000000')
}

function getProvinceFillColor(
  cellId: string,
  provinces: Record<string, Province>,
  cellSurfaces: Record<string, CellSurfaceState>,
  provinceAssignments: Record<string, string | null>,
  colorWaterInCountryLayer: boolean,
) {
  const provinceId = provinceAssignments[cellId]
  const surface = cellSurfaces[cellId] ?? DEFAULT_SURFACE_STATE

  if (!provinceId || surface.kind === 'empty') {
    return null
  }

  if (surface.kind === 'water' && !colorWaterInCountryLayer) {
    return null
  }

  return parseHexColor(provinces[provinceId]?.color ?? '#000000')
}

function getEdgeStyle({
  displayMode,
  currentSurface,
  neighborSurface,
  snowLineElevation,
  snowColor,
  showSnowOverride,
  landEdgeColor,
  landEdgeWidth,
  landEdgeColorValue,
  landEmptyEdgeColor,
  landEmptyEdgeWidth,
  landEmptyEdgeColorValue,
  coastEdgeColor,
  coastEdgeWidth,
  coastEdgeColorValue,
  waterEdgeColor,
  waterEdgeWidth,
  waterEdgeColorValue,
  waterEmptyEdgeColor,
  waterEmptyEdgeWidth,
  waterEmptyEdgeColorValue,
  darkWaterEdgeColor,
  darkWaterEdgeWidth,
  darkWaterEdgeColorValue,
  snowEdgeColor,
  snowEdgeWidth,
  snowEdgeColorValue,
  snowBoundaryEdgeColor,
  snowBoundaryEdgeWidth,
  snowBoundaryEdgeColorValue,
  showLandEmptyEdges,
  showWaterEmptyEdges,
}: {
  displayMode: 'surface' | 'topography'
  currentSurface: CellSurfaceState
  neighborSurface: CellSurfaceState
  snowLineElevation: number
  snowColor: string
  showSnowOverride: boolean
  landEdgeColor: string
  landEdgeWidth: number
  landEdgeColorValue: number
  landEmptyEdgeColor: string
  landEmptyEdgeWidth: number
  landEmptyEdgeColorValue: number
  coastEdgeColor: string
  coastEdgeWidth: number
  coastEdgeColorValue: number
  waterEdgeColor: string
  waterEdgeWidth: number
  waterEdgeColorValue: number
  waterEmptyEdgeColor: string
  waterEmptyEdgeWidth: number
  waterEmptyEdgeColorValue: number
  darkWaterEdgeColor: string
  darkWaterEdgeWidth: number
  darkWaterEdgeColorValue: number
  snowEdgeColor: string
  snowEdgeWidth: number
  snowEdgeColorValue: number
  snowBoundaryEdgeColor: string
  snowBoundaryEdgeWidth: number
  snowBoundaryEdgeColorValue: number
  showLandEmptyEdges: boolean
  showWaterEmptyEdges: boolean
}):
  | { color: string; colorValue: number; width: number; styleKey: TerrainEdgeStyleKey }
  | null {
  void snowColor

  const getTerrainEdgeClass = (surface: CellSurfaceState) => {
    if (surface.kind === 'empty') {
      return 'empty' as const
    }
    if (
      displayMode === 'topography' &&
      showSnowOverride &&
      surface.kind === 'land' &&
      surface.special === 'none' &&
      surface.elevation >= snowLineElevation
    ) {
      return 'snow' as const
    }
    if (surface.special === 'dark' && surface.kind === 'water') {
      return 'dark_water' as const
    }
    if (surface.kind === 'water') {
      return 'water' as const
    }
    return 'land' as const
  }

  const currentClass = getTerrainEdgeClass(currentSurface)
  const neighborClass = getTerrainEdgeClass(neighborSurface)

  if (currentClass === 'empty' && neighborClass === 'empty') {
    return null
  }

  if (currentClass === 'snow' && neighborClass === 'snow') {
    return { color: snowEdgeColor, colorValue: snowEdgeColorValue, width: snowEdgeWidth, styleKey: 'snow_inner' }
  }

  if (
    (currentClass === 'snow' && neighborClass === 'land') ||
    (currentClass === 'land' && neighborClass === 'snow')
  ) {
    return {
      color: snowBoundaryEdgeColor,
      colorValue: snowBoundaryEdgeColorValue,
      width: snowBoundaryEdgeWidth,
      styleKey: 'snow_boundary',
    }
  }

  if (
    ((currentClass === 'land' || currentClass === 'snow') &&
      (neighborClass === 'water' || neighborClass === 'dark_water')) ||
    ((currentClass === 'water' || currentClass === 'dark_water') &&
      (neighborClass === 'land' || neighborClass === 'snow'))
  ) {
    return { color: coastEdgeColor, colorValue: coastEdgeColorValue, width: coastEdgeWidth, styleKey: 'coast' }
  }

  if ((currentClass === 'land' || currentClass === 'snow') && neighborClass === 'empty') {
    return showLandEmptyEdges
      ? { color: landEmptyEdgeColor, colorValue: landEmptyEdgeColorValue, width: landEmptyEdgeWidth, styleKey: 'land_empty' }
      : null
  }

  if (currentClass === 'empty' && (neighborClass === 'land' || neighborClass === 'snow')) {
    return showLandEmptyEdges
      ? { color: landEmptyEdgeColor, colorValue: landEmptyEdgeColorValue, width: landEmptyEdgeWidth, styleKey: 'land_empty' }
      : null
  }

  if ((currentClass === 'water' || currentClass === 'dark_water') && neighborClass === 'empty') {
    return showWaterEmptyEdges
      ? { color: waterEmptyEdgeColor, colorValue: waterEmptyEdgeColorValue, width: waterEmptyEdgeWidth, styleKey: 'water_empty' }
      : null
  }

  if (currentClass === 'empty' && (neighborClass === 'water' || neighborClass === 'dark_water')) {
    return showWaterEmptyEdges
      ? { color: waterEmptyEdgeColor, colorValue: waterEmptyEdgeColorValue, width: waterEmptyEdgeWidth, styleKey: 'water_empty' }
      : null
  }

  if (currentClass === 'dark_water' || neighborClass === 'dark_water') {
    return {
      color: darkWaterEdgeColor,
      colorValue: darkWaterEdgeColorValue,
      width: darkWaterEdgeWidth,
      styleKey: 'dark_water_inner',
    }
  }

  if (currentClass === 'water' && neighborClass === 'water') {
    return { color: waterEdgeColor, colorValue: waterEdgeColorValue, width: waterEdgeWidth, styleKey: 'water_inner' }
  }

  if (
    (currentClass === 'land' || currentClass === 'snow') &&
    (neighborClass === 'land' || neighborClass === 'snow')
  ) {
    return { color: landEdgeColor, colorValue: landEdgeColorValue, width: landEdgeWidth, styleKey: 'land_inner' }
  }

  return null
}

function parseHexColor(color: string) {
  return Number.parseInt(color.replace('#', ''), 16)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function findTopmostLabelAtPoint(scene: SceneRefs, x: number, y: number) {
  for (let index = scene.orderedLabelIds.length - 1; index >= 0; index -= 1) {
    const labelId = scene.orderedLabelIds[index]
    const text = scene.labelTexts.get(labelId)

    if (!text || !text.visible) {
      continue
    }

    const bounds = text.getBounds()
    if (x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height) {
      return labelId
    }
  }

  return null
}

function normalizePixiFontWeight(weight: string) {
  if (weight === 'normal' || weight === 'bold' || weight === 'bolder' || weight === 'lighter') {
    return weight
  }

  const numericWeight = Number.parseInt(weight, 10)
  return Number.isFinite(numericWeight) ? numericWeight : 'normal'
}

function getLabelTextRenderFactor(zoom: number) {
  const clampedZoom = clamp(zoom, 1, 4)
  return snapToStep(clampedZoom, 0.25)
}

function snapToStep(value: number, step: number) {
  return Math.max(step, Math.round(value / step) * step)
}

function applyTextTransform(
  value: string,
  transform: 'none' | 'uppercase' | 'lowercase' | 'capitalize',
) {
  switch (transform) {
    case 'uppercase':
      return value.toUpperCase()
    case 'lowercase':
      return value.toLowerCase()
    case 'capitalize':
      return value.replace(/\b\p{L}/gu, (char) => char.toUpperCase())
    case 'none':
      return value
  }
}
