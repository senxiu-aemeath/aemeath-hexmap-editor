import type { Dispatch, SetStateAction } from 'react'

import { closeCityEditor, closeCityLevelEditor } from './editors/cityEditorLifecycle'
import type { CityLevel } from '../../domain/world'
import { getSortedCityLevels } from '../../domain/world'
import { getNextCityTypeSortMode } from '../../utils/appUtilities'
import type {
  CityLevelSortKey,
  CitySortKey,
  CityToolMode,
  CityTypeSortMode,
  CountryToolMode,
  CityLevelSortDirection,
  CityToolSectionId,
  CountrySortKey,
  PoliticalSubMode,
  PoliticalPaintMode,
  PoliticalWorkspaceSnapshot,
  ProvinceSortKey,
  ProvinceToolMode,
  SortDirection,
} from '../../political/types'

export function resetCountrySectionState(actions: {
  setBrushRadius: Dispatch<SetStateAction<number>>
  setCountryGovernmentTypeFilter: Dispatch<SetStateAction<string>>
  setCountryToolMode: Dispatch<SetStateAction<'view' | 'paint' | 'erase'>>
  setPoliticalPaintMode: Dispatch<
    SetStateAction<
      'radius_0' | 'radius_1' | 'radius_2' | 'radius_3' | 'fill_type' | 'fill_height'
    >
  >
}) {
  actions.setCountryToolMode('view')
  actions.setPoliticalPaintMode('radius_0')
  actions.setBrushRadius(0)
  actions.setCountryGovernmentTypeFilter('all')
}

export function resetCityLevelSectionState(actions: {
  setActiveCityLevelId: Dispatch<SetStateAction<string | null>>
  setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>
  setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>
  setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>
  setCityLevelDraftName: Dispatch<SetStateAction<string>>
  setCityLevelDraftRank: Dispatch<SetStateAction<number>>
  setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>
  setCityLevelSortDirection: Dispatch<SetStateAction<CityLevelSortDirection>>
  setCityLevelSortKey: Dispatch<SetStateAction<'name' | 'rank'>>
  setEditingCityLevelId: Dispatch<SetStateAction<string | null>>
  setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsCityLevelListExpanded: Dispatch<SetStateAction<boolean>>
}) {
  actions.setActiveCityLevelId(null)
  actions.setIsCityLevelListExpanded(false)
  actions.setCityLevelSortKey('rank')
  actions.setCityLevelSortDirection('asc')
  closeCityLevelEditor(
    actions.setIsCityLevelEditorOpen,
    actions.setEditingCityLevelId,
    actions.setCityLevelDraftName,
    actions.setCityLevelDraftRank,
    actions.setCityLevelDraftIconKey,
    actions.setCityLevelDraftIconScalePercent,
    actions.setCityLevelDraftUniquePerCountry,
    actions.setCityLevelDraftDisplayInCountryInfo,
  )
}

export function resetCityManagementSectionState(actions: {
  setActiveCityId: Dispatch<SetStateAction<string | null>>
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setCityCountryFilter: Dispatch<SetStateAction<string>>
  setCityDraftCountryId: Dispatch<SetStateAction<string>>
  setCityDraftDescription: Dispatch<SetStateAction<string>>
  setCityDraftLevelId: Dispatch<SetStateAction<string>>
  setCityDraftName: Dispatch<SetStateAction<string>>
  setCityDraftSecondName: Dispatch<SetStateAction<string>>
  setCityLevelFilter: Dispatch<SetStateAction<string>>
  setCitySortDirection: Dispatch<SetStateAction<'asc' | 'desc'>>
  setCitySortKey: Dispatch<
    SetStateAction<'name' | 'type' | 'country' | 'province' | 'second_name'>
  >
  setCityToolMode: Dispatch<SetStateAction<'view' | 'place_city'>>
  setCityTypeSortMode: Dispatch<
    SetStateAction<
      'type_name_asc' | 'type_name_desc' | 'type_rank_asc' | 'type_rank_desc'
    >
  >
  setEditingCityId: Dispatch<SetStateAction<string | null>>
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
  setIsCityListExpanded: Dispatch<SetStateAction<boolean>>
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>
}) {
  actions.setCityToolMode('view')
  actions.setActiveCityId(null)
  actions.setIsCityListExpanded(false)
  actions.setCityCountryFilter('all')
  actions.setCityLevelFilter('all')
  actions.setCitySortKey('name')
  actions.setCitySortDirection('asc')
  actions.setCityTypeSortMode('type_name_asc')
  closeCityEditor(
    actions.setIsCityEditorOpen,
    actions.setEditingCityId,
    actions.setPendingCityCellId,
    actions.setCityDraftName,
    actions.setCityDraftSecondName,
    actions.setCityDraftCountryId,
    actions.setCityDraftLevelId,
    actions.setCityDraftDescription,
    actions.setCityAssignedLabelDrafts,
  )
}

