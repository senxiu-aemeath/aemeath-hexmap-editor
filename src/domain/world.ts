import { createRectHexGrid, type HexCell, type HexGridConfig } from './grid'

export type SurfaceKind = 'land' | 'water' | 'empty'
export type SurfaceSpecial = 'none' | 'unknown' | 'dark'

export interface CellSurfaceState {
  kind: SurfaceKind
  elevation: number
  special: SurfaceSpecial
}

export interface Country {
  id: string
  name: string
  secondName?: string
  iconKey?: string | null
  color: string
  borderColor?: string
  provinceDefaultColor?: string
  provinceBorderColor?: string
  governmentTypeId: string | null
  isCityState: boolean
  description?: string
}

export interface GovernmentType {
  id: string
  name: string
  color: string
  order: number
}

export interface CityLevel {
  id: string
  name: string
  rank: number
  iconKey: string
  iconScalePercent: number
  order: number
  uniquePerCountry: boolean
  displayInCountryInfo: boolean
}

export interface City {
  id: string
  name: string
  secondName?: string
  cellId: string
  countryId: string | null
  levelId: string
  description?: string
}

export interface Province {
  id: string
  name: string
  countryId: string | null
  color: string
  capitalCityId: string | null
  description?: string
}

export interface Submap {
  id: string
  name: string
  cellIds: string[]
  useWorldTitlePrefix?: boolean
  useDefaultStyle?: boolean
  subtitle?: string
  pageMarginTop?: number
  frameTop?: number
  frameRight?: number
  frameBottom?: number
  frameLeft?: number
  frameColor?: string
  titleFontSize?: number
  subtitleFontSize?: number
  bylineFontSize?: number
  titleSubtitleGap?: number
  subtitleBylineGap?: number
}

export interface WorldMetadata {
  name: string
  author: string
  title: string
  subtitle: string
  showBranding: boolean
  showTitle: boolean
  showSubtitle: boolean
  showByline: boolean
  pageMarginTop: number
  headerFontFamily: string
  titleColor: string
  subtitleColor: string
  bylineColor: string
  titleFontSize: number
  subtitleFontSize: number
  bylineFontSize: number
  titleSubtitleGap: number
  subtitleBylineGap: number
}

export interface WorldFrame {
  top: number
  right: number
  bottom: number
  left: number
  color: string
}

export interface WorldAxes {
  showTop: boolean
  showRight: boolean
  showBottom: boolean
  showLeft: boolean
  color: string
  fontSize: number
  fontFamily: string
}

export interface WorldSubmapStyle {
  pageMarginTop: number
  frameTop: number
  frameRight: number
  frameBottom: number
  frameLeft: number
  frameColor: string
  titleFontSize: number
  subtitleFontSize: number
  bylineFontSize: number
  titleSubtitleGap: number
  subtitleBylineGap: number
}

export interface LabelStyle {
  fontFamily: string
  fontSize: number
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  letterSpacing: number
  lineHeight: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  textAlign: 'left' | 'center' | 'right'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  rotation: number
  scaleWithZoom: boolean
  scaleWithCountrySize: boolean
  countrySizeScaleMin: number
  countrySizeScaleMax: number
  minZoom: number | null
  maxZoom: number | null
  maxWidth: number | null
  curved: boolean
}

export interface LabelGroup {
  id: string
  name: string
  builtIn: boolean
  kind: LabelGroupKind
  visible: boolean
  locked: boolean
  order: number
  defaults: LabelStyle
  assignment: LabelGroupAssignment | null
}

export type LabelGroupKind = 'free' | 'assigned'

export type LabelAssignTarget = 'city' | 'country' | 'province'
export type AssignedLabelAutoCreateMode = 'always' | 'never' | 'default'

export type LabelGroupAssignment = {
  kind: LabelAssignTarget
  autoCreateMode: AssignedLabelAutoCreateMode
  autoCreateDefault: boolean
  confirmOnRemove: boolean
  defaultOffsetX: number
  defaultOffsetY: number
  generatedTextPrefix: string
  generatedTextSuffix: string
  sourceNameMode: 'primary' | 'secondary'
}

export type LabelSource =
  | { kind: 'manual' }
  | { kind: 'city'; cityId: string }
  | { kind: 'country'; countryId: string }
  | { kind: 'province'; provinceId: string }

export type LabelAnchor =
  | { kind: 'world'; x: number; y: number }
  | {
      kind: 'cell'
      cellId: string
      offsetX: number
      offsetY: number
      flipX?: boolean
      flipY?: boolean
      useDefaultOffsetX?: boolean
      useDefaultOffsetY?: boolean
    }
  | {
      kind: 'city'
      cityId: string
      offsetX: number
      offsetY: number
      flipX?: boolean
      flipY?: boolean
      useDefaultOffsetX?: boolean
      useDefaultOffsetY?: boolean
    }
  | {
      kind: 'country'
      countryId: string
      offsetX: number
      offsetY: number
      flipX?: boolean
      flipY?: boolean
      useDefaultOffsetX?: boolean
      useDefaultOffsetY?: boolean
    }
  | {
      kind: 'province'
      provinceId: string
      offsetX: number
      offsetY: number
      flipX?: boolean
      flipY?: boolean
      useDefaultOffsetX?: boolean
      useDefaultOffsetY?: boolean
    }
  | { kind: 'path'; pathId: string; t: number; offsetNormal: number }

export type LabelOffsetAnchor = Extract<LabelAnchor, { kind: 'cell' | 'city' | 'country' | 'province' }>

export interface Label {
  id: string
  groupId: string
  visible: boolean
  locked: boolean
  useGroupDefaults: boolean
  renderKind: 'text' | 'country-icon'
  source: LabelSource
  anchor: LabelAnchor
  textMode: 'source' | 'custom'
  customText: string
  styleOverrides: Partial<LabelStyle>
}

export interface WorldDocument {
  version: number
  grid: HexGridConfig
  cells: HexCell[]
  metadata: WorldMetadata
  frame: WorldFrame
  axes: WorldAxes
  submapStyle: WorldSubmapStyle
  countries: Record<string, Country>
  governmentTypes: Record<string, GovernmentType>
  cellSurfaces: Record<string, CellSurfaceState>
  countryAssignments: Record<string, string | null>
  provinces: Record<string, Province>
  provinceAssignments: Record<string, string | null>
  cityLevels: Record<string, CityLevel>
  cities: Record<string, City>
  submaps: Record<string, Submap>
  labelGroups: Record<string, LabelGroup>
  labels: Record<string, Label>
}

export const DEFAULT_WORLD_METADATA: WorldMetadata = {
  name: 'S.A. Hexmap',
  author: '',
  title: 'World Title',
  subtitle: 'World Description',
  showBranding: true,
  showTitle: true,
  showSubtitle: true,
  showByline: true,
  pageMarginTop: 28,
  headerFontFamily: '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
  titleColor: '#20150f',
  subtitleColor: '#4e3b34',
  bylineColor: '#7a6971',
  titleFontSize: 68,
  subtitleFontSize: 28,
  bylineFontSize: 18,
  titleSubtitleGap: 8,
  subtitleBylineGap: 8,
}

export const DEFAULT_WORLD_FRAME: WorldFrame = {
  top: 228,
  right: 68,
  bottom: 68,
  left: 68,
  color: '#f4f0e2',
}

export const DEFAULT_SUBMAP_STYLE: WorldSubmapStyle = {
  pageMarginTop: 18,
  frameTop: 141,
  frameRight: 56,
  frameBottom: 56,
  frameLeft: 56,
  frameColor: DEFAULT_WORLD_FRAME.color,
  titleFontSize: 30,
  subtitleFontSize: 22,
  bylineFontSize: 18,
  titleSubtitleGap: 6,
  subtitleBylineGap: 6,
}

export const DEFAULT_WORLD_AXES: WorldAxes = {
  showTop: true,
  showRight: true,
  showBottom: true,
  showLeft: true,
  color: '#20150f',
  fontSize: 14,
  fontFamily: '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
}

export const CITY_ICON_REGISTRY: Record<string, string> = {
  capital: '/icons/cities/capital.svg',
  province_capital: '/icons/cities/province_capital.svg',
  town: '/icons/cities/town.svg',
  village: '/icons/cities/village.svg',
}

