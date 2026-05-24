import type { AppMessages } from '../i18n'
import type { CityLevel } from '../domain/world'
import type { CityLevelSortDirection, CityTypeSortMode, SortDirection } from './types'

export function renderSortLabel(
  label: string,
  isActive: boolean,
  direction: SortDirection | CityLevelSortDirection,
) {
  if (!isActive) {
    return label
  }

  if (direction === 'none') {
    return `${label} ·`
  }

  return `${label} ${direction === 'asc' ? '↑' : '↓'}`
}

export function renderCityTypeSortLabel(
  label: string,
  isActive: boolean,
  mode: CityTypeSortMode,
) {
  if (!isActive) {
    return label
  }

  const suffixMap: Record<CityTypeSortMode, string> = {
    type_name_asc: 'A↑',
    type_name_desc: 'A↓',
    type_rank_asc: '#↑',
    type_rank_desc: '#↓',
  }

  return `${label} ${suffixMap[mode]}`
}

export function renderDisclosureIcon(isExpanded: boolean) {
  return isExpanded ? '▾' : '◂'
}

export function getCityLevelName(
  levelId: string,
  cityLevels: Record<string, CityLevel>,
  ui: AppMessages,
) {
  return (
    cityLevels[levelId]?.name ??
    ui.cityLevel[levelId as keyof AppMessages['cityLevel']] ??
    levelId
  )
}

export function getCountryEmblemFallback(name: string) {
  const trimmed = name.trim()
  if (!trimmed) {
    return '?'
  }

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => Array.from(word)[0] ?? '')
      .join('')
      .toUpperCase()
  }

  return Array.from(trimmed.replace(/\s+/g, '')).slice(0, 2).join('').toUpperCase()
}
