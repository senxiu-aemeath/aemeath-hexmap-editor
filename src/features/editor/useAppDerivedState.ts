import { useMemo } from 'react'
import type { AppMessages } from '../../i18n'
import {
  getSortedLabelGroups,
  resolveLabelText,
  getSortedCityLevels,
  getSortedGovernmentTypes,
  getSortedProvinces,
  findProvinceForCity,
  getProvinceCapital,
  getProvinceCellCount,
  type GovernmentType,
  type LabelGroup,
  type WorldDocument,
} from '../../domain/world'
import {
  getBuiltInGovernmentTypeDisplayName,
  getBuiltInLabelGroupDisplayName,
} from '../labels/displayHelpers'
import {
  describeLabelAnchor,
  describeLabelSource,
} from '../labels/labelHelpers'
import {
  sortCities,
  sortCityLevels,
  sortCountries,
  sortProvinces,
} from '../../utils/appUtilities'
import {
  getTerrainBrushState,
  type TerrainBrushKind,
  type TerrainDisplayMode,
} from '../../components/surface/terrainBrush'
import type { TerrainColorAnchor } from '../../components/TerrainAnchorField'
import type {
  CityLevelSortDirection,
  CityLevelSortKey,
  CitySortKey,
  CityTypeSortMode,
  ProvinceSortKey,
  SortDirection,
} from '../../political/types'
import type { IconRegistryEntry } from '../icons/iconRegistry'
import type { EditorMode } from '../workspace/useEditorMode'

export interface AppDerivedStateParams {
  // world data
  world: WorldDocument
  // ui messages
  ui: AppMessages
  // icon data
  iconRegistryEntries: IconRegistryEntry[]
  iconSourceMap: Record<string, string>
  // terrain brush
  terrainBrushKind: TerrainBrushKind
  terrainBrushElevation: number
  // terrain canvas style inputs
  terrainDisplayMode: TerrainDisplayMode
  terrainLandFillColor: string
  terrainLandAnchors: TerrainColorAnchor[]
  terrainWaterFillColor: string
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
  editorMode: EditorMode
  showEmptySurface: boolean
  showLandEmptyEdges: boolean
  showWaterEmptyEdges: boolean
  // political canvas style inputs
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
  // display preview overrides
  editingGovernmentTypeId: string | null
  governmentTypePreviewColor: string | null
  editingCountryId: string | null
  countryPreviewColor: string | null
  countryPreviewBorderColor: string | null
  countryPreviewProvinceBorderColor: string | null
  editingProvinceId: string | null
  provincePreviewColor: string | null
  // active entity ids
  activeCountryId: string | null
  activeProvinceId: string | null
  activeCityId: string | null
  activeSubmapId: string | null
  activeCityLevelId: string | null
  activeGovernmentTypeId: string | null
  activeLabelId: string | null
  activeManagedLabelGroupId: string | null
  // sort/filter state
  countrySortDirection: SortDirection
  provinceSortKey: ProvinceSortKey
  provinceSortDirection: SortDirection
  citySortKey: CitySortKey
  citySortDirection: SortDirection
  cityTypeSortMode: CityTypeSortMode
  cityLevelSortKey: CityLevelSortKey
  cityLevelSortDirection: CityLevelSortDirection
  countryGovernmentTypeFilter: string
  provinceCountryFilter: string
  cityCountryFilter: string
  cityProvinceFilter: string
  cityLevelFilter: string
  labelGroupFilter: string
  // icon manager filter state
  iconManagerSearch: string
  iconManagerTagFilter: string | null
  iconManagerSortMode: string
  // canvas view state
  canvasViewStates: Record<string, { zoom: number } | undefined>
  // world geometry
  worldCellCount: number
}