export const DEFAULT_LABEL_STYLE: LabelStyle = {
  fontFamily: '"JetBrains Mono", "Cascadia Mono", "Fira Code", "Noto Sans Mono CJK SC", monospace',
  fontSize: 18,
  fontWeight: '400',
  fontStyle: 'normal',
  letterSpacing: 0,
  lineHeight: 1.1,
  fill: '#f7f1da',
  stroke: '#20150f',
  strokeWidth: 3,
  opacity: 1,
  textAlign: 'center',
  textTransform: 'none',
  rotation: 0,
  scaleWithZoom: true,
  scaleWithCountrySize: true,
  countrySizeScaleMin: 0.85,
  countrySizeScaleMax: 1.25,
  minZoom: null,
  maxZoom: null,
  maxWidth: null,
  curved: false,
}

export const DEFAULT_SURFACE_STATE: CellSurfaceState = {
  kind: 'land',
  elevation: 0,
  special: 'none',
}

export function clampSurfaceElevation(kind: SurfaceKind, elevation: number) {
  if (kind === 'water') {
    return Math.max(-10, Math.min(0, Math.round(elevation)))
  }

  if (kind === 'land') {
    return Math.max(-5, Math.min(20, Math.round(elevation)))
  }

  return 0
}

export function normalizeSurfaceState(surface: CellSurfaceState): CellSurfaceState {
  if (surface.kind === 'empty') {
    return {
      kind: 'empty',
      elevation: 0,
      special: 'none',
    }
  }

  const special =
    surface.kind === 'water'
      ? surface.special
      : surface.special === 'unknown'
        ? 'unknown'
        : 'none'

  return {
    kind: surface.kind,
    elevation: clampSurfaceElevation(surface.kind, surface.elevation),
    special,
  }
}

export function createSurfaceState(
  kind: SurfaceKind,
  elevation: number = 0,
  special: SurfaceSpecial = 'none',
): CellSurfaceState {
  return normalizeSurfaceState({
    kind,
    elevation,
    special,
  })
}

export function isSurfaceLand(surface: CellSurfaceState | null | undefined) {
  return (surface ?? DEFAULT_SURFACE_STATE).kind === 'land'
}

export function isSurfaceWater(surface: CellSurfaceState | null | undefined) {
  return (surface ?? DEFAULT_SURFACE_STATE).kind === 'water'
}

export function isSurfaceEmpty(surface: CellSurfaceState | null | undefined) {
  return (surface ?? DEFAULT_SURFACE_STATE).kind === 'empty'
}

export function areSurfaceStatesEqual(
  left: CellSurfaceState | null | undefined,
  right: CellSurfaceState | null | undefined,
) {
  const normalizedLeft = normalizeSurfaceState(left ?? DEFAULT_SURFACE_STATE)
  const normalizedRight = normalizeSurfaceState(right ?? DEFAULT_SURFACE_STATE)

  return (
    normalizedLeft.kind === normalizedRight.kind &&
    normalizedLeft.elevation === normalizedRight.elevation &&
    normalizedLeft.special === normalizedRight.special
  )
}

export const BUILT_IN_LABEL_GROUP_IDS = {
  cityName: 'city_name',
  citySecondName: 'city_second_name',
  countryName: 'country_name',
  provinceName: 'province_name',
  countryIcon: 'country_icon',
  countrySecondName: 'country_second_name',
  freeLabel: 'free_label',
  freeIcon: 'free_icon',
} as const

function createBuiltInLabelGroups(): Record<string, LabelGroup> {
  return {
    [BUILT_IN_LABEL_GROUP_IDS.cityName]: {
      id: BUILT_IN_LABEL_GROUP_IDS.cityName,
      name: 'City Names',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 0,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 16,
        fontWeight: '600',
      },
      assignment: {
        kind: 'city',
        autoCreateMode: 'default',
        autoCreateDefault: false,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: 0,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'primary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.citySecondName]: {
      id: BUILT_IN_LABEL_GROUP_IDS.citySecondName,
      name: 'City Second Names',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 1,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 14,
        fontWeight: '400',
        fontStyle: 'italic',
      },
      assignment: {
        kind: 'city',
        autoCreateMode: 'default',
        autoCreateDefault: false,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: 18,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'secondary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.countryName]: {
      id: BUILT_IN_LABEL_GROUP_IDS.countryName,
      name: 'Country Names',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 2,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      },
      assignment: {
        kind: 'country',
        autoCreateMode: 'default',
        autoCreateDefault: false,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: 0,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'primary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.provinceName]: {
      id: BUILT_IN_LABEL_GROUP_IDS.provinceName,
      name: 'Province Names',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 3,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 22,
        fontWeight: '600',
        letterSpacing: 0.8,
      },
      assignment: {
        kind: 'province',
        autoCreateMode: 'default',
        autoCreateDefault: false,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: 0,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'primary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.countryIcon]: {
      id: BUILT_IN_LABEL_GROUP_IDS.countryIcon,
      name: 'Country Icons',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 4,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 52,
        strokeWidth: 0,
      },
      assignment: {
        kind: 'country',
        autoCreateMode: 'default',
        autoCreateDefault: true,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: -28,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'primary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.countrySecondName]: {
      id: BUILT_IN_LABEL_GROUP_IDS.countrySecondName,
      name: 'Country Second Names',
      builtIn: true,
      kind: 'assigned',
      visible: true,
      locked: false,
      order: 5,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 18,
        fontWeight: '500',
        fontStyle: 'italic',
        letterSpacing: 0.8,
      },
      assignment: {
        kind: 'country',
        autoCreateMode: 'default',
        autoCreateDefault: false,
        confirmOnRemove: true,
        defaultOffsetX: 0,
        defaultOffsetY: 26,
        generatedTextPrefix: '',
        generatedTextSuffix: '',
        sourceNameMode: 'secondary',
      },
    },
    [BUILT_IN_LABEL_GROUP_IDS.freeLabel]: {
      id: BUILT_IN_LABEL_GROUP_IDS.freeLabel,
      name: 'Free Labels',
      builtIn: true,
      kind: 'free',
      visible: true,
      locked: false,
      order: 6,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 20,
      },
      assignment: null,
    },
    [BUILT_IN_LABEL_GROUP_IDS.freeIcon]: {
      id: BUILT_IN_LABEL_GROUP_IDS.freeIcon,
      name: 'Free Icons',
      builtIn: true,
      kind: 'free',
      visible: true,
      locked: false,
      order: 7,
      defaults: {
        ...DEFAULT_LABEL_STYLE,
        fontSize: 52,
        strokeWidth: 0,
      },
      assignment: null,
    },
  }
}

export function getLabelGroupPresetDefaults(groupId: string): LabelStyle {
  return createBuiltInLabelGroups()[groupId]?.defaults ?? DEFAULT_LABEL_STYLE
}

export function createInitialWorld(grid: HexGridConfig): WorldDocument {
  const cells = createRectHexGrid(grid)

  return {
    version: 1,
    grid,
    cells,
    metadata: DEFAULT_WORLD_METADATA,
    frame: DEFAULT_WORLD_FRAME,
    axes: DEFAULT_WORLD_AXES,
    submapStyle: DEFAULT_SUBMAP_STYLE,
    countries: {},
    governmentTypes: {
      monarchy: { id: 'monarchy', name: 'Monarchy', color: '#c79a34', order: 0 },
      republic: { id: 'republic', name: 'Republic', color: '#4b86b4', order: 1 },
      theocracy: { id: 'theocracy', name: 'Theocracy', color: '#9d7bd8', order: 2 },
      steppe_horde: {
        id: 'steppe_horde',
        name: 'Steppe Horde',
        color: '#8f6b3d',
        order: 3,
      },
      tribe: { id: 'tribe', name: 'Tribe', color: '#5a8b7a', order: 4 },
    },
    cellSurfaces: Object.fromEntries(
      cells.map((cell) => [cell.id, createSurfaceState('land')] as const),
    ),
    countryAssignments: Object.fromEntries(
      cells.map((cell) => [cell.id, null] as const),
    ),
    provinces: {},
    provinceAssignments: Object.fromEntries(
      cells.map((cell) => [cell.id, null] as const),
    ),
    cityLevels: {
      capital: {
        id: 'capital',
        name: 'Capital',
        rank: 4,
        iconKey: 'capital',
        iconScalePercent: 100,
        order: 0,
        uniquePerCountry: true,
        displayInCountryInfo: true,
      },
      province_capital: {
        id: 'province_capital',
        name: 'Province Capital',
        rank: 3,
        iconKey: 'province_capital',
        iconScalePercent: 100,
        order: 1,
        uniquePerCountry: false,
        displayInCountryInfo: false,
      },
      town: {
        id: 'town',
        name: 'Town',
        rank: 2,
        iconKey: 'town',
        iconScalePercent: 100,
        order: 2,
        uniquePerCountry: false,
        displayInCountryInfo: false,
      },
      village: {
        id: 'village',
        name: 'Village',
        rank: 1,
        iconKey: 'village',
        iconScalePercent: 100,
        order: 3,
        uniquePerCountry: false,
        displayInCountryInfo: false,
      },
      fallback: {
        id: 'fallback',
        name: 'Fallback',
        rank: 0,
        iconKey: 'village',
        iconScalePercent: 100,
        order: 999,
        uniquePerCountry: false,
        displayInCountryInfo: false,
      },
    },
    cities: {},
    submaps: {},
    labelGroups: createBuiltInLabelGroups(),
    labels: {},
  }
}

