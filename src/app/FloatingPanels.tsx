import type { ComponentProps } from 'react'
import { ExpandedTablePanels } from '../components/ExpandedTablePanels'
import { IconManagerShell } from '../components/IconManagerShell'
import { LocalFontLookupPanel } from '../components/LocalFontLookupPanel'
import type { LocalFontLookupEntry } from '../features/workspace/useUiPreferences'

type ExpandedTablePanelsProps = ComponentProps<typeof ExpandedTablePanels>
type IconManagerShellProps = ComponentProps<typeof IconManagerShell>

interface FloatingPanelsProps extends ExpandedTablePanelsProps {
  // LocalFontLookupPanel props (only rendered when expandedTableId === 'fonts')
  localFontLookupStatus: 'idle' | 'loading' | 'ready' | 'unsupported' | 'blocked' | 'error'
  filteredLocalFontLookupEntries: LocalFontLookupEntry[]
  localFontLookupEntryCount: number
  localFontLookupFilter: string
  localFontLookupStatusText: string
  localFontCopyError: string | null
  recentlyCopiedFontFamily: string | null
  onLocalFontClose: () => void
  onLocalFontQuery: () => void
  onLocalFontRescan: () => void
  onLocalFontFilterChange: (value: string) => void
  onLocalFontCopy: (fontFamily: string) => void

  // IconManagerShell props (only rendered when expandedTableId === 'icons')
  iconManagerWidth: IconManagerShellProps['width']
  iconManagerHeight: IconManagerShellProps['height']
  onIconManagerClose: () => void
  onIconManagerResizeWidthStart: () => void
  onIconManagerResizeHeightStart: () => void
  iconManagerEntries: IconManagerShellProps['entries']
  selectedIconManagerKey: IconManagerShellProps['selectedIconKey']
  iconUsageCountByKey: IconManagerShellProps['usageCountByKey']
  iconManagerSearch: IconManagerShellProps['searchValue']
  iconManagerTagFilter: IconManagerShellProps['activeTag']
  iconManagerSortMode: IconManagerShellProps['sortMode']
  iconManagerTags: IconManagerShellProps['availableTags']
  onIconManagerSearchChange: IconManagerShellProps['onSearchChange']
  onIconManagerSelectTag: IconManagerShellProps['onSelectTag']
  onIconManagerChangeSortMode: IconManagerShellProps['onChangeSortMode']
  onIconManagerSelectIcon: IconManagerShellProps['onSelectIcon']
  onIconManagerUpload: () => void
  onIconManagerRenameKey: IconManagerShellProps['onRenameKey']
  onIconManagerUpdateLabel: IconManagerShellProps['onUpdateLabel']
  onIconManagerUpdateTags: IconManagerShellProps['onUpdateTags']
  onIconManagerRestoreBuiltIn: IconManagerShellProps['onRestoreBuiltIn']
  onIconManagerRevert: IconManagerShellProps['onRevert']
  onIconManagerRemove: IconManagerShellProps['onRemove']
}

