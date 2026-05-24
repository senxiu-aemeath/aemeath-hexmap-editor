import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import {
  removeCity,
  removeCityLevel,
  type City,
  type CityLevel,
  type WorldDocument,
} from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { CitiesSection } from './CitiesSection'
import { CityAutomationSection } from './CityAutomationSection'
import { CityLevelsSection } from './CityLevelsSection'
import { CityStyleSection } from './CityStyleSection'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type CityLevelsSectionProps = ComponentProps<typeof CityLevelsSection>
type CityAutomationSectionProps = ComponentProps<typeof CityAutomationSection>
type CitiesSectionProps = ComponentProps<typeof CitiesSection>

type OpenSidebarDeleteConfirmation = (
  title: string,
  onConfirm: () => void,
) => void

type OpenCityLevelEditor = (
  cityLevel: CityLevel,
  setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCityLevelId: Dispatch<SetStateAction<string | null>>,
  setCityLevelDraftName: Dispatch<SetStateAction<string>>,
  setCityLevelDraftRank: Dispatch<SetStateAction<number>>,
  setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>,
  setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>,
  setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>,
  setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>,
) => void

type OpenCityEditor = (
  city: City,
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCityId: Dispatch<SetStateAction<string | null>>,
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>,
  setCityDraftName: Dispatch<SetStateAction<string>>,
  setCityDraftSecondName: Dispatch<SetStateAction<string>>,
  setCityDraftCountryId: Dispatch<SetStateAction<string>>,
  setCityDraftLevelId: Dispatch<SetStateAction<string>>,
  setCityDraftDescription: Dispatch<SetStateAction<string>>,
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>,
) => void

interface PoliticalCityModeContainerProps {
  cityStyleSection: {
    isSectionExpanded: boolean
    setIsSectionExpanded: Dispatch<SetStateAction<boolean>>
  }
  cityLevelsSection: {
    isSectionExpanded: boolean
    onToggleSection: () => void
    activeCityLevel: CityLevelsSectionProps['activeCityLevel']
    activeCityLevelUsageCount: number
    iconSourceMap: CityLevelsSectionProps['iconSourceMap']
    isInfoExpanded: boolean
    setIsInfoExpanded: Dispatch<SetStateAction<boolean>>
    sortedCityLevels: CityLevelsSectionProps['sortedCityLevels']
    cityLevelSortKey: CityLevelsSectionProps['cityLevelSortKey']
    cityLevelSortDirection: CityLevelsSectionProps['cityLevelSortDirection']
    isListExpanded: boolean
    setIsListExpanded: Dispatch<SetStateAction<boolean>>
    onChangeSort: CityLevelsSectionProps['onChangeSort']
    onSetCityToolMode: CityLevelsSectionProps['onSetCityToolMode']
    closeObjectEditors: () => void
    defaultIconKey: string
    setIsCityLevelEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingCityLevelId: Dispatch<SetStateAction<string | null>>
    setCityLevelDraftName: Dispatch<SetStateAction<string>>
    setCityLevelDraftRank: Dispatch<SetStateAction<number>>
    setCityLevelDraftIconKey: Dispatch<SetStateAction<string>>
    setCityLevelDraftIconScalePercent: Dispatch<SetStateAction<number>>
    setCityLevelDraftUniquePerCountry: Dispatch<SetStateAction<boolean>>
    setCityLevelDraftDisplayInCountryInfo: Dispatch<SetStateAction<boolean>>
    openSidebarDeleteConfirmation: OpenSidebarDeleteConfirmation
    setWorld: Dispatch<SetStateAction<WorldDocument>>
  }
  cityAutomationSection: {
    isSectionExpanded: boolean
    onToggleSection: () => void
    assignedLabelGroups: CityAutomationSectionProps['assignedLabelGroups']
    onChangeAutoCreateMode: CityAutomationSectionProps['onChangeAutoCreateMode']
    onChangeAutoCreateDefault: CityAutomationSectionProps['onChangeAutoCreateDefault']
    onChangeConfirmOnRemove: CityAutomationSectionProps['onChangeConfirmOnRemove']
  }
  citiesSection: {
    isSectionExpanded: boolean
    onToggleSection: () => void
    worldCityLevels: CitiesSectionProps['worldCityLevels']
    iconSourceMap: CitiesSectionProps['iconSourceMap']
    countries: CitiesSectionProps['countries']
    provinces: CitiesSectionProps['provinces']
    cityProvinceIdById: CitiesSectionProps['cityProvinceIdById']
    cityProvinceNameById: CitiesSectionProps['cityProvinceNameById']
    cityColumnOrder: CitiesSectionProps['visibleSidebarColumns']
    cityCompactColumns: CitiesSectionProps['visibleSidebarColumns']
    activeCityProvinceName: CitiesSectionProps['activeCityProvinceName']
    activeCity: CitiesSectionProps['activeCity']
    isInfoExpanded: boolean
    setIsInfoExpanded: Dispatch<SetStateAction<boolean>>
    filteredCities: CitiesSectionProps['filteredCities']
    effectiveCityCountryFilter: string
    effectiveCityProvinceFilter: string
    effectiveCityLevelFilter: string
    citySortKey: CitiesSectionProps['citySortKey']
    citySortDirection: CitiesSectionProps['citySortDirection']
    cityTypeSortMode: CitiesSectionProps['cityTypeSortMode']
    isListExpanded: boolean
    setIsListExpanded: Dispatch<SetStateAction<boolean>>
    onSetCityToolMode: CitiesSectionProps['onSetCityToolMode']
    setCityCountryFilter: Dispatch<SetStateAction<string>>
    setCityProvinceFilter: Dispatch<SetStateAction<string>>
    setCityLevelFilter: Dispatch<SetStateAction<string>>
    onChangeSort: CitiesSectionProps['onChangeSort']
    closeObjectEditors: () => void
    openSidebarDeleteConfirmation: OpenSidebarDeleteConfirmation
    setWorld: Dispatch<SetStateAction<WorldDocument>>
    onOpenExpandedTable: () => void
    setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingCityId: Dispatch<SetStateAction<string | null>>
    setPendingCityCellId: Dispatch<SetStateAction<string | null>>
    setCityDraftName: Dispatch<SetStateAction<string>>
    setCityDraftSecondName: Dispatch<SetStateAction<string>>
    setCityDraftCountryId: Dispatch<SetStateAction<string>>
    setCityDraftLevelId: Dispatch<SetStateAction<string>>
    setCityDraftDescription: Dispatch<SetStateAction<string>>
    setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  }
  helpers: {
    openCityLevelEditor: OpenCityLevelEditor
    openCityEditor: OpenCityEditor
  }
}