export function resizeWorldDocument(world: WorldDocument, grid: HexGridConfig): WorldDocument {
  const nextCells = createRectHexGrid(grid)
  const nextCellIds = new Set(nextCells.map((cell) => cell.id))

  const nextCellSurfaces = Object.fromEntries(
    nextCells.map((cell) => [cell.id, world.cellSurfaces[cell.id] ?? createSurfaceState('land')] as const),
  )
  const nextCountryAssignments = Object.fromEntries(
    nextCells.map((cell) => [cell.id, world.countryAssignments[cell.id] ?? null] as const),
  )
  const nextProvinceAssignments = Object.fromEntries(
    nextCells.map((cell) => [cell.id, world.provinceAssignments[cell.id] ?? null] as const),
  )

  const nextCities = Object.fromEntries(
    Object.entries(world.cities).filter(([, city]) => nextCellIds.has(city.cellId)),
  )

  const nextSubmaps = Object.fromEntries(
    Object.entries(world.submaps).map(([submapId, submap]) => [
      submapId,
      {
        ...submap,
        cellIds: submap.cellIds.filter((cellId) => nextCellIds.has(cellId)),
      },
    ]),
  )

  const nextLabels = Object.fromEntries(
    Object.entries(world.labels).filter(([, label]) => {
      if (label.source.kind === 'city' && !nextCities[label.source.cityId]) {
        return false
      }

      if (label.anchor.kind === 'city' && !nextCities[label.anchor.cityId]) {
        return false
      }

      if (label.anchor.kind === 'cell' && !nextCellIds.has(label.anchor.cellId)) {
        return false
      }

      return true
    }),
  )

  const resizedWorld: WorldDocument = {
    ...world,
    grid,
    cells: nextCells,
    cellSurfaces: nextCellSurfaces,
    countryAssignments: nextCountryAssignments,
    provinceAssignments: nextProvinceAssignments,
    cities: nextCities,
    submaps: nextSubmaps,
    labels: nextLabels,
  }

  return {
    ...resizedWorld,
    provinces: clearInvalidProvinceCapitals(resizedWorld, resizedWorld.provinces, resizedWorld.provinceAssignments),
  }
}

export function normalizeWorldDocument(world: WorldDocument): WorldDocument {
  const rawAxes = (world as Partial<WorldDocument>).axes as
    | (Partial<WorldAxes> & { show?: boolean })
    | undefined
  const legacyShow = typeof rawAxes?.show === 'boolean' ? rawAxes.show : null

  const mergedLabelGroups = {
    ...createBuiltInLabelGroups(),
    ...world.labelGroups,
  }
  const normalizedLabelGroups = Object.fromEntries(
    Object.entries(mergedLabelGroups).map(([groupId, group]) => [
      groupId,
      {
        ...group,
        defaults: {
          ...DEFAULT_LABEL_STYLE,
          ...(group.defaults ?? {}),
        },
      },
    ]),
  )

  return {
    ...world,
    metadata: {
      ...DEFAULT_WORLD_METADATA,
      ...(world as Partial<WorldDocument>).metadata,
    },
    frame: {
      ...DEFAULT_WORLD_FRAME,
      ...(world as Partial<WorldDocument>).frame,
    },
    axes: {
      ...DEFAULT_WORLD_AXES,
      ...(legacyShow === null
        ? null
        : {
            showTop: legacyShow,
            showRight: legacyShow,
            showBottom: legacyShow,
            showLeft: legacyShow,
          }),
      ...rawAxes,
    },
    submapStyle: {
      ...DEFAULT_SUBMAP_STYLE,
      ...((world as Partial<WorldDocument>).submapStyle ?? null),
    },
    labelGroups: normalizedLabelGroups,
    labels: Object.fromEntries(
      Object.entries(world.labels).map(([labelId, label]) => [
        labelId,
        normalizeLabelData(label, normalizedLabelGroups[label.groupId]),
      ]),
    ),
  }
}

export function createCountry(name: string, color: string): Country {
  return {
    id: `country-${crypto.randomUUID()}`,
    name,
    secondName: '',
    iconKey: null,
    color,
    borderColor: color,
    provinceDefaultColor: color,
    provinceBorderColor: color,
    governmentTypeId: null,
    isCityState: false,
    description: '',
  }
}

export function isCityStateCountry(country: Country | null | undefined) {
  return country?.isCityState === true
}

export function createGovernmentType(
  name: string,
  color: string,
  order: number,
): GovernmentType {
  return {
    id: `government-type-${crypto.randomUUID()}`,
    name,
    color,
    order,
  }
}

export function createProvince(
  name: string,
  color: string,
  countryId: string | null,
): Province {
  return {
    id: `province-${crypto.randomUUID()}`,
    name,
    countryId,
    color,
    capitalCityId: null,
    description: '',
  }
}

export function createCity(
  name: string,
  cellId: string,
  countryId: string | null,
  levelId: string,
): City {
  return {
    id: `city-${crypto.randomUUID()}`,
    name,
    secondName: '',
    cellId,
    countryId,
    levelId,
    description: '',
  }
}

export function createCityLevel(
  name: string,
  rank: number,
  iconKey: string,
  iconScalePercent: number,
  order: number,
  uniquePerCountry: boolean = false,
  displayInCountryInfo: boolean = false,
): CityLevel {
  return {
    id: `city-level-${crypto.randomUUID()}`,
    name,
    rank,
    iconKey,
    iconScalePercent,
    order,
    uniquePerCountry,
    displayInCountryInfo,
  }
}

export function createSubmap(name: string, cellIds: string[]): Submap {
  return {
    id: `submap-${crypto.randomUUID()}`,
    name,
    cellIds,
    useDefaultStyle: true,
    subtitle: '',
  }
}

export function createLabelGroup(
  name: string,
  order: number,
  kind: LabelGroupKind = 'free',
  defaults: Partial<LabelStyle> = {},
  assignment: LabelGroupAssignment | null = null,
): LabelGroup {
  return {
    id: `label-group-${crypto.randomUUID()}`,
    name,
    builtIn: false,
    kind,
    visible: true,
    locked: false,
    order,
    defaults: {
      ...DEFAULT_LABEL_STYLE,
      ...defaults,
    },
    assignment: kind === 'assigned' ? (assignment ?? createDefaultLabelGroupAssignment('city')) : null,
  }
}

export function createDefaultLabelGroupAssignment(kind: LabelAssignTarget): LabelGroupAssignment {
  return {
    kind,
    autoCreateMode: 'default',
    autoCreateDefault: false,
    confirmOnRemove: true,
    defaultOffsetX: 0,
    defaultOffsetY: 0,
    generatedTextPrefix: '',
    generatedTextSuffix: '',
    sourceNameMode: 'primary',
  }
}

export function isLabelOffsetAnchor(anchor: LabelAnchor): anchor is LabelOffsetAnchor {
  return (
    anchor.kind === 'cell' ||
    anchor.kind === 'city' ||
    anchor.kind === 'country' ||
    anchor.kind === 'province'
  )
}