export function FloatingPanels({
  // ExpandedTablePanels props (spread)
  expandedTableId,
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
  // LocalFontLookupPanel props
  localFontLookupStatus,
  filteredLocalFontLookupEntries,
  localFontLookupEntryCount,
  localFontLookupFilter,
  localFontLookupStatusText,
  localFontCopyError,
  recentlyCopiedFontFamily,
  onLocalFontClose,
  onLocalFontQuery,
  onLocalFontRescan,
  onLocalFontFilterChange,
  onLocalFontCopy,
  // IconManagerShell props
  iconManagerWidth,
  iconManagerHeight,
  onIconManagerClose,
  onIconManagerResizeWidthStart,
  onIconManagerResizeHeightStart,
  iconManagerEntries,
  selectedIconManagerKey,
  iconUsageCountByKey,
  iconManagerSearch,
  iconManagerTagFilter,
  iconManagerSortMode,
  iconManagerTags,
  onIconManagerSearchChange,
  onIconManagerSelectTag,
  onIconManagerChangeSortMode,
  onIconManagerSelectIcon,
  onIconManagerUpload,
  onIconManagerRenameKey,
  onIconManagerUpdateLabel,
  onIconManagerUpdateTags,
  onIconManagerRestoreBuiltIn,
  onIconManagerRevert,
  onIconManagerRemove,
}: FloatingPanelsProps) {
  return (
    <>
      <ExpandedTablePanels
        expandedTableId={expandedTableId}
        floatingTableWidth={floatingTableWidth}
        onResizeStart={onResizeStart}
        onCloseExpandedTable={onCloseExpandedTable}
        filteredCities={filteredCities}
        totalCitiesCount={totalCitiesCount}
        cityProvinceNameById={cityProvinceNameById}
        cityProvinceIdById={cityProvinceIdById}
        cityColumnOrder={cityColumnOrder}
        setCityColumnOrder={setCityColumnOrder}
        cityCompactColumns={cityCompactColumns}
        setCityCompactColumns={setCityCompactColumns}
        effectiveCityCountryFilter={effectiveCityCountryFilter}
        effectiveCityProvinceFilter={effectiveCityProvinceFilter}
        effectiveCityLevelFilter={effectiveCityLevelFilter}
        citySortKey={citySortKey}
        citySortDirection={citySortDirection}
        cityTypeSortMode={cityTypeSortMode}
        expandedCitiesSearch={expandedCitiesSearch}
        setExpandedCitiesSearch={setExpandedCitiesSearch}
        setCityCountryFilter={setCityCountryFilter}
        setCityProvinceFilter={setCityProvinceFilter}
        setCityLevelFilter={setCityLevelFilter}
        onCitySortChange={onCitySortChange}
        onSelectCity={onSelectCity}
        onEditCity={onEditCity}
        filteredCountries={filteredCountries}
        totalCountriesCount={totalCountriesCount}
        governmentTypesById={governmentTypesById}
        effectiveCountryGovernmentTypeFilter={effectiveCountryGovernmentTypeFilter}
        countryAssignmentCountById={countryAssignmentCountById}
        countryProvinceCountById={countryProvinceCountById}
        countrySortKey={countrySortKey}
        countrySortDirection={countrySortDirection}
        expandedCountriesSearch={expandedCountriesSearch}
        setExpandedCountriesSearch={setExpandedCountriesSearch}
        countryColumnOrder={countryColumnOrder}
        setCountryColumnOrder={setCountryColumnOrder}
        countryCompactColumns={countryCompactColumns}
        setCountryCompactColumns={setCountryCompactColumns}
        setCountryGovernmentTypeFilter={setCountryGovernmentTypeFilter}
        onCountrySortChange={onCountrySortChange}
        onSelectCountry={onSelectCountry}
        onEditCountry={onEditCountry}
        filteredProvinces={filteredProvinces}
        totalProvincesCount={totalProvincesCount}
        displayCountriesById={displayCountriesById}
        provinceSortKey={provinceSortKey}
        provinceSortDirection={provinceSortDirection}
        effectiveProvinceCountryFilter={effectiveProvinceCountryFilter}
        expandedProvincesSearch={expandedProvincesSearch}
        setExpandedProvincesSearch={setExpandedProvincesSearch}
        provinceColumnOrder={provinceColumnOrder}
        setProvinceColumnOrder={setProvinceColumnOrder}
        provinceCompactColumns={provinceCompactColumns}
        setProvinceCompactColumns={setProvinceCompactColumns}
        setProvinceCountryFilter={setProvinceCountryFilter}
        onProvinceSortChange={onProvinceSortChange}
        onSelectProvince={onSelectProvince}
        onEditProvince={onEditProvince}
        labelGroups={labelGroups}
        labelCountByGroupId={labelCountByGroupId}
        expandedLabelGroupsSearch={expandedLabelGroupsSearch}
        setExpandedLabelGroupsSearch={setExpandedLabelGroupsSearch}
        labelGroupColumnOrder={labelGroupColumnOrder}
        setLabelGroupColumnOrder={setLabelGroupColumnOrder}
        labelGroupCompactColumns={labelGroupCompactColumns}
        setLabelGroupCompactColumns={setLabelGroupCompactColumns}
        onSelectLabelGroup={onSelectLabelGroup}
        onEditLabelGroup={onEditLabelGroup}
        expandedLabelRows={expandedLabelRows}
        displayLabelGroupsById={displayLabelGroupsById}
        labelGroupFilter={labelGroupFilter}
        setLabelGroupFilter={setLabelGroupFilter}
        expandedLabelsSearch={expandedLabelsSearch}
        setExpandedLabelsSearch={setExpandedLabelsSearch}
        onSelectLabel={onSelectLabel}
        onEditLabel={onEditLabel}
      />
      {expandedTableId === 'fonts' && (
        <LocalFontLookupPanel
          status={localFontLookupStatus}
          entries={filteredLocalFontLookupEntries}
          totalEntryCount={localFontLookupEntryCount}
          filter={localFontLookupFilter}
          statusText={localFontLookupStatusText}
          copyError={localFontCopyError}
          recentlyCopiedFontFamily={recentlyCopiedFontFamily}
          onClose={onLocalFontClose}
          onQuery={onLocalFontQuery}
          onRescan={onLocalFontRescan}
          onFilterChange={onLocalFontFilterChange}
          onCopy={onLocalFontCopy}
        />
      )}
      {expandedTableId === 'icons' && (
        <IconManagerShell
          width={iconManagerWidth}
          height={iconManagerHeight}
          onClose={onIconManagerClose}
          onResizeWidthStart={onIconManagerResizeWidthStart}
          onResizeHeightStart={onIconManagerResizeHeightStart}
          entries={iconManagerEntries}
          selectedIconKey={selectedIconManagerKey}
          usageCountByKey={iconUsageCountByKey}
          searchValue={iconManagerSearch}
          activeTag={iconManagerTagFilter}
          sortMode={iconManagerSortMode}
          availableTags={iconManagerTags}
          onSearchChange={onIconManagerSearchChange}
          onSelectTag={onIconManagerSelectTag}
          onChangeSortMode={onIconManagerChangeSortMode}
          onSelectIcon={onIconManagerSelectIcon}
          onUpload={onIconManagerUpload}
          onRenameKey={onIconManagerRenameKey}
          onUpdateLabel={onIconManagerUpdateLabel}
          onUpdateTags={onIconManagerUpdateTags}
          onRestoreBuiltIn={onIconManagerRestoreBuiltIn}
          onRevert={onIconManagerRevert}
          onRemove={onIconManagerRemove}
        />
      )}
    </>
  )
}
