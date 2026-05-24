import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from 'react'
import { getProvinceCellCount, type Country, type LabelGroup } from '../domain/world'
import { useUiMessages } from '../i18n'
import { FloatingTableSidecar } from './FloatingTableSidecar'
import { ExpandedCitiesTable } from './political/ExpandedCitiesTable'
import { ExpandedCountriesTable } from './political/ExpandedCountriesTable'
import { ExpandedIconLabelsTable } from './political/ExpandedIconLabelsTable'
import { ExpandedLabelGroupsTable } from './political/ExpandedLabelGroupsTable'
import { ExpandedProvincesTable } from './political/ExpandedProvincesTable'
import { ExpandedTextLabelsTable } from './political/ExpandedTextLabelsTable'
import { useWorldContext } from '../state/WorldContext'
import { useActiveEntityContext } from '../state/ActiveEntityContext'

type ExpandedFloatingTableId =
  | 'cities'
  | 'countries'
  | 'provinces'
  | 'label-groups'
  | 'text-labels'
  | 'icon-labels'
  | 'fonts'
  | 'icons'
  | null

type CitiesTableProps = ComponentProps<typeof ExpandedCitiesTable>
type CountriesTableProps = ComponentProps<typeof ExpandedCountriesTable>
type ProvincesTableProps = ComponentProps<typeof ExpandedProvincesTable>
type LabelGroupsTableProps = ComponentProps<typeof ExpandedLabelGroupsTable>

interface ExpandedLabelRow {
  id: string
  renderKind: 'text' | 'country-icon'
  primaryText: string
  groupName: string
  sourceText: string
  anchorText: string
  visible: boolean
  locked: boolean
  iconSrc?: string | null
  iconAlt?: string
}

interface ExpandedTablePanelsProps {
  expandedTableId: ExpandedFloatingTableId
  floatingTableWidth: number
  onResizeStart: () => void
  onCloseExpandedTable: () => void

  filteredCities: CitiesTableProps['cities']
  totalCitiesCount: number
  cityProvinceNameById: CitiesTableProps['activeCityProvinceNameById']
  cityProvinceIdById: CitiesTableProps['activeCityProvinceIdById']
  cityColumnOrder: CitiesTableProps['orderedColumnIds']
  setCityColumnOrder: Dispatch<SetStateAction<CitiesTableProps['orderedColumnIds']>>
  cityCompactColumns: CitiesTableProps['compactColumnIds']
  setCityCompactColumns: Dispatch<SetStateAction<CitiesTableProps['compactColumnIds']>>
  effectiveCityCountryFilter: string
  effectiveCityProvinceFilter: string
  effectiveCityLevelFilter: string
  citySortKey: CitiesTableProps['citySortKey']
  citySortDirection: CitiesTableProps['citySortDirection']
  cityTypeSortMode: CitiesTableProps['cityTypeSortMode']
  expandedCitiesSearch: string
  setExpandedCitiesSearch: Dispatch<SetStateAction<string>>
  setCityCountryFilter: Dispatch<SetStateAction<string>>
  setCityProvinceFilter: Dispatch<SetStateAction<string>>
  setCityLevelFilter: Dispatch<SetStateAction<string>>
  onCitySortChange: CitiesTableProps['onChangeSort']
  onSelectCity: (cityId: string) => void
  onEditCity: (cityId: string) => void

  filteredCountries: CountriesTableProps['countries']
  totalCountriesCount: number
  governmentTypesById: CountriesTableProps['governmentTypes']
  effectiveCountryGovernmentTypeFilter: string
  countryAssignmentCountById: CountriesTableProps['assignmentCountById']
  countryProvinceCountById: CountriesTableProps['provinceCountById']
  countrySortKey: CountriesTableProps['countrySortKey']
  countrySortDirection: CountriesTableProps['countrySortDirection']
  expandedCountriesSearch: string
  setExpandedCountriesSearch: Dispatch<SetStateAction<string>>
  countryColumnOrder: CountriesTableProps['orderedColumnIds']
  setCountryColumnOrder: Dispatch<SetStateAction<CountriesTableProps['orderedColumnIds']>>
  countryCompactColumns: CountriesTableProps['compactColumnIds']
  setCountryCompactColumns: Dispatch<SetStateAction<CountriesTableProps['compactColumnIds']>>
  setCountryGovernmentTypeFilter: Dispatch<SetStateAction<string>>
  onCountrySortChange: CountriesTableProps['onChangeSort']
  onSelectCountry: (countryId: string) => void
  onEditCountry: (countryId: string) => void

