import { useState } from 'react'

type CityColumnId = 'type' | 'country' | 'province' | 'second_name'
type CountryColumnId = 'government' | 'city_state' | 'provinces' | 'cells'
type ProvinceColumnId = 'country' | 'capital' | 'cells'
type LabelGroupCompactColumnId = 'kind' | 'count'

const CITY_COLUMN_ORDER_STORAGE_KEY = 'hex-map-editor:city-column-order'
const CITY_COMPACT_COLUMNS_STORAGE_KEY = 'hex-map-editor:city-compact-columns'
const COUNTRY_COLUMN_ORDER_STORAGE_KEY = 'hex-map-editor:country-column-order'
const COUNTRY_COMPACT_COLUMNS_STORAGE_KEY = 'hex-map-editor:country-compact-columns'
const PROVINCE_COLUMN_ORDER_STORAGE_KEY = 'hex-map-editor:province-column-order'
const PROVINCE_COMPACT_COLUMNS_STORAGE_KEY = 'hex-map-editor:province-compact-columns'
const LABEL_GROUP_COLUMN_ORDER_STORAGE_KEY = 'hex-map-editor:label-group-column-order'
const LABEL_GROUP_COMPACT_COLUMNS_STORAGE_KEY = 'hex-map-editor:label-group-compact-columns'

const DEFAULT_CITY_COLUMN_ORDER: CityColumnId[] = ['type', 'country', 'province', 'second_name']
const DEFAULT_CITY_COMPACT_COLUMNS: CityColumnId[] = ['type', 'country']
const DEFAULT_COUNTRY_COLUMN_ORDER: CountryColumnId[] = ['government', 'city_state', 'provinces', 'cells']
const DEFAULT_COUNTRY_COMPACT_COLUMNS: CountryColumnId[] = ['government']
const DEFAULT_PROVINCE_COLUMN_ORDER: ProvinceColumnId[] = ['country', 'capital', 'cells']
const DEFAULT_PROVINCE_COMPACT_COLUMNS: ProvinceColumnId[] = ['country', 'capital']
const DEFAULT_LABEL_GROUP_COLUMN_ORDER: LabelGroupCompactColumnId[] = ['kind', 'count']
const DEFAULT_LABEL_GROUP_COMPACT_COLUMNS: LabelGroupCompactColumnId[] = ['kind', 'count']

function restoreColumnOrder<T extends string>(
  storageKey: string,
  defaults: T[],
): T[] {
  if (typeof window === 'undefined') return defaults
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaults
  try {
    const parsed = JSON.parse(stored)
    const next = Array.isArray(parsed)
      ? parsed.filter((value): value is T =>
          defaults.includes(String(value) as T),
        )
      : []
    const deduped = Array.from(new Set(next))
    const missing = defaults.filter((value) => !deduped.includes(value))
    return deduped.length > 0 ? [...deduped, ...missing] : defaults
  } catch {
    return defaults
  }
}

function restoreCompactColumns<T extends string>(
  storageKey: string,
  defaults: T[],
  validValues: string[],
): T[] {
  if (typeof window === 'undefined') return defaults
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return defaults
  try {
    const parsed = JSON.parse(stored)
    const next = Array.isArray(parsed)
      ? parsed.filter((value): value is T =>
          validValues.includes(String(value)),
        )
      : []
    return next.length > 0 ? next : defaults
  } catch {
    return defaults
  }
}

export function useTableConfig() {
  const [cityColumnOrder, setCityColumnOrder] = useState<CityColumnId[]>(() =>
    restoreColumnOrder(CITY_COLUMN_ORDER_STORAGE_KEY, DEFAULT_CITY_COLUMN_ORDER),
  )
  const [cityCompactColumns, setCityCompactColumns] = useState<CityColumnId[]>(() =>
    restoreCompactColumns(
      CITY_COMPACT_COLUMNS_STORAGE_KEY,
      DEFAULT_CITY_COMPACT_COLUMNS,
      DEFAULT_CITY_COLUMN_ORDER,
    ),
  )
  const [countryColumnOrder, setCountryColumnOrder] = useState<CountryColumnId[]>(() =>
    restoreColumnOrder(COUNTRY_COLUMN_ORDER_STORAGE_KEY, DEFAULT_COUNTRY_COLUMN_ORDER),
  )
  const [countryCompactColumns, setCountryCompactColumns] = useState<CountryColumnId[]>(() =>
    restoreCompactColumns(
      COUNTRY_COMPACT_COLUMNS_STORAGE_KEY,
      DEFAULT_COUNTRY_COMPACT_COLUMNS,
      ['government', 'city_state', 'provinces', 'cells'],
    ),
  )
  const [provinceColumnOrder, setProvinceColumnOrder] = useState<ProvinceColumnId[]>(() =>
    restoreColumnOrder(PROVINCE_COLUMN_ORDER_STORAGE_KEY, DEFAULT_PROVINCE_COLUMN_ORDER),
  )
  const [provinceCompactColumns, setProvinceCompactColumns] = useState<ProvinceColumnId[]>(() =>
    restoreCompactColumns(
      PROVINCE_COMPACT_COLUMNS_STORAGE_KEY,
      DEFAULT_PROVINCE_COMPACT_COLUMNS,
      ['country', 'capital', 'cells'],
    ),
  )
  const [labelGroupColumnOrder, setLabelGroupColumnOrder] = useState<LabelGroupCompactColumnId[]>(() =>
    restoreColumnOrder(LABEL_GROUP_COLUMN_ORDER_STORAGE_KEY, DEFAULT_LABEL_GROUP_COLUMN_ORDER),
  )
  const [labelGroupCompactColumns, setLabelGroupCompactColumns] = useState<LabelGroupCompactColumnId[]>(() =>
    restoreCompactColumns(
      LABEL_GROUP_COMPACT_COLUMNS_STORAGE_KEY,
      DEFAULT_LABEL_GROUP_COMPACT_COLUMNS,
      ['kind', 'count'],
    ),
  )

  return {
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
  }
}

export type TableConfigState = ReturnType<typeof useTableConfig>
export type { CityColumnId, CountryColumnId, ProvinceColumnId, LabelGroupCompactColumnId }