export function getLabelGroupAssignmentDefaultOffset(
  labelGroup: LabelGroup | null | undefined,
): { x: number; y: number } | null {
  if (!labelGroup || labelGroup.kind !== 'assigned' || !labelGroup.assignment) {
    return null
  }

  return {
    x: labelGroup.assignment.defaultOffsetX,
    y: labelGroup.assignment.defaultOffsetY,
  }
}

export function getLabelAnchorOffsetState(
  labelGroup: LabelGroup | null | undefined,
  anchor: LabelAnchor | null | undefined,
): {
  rawX: number
  rawY: number
  effectiveX: number
  effectiveY: number
  usesDefaultX: boolean
  usesDefaultY: boolean
  defaultX: number | null
  defaultY: number | null
} | null {
  if (!anchor || !isLabelOffsetAnchor(anchor)) {
    return null
  }

  const defaultOffset = getLabelGroupAssignmentDefaultOffset(labelGroup)
  const usesDefaultX = Boolean(anchor.useDefaultOffsetX && defaultOffset)
  const usesDefaultY = Boolean(anchor.useDefaultOffsetY && defaultOffset)
  const rawX = usesDefaultX ? defaultOffset!.x : anchor.offsetX
  const rawY = usesDefaultY ? defaultOffset!.y : anchor.offsetY

  return {
    rawX,
    rawY,
    effectiveX: anchor.flipX ? -rawX : rawX,
    effectiveY: anchor.flipY ? -rawY : rawY,
    usesDefaultX,
    usesDefaultY,
    defaultX: defaultOffset?.x ?? null,
    defaultY: defaultOffset?.y ?? null,
  }
}

function normalizeLabelAnchor(
  anchor: LabelAnchor,
  labelGroup: LabelGroup | undefined,
): LabelAnchor {
  if (!isLabelOffsetAnchor(anchor)) {
    return anchor
  }

  const defaultOffset = getLabelGroupAssignmentDefaultOffset(labelGroup)
  const inferredUseDefaultX = defaultOffset ? anchor.offsetX === defaultOffset.x : false
  const inferredUseDefaultY = defaultOffset ? anchor.offsetY === defaultOffset.y : false
  const useDefaultOffsetX = defaultOffset ? (anchor.useDefaultOffsetX ?? inferredUseDefaultX) : false
  const useDefaultOffsetY = defaultOffset ? (anchor.useDefaultOffsetY ?? inferredUseDefaultY) : false

  return {
    ...anchor,
    useDefaultOffsetX,
    useDefaultOffsetY,
  }
}

function normalizeLabelData(
  label: Label,
  labelGroup: LabelGroup | undefined,
): Label {
  return {
    ...label,
    useGroupDefaults: label.useGroupDefaults ?? true,
    renderKind: label.renderKind ?? 'text',
    anchor: normalizeLabelAnchor(label.anchor, labelGroup),
  }
}

export function createFreeLabel(
  text: string,
  x: number,
  y: number,
  groupId: string = BUILT_IN_LABEL_GROUP_IDS.freeLabel,
): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId,
    visible: true,
    locked: false,
    useGroupDefaults: true,
    renderKind: 'text',
    source: { kind: 'manual' },
    anchor: { kind: 'world', x, y },
    textMode: 'custom',
    customText: text,
    styleOverrides: {},
  }
}

export function createCityNameLabel(cityId: string, offsetX: number = 0, offsetY: number = 0): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId: BUILT_IN_LABEL_GROUP_IDS.cityName,
    visible: true,
    locked: false,
    useGroupDefaults: true,
    renderKind: 'text',
    source: { kind: 'city', cityId },
    anchor: { kind: 'city', cityId, offsetX, offsetY },
    textMode: 'source',
    customText: '',
    styleOverrides: {},
  }
}

export function createCountryNameLabel(
  countryId: string,
  offsetX: number = 0,
  offsetY: number = 0,
): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId: BUILT_IN_LABEL_GROUP_IDS.countryName,
    visible: true,
    locked: false,
    useGroupDefaults: true,
    renderKind: 'text',
    source: { kind: 'country', countryId },
    anchor: { kind: 'country', countryId, offsetX, offsetY },
    textMode: 'source',
    customText: '',
    styleOverrides: {},
  }
}

export function createProvinceNameLabel(
  provinceId: string,
  offsetX: number = 0,
  offsetY: number = 0,
): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId: BUILT_IN_LABEL_GROUP_IDS.provinceName,
    visible: true,
    locked: false,
    useGroupDefaults: true,
    renderKind: 'text',
    source: { kind: 'province', provinceId },
    anchor: { kind: 'province', provinceId, offsetX, offsetY },
    textMode: 'source',
    customText: '',
    styleOverrides: {},
  }
}

export function createCountryIconLabel(
  countryId: string,
  offsetX: number = 0,
  offsetY: number = -28,
): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId: BUILT_IN_LABEL_GROUP_IDS.countryIcon,
    visible: true,
    locked: true,
    useGroupDefaults: true,
    renderKind: 'country-icon',
    source: { kind: 'country', countryId },
    anchor: { kind: 'country', countryId, offsetX, offsetY },
    textMode: 'source',
    customText: '',
    styleOverrides: {},
  }
}

export function createFreeCountryIconLabel(
  countryId: string,
  x: number,
  y: number,
  groupId: string = BUILT_IN_LABEL_GROUP_IDS.freeIcon,
): Label {
  return {
    id: `label-${crypto.randomUUID()}`,
    groupId,
    visible: true,
    locked: groupId === BUILT_IN_LABEL_GROUP_IDS.countryIcon,
    useGroupDefaults: true,
    renderKind: 'country-icon',
    source: { kind: 'country', countryId },
    anchor: { kind: 'world', x, y },
    textMode: 'source',
    customText: '',
    styleOverrides: {},
  }
}

export function hasAssignedLabelForObject(
  world: WorldDocument,
  groupId: string,
  targetId: string,
): boolean {
  return findAssignedLabelForObject(world, groupId, targetId) !== null
}

export function findAssignedLabelForObject(
  world: WorldDocument,
  groupId: string,
  targetId: string,
): Label | null {
  return (
    Object.values(world.labels).find((label) => {
      if (label.groupId !== groupId) {
        return false
      }

      if (label.source.kind === 'city') {
        return label.source.cityId === targetId
      }

      if (label.source.kind === 'country') {
        return label.source.countryId === targetId
      }

      if (label.source.kind === 'province') {
        return label.source.provinceId === targetId
      }

      return false
    }) ?? null
  )
}

export function createAssignedLabelForGroup(
  world: WorldDocument,
  groupId: string,
  targetId: string,
): Label | null {
  const group = world.labelGroups[groupId]
  if (!group || group.kind !== 'assigned' || !group.assignment) {
    return null
  }

  const { assignment } = group
  const baseText =
    assignment.kind === 'city'
      ? resolveCityLabelText(world.cities[targetId], group)
      : assignment.kind === 'country'
        ? resolveCountryLabelText(world.countries[targetId], group)
        : resolveProvinceLabelText(world.provinces[targetId], group)

  if (!baseText) {
    return null
  }

  const generatedText = `${assignment.generatedTextPrefix}${baseText}${assignment.generatedTextSuffix}`
  const hasTextWrapper =
    assignment.generatedTextPrefix.length > 0 || assignment.generatedTextSuffix.length > 0

  if (assignment.kind === 'city') {
    return {
      id: `label-${crypto.randomUUID()}`,
      groupId,
      visible: true,
      locked: false,
      useGroupDefaults: true,
      renderKind: 'text',
      source: { kind: 'city', cityId: targetId },
      anchor: {
        kind: 'city',
        cityId: targetId,
        offsetX: assignment.defaultOffsetX,
        offsetY: assignment.defaultOffsetY,
        useDefaultOffsetX: true,
        useDefaultOffsetY: true,
      },
      textMode: hasTextWrapper ? 'custom' : 'source',
      customText: hasTextWrapper ? generatedText : '',
      styleOverrides: {},
    }
  }

  if (assignment.kind === 'province') {
    return {
      id: `label-${crypto.randomUUID()}`,
      groupId,
      visible: true,
      locked: false,
      useGroupDefaults: true,
      renderKind: 'text',
      source: { kind: 'province', provinceId: targetId },
      anchor: {
        kind: 'province',
        provinceId: targetId,
        offsetX: assignment.defaultOffsetX,
        offsetY: assignment.defaultOffsetY,
        useDefaultOffsetX: true,
        useDefaultOffsetY: true,
      },
      textMode: hasTextWrapper ? 'custom' : 'source',
      customText: hasTextWrapper ? generatedText : '',
      styleOverrides: {},
    }
  }

  return {
    id: `label-${crypto.randomUUID()}`,
    groupId,
    visible: true,
    locked: false,
    useGroupDefaults: true,
    renderKind:
      groupId === BUILT_IN_LABEL_GROUP_IDS.countryIcon ||
      groupId === BUILT_IN_LABEL_GROUP_IDS.freeIcon
        ? 'country-icon'
        : 'text',
    source: { kind: 'country', countryId: targetId },
    anchor: {
      kind: 'country',
      countryId: targetId,
      offsetX: assignment.defaultOffsetX,
      offsetY: assignment.defaultOffsetY,
      useDefaultOffsetX: true,
      useDefaultOffsetY: true,
    },
    textMode: hasTextWrapper ? 'custom' : 'source',
    customText: hasTextWrapper ? generatedText : '',
    styleOverrides: {},
  }
}