export function getNextExpandedCityToolSections(args: {
  cachePoliticalWorkspaceSnapshot: () => void
  current: Record<CityToolSectionId, boolean>
  politicalWorkspaceSnapshot: PoliticalWorkspaceSnapshot
  resetCityLevelSection: () => void
  resetCityManagementSection: () => void
  restoreCityLevelsSectionWorkspace: (
    snapshot: PoliticalWorkspaceSnapshot['cityLevelsSection'],
  ) => void
  restoreCityManagementSectionWorkspace: (
    snapshot: PoliticalWorkspaceSnapshot['cityManagementSection'],
  ) => void
  sectionId: CityToolSectionId
}) {
  const nextExpanded = !args.current[args.sectionId]
  if (!nextExpanded) {
    args.cachePoliticalWorkspaceSnapshot()
    if (args.sectionId === 'city_levels') {
      args.resetCityLevelSection()
    } else if (args.sectionId === 'city_automation') {
      return {
        ...args.current,
        [args.sectionId]: nextExpanded,
      }
    } else {
      args.resetCityManagementSection()
    }
  } else if (args.sectionId === 'city_levels') {
    args.restoreCityLevelsSectionWorkspace(
      args.politicalWorkspaceSnapshot.cityLevelsSection,
    )
  } else if (args.sectionId === 'city_automation') {
    return {
      ...args.current,
      [args.sectionId]: nextExpanded,
    }
  } else {
    args.restoreCityManagementSectionWorkspace(
      args.politicalWorkspaceSnapshot.cityManagementSection,
    )
  }

  return {
    ...args.current,
    [args.sectionId]: nextExpanded,
  }
}

export function handleSetCityToolModeState(args: {
  activeCityLevelId: string | null
  cityLevels: Record<string, CityLevel>
  mode: CityToolMode
  setActiveCityLevelId: Dispatch<SetStateAction<string | null>>
  setCityBrushLevelId: Dispatch<SetStateAction<string | null>>
  setCityToolMode: Dispatch<SetStateAction<CityToolMode>>
}) {
  if (args.mode === 'place_city') {
    let nextLevelId: string | null = null
    args.setCityBrushLevelId((current) => {
      nextLevelId =
        current && args.cityLevels[current]
          ? current
          : args.activeCityLevelId && args.cityLevels[args.activeCityLevelId]
            ? args.activeCityLevelId
            : args.cityLevels.fallback
              ? 'fallback'
              : getSortedCityLevels(args.cityLevels)[0]?.id ?? null
      return nextLevelId
    })
    if (nextLevelId) {
      args.setActiveCityLevelId(nextLevelId)
    }
  }

  args.setCityToolMode(args.mode)
}

export function handleCountrySortChangeState(args: {
  countrySortKey: CountrySortKey
  nextKey: CountrySortKey
  setCountrySortDirection: Dispatch<SetStateAction<SortDirection>>
  setCountrySortKey: Dispatch<SetStateAction<CountrySortKey>>
}) {
  if (args.countrySortKey === args.nextKey) {
    args.setCountrySortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    return
  }

  args.setCountrySortKey(args.nextKey)
  args.setCountrySortDirection('asc')
}

export function handleProvinceSortChangeState(args: {
  nextKey: ProvinceSortKey
  provinceSortKey: ProvinceSortKey
  setProvinceSortDirection: Dispatch<SetStateAction<SortDirection>>
  setProvinceSortKey: Dispatch<SetStateAction<ProvinceSortKey>>
}) {
  if (args.provinceSortKey === args.nextKey) {
    args.setProvinceSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    return
  }

  args.setProvinceSortKey(args.nextKey)
  args.setProvinceSortDirection('asc')
}

export function handleCitySortChangeState(args: {
  citySortKey: CitySortKey
  nextKey: CitySortKey
  setCitySortDirection: Dispatch<SetStateAction<SortDirection>>
  setCitySortKey: Dispatch<SetStateAction<CitySortKey>>
  setCityTypeSortMode: Dispatch<SetStateAction<CityTypeSortMode>>
}) {
  if (args.nextKey === 'type') {
    args.setCitySortKey('type')
    args.setCityTypeSortMode((current) => getNextCityTypeSortMode(current))
    return
  }

  if (args.citySortKey === args.nextKey) {
    args.setCitySortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    return
  }

  args.setCitySortKey(args.nextKey)
  args.setCitySortDirection('asc')
}

