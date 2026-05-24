import type {
  CityLevelsSectionSnapshot,
  CityLevelSortKey,
  CityLevelSortDirection,
  CityManagementSectionSnapshot,
  ProvinceSectionSnapshot,
  CitySortKey,
  CityTypeSortMode,
  CountrySectionSnapshot,
  CountrySortKey,
  PoliticalSubMode,
  PoliticalWorkspaceSnapshot,
  ProvinceSortKey,
  SortDirection,
} from '../../political/types'

interface CapturePoliticalWorkspaceInput {
  politicalSubMode: PoliticalSubMode
  activeCountryId: string | null
  governmentTypeFilter: string
  countrySortKey: CountrySortKey
  countrySortDirection: SortDirection
  isCountryListExpanded: boolean
  activeCityLevelId: string | null
  activeProvinceId: string | null
  provinceCountryFilter: string
  provinceSortKey: ProvinceSortKey
  provinceSortDirection: SortDirection
  isProvinceListExpanded: boolean
  cityLevelSortKey: CityLevelSortKey
  cityLevelSortDirection: CityLevelSortDirection
  isCityLevelListExpanded: boolean
  activeCityId: string | null
  cityCountryFilter: string
  cityProvinceFilter: string
  cityLevelFilter: string
  citySortKey: CitySortKey
  citySortDirection: SortDirection
  cityTypeSortMode: CityTypeSortMode
  cityBrushLevelId: string | null
  isCityListExpanded: boolean
}

export function createInitialPoliticalWorkspaceSnapshot(): PoliticalWorkspaceSnapshot {
  return {
    subMode: 'country',
    countrySection: {
      activeCountryId: null,
      governmentTypeFilter: 'all',
      sortKey: 'name',
      sortDirection: 'asc',
      listExpanded: false,
    },
    provinceSection: {
      activeProvinceId: null,
      countryFilter: 'all',
      sortKey: 'name',
      sortDirection: 'asc',
      listExpanded: false,
    },
    cityLevelsSection: {
      activeCityLevelId: null,
      sortKey: 'name',
      sortDirection: 'none',
      listExpanded: false,
    },
    cityManagementSection: {
      activeCityId: null,
      cityCountryFilter: 'all',
      cityProvinceFilter: 'all',
      cityLevelFilter: 'all',
      citySortKey: 'name',
      citySortDirection: 'asc',
      cityTypeSortMode: 'type_name_asc',
      cityBrushLevelId: null,
      listExpanded: false,
    },
  }
}

export function capturePoliticalWorkspaceSnapshot(
  input: CapturePoliticalWorkspaceInput,
): PoliticalWorkspaceSnapshot {
  return {
    subMode: input.politicalSubMode,
    countrySection: {
      activeCountryId: input.activeCountryId,
      governmentTypeFilter: input.governmentTypeFilter,
      sortKey: input.countrySortKey,
      sortDirection: input.countrySortDirection,
      listExpanded: input.isCountryListExpanded,
    },
    provinceSection: {
      activeProvinceId: input.activeProvinceId,
      countryFilter: input.provinceCountryFilter,
      sortKey: input.provinceSortKey,
      sortDirection: input.provinceSortDirection,
      listExpanded: input.isProvinceListExpanded,
    },
    cityLevelsSection: {
      activeCityLevelId: input.activeCityLevelId,
      sortKey: input.cityLevelSortKey,
      sortDirection: input.cityLevelSortDirection,
      listExpanded: input.isCityLevelListExpanded,
    },
    cityManagementSection: {
      activeCityId: input.activeCityId,
      cityCountryFilter: input.cityCountryFilter,
      cityProvinceFilter: input.cityProvinceFilter,
      cityLevelFilter: input.cityLevelFilter,
      citySortKey: input.citySortKey,
      citySortDirection: input.citySortDirection,
      cityTypeSortMode: input.cityTypeSortMode,
      cityBrushLevelId: input.cityBrushLevelId,
      listExpanded: input.isCityListExpanded,
    },
  }
}

export function cloneCountrySectionSnapshot(
  snapshot: CountrySectionSnapshot,
): CountrySectionSnapshot {
  return { ...snapshot }
}

export function cloneCityLevelsSectionSnapshot(
  snapshot: CityLevelsSectionSnapshot,
): CityLevelsSectionSnapshot {
  return { ...snapshot }
}

export function cloneProvinceSectionSnapshot(
  snapshot: ProvinceSectionSnapshot,
): ProvinceSectionSnapshot {
  return { ...snapshot }
}

export function cloneCityManagementSectionSnapshot(
  snapshot: CityManagementSectionSnapshot,
): CityManagementSectionSnapshot {
  return { ...snapshot }
}