export function createMissingAssignedLabelsForGroup(
  world: WorldDocument,
  groupId: string,
): WorldDocument {
  const group = world.labelGroups[groupId]
  if (!group || group.kind !== 'assigned' || !group.assignment) {
    return world
  }

  const targetIds =
    group.assignment.kind === 'city'
      ? Object.keys(world.cities)
      : group.assignment.kind === 'country'
        ? Object.keys(world.countries)
        : Object.keys(world.provinces)

  let nextWorld = world

  for (const targetId of targetIds) {
    if (hasAssignedLabelForObject(nextWorld, groupId, targetId)) {
      continue
    }

    const label = createAssignedLabelForGroup(nextWorld, groupId, targetId)
    if (!label) {
      continue
    }

    nextWorld = upsertLabel(nextWorld, label)
  }

  return nextWorld
}

export function removeAssignedLabelForObject(
  world: WorldDocument,
  groupId: string,
  targetId: string,
): WorldDocument {
  const label = findAssignedLabelForObject(world, groupId, targetId)
  if (!label) {
    return world
  }

  return removeLabel(world, label.id)
}

export function assignCountryToCell(
  world: WorldDocument,
  cellId: string,
  countryId: string | null,
): WorldDocument {
  if (isSurfaceEmpty(world.cellSurfaces[cellId])) {
    return world
  }

  const cities = Object.fromEntries(
    Object.entries(world.cities).map(([cityId, city]) => [
      cityId,
      city.cellId === cellId ? { ...city, countryId } : city,
    ]),
  )

  const currentProvinceId = world.provinceAssignments[cellId]
  const provinceId =
    currentProvinceId && world.provinces[currentProvinceId]?.countryId === countryId
      ? currentProvinceId
      : null

  const provinceAssignments = {
    ...world.provinceAssignments,
    [cellId]: provinceId,
  }

  return {
    ...world,
    countryAssignments: {
      ...world.countryAssignments,
      [cellId]: countryId,
    },
    provinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, provinceAssignments),
    cities,
  }
}

export function assignCountryToCells(
  world: WorldDocument,
  cellIds: string[],
  countryId: string | null,
): WorldDocument {
  if (cellIds.length === 0) {
    return world
  }

  const nextAssignments = { ...world.countryAssignments }
  const nextProvinceAssignments = { ...world.provinceAssignments }
  const nextCities = { ...world.cities }
  const pendingCellIds = new Set<string>()
  let changed = false

  for (const cellId of cellIds) {
    if (isSurfaceEmpty(world.cellSurfaces[cellId])) {
      continue
    }

    if (nextAssignments[cellId] === countryId) {
      continue
    }

    nextAssignments[cellId] = countryId
    const currentProvinceId = nextProvinceAssignments[cellId]
    if (
      currentProvinceId &&
      world.provinces[currentProvinceId]?.countryId !== countryId
    ) {
      nextProvinceAssignments[cellId] = null
    }
    pendingCellIds.add(cellId)
    changed = true
  }

  if (!changed) {
    return world
  }

  for (const [cityId, city] of Object.entries(nextCities)) {
    if (pendingCellIds.has(city.cellId) && city.countryId !== countryId) {
      nextCities[cityId] = { ...city, countryId }
    }
  }

  return {
    ...world,
    countryAssignments: nextAssignments,
    provinceAssignments: nextProvinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, nextProvinceAssignments),
    cities: nextCities,
  }
}

export function upsertCountry(
  world: WorldDocument,
  country: Country,
): WorldDocument {
  return {
    ...world,
    countries: {
      ...world.countries,
      [country.id]: country,
    },
  }
}

export function upsertGovernmentType(
  world: WorldDocument,
  governmentType: GovernmentType,
): WorldDocument {
  return {
    ...world,
    governmentTypes: {
      ...world.governmentTypes,
      [governmentType.id]: governmentType,
    },
  }
}

export function upsertProvince(
  world: WorldDocument,
  province: Province,
): WorldDocument {
  const sanitizedProvince = {
    ...province,
    capitalCityId:
      province.capitalCityId && isCityInProvince(world, province.id, province.capitalCityId)
        ? province.capitalCityId
        : null,
  }

  let nextWorld: WorldDocument = {
    ...world,
    provinces: {
      ...world.provinces,
      [province.id]: sanitizedProvince,
    },
  }

  if (province.countryId !== world.provinces[province.id]?.countryId) {
    nextWorld = clearProvinceAssignmentsOutsideCountry(nextWorld, province.id)
  }

  return nextWorld
}

export function getSortedGovernmentTypes(governmentTypes: Record<string, GovernmentType>) {
  return [...Object.values(governmentTypes)].sort((left, right) => left.order - right.order)
}

export function upsertCity(
  world: WorldDocument,
  city: City,
): WorldDocument {
  return {
    ...world,
    cities: {
      ...world.cities,
      [city.id]: city,
    },
  }
}

export function upsertCityLevel(
  world: WorldDocument,
  cityLevel: CityLevel,
): WorldDocument {
  return {
    ...world,
    cityLevels: {
      ...world.cityLevels,
      [cityLevel.id]: cityLevel,
    },
  }
}

export function upsertSubmap(
  world: WorldDocument,
  submap: Submap,
): WorldDocument {
  return {
    ...world,
    submaps: {
      ...world.submaps,
      [submap.id]: submap,
    },
  }
}

export function assignProvinceToCell(
  world: WorldDocument,
  cellId: string,
  provinceId: string | null,
): WorldDocument {
  if (!isSurfaceLand(world.cellSurfaces[cellId])) {
    return world
  }

  if (provinceId === null) {
    if (world.provinceAssignments[cellId] === null) {
      return world
    }

    return {
      ...world,
      provinceAssignments: {
        ...world.provinceAssignments,
        [cellId]: null,
      },
      provinces: clearInvalidProvinceCapitals(world, world.provinces, {
        ...world.provinceAssignments,
        [cellId]: null,
      }),
    }
  }

  const province = world.provinces[provinceId]
  if (!province) {
    return world
  }

  const cellCountryId = world.countryAssignments[cellId] ?? null
  if (!cellCountryId || province.countryId !== cellCountryId) {
    return world
  }

  if (world.provinceAssignments[cellId] === provinceId) {
    return world
  }

  const nextProvinceAssignments = {
    ...world.provinceAssignments,
    [cellId]: provinceId,
  }

  return {
    ...world,
    provinceAssignments: nextProvinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, nextProvinceAssignments),
  }
}

export function assignProvinceToCells(
  world: WorldDocument,
  cellIds: string[],
  provinceId: string | null,
): WorldDocument {
  if (cellIds.length === 0) {
    return world
  }

  const nextAssignments = { ...world.provinceAssignments }
  let changed = false

  if (provinceId === null) {
    for (const cellId of cellIds) {
      if (!isSurfaceLand(world.cellSurfaces[cellId])) {
        continue
      }

      if (nextAssignments[cellId] === null) {
        continue
      }

      nextAssignments[cellId] = null
      changed = true
    }
  } else {
    const province = world.provinces[provinceId]
    if (!province) {
      return world
    }

    for (const cellId of cellIds) {
      if (!isSurfaceLand(world.cellSurfaces[cellId])) {
        continue
      }

      const cellCountryId = world.countryAssignments[cellId] ?? null
      if (!cellCountryId || province.countryId !== cellCountryId) {
        continue
      }

      if (nextAssignments[cellId] === provinceId) {
        continue
      }

      nextAssignments[cellId] = provinceId
      changed = true
    }
  }

  if (!changed) {
    return world
  }

  return {
    ...world,
    provinceAssignments: nextAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, nextAssignments),
  }
}