  filteredProvinces: ProvincesTableProps['provinces']
  totalProvincesCount: number
  displayCountriesById: Record<string, Country>
  provinceSortKey: ProvincesTableProps['provinceSortKey']
  provinceSortDirection: ProvincesTableProps['provinceSortDirection']
  effectiveProvinceCountryFilter: string
  expandedProvincesSearch: string
  setExpandedProvincesSearch: Dispatch<SetStateAction<string>>
  provinceColumnOrder: ProvincesTableProps['orderedColumnIds']
  setProvinceColumnOrder: Dispatch<SetStateAction<ProvincesTableProps['orderedColumnIds']>>
  provinceCompactColumns: ProvincesTableProps['compactColumnIds']
  setProvinceCompactColumns: Dispatch<SetStateAction<ProvincesTableProps['compactColumnIds']>>
  setProvinceCountryFilter: Dispatch<SetStateAction<string>>
  onProvinceSortChange: ProvincesTableProps['onChangeSort']
  onSelectProvince: (provinceId: string) => void
  onEditProvince: (provinceId: string) => void

  labelGroups: LabelGroupsTableProps['labelGroups']
  labelCountByGroupId: LabelGroupsTableProps['labelCountByGroupId']
  expandedLabelGroupsSearch: string
  setExpandedLabelGroupsSearch: Dispatch<SetStateAction<string>>
  labelGroupColumnOrder: LabelGroupsTableProps['orderedColumnIds']
  setLabelGroupColumnOrder: Dispatch<SetStateAction<LabelGroupsTableProps['orderedColumnIds']>>
  labelGroupCompactColumns: LabelGroupsTableProps['compactColumnIds']
  setLabelGroupCompactColumns: Dispatch<SetStateAction<LabelGroupsTableProps['compactColumnIds']>>
  onSelectLabelGroup: (groupId: string) => void
  onEditLabelGroup: (groupId: string) => void

  expandedLabelRows: ExpandedLabelRow[]
  displayLabelGroupsById: Record<string, LabelGroup>
  labelGroupFilter: string
  setLabelGroupFilter: Dispatch<SetStateAction<string>>
  expandedLabelsSearch: string
  setExpandedLabelsSearch: Dispatch<SetStateAction<string>>
  onSelectLabel: (labelId: string) => void
  onEditLabel: (labelId: string) => void
}

function toggleCompactColumn<T extends string>(
  setter: Dispatch<SetStateAction<T[]>>,
  columnId: T,
) {
  setter((current) => {
    const exists = current.includes(columnId)
    if (exists) {
      const next = current.filter((entry) => entry !== columnId)
      return next.length > 0 ? next : current
    }
    return [...current, columnId]
  })
}

function moveOrderedColumn<T extends string>(
  setter: Dispatch<SetStateAction<T[]>>,
  columnId: T,
  direction: 'left' | 'right',
) {
  setter((current) => {
    const index = current.indexOf(columnId)
    if (index === -1) {
      return current
    }
    const nextIndex = direction === 'left' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= current.length) {
      return current
    }
    const next = [...current]
    const [moved] = next.splice(index, 1)
    next.splice(nextIndex, 0, moved)
    return next
  })
}