export function handleCityLevelSortChangeState(args: {
  cityLevelSortKey: CityLevelSortKey
  nextKey: CityLevelSortKey
  setCityLevelSortDirection: Dispatch<SetStateAction<CityLevelSortDirection>>
  setCityLevelSortKey: Dispatch<SetStateAction<CityLevelSortKey>>
}) {
  if (args.cityLevelSortKey === args.nextKey) {
    args.setCityLevelSortDirection((current) =>
      current === 'none' ? 'asc' : current === 'asc' ? 'desc' : 'none',
    )
    return
  }

  args.setCityLevelSortKey(args.nextKey)
  args.setCityLevelSortDirection('asc')
}

export function cyclePoliticalCountryTargetState(args: {
  activeCountryId: string | null
  delta: number
  politicalSubMode: PoliticalSubMode
  provinceChooserCountryId: string | null
  setActiveCountryId: Dispatch<SetStateAction<string | null>>
  setActiveProvinceId: Dispatch<SetStateAction<string | null>>
  sortedCountries: Array<{ id: string }>
  sortedProvinces: Array<{ id: string; countryId: string | null }>
}) {
  if (args.sortedCountries.length === 0) {
    return
  }
  const currentId =
    args.politicalSubMode === 'country'
      ? args.activeCountryId
      : args.provinceChooserCountryId
  const currentIndex = Math.max(
    0,
    args.sortedCountries.findIndex((country) => country.id === currentId),
  )
  const nextIndex =
    ((currentIndex + args.delta) % args.sortedCountries.length +
      args.sortedCountries.length) %
    args.sortedCountries.length
  const nextCountryId = args.sortedCountries[nextIndex]?.id ?? null
  args.setActiveCountryId(nextCountryId)
  if (args.politicalSubMode === 'province') {
    const nextProvince =
      args.sortedProvinces.find((province) => province.countryId === nextCountryId) ??
      null
    args.setActiveProvinceId(nextProvince?.id ?? null)
  }
}

export function cyclePoliticalProvinceTargetState(args: {
  activeProvinceId: string | null
  delta: number
  provinceChooserProvinces: Array<{ id: string }>
  setActiveProvinceId: Dispatch<SetStateAction<string | null>>
}) {
  if (args.provinceChooserProvinces.length === 0) {
    return
  }
  const currentIndex = Math.max(
    0,
    args.provinceChooserProvinces.findIndex(
      (province) => province.id === args.activeProvinceId,
    ),
  )
  const nextIndex =
    ((currentIndex + args.delta) % args.provinceChooserProvinces.length +
      args.provinceChooserProvinces.length) %
    args.provinceChooserProvinces.length
  args.setActiveProvinceId(args.provinceChooserProvinces[nextIndex]?.id ?? null)
}

export function cyclePoliticalPaintModeState(args: {
  delta: number
  politicalPaintMode: PoliticalPaintMode
  setBrushRadius: Dispatch<SetStateAction<number>>
  setPoliticalPaintMode: Dispatch<SetStateAction<PoliticalPaintMode>>
}) {
  const ids: PoliticalPaintMode[] = [
    'radius_0',
    'radius_1',
    'radius_2',
    'radius_3',
    'fill_type',
    'fill_height',
  ]
  const currentIndex = Math.max(
    0,
    ids.findIndex((mode) => mode === args.politicalPaintMode),
  )
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextMode = ids[nextIndex]
  args.setPoliticalPaintMode(nextMode)
  if (nextMode.startsWith('radius_')) {
    args.setBrushRadius(Number(nextMode.slice(-1)))
  }
}

export function cyclePoliticalToolState(args: {
  cityToolMode: CityToolMode
  countryToolMode: CountryToolMode
  delta: number
  handleSetCityToolMode: (mode: CityToolMode) => void
  politicalSubMode: PoliticalSubMode
  provinceToolMode: ProvinceToolMode
  setCityToolMode: Dispatch<SetStateAction<CityToolMode>>
  setCountryToolMode: Dispatch<SetStateAction<CountryToolMode>>
  setProvinceToolMode: Dispatch<SetStateAction<ProvinceToolMode>>
}) {
  if (args.politicalSubMode === 'city') {
    const ids: CityToolMode[] = ['view', 'place_city']
    const currentIndex = Math.max(
      0,
      ids.findIndex((mode) => mode === args.cityToolMode),
    )
    const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
    const nextMode = ids[nextIndex]
    if (nextMode === 'place_city') {
      args.handleSetCityToolMode(nextMode)
    } else {
      args.setCityToolMode(nextMode)
    }
    return
  }

  const ids: Array<'view' | 'paint' | 'erase'> = ['view', 'paint', 'erase']
  const currentMode =
    args.politicalSubMode === 'country'
      ? args.countryToolMode
      : args.provinceToolMode
  const currentIndex = Math.max(0, ids.findIndex((mode) => mode === currentMode))
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextMode = ids[nextIndex]
  if (args.politicalSubMode === 'country') {
    args.setCountryToolMode(nextMode)
  } else {
    args.setProvinceToolMode(nextMode)
  }
}