export function upsertLabelGroup(
  world: WorldDocument,
  labelGroup: LabelGroup,
): WorldDocument {
  return {
    ...world,
    labelGroups: {
      ...world.labelGroups,
      [labelGroup.id]: labelGroup,
    },
  }
}

export function upsertLabel(
  world: WorldDocument,
  label: Label,
): WorldDocument {
  const normalizedLabel = normalizeLabelData(label, world.labelGroups[label.groupId])
  return {
    ...world,
    labels: {
      ...world.labels,
      [normalizedLabel.id]: normalizedLabel,
    },
  }
}

export function removeLabelGroup(
  world: WorldDocument,
  labelGroupId: string,
): WorldDocument {
  const labelGroup = world.labelGroups[labelGroupId]
  if (!labelGroup || labelGroup.builtIn) {
    return world
  }

  const labelGroups = { ...world.labelGroups }
  delete labelGroups[labelGroupId]

  const labels = Object.fromEntries(
    Object.entries(world.labels).map(([labelId, label]) => [
      labelId,
      label.groupId === labelGroupId
        ? { ...label, groupId: BUILT_IN_LABEL_GROUP_IDS.freeLabel }
        : label,
    ]),
  )

  return {
    ...world,
    labelGroups,
    labels,
  }
}

export function removeLabel(
  world: WorldDocument,
  labelId: string,
): WorldDocument {
  if (!world.labels[labelId]) {
    return world
  }

  const labels = { ...world.labels }
  delete labels[labelId]

  return {
    ...world,
    labels,
  }
}

export function updateLabelGroupDefaults(
  world: WorldDocument,
  labelGroupId: string,
  defaults: Partial<LabelStyle>,
): WorldDocument {
  const labelGroup = world.labelGroups[labelGroupId]
  if (!labelGroup) {
    return world
  }

  return upsertLabelGroup(world, {
    ...labelGroup,
    defaults: {
      ...labelGroup.defaults,
      ...defaults,
    },
  })
}

export function updateLabelGroupAssignment(
  world: WorldDocument,
  labelGroupId: string,
  assignment: LabelGroupAssignment | null,
): WorldDocument {
  const labelGroup = world.labelGroups[labelGroupId]
  if (!labelGroup) {
    return world
  }

  return upsertLabelGroup(world, {
    ...labelGroup,
    kind: assignment ? 'assigned' : 'free',
    assignment,
  })
}

export function setLabelStyleOverrides(
  world: WorldDocument,
  labelId: string,
  styleOverrides: Partial<LabelStyle>,
): WorldDocument {
  const label = world.labels[labelId]
  if (!label) {
    return world
  }

  return upsertLabel(world, {
    ...label,
    styleOverrides: {
      ...label.styleOverrides,
      ...styleOverrides,
    },
  })
}

export function restoreLabelStyleOverride(
  world: WorldDocument,
  labelId: string,
  styleKey: keyof LabelStyle,
): WorldDocument {
  const label = world.labels[labelId]
  if (!label || !(styleKey in label.styleOverrides)) {
    return world
  }

  const styleOverrides = { ...label.styleOverrides }
  delete styleOverrides[styleKey]

  return upsertLabel(world, {
    ...label,
    styleOverrides,
  })
}

export function restoreAllLabelStyleOverrides(
  world: WorldDocument,
  labelId: string,
): WorldDocument {
  const label = world.labels[labelId]
  if (!label || Object.keys(label.styleOverrides).length === 0) {
    return world
  }

  return upsertLabel(world, {
    ...label,
    styleOverrides: {},
  })
}

export function nudgeLabelAnchor(
  world: WorldDocument,
  labelId: string,
  deltaX: number,
  deltaY: number,
): WorldDocument {
  const label = world.labels[labelId]
  if (!label) {
    return world
  }

  switch (label.anchor.kind) {
    case 'world':
      return upsertLabel(world, {
        ...label,
        anchor: {
          ...label.anchor,
          x: label.anchor.x + deltaX,
          y: label.anchor.y + deltaY,
        },
      })
    case 'cell':
    case 'city':
    case 'country':
    case 'province': {
      const offsetState = getLabelAnchorOffsetState(world.labelGroups[label.groupId], label.anchor)
      if (!offsetState) {
        return world
      }
      return upsertLabel(world, {
        ...label,
        anchor: {
          ...label.anchor,
          offsetX: offsetState.rawX + deltaX,
          offsetY: offsetState.rawY + deltaY,
          useDefaultOffsetX: deltaX === 0 ? offsetState.usesDefaultX : false,
          useDefaultOffsetY: deltaY === 0 ? offsetState.usesDefaultY : false,
        },
      })
    }
    case 'path':
      return world
  }
}

export function getEffectiveLabelStyle(
  labelGroup: LabelGroup | undefined,
  label: Label | undefined,
): LabelStyle {
  return {
    ...DEFAULT_LABEL_STYLE,
    ...(labelGroup?.defaults ?? {}),
    ...(label?.styleOverrides ?? {}),
  }
}

function resolveCityLabelText(city: City | undefined, labelGroup: LabelGroup | undefined): string {
  if (!city) {
    return ''
  }

  if (labelGroup?.assignment?.sourceNameMode === 'secondary') {
    return city.secondName?.trim() || city.name
  }

  return city.name
}

function resolveCountryLabelText(
  country: Country | undefined,
  labelGroup: LabelGroup | undefined,
): string {
  if (!country) {
    return ''
  }

  if (labelGroup?.assignment?.sourceNameMode === 'secondary') {
    return country.secondName?.trim() || country.name
  }

  return country.name
}

function resolveProvinceLabelText(
  province: Province | undefined,
  labelGroup: LabelGroup | undefined,
): string {
  void labelGroup

  if (!province) {
    return ''
  }

  return province.name
}

export function resolveLabelText(
  world: WorldDocument,
  label: Label,
): string {
  if (label.textMode === 'custom') {
    return label.customText
  }

  const labelGroup = world.labelGroups[label.groupId]

  switch (label.source.kind) {
    case 'manual':
      return label.customText
    case 'city':
      return resolveCityLabelText(world.cities[label.source.cityId], labelGroup)
    case 'country':
      return resolveCountryLabelText(world.countries[label.source.countryId], labelGroup)
    case 'province':
      return resolveProvinceLabelText(world.provinces[label.source.provinceId], labelGroup)
  }
}

export function resolveLabelAnchorPosition(
  world: WorldDocument,
  label: Label,
): { x: number; y: number } | null {
  const offsetState = getLabelAnchorOffsetState(world.labelGroups[label.groupId], label.anchor)

  switch (label.anchor.kind) {
    case 'world':
      return { x: label.anchor.x, y: label.anchor.y }
    case 'cell': {
      const anchor = label.anchor
      const cell = world.cells.find((entry) => entry.id === anchor.cellId)
      const effectiveOffsetX = offsetState?.effectiveX ?? anchor.offsetX
      const effectiveOffsetY = offsetState?.effectiveY ?? anchor.offsetY
      return cell
        ? { x: cell.centerX + effectiveOffsetX, y: cell.centerY + effectiveOffsetY }
        : null
    }
    case 'city': {
      const anchor = label.anchor
      const city = world.cities[anchor.cityId]
      if (!city) {
        return null
      }

      const cell = world.cells.find((entry) => entry.id === city.cellId)
      const effectiveOffsetX = offsetState?.effectiveX ?? anchor.offsetX
      const effectiveOffsetY = offsetState?.effectiveY ?? anchor.offsetY
      return cell
        ? { x: cell.centerX + effectiveOffsetX, y: cell.centerY + effectiveOffsetY }
        : null
    }
    case 'country': {
      const anchor = label.anchor
      const countryCenter = getCountryLabelAnchorPoint(world, anchor.countryId)
      const effectiveOffsetX = offsetState?.effectiveX ?? anchor.offsetX
      const effectiveOffsetY = offsetState?.effectiveY ?? anchor.offsetY
      return countryCenter
        ? { x: countryCenter.x + effectiveOffsetX, y: countryCenter.y + effectiveOffsetY }
        : null
    }
    case 'province': {
      const anchor = label.anchor
      const provinceCenter = getProvinceLabelAnchorPoint(world, anchor.provinceId)
      const effectiveOffsetX = offsetState?.effectiveX ?? anchor.offsetX
      const effectiveOffsetY = offsetState?.effectiveY ?? anchor.offsetY
      return provinceCenter
        ? { x: provinceCenter.x + effectiveOffsetX, y: provinceCenter.y + effectiveOffsetY }
        : null
    }
    case 'path':
      return null
  }
}