export function useAppDerivedState(params: AppDerivedStateParams) {
  const {
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
    worldCellCount,
  } = params

  // ---------- surfaceBrush ----------
  const surfaceBrush = useMemo(
    () => getTerrainBrushState(terrainBrushKind, terrainBrushElevation),
    [terrainBrushElevation, terrainBrushKind],
  )

  // ---------- politicalCanvasStyle ----------
  const politicalCanvasStyle = useMemo(
    () => ({
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
    }),
    [
      countryBorderColor,
      countryBorderOpacity,
      countryBorderWidth,
      countryFillOpacity,
      countrySharedBorderOverridesOwn,
      countrySharedBorderMode,
      provinceBorderColor,
      provinceBorderOpacity,
      provinceBorderWidth,
      provinceBorderOverridesCountryBorder,
      provinceFillOpacity,
    ],
  )

  // ---------- terrainCanvasStyle ----------
  const terrainCanvasStyle = useMemo(
    () => ({
      displayMode: terrainDisplayMode,
      landFillColor: terrainLandFillColor,
      landAnchors: terrainLandAnchors,
      waterFillColor: terrainWaterFillColor,
      waterAnchors: terrainWaterAnchors,
      snowLineElevation: terrainSnowLineElevation,
      snowColor: terrainSnowColor,
      showSnowOverride,
      emptyFillColor: terrainEmptyFillColor,
      landUnknownFillColor: terrainLandUnknownFillColor,
      waterUnknownFillColor: terrainWaterUnknownFillColor,
      waterDarkFillColor: terrainWaterDarkFillColor,
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
      showEmptyCells: editorMode === 'surface' && showEmptySurface,
      showLandEmptyEdges,
      showWaterEmptyEdges,
    }),
    [
      coastEdgeColor,
      coastEdgeWidth,
      terrainDisplayMode,
      editorMode,
      landEdgeColor,
      landEdgeWidth,
      landEmptyEdgeColor,
      landEmptyEdgeWidth,
      showEmptySurface,
      showLandEmptyEdges,
      showWaterEmptyEdges,
      darkWaterEdgeColor,
      darkWaterEdgeWidth,
      snowBoundaryEdgeColor,
      snowBoundaryEdgeWidth,
      snowEdgeColor,
      snowEdgeWidth,
      terrainEmptyFillColor,
      terrainLandFillColor,
      terrainLandAnchors,
      terrainSnowLineElevation,
      terrainSnowColor,
      showSnowOverride,
      terrainLandUnknownFillColor,
      terrainWaterDarkFillColor,
      terrainWaterAnchors,
      terrainWaterFillColor,
      terrainWaterUnknownFillColor,
      waterEdgeColor,
      waterEdgeWidth,
      waterEmptyEdgeColor,
      waterEmptyEdgeWidth,
    ],
  )

  // ---------- displayGovernmentTypesById ----------
  const displayGovernmentTypesById = useMemo(() => {
    const sourceGovernmentTypes =
      editingGovernmentTypeId &&
      governmentTypePreviewColor &&
      world.governmentTypes[editingGovernmentTypeId]
        ? {
            ...world.governmentTypes,
            [editingGovernmentTypeId]: {
              ...world.governmentTypes[editingGovernmentTypeId],
              color: governmentTypePreviewColor,
            },
          }
        : world.governmentTypes

    return Object.fromEntries(
      Object.entries(sourceGovernmentTypes).map(([governmentTypeId, governmentType]) => [
        governmentTypeId,
        {
          ...governmentType,
          name: getBuiltInGovernmentTypeDisplayName(governmentType, ui),
        },
      ]),
    ) as Record<string, GovernmentType>
  }, [editingGovernmentTypeId, governmentTypePreviewColor, ui, world.governmentTypes])

  // ---------- displayCountriesById ----------
  const displayCountriesById = useMemo(() => {
    if (
      !editingCountryId ||
      (!countryPreviewColor && !countryPreviewBorderColor && !countryPreviewProvinceBorderColor) ||
      !world.countries[editingCountryId]
    ) {
      return world.countries
    }

    return {
      ...world.countries,
      [editingCountryId]: {
        ...world.countries[editingCountryId],
        color: countryPreviewColor ?? world.countries[editingCountryId].color,
        borderColor:
          countryPreviewBorderColor ??
          world.countries[editingCountryId].borderColor ??
          world.countries[editingCountryId].color,
        provinceBorderColor:
          countryPreviewProvinceBorderColor ??
          world.countries[editingCountryId].provinceBorderColor ??
          world.countries[editingCountryId].borderColor ??
          world.countries[editingCountryId].color,
      },
    }
  }, [
    countryPreviewBorderColor,
    countryPreviewColor,
    countryPreviewProvinceBorderColor,
    editingCountryId,
    world.countries,
  ])

  // ---------- displayProvincesById ----------
  const displayProvincesById = useMemo(() => {
    if (!editingProvinceId || !provincePreviewColor || !world.provinces[editingProvinceId]) {
      return world.provinces
    }

    return {
      ...world.provinces,
      [editingProvinceId]: {
        ...world.provinces[editingProvinceId],
        color: provincePreviewColor,
      },
    }
  }, [editingProvinceId, provincePreviewColor, world.provinces])

  // ---------- countries, provinces, governmentTypes ----------
  const countries = useMemo(() => Object.values(displayCountriesById), [displayCountriesById])
  const provinces = useMemo(
    () => getSortedProvinces(displayProvincesById),
    [displayProvincesById],
  )
  const governmentTypes = useMemo(
    () => getSortedGovernmentTypes(displayGovernmentTypesById),
    [displayGovernmentTypesById],
  )

  // ---------- submaps ----------
  const submaps = useMemo(
    () => Object.values(world.submaps).sort((left, right) => left.name.localeCompare(right.name)),
    [world.submaps],
  )

  // ---------- cities, cityLevels ----------
  const cities = useMemo(() => Object.values(world.cities), [world.cities])
  const cityLevels = useMemo(() => getSortedCityLevels(world.cityLevels), [world.cityLevels])

  // ---------- iconUsageCountByKey ----------
  const iconUsageCountByKey = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const level of Object.values(world.cityLevels)) {
      counts[level.iconKey] = (counts[level.iconKey] ?? 0) + 1
    }
    for (const country of Object.values(world.countries)) {
      if (!country.iconKey) {
        continue
      }
      counts[country.iconKey] = (counts[country.iconKey] ?? 0) + 1
    }
    return counts
  }, [world.cityLevels, world.countries])

  // ---------- displayLabelGroupsById, labelGroups ----------
  const displayLabelGroupsById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(world.labelGroups).map(([groupId, group]) => [
          groupId,
          {
            ...group,
            name: getBuiltInLabelGroupDisplayName(group, ui),
          },
        ]),
      ) as Record<string, LabelGroup>,
    [ui, world.labelGroups],
  )
  const labelGroups = useMemo(
    () => getSortedLabelGroups(displayLabelGroupsById),
    [displayLabelGroupsById],
  )

  // ---------- iconManagerTags ----------
  const iconManagerTags = useMemo(
    () =>
      Array.from(new Set(iconRegistryEntries.flatMap((entry) => entry.tags))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [iconRegistryEntries],
  )

  // ---------- filteredIconManagerEntries ----------
  const filteredIconManagerEntries = useMemo(() => {
    const normalizedSearch = iconManagerSearch.trim().toLowerCase()
    const filtered = iconRegistryEntries.filter((entry) => {
      const matchesSearch =
        !normalizedSearch ||
        [entry.key, entry.label, entry.tags.join(' '), entry.kind]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      const matchesTag = !iconManagerTagFilter || entry.tags.includes(iconManagerTagFilter)
      return matchesSearch && matchesTag
    })
    return [...filtered].sort((left, right) => {
      if (left.builtIn !== right.builtIn) {
        return left.builtIn ? -1 : 1
      }
      if (iconManagerSortMode === 'upload') {
        if (left.uploadedAt !== right.uploadedAt) {
          return left.uploadedAt - right.uploadedAt
        }
      }
      const labelComparison = left.label.localeCompare(right.label)
      if (labelComparison !== 0) {
        return labelComparison
      }
      return left.key.localeCompare(right.key)
    })
  }, [iconManagerSearch, iconManagerSortMode, iconManagerTagFilter, iconRegistryEntries])

  // ---------- sortedCountries ----------
  const sortedCountries = useMemo(
    () => sortCountries(countries, countrySortDirection),
    [countries, countrySortDirection],
  )

  // ---------- sortedProvinces ----------
  const sortedProvinces = useMemo(
    () => sortProvinces(provinces, displayCountriesById, provinceSortKey, provinceSortDirection),
    [displayCountriesById, provinces, provinceSortDirection, provinceSortKey],
  )

  // ---------- cityProvinceNameById, cityProvinceIdById ----------
  const cityProvinceNameById = useMemo(
    () =>
      Object.fromEntries(
        cities.map((city) => [city.id, findProvinceForCity(world, city.id)?.name ?? null] as const),
      ),
    [cities, world],
  )
  const cityProvinceIdById = useMemo(
    () =>
      Object.fromEntries(
        cities.map((city) => [city.id, findProvinceForCity(world, city.id)?.id ?? null] as const),
      ),
    [cities, world],
  )

  // ---------- sortedCities ----------
  const sortedCities = useMemo(
    () =>
      sortCities(
        cities,
        world.countries,
        world.cityLevels,
        cityProvinceNameById,
        citySortKey,
        citySortDirection,
        cityTypeSortMode,
      ),
    [
      cities,
      cityProvinceNameById,
      citySortDirection,
      citySortKey,
      cityTypeSortMode,
      world.countries,
      world.cityLevels,
    ],
  )

  // ---------- sortedCityLevels ----------
  const sortedCityLevels = useMemo(
    () => sortCityLevels(cityLevels, cityLevelSortKey, cityLevelSortDirection),
    [cityLevelSortDirection, cityLevelSortKey, cityLevels],
  )

  // ---------- effective filters (derived inline values) ----------
  const effectiveCountryGovernmentTypeFilter =
    countryGovernmentTypeFilter !== 'all' &&
    countryGovernmentTypeFilter !== 'none' &&
    !world.governmentTypes[countryGovernmentTypeFilter]
      ? 'all'
      : countryGovernmentTypeFilter
  const effectiveProvinceCountryFilter =
    provinceCountryFilter !== 'all' &&
    provinceCountryFilter !== 'unassigned' &&
    !world.countries[provinceCountryFilter]
      ? 'all'
      : provinceCountryFilter
  const effectiveCityCountryFilter =
    cityCountryFilter !== 'all' &&
    cityCountryFilter !== 'unassigned' &&
    !world.countries[cityCountryFilter]
      ? 'all'
      : cityCountryFilter
  const effectiveCityProvinceFilter =
    cityProvinceFilter !== 'all' &&
    cityProvinceFilter !== 'none' &&
    !world.provinces[cityProvinceFilter]
      ? 'all'
      : cityProvinceFilter
  const effectiveCityLevelFilter =
    cityLevelFilter !== 'all' && !world.cityLevels[cityLevelFilter] ? 'all' : cityLevelFilter

  // ---------- filteredCountries ----------
  const filteredCountries = useMemo(() => {
    if (effectiveCountryGovernmentTypeFilter === 'all') {
      return sortedCountries
    }
    if (effectiveCountryGovernmentTypeFilter === 'none') {
      return sortedCountries.filter((country) => country.governmentTypeId === null)
    }
    return sortedCountries.filter(
      (country) => country.governmentTypeId === effectiveCountryGovernmentTypeFilter,
    )
  }, [effectiveCountryGovernmentTypeFilter, sortedCountries])

  // ---------- filteredCities ----------
  const filteredCities = useMemo(() => {
    return sortedCities.filter((city) => {
      const matchesCountry =
        effectiveCityCountryFilter === 'all'
          ? true
          : effectiveCityCountryFilter === 'unassigned'
            ? city.countryId === null
            : city.countryId === effectiveCityCountryFilter

      const matchesLevel =
        effectiveCityLevelFilter === 'all' ? true : city.levelId === effectiveCityLevelFilter

      const cityProvinceId = cityProvinceIdById[city.id]
      const matchesProvince =
        effectiveCityProvinceFilter === 'all'
          ? true
          : effectiveCityProvinceFilter === 'none'
            ? cityProvinceId === null
            : cityProvinceId === effectiveCityProvinceFilter

      return matchesCountry && matchesLevel && matchesProvince
    })
  }, [cityProvinceIdById, effectiveCityCountryFilter, effectiveCityLevelFilter, effectiveCityProvinceFilter, sortedCities])

  // ---------- filteredProvinces ----------
  const filteredProvinces = useMemo(() => {
    return sortedProvinces.filter((province) => {
      if (effectiveProvinceCountryFilter === 'all') {
        return true
      }
      if (effectiveProvinceCountryFilter === 'unassigned') {
        return province.countryId === null
      }
      return province.countryId === effectiveProvinceCountryFilter
    })
  }, [effectiveProvinceCountryFilter, sortedProvinces])

  // ---------- active entities (simple lookups) ----------
  const activeCountry = activeCountryId ? displayCountriesById[activeCountryId] ?? null : null
  const activeProvince = activeProvinceId ? displayProvincesById[activeProvinceId] ?? null : null
  const activeCity = activeCityId ? world.cities[activeCityId] ?? null : null
  const activeSubmap = activeSubmapId ? world.submaps[activeSubmapId] ?? null : null

  // ---------- displayWorldMetadata ----------
  const displayWorldMetadata = useMemo(() => {
    if (!activeSubmap) {
      return world.metadata
    }

    const effectiveSubmapStyle =
      activeSubmap.useDefaultStyle === false
        ? {
            pageMarginTop: activeSubmap.pageMarginTop ?? world.submapStyle.pageMarginTop,
            titleFontSize: activeSubmap.titleFontSize ?? world.submapStyle.titleFontSize,
            subtitleFontSize: activeSubmap.subtitleFontSize ?? world.submapStyle.subtitleFontSize,
            bylineFontSize: activeSubmap.bylineFontSize ?? world.submapStyle.bylineFontSize,
            titleSubtitleGap:
              activeSubmap.titleSubtitleGap ?? world.submapStyle.titleSubtitleGap,
            subtitleBylineGap:
              activeSubmap.subtitleBylineGap ?? world.submapStyle.subtitleBylineGap,
          }
        : {
            pageMarginTop: world.submapStyle.pageMarginTop,
            titleFontSize: world.submapStyle.titleFontSize,
            subtitleFontSize: world.submapStyle.subtitleFontSize,
            bylineFontSize: world.submapStyle.bylineFontSize,
            titleSubtitleGap: world.submapStyle.titleSubtitleGap,
            subtitleBylineGap: world.submapStyle.subtitleBylineGap,
          }

    return {
      ...world.metadata,
      title:
        activeSubmap.useWorldTitlePrefix === false
          ? activeSubmap.name
          : world.metadata.title.trim()
            ? `${world.metadata.title}-${activeSubmap.name}`
            : activeSubmap.name,
      subtitle: activeSubmap.subtitle ?? world.metadata.subtitle,
      pageMarginTop: effectiveSubmapStyle.pageMarginTop,
      titleFontSize: effectiveSubmapStyle.titleFontSize,
      subtitleFontSize: effectiveSubmapStyle.subtitleFontSize,
      bylineFontSize: effectiveSubmapStyle.bylineFontSize,
      titleSubtitleGap: effectiveSubmapStyle.titleSubtitleGap,
      subtitleBylineGap: effectiveSubmapStyle.subtitleBylineGap,
    }
  }, [activeSubmap, world.metadata, world.submapStyle])

  // ---------- displayWorldFrame ----------
  const displayWorldFrame = useMemo(() => {
    if (!activeSubmap) {
      return world.frame
    }

    return {
      ...world.frame,
      top:
        activeSubmap.useDefaultStyle === false
          ? activeSubmap.frameTop ?? world.submapStyle.frameTop
          : world.submapStyle.frameTop,
      right:
        activeSubmap.useDefaultStyle === false
          ? activeSubmap.frameRight ?? world.submapStyle.frameRight
          : world.submapStyle.frameRight,
      bottom:
        activeSubmap.useDefaultStyle === false
          ? activeSubmap.frameBottom ?? world.submapStyle.frameBottom
          : world.submapStyle.frameBottom,
      left:
        activeSubmap.useDefaultStyle === false
          ? activeSubmap.frameLeft ?? world.submapStyle.frameLeft
          : world.submapStyle.frameLeft,
      color:
        activeSubmap.useDefaultStyle === false
          ? activeSubmap.frameColor ?? world.submapStyle.frameColor
          : world.submapStyle.frameColor,
    }
  }, [activeSubmap, world.frame, world.submapStyle])

  // ---------- activeCanvasViewKey, activeCanvasZoom ----------
  const activeCanvasViewKey = activeSubmapId ?? '__all__'
  const activeCanvasZoom = canvasViewStates[activeCanvasViewKey]?.zoom ?? 1

  // ---------- activeSubmapCellIdSet ----------
  const activeSubmapCellIdSet = useMemo(
    () => (activeSubmap ? new Set(activeSubmap.cellIds) : null),
    [activeSubmap],
  )

  // ---------- activeCityLevel ----------
  const activeCityLevel =
    activeCityLevelId ? world.cityLevels[activeCityLevelId] ?? null : null

  // ---------- activeCityLevelUsageCount ----------
  const activeCityLevelUsageCount = useMemo(
    () => cities.filter((city) => city.levelId === activeCityLevelId).length,
    [activeCityLevelId, cities],
  )

  // ---------- activeGovernmentTypeUsageCount ----------
  const activeGovernmentTypeUsageCount = useMemo(() => {
    if (!activeGovernmentTypeId) {
      return 0
    }

    return countries.filter((country) => country.governmentTypeId === activeGovernmentTypeId).length
  }, [activeGovernmentTypeId, countries])

  // ---------- activeCountryAssignmentCount ----------
  const activeCountryAssignmentCount = useMemo(() => {
    if (!activeCountryId) {
      return 0
    }

    return Object.values(world.countryAssignments).filter(
      (countryId) => countryId === activeCountryId,
    ).length
  }, [activeCountryId, world.countryAssignments])

  // ---------- countryAssignmentCountById ----------
  const countryAssignmentCountById = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const countryId of Object.values(world.countryAssignments)) {
      if (!countryId) {
        continue
      }
      counts[countryId] = (counts[countryId] ?? 0) + 1
    }
    return counts
  }, [world.countryAssignments])

  // ---------- activeProvinceCellCount ----------
  const activeProvinceCellCount = useMemo(
    () => (activeProvinceId ? getProvinceCellCount(world, activeProvinceId) : 0),
    [activeProvinceId, world],
  )

  // ---------- activeCountryProvinceCount ----------
  const activeCountryProvinceCount = useMemo(
    () =>
      activeCountryId
        ? Object.values(world.provinces).filter((province) => province.countryId === activeCountryId).length
        : 0,
    [activeCountryId, world.provinces],
  )

  // ---------- countryProvinceCountById ----------
  const countryProvinceCountById = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const province of Object.values(world.provinces)) {
      if (!province.countryId) {
        continue
      }
      counts[province.countryId] = (counts[province.countryId] ?? 0) + 1
    }
    return counts
  }, [world.provinces])

  // ---------- activeProvinceCapital ----------
  const activeProvinceCapital = useMemo(
    () => (activeProvinceId ? getProvinceCapital(world, activeProvinceId) : null),
    [activeProvinceId, world],
  )

  // ---------- activeCityProvince ----------
  const activeCityProvince = useMemo(
    () => (activeCityId ? findProvinceForCity(world, activeCityId) : null),
    [activeCityId, world],
  )

  // ---------- cityByCellId ----------
  const cityByCellId = useMemo(
    () => new Map(cities.map((city) => [city.cellId, city] as const)),
    [cities],
  )

  // ---------- visibleCellCount ----------
  const visibleCellCount = activeSubmap ? activeSubmap.cellIds.length : worldCellCount

  // ---------- activeLabel, activeLabelGroup, activeManagedLabelGroup, activeLabelText ----------
  const activeLabel = activeLabelId ? world.labels[activeLabelId] ?? null : null
  const activeLabelGroup = activeLabel
    ? displayLabelGroupsById[activeLabel.groupId] ?? null
    : null
  const activeManagedLabelGroup = activeManagedLabelGroupId
    ? displayLabelGroupsById[activeManagedLabelGroupId] ?? null
    : null
  const activeLabelText = activeLabel ? resolveLabelText(world, activeLabel) : ''

  // ---------- sortedLabels ----------
  const sortedLabels = useMemo(
    () =>
      Object.values(world.labels).sort((left, right) => {
        const leftGroup = world.labelGroups[left.groupId]?.order ?? Number.MAX_SAFE_INTEGER
        const rightGroup = world.labelGroups[right.groupId]?.order ?? Number.MAX_SAFE_INTEGER
        if (leftGroup !== rightGroup) {
          return leftGroup - rightGroup
        }

        const leftText = resolveLabelText(world, left).trim()
        const rightText = resolveLabelText(world, right).trim()
        return leftText.localeCompare(rightText)
      }),
    [world],
  )

  // ---------- filteredLabels ----------
  const filteredLabels = useMemo(
    () =>
      labelGroupFilter === 'all'
        ? sortedLabels
        : sortedLabels.filter((label) => label.groupId === labelGroupFilter),
    [labelGroupFilter, sortedLabels],
  )

  // ---------- splitFilteredLabels ----------
  const splitFilteredLabels = useMemo(
    () => ({
      text: filteredLabels.filter((label) => label.renderKind !== 'country-icon'),
      icons: filteredLabels.filter((label) => label.renderKind === 'country-icon'),
    }),
    [filteredLabels],
  )

  // ---------- expandedLabelRows ----------
  const expandedLabelRows = useMemo(
    () =>
      sortedLabels.map((label) => {
        const sourceText = describeLabelSource(label)
        const anchorText = describeLabelAnchor(label.anchor)
        const primaryText =
          label.renderKind === 'country-icon'
            ? (() => {
                if (label.source.kind !== 'country') return ui.label.countryIcon
                return world.countries[label.source.countryId]?.name ?? ui.label.countryIcon
              })()
            : resolveLabelText(world, label).trim() || ui.common.empty
        const iconSrc =
          label.renderKind === 'country-icon' && label.source.kind === 'country'
            ? iconSourceMap[world.countries[label.source.countryId]?.iconKey ?? ''] ?? null
            : null

        return {
          id: label.id,
          renderKind: label.renderKind,
          primaryText,
          groupName: displayLabelGroupsById[label.groupId]?.name ?? label.groupId,
          sourceText,
          anchorText,
          visible: label.visible,
          locked: label.locked,
          iconSrc,
          iconAlt: primaryText,
        } as const
      }),
    [displayLabelGroupsById, iconSourceMap, sortedLabels, ui.common.empty, ui.label.countryIcon, world],
  )

  // ---------- labelCountByGroupId ----------
  const labelCountByGroupId = useMemo(() => {
    const counts: Record<string, number> = {}
    sortedLabels.forEach((label) => {
      counts[label.groupId] = (counts[label.groupId] ?? 0) + 1
    })
    return counts
  }, [sortedLabels])

  // ---------- countryAssignedLabelGroups, cityAssignedLabelGroups, provinceAssignedLabelGroups ----------
  const countryAssignedLabelGroups = useMemo(
    () =>
      labelGroups.filter(
        (group) => group.kind === 'assigned' && group.assignment?.kind === 'country',
      ),
    [labelGroups],
  )
  const cityAssignedLabelGroups = useMemo(
    () =>
      labelGroups.filter(
        (group) => group.kind === 'assigned' && group.assignment?.kind === 'city',
      ),
    [labelGroups],
  )
  const provinceAssignedLabelGroups = useMemo(
    () =>
      labelGroups.filter(
        (group) => group.kind === 'assigned' && group.assignment?.kind === 'province',
      ),
    [labelGroups],
  )

  // ---------- canPaintCountries, canPaintProvinces, defaultPaintCountryId, defaultPaintProvinceId ----------
  const paintableCountries = sortedCountries
  const canPaintCountries = paintableCountries.length > 0
  const canPaintProvinces = Boolean(activeProvince)
  const defaultPaintCountryId = activeCountryId ?? sortedCountries[0]?.id ?? null
  const defaultPaintProvinceId = activeProvinceId ?? sortedProvinces[0]?.id ?? null

  return {
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
    activeSubmap,
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
    sortedLabels,
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
  }
}
