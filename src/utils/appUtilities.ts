import type { City, CityLevel, Country, Province } from '../domain/world'
import type {
  CityLevelSortDirection,
  CityLevelSortKey,
  CitySortKey,
  CityTypeSortMode,
  ProvinceSortKey,
  SortDirection,
} from '../political/types'

const SIDEBAR_NAME_SCALE_MIN = 0.6
const SIDEBAR_NAME_SCALE_MAX = 1.4

export function normalizeSidebarNameScale(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  const normalized = Math.round(value * 100) / 100
  return Math.min(Math.max(normalized, SIDEBAR_NAME_SCALE_MIN), SIDEBAR_NAME_SCALE_MAX)
}

export function sanitizeGridValue(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export function sanitizeFloatValue(
  rawValue: string,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number.parseFloat(rawValue)

  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min
  }

  return Math.min(Math.max(value, min), max)
}

export function sortProvinces(
  provinces: Province[],
  countries: Record<string, Country>,
  sortKey: ProvinceSortKey,
  sortDirection: SortDirection,
) {
  return [...provinces].sort((left, right) => {
    const leftCountry = left.countryId ? countries[left.countryId]?.name ?? '' : ''
    const rightCountry = right.countryId ? countries[right.countryId]?.name ?? '' : ''

    let comparison = 0
    if (sortKey === 'country') {
      comparison = leftCountry.localeCompare(rightCountry)
      if (comparison === 0) {
        comparison = left.name.localeCompare(right.name)
      }
    } else {
      comparison = left.name.localeCompare(right.name)
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })
}

export function sortCities(
  cities: City[],
  countries: Record<string, Country>,
  cityLevels: Record<string, CityLevel>,
  cityProvinceNameById: Record<string, string | null>,
  sortKey: CitySortKey,
  sortDirection: SortDirection,
  cityTypeSortMode: CityTypeSortMode,
) {
  return [...cities].sort((left, right) => {
    const leftCountry = left.countryId ? countries[left.countryId]?.name ?? '' : ''
    const rightCountry = right.countryId ? countries[right.countryId]?.name ?? '' : ''
    const leftLevel = cityLevels[left.levelId]
    const rightLevel = cityLevels[right.levelId]
    const leftType = leftLevel?.name ?? left.levelId
    const rightType = rightLevel?.name ?? right.levelId
    const leftProvince = cityProvinceNameById[left.id] ?? ''
    const rightProvince = cityProvinceNameById[right.id] ?? ''
    const leftSecondName = left.secondName?.trim() ?? ''
    const rightSecondName = right.secondName?.trim() ?? ''

    let comparison = 0

    if (sortKey === 'country') {
      comparison = leftCountry.localeCompare(rightCountry, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    } else if (sortKey === 'province') {
      comparison = leftProvince.localeCompare(rightProvince, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    } else if (sortKey === 'second_name') {
      comparison = leftSecondName.localeCompare(
        rightSecondName,
        ['zh-Hans-CN-u-co-pinyin', 'en'],
        {
          sensitivity: 'base',
          numeric: true,
        },
      )
    } else if (sortKey === 'type') {
      if (cityTypeSortMode === 'type_name_asc' || cityTypeSortMode === 'type_name_desc') {
        comparison = leftType.localeCompare(rightType, ['zh-Hans-CN-u-co-pinyin', 'en'], {
          sensitivity: 'base',
          numeric: true,
        })
        if (cityTypeSortMode === 'type_name_desc') {
          comparison *= -1
        }
      } else {
        comparison = (leftLevel?.rank ?? 0) - (rightLevel?.rank ?? 0)
        if (comparison === 0) {
          comparison = (leftLevel?.order ?? 0) - (rightLevel?.order ?? 0)
        }
        if (cityTypeSortMode === 'type_rank_desc') {
          comparison *= -1
        }
      }
    } else {
      comparison = left.name.localeCompare(right.name, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    }

    if (comparison === 0 && sortKey !== 'name') {
      comparison = left.name.localeCompare(right.name, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    }

    return sortDirection === 'asc' ? comparison : comparison * -1
  })
}

export function sortCityLevels(
  cityLevels: CityLevel[],
  sortKey: CityLevelSortKey,
  sortDirection: CityLevelSortDirection,
) {
  return [...cityLevels].sort((left, right) => {
    const effectiveSortKey = sortDirection === 'none' ? 'rank' : sortKey
    const effectiveSortDirection = sortDirection === 'none' ? 'asc' : sortDirection

    let comparison = 0

    if (effectiveSortKey === 'rank') {
      comparison = left.rank - right.rank
    } else {
      comparison = left.name.localeCompare(right.name, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    }

    if (comparison === 0) {
      comparison = left.name.localeCompare(right.name, ['zh-Hans-CN-u-co-pinyin', 'en'], {
        sensitivity: 'base',
        numeric: true,
      })
    }

    return effectiveSortDirection === 'asc' ? comparison : comparison * -1
  })
}

export function sortCountries(countries: Country[], sortDirection: SortDirection) {
  return [...countries].sort((left, right) => {
    const comparison = left.name.localeCompare(right.name, ['zh-Hans-CN-u-co-pinyin', 'en'], {
      sensitivity: 'base',
      numeric: true,
    })

    return sortDirection === 'asc' ? comparison : comparison * -1
  })
}

export function getNextCityTypeSortMode(current: CityTypeSortMode): CityTypeSortMode {
  const modes: CityTypeSortMode[] = [
    'type_name_asc',
    'type_name_desc',
    'type_rank_asc',
    'type_rank_desc',
  ]
  const index = modes.indexOf(current)
  return modes[(index + 1) % modes.length]
}

export function moveLayer<T>(layers: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= layers.length) {
    return layers
  }

  const next = [...layers]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}
