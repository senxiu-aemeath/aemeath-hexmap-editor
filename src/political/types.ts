export type PoliticalSubMode = 'country' | 'province' | 'city'
export type CountryToolMode = 'view' | 'paint' | 'erase'
export type ProvinceToolMode = 'view' | 'paint' | 'erase'
export type PoliticalPaintMode = 'radius_0' | 'radius_1' | 'radius_2' | 'radius_3' | 'fill_type' | 'fill_height'
export type CityToolMode = 'view' | 'place_city'
export type CityToolSectionId =
  | 'city_levels'
  | 'city_automation'
  | 'city_management'
export type CountrySortKey = 'name'
export type ProvinceSortKey = 'name' | 'country'
export type CitySortKey = 'name' | 'type' | 'country' | 'province' | 'second_name'
export type CityTypeSortMode =
  | 'type_name_asc'
  | 'type_name_desc'
  | 'type_rank_asc'
  | 'type_rank_desc'
export type CityLevelSortKey = 'name' | 'rank'
export type CityLevelSortDirection = 'asc' | 'desc' | 'none'
export type SortDirection = 'asc' | 'desc'

export interface CountrySectionSnapshot {
  activeCountryId: string | null
  governmentTypeFilter: string
  sortKey: CountrySortKey
  sortDirection: SortDirection
  listExpanded: boolean
}

export interface CityLevelsSectionSnapshot {
  activeCityLevelId: string | null
  sortKey: CityLevelSortKey
  sortDirection: CityLevelSortDirection
  listExpanded: boolean
}

export interface ProvinceSectionSnapshot {
  activeProvinceId: string | null
  countryFilter: string
  sortKey: ProvinceSortKey
  sortDirection: SortDirection
  listExpanded: boolean
}

export interface CityManagementSectionSnapshot {
  activeCityId: string | null
  cityCountryFilter: string
  cityProvinceFilter: string
  cityLevelFilter: string
  citySortKey: CitySortKey
  citySortDirection: SortDirection
  cityTypeSortMode: CityTypeSortMode
  cityBrushLevelId: string | null
  listExpanded: boolean
}

export interface PoliticalWorkspaceSnapshot {
  subMode: PoliticalSubMode
  countrySection: CountrySectionSnapshot
  provinceSection: ProvinceSectionSnapshot
  cityLevelsSection: CityLevelsSectionSnapshot
  cityManagementSection: CityManagementSectionSnapshot
}
