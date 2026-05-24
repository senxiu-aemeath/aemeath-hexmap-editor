import { useState } from 'react'

import type {
  CityLevelSortDirection,
  CityLevelSortKey,
  CitySortKey,
  CityTypeSortMode,
  CountrySortKey,
  ProvinceSortKey,
  SortDirection,
} from '../../political/types'

export function useSortFilterState() {
  // List filters
  const [countryGovernmentTypeFilter, setCountryGovernmentTypeFilter] = useState<string>('all')
  const [provinceCountryFilter, setProvinceCountryFilter] = useState<string>('all')
  const [cityCountryFilter, setCityCountryFilter] = useState<string>('all')
  const [cityProvinceFilter, setCityProvinceFilter] = useState<string>('all')
  const [cityLevelFilter, setCityLevelFilter] = useState<string>('all')

  // Sort state
  const [countrySortKey, setCountrySortKey] = useState<CountrySortKey>('name')
  const [countrySortDirection, setCountrySortDirection] = useState<SortDirection>('asc')
  const [provinceSortKey, setProvinceSortKey] = useState<ProvinceSortKey>('name')
  const [provinceSortDirection, setProvinceSortDirection] = useState<SortDirection>('asc')
  const [citySortKey, setCitySortKey] = useState<CitySortKey>('name')
  const [citySortDirection, setCitySortDirection] = useState<SortDirection>('asc')
  const [cityTypeSortMode, setCityTypeSortMode] = useState<CityTypeSortMode>('type_name_asc')
  const [cityLevelSortKey, setCityLevelSortKey] = useState<CityLevelSortKey>('rank')
  const [cityLevelSortDirection, setCityLevelSortDirection] = useState<CityLevelSortDirection>('asc')

  return {
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
  }
}

export type SortFilterState = ReturnType<typeof useSortFilterState>