export function getCountryLabelAnchorPoint(
  world: WorldDocument,
  countryId: string,
): { x: number; y: number } | null {
  let totalX = 0
  let totalY = 0
  let count = 0

  for (const cell of world.cells) {
    if (world.countryAssignments[cell.id] !== countryId) {
      continue
    }

    totalX += cell.centerX
    totalY += cell.centerY
    count += 1
  }

  if (count === 0) {
    return null
  }

  return {
    x: totalX / count,
    y: totalY / count,
  }
}

export function getProvinceLabelAnchorPoint(
  world: WorldDocument,
  provinceId: string,
): { x: number; y: number } | null {
  let totalX = 0
  let totalY = 0
  let count = 0

  for (const cell of world.cells) {
    if (world.provinceAssignments[cell.id] !== provinceId) {
      continue
    }

    totalX += cell.centerX
    totalY += cell.centerY
    count += 1
  }

  if (count === 0) {
    return null
  }

  return {
    x: totalX / count,
    y: totalY / count,
  }
}

export function getSortedLabelGroups(labelGroups: Record<string, LabelGroup>) {
  return [...Object.values(labelGroups)].sort((left, right) => left.order - right.order)
}

export function getSortedProvinces(provinces: Record<string, Province>) {
  return [...Object.values(provinces)].sort((left, right) => left.name.localeCompare(right.name))
}

export function getProvinceCellCount(world: WorldDocument, provinceId: string) {
  return Object.values(world.provinceAssignments).filter(
    (assignedProvinceId) => assignedProvinceId === provinceId,
  ).length
}

export function findProvinceForCity(world: WorldDocument, cityId: string): Province | null {
  const city = world.cities[cityId]
  if (!city) {
    return null
  }

  const provinceId = world.provinceAssignments[city.cellId]
  return provinceId ? world.provinces[provinceId] ?? null : null
}

export function getProvinceCities(world: WorldDocument, provinceId: string) {
  return Object.values(world.cities).filter(
    (city) => world.provinceAssignments[city.cellId] === provinceId,
  )
}

export function getProvinceCapital(world: WorldDocument, provinceId: string): City | null {
  const province = world.provinces[provinceId]
  if (!province?.capitalCityId) {
    return null
  }

  return world.cities[province.capitalCityId] ?? null
}

export function removeSubmap(
  world: WorldDocument,
  submapId: string,
): WorldDocument {
  const submaps = { ...world.submaps }
  delete submaps[submapId]

  return {
    ...world,
    submaps,
  }
}

export function clearProvinceTerritory(
  world: WorldDocument,
  provinceId: string,
): WorldDocument {
  if (!world.provinces[provinceId]) {
    return world
  }

  const provinceAssignments = Object.fromEntries(
    Object.entries(world.provinceAssignments).map(([cellId, assignedProvinceId]) => [
      cellId,
      assignedProvinceId === provinceId ? null : assignedProvinceId,
    ]),
  )

  return {
    ...world,
    provinceAssignments,
    provinces: {
      ...world.provinces,
      [provinceId]: {
        ...world.provinces[provinceId],
        capitalCityId: null,
      },
    },
  }
}

export function removeProvince(
  world: WorldDocument,
  provinceId: string,
): WorldDocument {
  if (!world.provinces[provinceId]) {
    return world
  }

  const provinces = { ...world.provinces }
  delete provinces[provinceId]

  const provinceAssignments = Object.fromEntries(
    Object.entries(world.provinceAssignments).map(([cellId, assignedProvinceId]) => [
      cellId,
      assignedProvinceId === provinceId ? null : assignedProvinceId,
    ]),
  )

  return {
    ...world,
    provinces,
    provinceAssignments,
    labels: removeLabelsReferencingProvince(world.labels, provinceId),
  }
}

export function removeCountry(
  world: WorldDocument,
  countryId: string,
): WorldDocument {
  const countries = { ...world.countries }
  delete countries[countryId]

  const countryAssignments = Object.fromEntries(
    Object.entries(world.countryAssignments).map(([cellId, assignedCountryId]) => [
      cellId,
      assignedCountryId === countryId ? null : assignedCountryId,
    ]),
  )

  const cities = Object.fromEntries(
    Object.entries(world.cities).map(([cityId, city]) => {
      if (city.countryId === countryId) {
        return [cityId, { ...city, countryId: null }]
      }
      return [cityId, city]
    }),
  )

  const provinces = Object.fromEntries(
    Object.entries(world.provinces).map(([provinceId, province]) => [
      provinceId,
      province.countryId === countryId
        ? { ...province, countryId: null, capitalCityId: null }
        : province,
    ]),
  )

  const provinceAssignments = Object.fromEntries(
    Object.entries(world.provinceAssignments).map(([cellId, assignedProvinceId]) => {
      if (!assignedProvinceId) {
        return [cellId, null]
      }

      return [cellId, provinces[assignedProvinceId]?.countryId ? assignedProvinceId : null]
    }),
  )

  return {
    ...world,
    countries,
    countryAssignments,
    provinces,
    provinceAssignments,
    cities,
    labels: removeLabelsReferencingCountry(world.labels, countryId),
  }
}

export function clearCountryTerritory(
  world: WorldDocument,
  countryId: string,
): WorldDocument {
  return {
    ...world,
    countryAssignments: Object.fromEntries(
      Object.entries(world.countryAssignments).map(([cellId, assignedCountryId]) => [
        cellId,
        assignedCountryId === countryId ? null : assignedCountryId,
      ]),
    ),
  }
}

export function removeGovernmentType(
  world: WorldDocument,
  governmentTypeId: string,
): WorldDocument {
  const governmentTypes = { ...world.governmentTypes }
  delete governmentTypes[governmentTypeId]

  return {
    ...world,
    governmentTypes,
    countries: Object.fromEntries(
      Object.entries(world.countries).map(([countryId, country]) => [
        countryId,
        country.governmentTypeId === governmentTypeId
          ? { ...country, governmentTypeId: null }
          : country,
      ]),
    ),
  }
}

export function removeCity(
  world: WorldDocument,
  cityId: string,
): WorldDocument {
  const cities = { ...world.cities }
  delete cities[cityId]

  const provinces = Object.fromEntries(
    Object.entries(world.provinces).map(([provinceId, province]) => [
      provinceId,
      province.capitalCityId === cityId ? { ...province, capitalCityId: null } : province,
    ]),
  )

  return {
    ...world,
    cities,
    provinces,
    labels: removeLabelsReferencingCity(world.labels, cityId),
  }
}

export function removeCityLevel(
  world: WorldDocument,
  cityLevelId: string,
): WorldDocument {
  const cityLevels = { ...world.cityLevels }
  delete cityLevels[cityLevelId]

  const fallbackLevelId = 'fallback'
  const cities = Object.fromEntries(
    Object.entries(world.cities).map(([cityId, city]) => {
      if (city.levelId === cityLevelId && world.cityLevels[fallbackLevelId]) {
        return [cityId, { ...city, levelId: fallbackLevelId }]
      }
      return [cityId, city]
    }),
  )

  return {
    ...world,
    cityLevels: normalizeCityLevelOrder(cityLevels),
    cities,
  }
}