export function PoliticalCityModeContainer({ cityStyleSection,
  cityLevelsSection,
  cityAutomationSection,
  citiesSection,
  helpers,
}: PoliticalCityModeContainerProps) {
  const ui = useUiMessages()
  const { setActiveCityId, setActiveCityLevelId } = useActiveEntityContext()
  return (
    <section className="tool-section-stack city-panel section-gap">
      <CityStyleSection
        isSectionExpanded={cityStyleSection.isSectionExpanded}
        onToggleSection={() => {
          cityStyleSection.setIsSectionExpanded((current) => !current)
        }}
      />

      <CityAutomationSection
        isSectionExpanded={cityAutomationSection.isSectionExpanded}
        onToggleSection={cityAutomationSection.onToggleSection}
        assignedLabelGroups={cityAutomationSection.assignedLabelGroups}
        onChangeAutoCreateMode={cityAutomationSection.onChangeAutoCreateMode}
        onChangeAutoCreateDefault={cityAutomationSection.onChangeAutoCreateDefault}
        onChangeConfirmOnRemove={cityAutomationSection.onChangeConfirmOnRemove}
      />

      <CityLevelsSection
        isSectionExpanded={cityLevelsSection.isSectionExpanded}
        onToggleSection={cityLevelsSection.onToggleSection}
        activeCityLevel={cityLevelsSection.activeCityLevel}
        activeCityLevelUsageCount={cityLevelsSection.activeCityLevelUsageCount}
        iconSourceMap={cityLevelsSection.iconSourceMap}
        isInfoExpanded={cityLevelsSection.isInfoExpanded}
        sortedCityLevels={cityLevelsSection.sortedCityLevels}
        cityLevelSortKey={cityLevelsSection.cityLevelSortKey}
        cityLevelSortDirection={cityLevelsSection.cityLevelSortDirection}
        isListExpanded={cityLevelsSection.isListExpanded}
        onChangeSort={cityLevelsSection.onChangeSort}
        onToggleInfoExpanded={() => {
          cityLevelsSection.setIsInfoExpanded((current) => !current)
        }}
        onToggleListExpanded={() => {
          cityLevelsSection.setIsListExpanded((current) => !current)
        }}
        onCreateCityLevel={() => {
          cityLevelsSection.closeObjectEditors()
          cityLevelsSection.setIsCityLevelEditorOpen(true)
          cityLevelsSection.setEditingCityLevelId(null)
          cityLevelsSection.setCityLevelDraftName('')
          cityLevelsSection.setCityLevelDraftRank(1)
          cityLevelsSection.setCityLevelDraftIconKey(cityLevelsSection.defaultIconKey)
          cityLevelsSection.setCityLevelDraftIconScalePercent(100)
          cityLevelsSection.setCityLevelDraftUniquePerCountry(false)
          cityLevelsSection.setCityLevelDraftDisplayInCountryInfo(false)
        }}
        onDeleteActiveCityLevel={() => {
          if (
            !cityLevelsSection.activeCityLevel ||
            cityLevelsSection.activeCityLevelUsageCount > 0
          ) {
            return
          }
          if (cityLevelsSection.activeCityLevel.id === 'fallback') {
            return
          }
          const targetId = cityLevelsSection.activeCityLevel.id
          const targetName = cityLevelsSection.activeCityLevel.name || targetId
          cityLevelsSection.openSidebarDeleteConfirmation(
            `${ui.common.delete} ${targetName}?`,
            () => {
              cityLevelsSection.setWorld((current) => removeCityLevel(current, targetId))
              setActiveCityLevelId(null)
            },
          )
        }}
        onSetCityToolMode={cityLevelsSection.onSetCityToolMode}
        onSelectCityLevel={(levelId) => {
          setActiveCityLevelId(levelId)
        }}
        onClearSelection={() => {
          setActiveCityLevelId(null)
        }}
        onEditCityLevel={(level) => {
          setActiveCityLevelId(level.id)
          cityLevelsSection.closeObjectEditors()
          helpers.openCityLevelEditor(
            level,
            cityLevelsSection.setIsCityLevelEditorOpen,
            cityLevelsSection.setEditingCityLevelId,
            cityLevelsSection.setCityLevelDraftName,
            cityLevelsSection.setCityLevelDraftRank,
            cityLevelsSection.setCityLevelDraftIconKey,
            cityLevelsSection.setCityLevelDraftIconScalePercent,
            cityLevelsSection.setCityLevelDraftUniquePerCountry,
            cityLevelsSection.setCityLevelDraftDisplayInCountryInfo,
          )
        }}
      />

      <CitiesSection
        isSectionExpanded={citiesSection.isSectionExpanded}
        onToggleSection={citiesSection.onToggleSection}
        worldCityLevels={citiesSection.worldCityLevels}
        iconSourceMap={citiesSection.iconSourceMap}
        countries={citiesSection.countries}
        provinces={citiesSection.provinces}
        cityProvinceIdById={citiesSection.cityProvinceIdById}
        cityProvinceNameById={citiesSection.cityProvinceNameById}
        visibleSidebarColumns={citiesSection.cityColumnOrder.filter((columnId) =>
          citiesSection.cityCompactColumns.includes(columnId),
        )}
        activeCityProvinceName={citiesSection.activeCityProvinceName}
        activeCity={citiesSection.activeCity}
        isInfoExpanded={citiesSection.isInfoExpanded}
        filteredCities={citiesSection.filteredCities}
        effectiveCityCountryFilter={citiesSection.effectiveCityCountryFilter}
        effectiveCityProvinceFilter={citiesSection.effectiveCityProvinceFilter}
        effectiveCityLevelFilter={citiesSection.effectiveCityLevelFilter}
        citySortKey={citiesSection.citySortKey}
        citySortDirection={citiesSection.citySortDirection}
        cityTypeSortMode={citiesSection.cityTypeSortMode}
        isListExpanded={citiesSection.isListExpanded}
        onSetCityToolMode={citiesSection.onSetCityToolMode}
        onDeleteActiveCity={() => {
          if (!citiesSection.activeCity) {
            return
          }
          const targetId = citiesSection.activeCity.id
          const targetName = citiesSection.activeCity.name || targetId
          citiesSection.openSidebarDeleteConfirmation(
            `${ui.common.delete} ${targetName}?`,
            () => {
              citiesSection.setWorld((current) => removeCity(current, targetId))
              setActiveCityId(null)
            },
          )
        }}
        onOpenExpandedTable={citiesSection.onOpenExpandedTable}
        onToggleInfoExpanded={() => {
          citiesSection.setIsInfoExpanded((current) => !current)
        }}
        onClearFilters={() => {
          citiesSection.setCityCountryFilter('all')
          citiesSection.setCityProvinceFilter('all')
          citiesSection.setCityLevelFilter('all')
        }}
        onClearCountryFilter={() => {
          citiesSection.setCityCountryFilter('all')
        }}
        onClearProvinceFilter={() => {
          citiesSection.setCityProvinceFilter('all')
        }}
        onClearLevelFilter={() => {
          citiesSection.setCityLevelFilter('all')
        }}
        onChangeSort={citiesSection.onChangeSort}
        onToggleListExpanded={() => {
          citiesSection.setIsListExpanded((current) => !current)
        }}
        onSelectCity={(cityId) => {
          setActiveCityId(cityId)
        }}
        onClearSelection={() => {
          setActiveCityId(null)
        }}
        onEditCity={(city) => {
          setActiveCityId(city.id)
          citiesSection.closeObjectEditors()
          helpers.openCityEditor(
            city,
            citiesSection.setIsCityEditorOpen,
            citiesSection.setEditingCityId,
            citiesSection.setPendingCityCellId,
            citiesSection.setCityDraftName,
            citiesSection.setCityDraftSecondName,
            citiesSection.setCityDraftCountryId,
            citiesSection.setCityDraftLevelId,
            citiesSection.setCityDraftDescription,
            citiesSection.setCityAssignedLabelDrafts,
          )
        }}
        onToggleCountryFilter={(countryId) => {
          const nextFilter = countryId ?? 'unassigned'
          citiesSection.setCityCountryFilter((current) =>
            current === nextFilter ? 'all' : nextFilter,
          )
        }}
        onToggleProvinceFilter={(provinceId) => {
          const nextFilter = provinceId ?? 'none'
          citiesSection.setCityProvinceFilter((current) =>
            current === nextFilter ? 'all' : nextFilter,
          )
        }}
        onToggleLevelFilter={(levelId) => {
          citiesSection.setCityLevelFilter((current) =>
            current === levelId ? 'all' : levelId,
          )
        }}
      />
    </section>
  )
}