export function ExpandedTablePanels({ expandedTableId,
  floatingTableWidth,
  onResizeStart,
  onCloseExpandedTable,
  filteredCities,
  totalCitiesCount,
  cityProvinceNameById,
  cityProvinceIdById,
  cityColumnOrder,
  setCityColumnOrder,
  cityCompactColumns,
  setCityCompactColumns,
  effectiveCityCountryFilter,
  effectiveCityProvinceFilter,
  effectiveCityLevelFilter,
  citySortKey,
  citySortDirection,
  cityTypeSortMode,
  expandedCitiesSearch,
  setExpandedCitiesSearch,
  setCityCountryFilter,
  setCityProvinceFilter,
  setCityLevelFilter,
  onCitySortChange,
  onSelectCity,
  onEditCity,
  filteredCountries,
  totalCountriesCount,
  governmentTypesById,
  effectiveCountryGovernmentTypeFilter,
  countryAssignmentCountById,
  countryProvinceCountById,
  countrySortKey,
  countrySortDirection,
  expandedCountriesSearch,
  setExpandedCountriesSearch,
  countryColumnOrder,
  setCountryColumnOrder,
  countryCompactColumns,
  setCountryCompactColumns,
  setCountryGovernmentTypeFilter,
  onCountrySortChange,
  onSelectCountry,
  onEditCountry,
  filteredProvinces,
  totalProvincesCount,
  displayCountriesById,
  provinceSortKey,
  provinceSortDirection,
  effectiveProvinceCountryFilter,
  expandedProvincesSearch,
  setExpandedProvincesSearch,
  provinceColumnOrder,
  setProvinceColumnOrder,
  provinceCompactColumns,
  setProvinceCompactColumns,
  setProvinceCountryFilter,
  onProvinceSortChange,
  onSelectProvince,
  onEditProvince,
  labelGroups,
  labelCountByGroupId,
  expandedLabelGroupsSearch,
  setExpandedLabelGroupsSearch,
  labelGroupColumnOrder,
  setLabelGroupColumnOrder,
  labelGroupCompactColumns,
  setLabelGroupCompactColumns,
  onSelectLabelGroup,
  onEditLabelGroup,
  expandedLabelRows,
  displayLabelGroupsById,
  labelGroupFilter,
  setLabelGroupFilter,
  expandedLabelsSearch,
  setExpandedLabelsSearch,
  onSelectLabel,
  onEditLabel,
}: ExpandedTablePanelsProps) {
  const { world, iconSourceMap } = useWorldContext()
  const { activeManagedLabelGroupId } = useActiveEntityContext()
  const ui = useUiMessages()
  const renderSidecar = (title: string, children: ReactNode) => (
    <FloatingTableSidecar
      title={title}
      width={floatingTableWidth}
      onResizeStart={onResizeStart}
      onClose={onCloseExpandedTable}
      toolbar={null}
    >
      {children}
    </FloatingTableSidecar>
  )

  if (expandedTableId === 'cities') {
    return renderSidecar(
      ui.political.citiesOnMap,
      <ExpandedCitiesTable
        worldCityLevels={world.cityLevels}
        iconSourceMap={iconSourceMap}
        countries={world.countries}
        provinces={world.provinces}
        cities={filteredCities}
        totalCount={totalCitiesCount}
        activeCityProvinceNameById={cityProvinceNameById}
        activeCityProvinceIdById={cityProvinceIdById}
        orderedColumnIds={cityColumnOrder}
        compactColumnIds={cityCompactColumns}
        effectiveCityCountryFilter={effectiveCityCountryFilter}
        effectiveCityProvinceFilter={effectiveCityProvinceFilter}
        effectiveCityLevelFilter={effectiveCityLevelFilter}
        citySortKey={citySortKey}
        citySortDirection={citySortDirection}
        cityTypeSortMode={cityTypeSortMode}
        searchValue={expandedCitiesSearch}
        onSearchChange={setExpandedCitiesSearch}
        onToggleCompactColumn={(columnId) => {
          toggleCompactColumn(setCityCompactColumns, columnId)
        }}
        onMoveColumn={(columnId, direction) => {
          moveOrderedColumn(setCityColumnOrder, columnId, direction)
        }}
        onClearFilters={() => {
          setCityCountryFilter('all')
          setCityProvinceFilter('all')
          setCityLevelFilter('all')
        }}
        onToggleCountryFilter={(countryId) => {
          const nextFilter = countryId ?? 'unassigned'
          setCityCountryFilter((current) => (current === nextFilter ? 'all' : nextFilter))
        }}
        onToggleProvinceFilter={(provinceId) => {
          const nextFilter = provinceId ?? 'none'
          setCityProvinceFilter((current) => (current === nextFilter ? 'all' : nextFilter))
        }}
        onToggleLevelFilter={(levelId) => {
          setCityLevelFilter((current) => (current === levelId ? 'all' : levelId))
        }}
        onChangeSort={onCitySortChange}
        onSelectCity={onSelectCity}
        onEditCity={onEditCity}
      />,
    )
  }

  if (expandedTableId === 'countries') {
    return renderSidecar(
      ui.political.countries,
      <ExpandedCountriesTable
        countries={filteredCountries}
        iconSourceMap={iconSourceMap}
        totalCount={totalCountriesCount}
        governmentTypes={governmentTypesById}
        effectiveGovernmentTypeFilter={effectiveCountryGovernmentTypeFilter}
        assignmentCountById={countryAssignmentCountById}
        provinceCountById={countryProvinceCountById}
        countrySortKey={countrySortKey}
        countrySortDirection={countrySortDirection}
        searchValue={expandedCountriesSearch}
        orderedColumnIds={countryColumnOrder}
        compactColumnIds={countryCompactColumns}
        onSearchChange={setExpandedCountriesSearch}
        onToggleCompactColumn={(columnId) => {
          toggleCompactColumn(setCountryCompactColumns, columnId)
        }}
        onMoveColumn={(columnId, direction) => {
          moveOrderedColumn(setCountryColumnOrder, columnId, direction)
        }}
        onClearFilter={() => {
          setCountryGovernmentTypeFilter('all')
        }}
        onToggleGovernmentTypeFilter={(governmentTypeId) => {
          const nextFilter = governmentTypeId ?? 'none'
          setCountryGovernmentTypeFilter((current) => (current === nextFilter ? 'all' : nextFilter))
        }}
        onChangeSort={onCountrySortChange}
        onSelectCountry={onSelectCountry}
        onEditCountry={onEditCountry}
      />,
    )
  }

  if (expandedTableId === 'provinces') {
    const provinceCellCounts = Object.fromEntries(
      filteredProvinces.map((province) => [province.id, getProvinceCellCount(world, province.id)]),
    )

    return renderSidecar(
      ui.political.provinces,
      <ExpandedProvincesTable
        provinces={filteredProvinces}
        totalCount={totalProvincesCount}
        countries={displayCountriesById}
        cities={world.cities}
        provinceCellCounts={provinceCellCounts}
        provinceSortKey={provinceSortKey}
        provinceSortDirection={provinceSortDirection}
        effectiveCountryFilter={effectiveProvinceCountryFilter}
        searchValue={expandedProvincesSearch}
        orderedColumnIds={provinceColumnOrder}
        compactColumnIds={provinceCompactColumns}
        onSearchChange={setExpandedProvincesSearch}
        onToggleCompactColumn={(columnId) => {
          toggleCompactColumn(setProvinceCompactColumns, columnId)
        }}
        onMoveColumn={(columnId, direction) => {
          moveOrderedColumn(setProvinceColumnOrder, columnId, direction)
        }}
        onClearFilter={() => {
          setProvinceCountryFilter('all')
        }}
        onToggleCountryFilter={(countryId) => {
          const nextFilter = countryId ?? 'unassigned'
          setProvinceCountryFilter((current) => (current === nextFilter ? 'all' : nextFilter))
        }}
        onChangeSort={onProvinceSortChange}
        onSelectProvince={onSelectProvince}
        onEditProvince={onEditProvince}
      />,
    )
  }

  if (expandedTableId === 'label-groups') {
    return renderSidecar(
      ui.label.groups,
      <ExpandedLabelGroupsTable
        labelGroups={labelGroups}
        totalCount={labelGroups.length}
        activeLabelGroupId={activeManagedLabelGroupId}
        labelCountByGroupId={labelCountByGroupId}
        searchValue={expandedLabelGroupsSearch}
        orderedColumnIds={labelGroupColumnOrder}
        compactColumnIds={labelGroupCompactColumns}
        onSearchChange={setExpandedLabelGroupsSearch}
        onToggleCompactColumn={(columnId) => {
          toggleCompactColumn(setLabelGroupCompactColumns, columnId)
        }}
        onMoveColumn={(columnId, direction) => {
          moveOrderedColumn(setLabelGroupColumnOrder, columnId, direction)
        }}
        onSelectLabelGroup={onSelectLabelGroup}
        onEditLabelGroup={onEditLabelGroup}
      />,
    )
  }

  if (expandedTableId === 'text-labels') {
    const rows =
      labelGroupFilter === 'all'
        ? expandedLabelRows.filter((row) => row.renderKind === 'text')
        : expandedLabelRows.filter((row) => {
            const matchingLabel = world.labels[row.id]
            return matchingLabel?.groupId === labelGroupFilter && row.renderKind === 'text'
          })

    const totalCount = Object.values(world.labels).filter((label) => label.renderKind === 'text').length
    const activeGroupLabel =
      labelGroupFilter === 'all'
        ? null
        : displayLabelGroupsById[labelGroupFilter]?.name ?? labelGroupFilter

    return renderSidecar(
      ui.label.textFullTable,
      <ExpandedTextLabelsTable
        rows={rows}
        totalCount={totalCount}
        searchValue={expandedLabelsSearch}
        activeGroupLabel={activeGroupLabel}
        onSearchChange={setExpandedLabelsSearch}
        onClearFilter={() => {
          setLabelGroupFilter('all')
        }}
        onSelectLabel={onSelectLabel}
        onEditLabel={onEditLabel}
      />,
    )
  }

  if (expandedTableId === 'icon-labels') {
    const rows =
      labelGroupFilter === 'all'
        ? expandedLabelRows.filter((row) => row.renderKind === 'country-icon')
        : expandedLabelRows.filter((row) => {
            const matchingLabel = world.labels[row.id]
            return matchingLabel?.groupId === labelGroupFilter && row.renderKind === 'country-icon'
          })

    const totalCount = Object.values(world.labels).filter(
      (label) => label.renderKind === 'country-icon',
    ).length
    const activeGroupLabel =
      labelGroupFilter === 'all'
        ? null
        : displayLabelGroupsById[labelGroupFilter]?.name ?? labelGroupFilter

    return renderSidecar(
      ui.label.iconFullTable,
      <ExpandedIconLabelsTable
        rows={rows}
        totalCount={totalCount}
        searchValue={expandedLabelsSearch}
        activeGroupLabel={activeGroupLabel}
        onSearchChange={setExpandedLabelsSearch}
        onClearFilter={() => {
          setLabelGroupFilter('all')
        }}
        onSelectLabel={onSelectLabel}
        onEditLabel={onEditLabel}
      />,
    )
  }

  return null
}