export function moveCityLevel(
  world: WorldDocument,
  cityLevelId: string,
  direction: -1 | 1,
): WorldDocument {
  if (cityLevelId === 'fallback') {
    return world
  }

  const sortedLevels = getSortedCityLevels(world.cityLevels)
  const index = sortedLevels.findIndex((level) => level.id === cityLevelId)

  if (index < 0) {
    return world
  }

  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= sortedLevels.length) {
    return world
  }

  const nextLevels = [...sortedLevels]
  const [moved] = nextLevels.splice(index, 1)
  nextLevels.splice(targetIndex, 0, moved)

  return {
    ...world,
    cityLevels: normalizeCityLevelOrder(
      Object.fromEntries(
        nextLevels.map((level, order) => [level.id, { ...level, order }]),
      ),
    ),
  }
}

export function normalizeCityLevelOrder(cityLevels: Record<string, CityLevel>) {
  const nonFallbackLevels = [...Object.values(cityLevels)].filter((level) => level.id !== 'fallback')
  const fallbackLevel = cityLevels['fallback']

  const sortedLevels = nonFallbackLevels.sort((left, right) => left.order - right.order)

  if (fallbackLevel) {
    sortedLevels.push({ ...fallbackLevel, order: 999 })
  }

  return Object.fromEntries(
    sortedLevels.map((level, order) => [level.id, { ...level, order }]),
  )
}

export function getSortedCityLevels(cityLevels: Record<string, CityLevel>) {
  const nonFallbackLevels = [...Object.values(cityLevels)].filter((level) => level.id !== 'fallback')
  const fallbackLevel = cityLevels['fallback']

  const sortedLevels = nonFallbackLevels.sort((left, right) => left.order - right.order)

  if (fallbackLevel) {
    sortedLevels.push({ ...fallbackLevel, order: 999 })
  }

  return sortedLevels
}

export function findExistingUniqueLevelCity(
  world: WorldDocument,
  countryId: string | null,
  levelId: string,
  excludeCityId?: string,
): City | null {
  const level = world.cityLevels[levelId]
  if (!level || !level.uniquePerCountry || countryId === null) {
    return null
  }

  return (
    Object.values(world.cities).find(
      (city) =>
        city.levelId === levelId &&
        city.countryId === countryId &&
        city.id !== excludeCityId,
    ) ?? null
  )
}

export function getCountryCitiesByLevel(
  world: WorldDocument,
  countryId: string | null,
  levelId: string,
): City[] {
  return Object.values(world.cities).filter(
    (city) => city.levelId === levelId && city.countryId === countryId,
  )
}

export function setCellSurface(
  world: WorldDocument,
  cellId: string,
  surface: CellSurfaceState,
): WorldDocument {
  const normalizedSurface = normalizeSurfaceState(surface)
  const nextAssignments =
    normalizedSurface.kind === 'empty'
      ? {
          ...world.countryAssignments,
          [cellId]: null,
        }
      : world.countryAssignments

  const nextProvinceAssignments =
    normalizedSurface.kind !== 'land'
      ? {
          ...world.provinceAssignments,
          [cellId]: null,
        }
      : world.provinceAssignments

  let nextCities = world.cities
  let cityToRemove: City | null = null
  if (normalizedSurface.kind !== 'land') {
    cityToRemove = Object.values(world.cities).find(
      (city) => city.cellId === cellId,
    ) ?? null
    if (cityToRemove) {
      const cities = { ...world.cities }
      delete cities[cityToRemove.id]
      nextCities = cities
    }
  }

  return {
    ...world,
    cellSurfaces: {
      ...world.cellSurfaces,
      [cellId]: normalizedSurface,
    },
    countryAssignments: nextAssignments,
    provinceAssignments: nextProvinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, nextProvinceAssignments),
    cities: nextCities,
    labels:
      normalizedSurface.kind !== 'land' && cityToRemove
        ? removeLabelsReferencingCity(world.labels, cityToRemove.id)
        : world.labels,
  }
}

export function setCellSurfaces(
  world: WorldDocument,
  updates: Array<{ cellId: string; surface: CellSurfaceState }>,
): WorldDocument {
  if (updates.length === 0) {
    return world
  }

  const nextCellSurfaces = { ...world.cellSurfaces }
  const nextAssignments = { ...world.countryAssignments }
  const nextProvinceAssignments = { ...world.provinceAssignments }
  const nextCities = { ...world.cities }
  const nonLandCellIds = new Set<string>()
  let changed = false

  for (const { cellId, surface } of updates) {
    const normalizedSurface = normalizeSurfaceState(surface)

    if (areSurfaceStatesEqual(nextCellSurfaces[cellId], normalizedSurface)) {
      continue
    }

    nextCellSurfaces[cellId] = normalizedSurface
    changed = true

    if (normalizedSurface.kind === 'empty') {
      nextAssignments[cellId] = null
    }

    if (normalizedSurface.kind !== 'land') {
      nonLandCellIds.add(cellId)
      nextProvinceAssignments[cellId] = null
    }
  }

  if (!changed) {
    return world
  }

  if (nonLandCellIds.size > 0) {
    for (const [cityId, city] of Object.entries(nextCities)) {
      if (nonLandCellIds.has(city.cellId)) {
        delete nextCities[cityId]
      }
    }
  }

  return {
    ...world,
    cellSurfaces: nextCellSurfaces,
    countryAssignments: nextAssignments,
    provinceAssignments: nextProvinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, nextProvinceAssignments),
    cities: nextCities,
    labels: removeLabelsReferencingMissingCities(world.labels, nextCities),
  }
}

function removeLabelsReferencingCity(
  labels: Record<string, Label>,
  cityId: string,
) {
  return Object.fromEntries(
    Object.entries(labels).filter(([, label]) => {
      if (label.source.kind === 'city' && label.source.cityId === cityId) {
        return false
      }

      return !(label.anchor.kind === 'city' && label.anchor.cityId === cityId)
    }),
  )
}

function removeLabelsReferencingCountry(
  labels: Record<string, Label>,
  countryId: string,
) {
  return Object.fromEntries(
    Object.entries(labels).filter(([, label]) => {
      if (label.source.kind === 'country' && label.source.countryId === countryId) {
        return false
      }

      return !(label.anchor.kind === 'country' && label.anchor.countryId === countryId)
    }),
  )
}

function removeLabelsReferencingProvince(
  labels: Record<string, Label>,
  provinceId: string,
) {
  return Object.fromEntries(
    Object.entries(labels).filter(([, label]) => {
      if (label.source.kind === 'province' && label.source.provinceId === provinceId) {
        return false
      }

      return !(label.anchor.kind === 'province' && label.anchor.provinceId === provinceId)
    }),
  )
}

function removeLabelsReferencingMissingCities(
  labels: Record<string, Label>,
  cities: Record<string, City>,
) {
  return Object.fromEntries(
    Object.entries(labels).filter(([, label]) => {
      if (label.source.kind === 'city' && !cities[label.source.cityId]) {
        return false
      }

      return !(label.anchor.kind === 'city' && !cities[label.anchor.cityId])
    }),
  )
}

function isCityInProvince(
  world: WorldDocument,
  provinceId: string,
  cityId: string,
) {
  const city = world.cities[cityId]
  if (!city) {
    return false
  }

  return world.provinceAssignments[city.cellId] === provinceId
}

function clearInvalidProvinceCapitals(
  world: WorldDocument,
  provinces: Record<string, Province>,
  provinceAssignments: Record<string, string | null>,
) {
  return Object.fromEntries(
    Object.entries(provinces).map(([provinceId, province]) => {
      if (!province.capitalCityId) {
        return [provinceId, province]
      }

      const city = world.cities[province.capitalCityId]
      if (!city || provinceAssignments[city.cellId] !== provinceId) {
        return [provinceId, { ...province, capitalCityId: null }]
      }

      return [provinceId, province]
    }),
  )
}

function clearProvinceAssignmentsOutsideCountry(
  world: WorldDocument,
  provinceId: string,
) {
  const province = world.provinces[provinceId]
  if (!province) {
    return world
  }

  const provinceAssignments = Object.fromEntries(
    Object.entries(world.provinceAssignments).map(([cellId, assignedProvinceId]) => {
      if (assignedProvinceId !== provinceId) {
        return [cellId, assignedProvinceId]
      }

      return [cellId, world.countryAssignments[cellId] === province.countryId ? provinceId : null]
    }),
  )

  return {
    ...world,
    provinceAssignments,
    provinces: clearInvalidProvinceCapitals(world, world.provinces, provinceAssignments),
  }
}
