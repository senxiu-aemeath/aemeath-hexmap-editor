import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import {
  removeCountry,
  removeGovernmentType,
  type City,
  type Country,
  type GovernmentType,
  type LabelGroup,
  type WorldDocument,
} from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { CountrySection } from './CountrySection'
import { CountryStyleSection } from './CountryStyleSection'
import { GovernmentTypesSection } from './GovernmentTypesSection'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type CountrySectionProps = ComponentProps<typeof CountrySection>
type GovernmentTypesSectionProps = ComponentProps<typeof GovernmentTypesSection>

type OpenSidebarDeleteConfirmation = (
  title: string,
  onConfirm: () => void,
) => void

type OpenGovernmentTypeEditor = (
  governmentType: GovernmentType,
  setIsGovernmentTypeEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingGovernmentTypeId: Dispatch<SetStateAction<string | null>>,
  setGovernmentTypeDraftName: Dispatch<SetStateAction<string>>,
  setGovernmentTypeDraftColor: Dispatch<SetStateAction<string>>,
) => void

type OpenCountryEditor = (
  country: Country,
  setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>,
  setEditingCountryId: Dispatch<SetStateAction<string | null>>,
  setCountryDraftName: Dispatch<SetStateAction<string>>,
  setCountryDraftSecondName: Dispatch<SetStateAction<string>>,
  setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>,
  setCountryDraftColor: Dispatch<SetStateAction<string>>,
  setCountryDraftBorderColor: Dispatch<SetStateAction<string>>,
  setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>,
  setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>,
  setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>,
  setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>,
  setCountryDraftDescription: Dispatch<SetStateAction<string>>,
  setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>,
) => void

interface PoliticalCountryModeContainerProps {
  governmentTypesSection: {
    isSectionExpanded: boolean
    setIsSectionExpanded: Dispatch<SetStateAction<boolean>>
    governmentTypes: GovernmentTypesSectionProps['governmentTypes']
    activeGovernmentTypeUsageCount: number
    isInfoExpanded: boolean
    setIsInfoExpanded: Dispatch<SetStateAction<boolean>>
    isListExpanded: boolean
    setIsListExpanded: Dispatch<SetStateAction<boolean>>
    editingGovernmentTypeId: string | null
    worldGovernmentTypes: Record<string, GovernmentType>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
    closeObjectEditors: () => void
    closeGovernmentTypeEditorWithPreviewReset: () => void
    openSidebarDeleteConfirmation: OpenSidebarDeleteConfirmation
    setIsGovernmentTypeEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingGovernmentTypeId: Dispatch<SetStateAction<string | null>>
    setGovernmentTypeDraftName: Dispatch<SetStateAction<string>>
    setGovernmentTypeDraftColor: Dispatch<SetStateAction<string>>
  }
  countrySection: {
    isSectionExpanded: boolean
    setIsSectionExpanded: Dispatch<SetStateAction<boolean>>
    onCacheWorkspace: () => void
    onRestoreWorkspace: () => void
    activeCountry: CountrySectionProps['activeCountry']
    activeCountryAssignmentCount: number
    isInfoExpanded: boolean
    setIsInfoExpanded: Dispatch<SetStateAction<boolean>>
    filteredCountries: CountrySectionProps['filteredCountries']
    iconSourceMap: CountrySectionProps['iconSourceMap']
    governmentTypes: CountrySectionProps['governmentTypes']
    countryColumnOrder: CountrySectionProps['visibleSidebarColumns']
    countryCompactColumns: CountrySectionProps['visibleSidebarColumns']
    effectiveGovernmentTypeFilter: string
    countrySortKey: CountrySectionProps['countrySortKey']
    countrySortDirection: CountrySectionProps['countrySortDirection']
    isListExpanded: boolean
    setIsListExpanded: Dispatch<SetStateAction<boolean>>
    setBrushRadius: Dispatch<SetStateAction<number>>
    paintableCountries: Country[]
    onChangeSort: CountrySectionProps['onChangeSort']
    setCountryGovernmentTypeFilter: Dispatch<SetStateAction<string>>
    closeObjectEditors: () => void
    countries: Country[]
    setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>
    editingCountryId: string | null
    setEditingCountryId: Dispatch<SetStateAction<string | null>>
    setCountryDraftName: Dispatch<SetStateAction<string>>
    setCountryDraftSecondName: Dispatch<SetStateAction<string>>
    setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>
    setCountryDraftColor: Dispatch<SetStateAction<string>>
    setCountryDraftBorderColor: Dispatch<SetStateAction<string>>
    setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>
    setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>
    setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>
    setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>
    setCountryDraftDescription: Dispatch<SetStateAction<string>>
    setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    getCountryAssignedLabelGroups: () => LabelGroup[]
    setWorld: Dispatch<SetStateAction<WorldDocument>>
    openSidebarDeleteConfirmation: OpenSidebarDeleteConfirmation
    closeCountryEditorWithPreviewReset: () => void
    onOpenExpandedTable: () => void
    onResetToolMode: () => void
    activeCountryProvinceCount: number
    cities: City[]
    worldCityLevels: CountrySectionProps['cityLevels']
  }
  countryStyleSection: {
    isSectionExpanded: boolean
    setIsSectionExpanded: Dispatch<SetStateAction<boolean>>
  }
  helpers: {
    pickNextColor: (countries: Country[]) => string
    applyCountryDraftDerivedColors: (color: string) => void
    getAssignedLabelDrafts: (groups: LabelGroup[]) => Record<string, boolean>
    openGovernmentTypeEditor: OpenGovernmentTypeEditor
    openCountryEditor: OpenCountryEditor
  }
}

export function PoliticalCountryModeContainer({ governmentTypesSection,
  countrySection,
  countryStyleSection,
  helpers,
}: PoliticalCountryModeContainerProps) {
  const { countryToolMode, setCountryToolMode, setPoliticalPaintMode } = useEditorModeContext()
  const { setActiveGovernmentTypeId, activeGovernmentTypeId, activeCountryId, setActiveCountryId } = useActiveEntityContext()
  const ui = useUiMessages()
  return (
    <section className="tool-section-stack section-gap">
      <CountryStyleSection
        isSectionExpanded={countryStyleSection.isSectionExpanded}
        onToggleSection={() => {
          countryStyleSection.setIsSectionExpanded((current) => !current)
        }}
      />

      <GovernmentTypesSection
        isSectionExpanded={governmentTypesSection.isSectionExpanded}
        onToggleSection={() => {
          governmentTypesSection.setIsSectionExpanded((current) => {
            const nextExpanded = !current

            if (!nextExpanded) {
              setActiveGovernmentTypeId(null)
              governmentTypesSection.closeGovernmentTypeEditorWithPreviewReset()
            }

            return nextExpanded
          })
        }}
        governmentTypes={governmentTypesSection.governmentTypes}
        activeGovernmentTypeUsageCount={governmentTypesSection.activeGovernmentTypeUsageCount}
        isInfoExpanded={governmentTypesSection.isInfoExpanded}
        isListExpanded={governmentTypesSection.isListExpanded}
        onToggleInfoExpanded={() => {
          governmentTypesSection.setIsInfoExpanded((current) => !current)
        }}
        onToggleListExpanded={() => {
          governmentTypesSection.setIsListExpanded((current) => !current)
        }}
        onCreateGovernmentType={() => {
          governmentTypesSection.closeObjectEditors()
          governmentTypesSection.setIsGovernmentTypeEditorOpen(true)
          governmentTypesSection.setEditingGovernmentTypeId(null)
          governmentTypesSection.setGovernmentTypeDraftName(
            ui.generated.newGovernmentType(governmentTypesSection.governmentTypes.length + 1),
          )
          governmentTypesSection.setGovernmentTypeDraftColor('#c79a34')
        }}
        onDeleteActiveGovernmentType={() => {
          if (!activeGovernmentTypeId) {
            return
          }

          const targetId = activeGovernmentTypeId
          const targetName =
            governmentTypesSection.worldGovernmentTypes[targetId]?.name ?? targetId

          governmentTypesSection.openSidebarDeleteConfirmation(
            `${ui.common.delete} ${targetName}?`,
            () => {
              governmentTypesSection.setWorld((current) =>
                removeGovernmentType(current, targetId),
              )
              setActiveGovernmentTypeId(null)
              if (governmentTypesSection.editingGovernmentTypeId === targetId) {
                governmentTypesSection.closeGovernmentTypeEditorWithPreviewReset()
              }
            },
          )
        }}
        onSelectGovernmentType={(governmentTypeId) => {
          setActiveGovernmentTypeId(governmentTypeId)
        }}
        onClearSelection={() => {
          setActiveGovernmentTypeId(null)
        }}
        onEditGovernmentType={(governmentType) => {
          setActiveGovernmentTypeId(governmentType.id)
          governmentTypesSection.closeObjectEditors()
          const sourceGovernmentType =
            governmentTypesSection.worldGovernmentTypes[governmentType.id] ?? governmentType
          helpers.openGovernmentTypeEditor(
            sourceGovernmentType,
            governmentTypesSection.setIsGovernmentTypeEditorOpen,
            governmentTypesSection.setEditingGovernmentTypeId,
            governmentTypesSection.setGovernmentTypeDraftName,
            governmentTypesSection.setGovernmentTypeDraftColor,
          )
        }}
      />

      <CountrySection
        isSectionExpanded={countrySection.isSectionExpanded}
        onToggleSection={() => {
          countrySection.setIsSectionExpanded((current) => {
            const nextExpanded = !current
            if (!nextExpanded) {
              countrySection.onCacheWorkspace()
              countrySection.onResetToolMode()
            } else {
              countrySection.onRestoreWorkspace()
            }
            return nextExpanded
          })
        }}
        activeCountry={countrySection.activeCountry}
        activeCountryAssignmentCount={countrySection.activeCountryAssignmentCount}
        isInfoExpanded={countrySection.isInfoExpanded}
        filteredCountries={countrySection.filteredCountries}
        iconSourceMap={countrySection.iconSourceMap}
        governmentTypes={countrySection.governmentTypes}
        visibleSidebarColumns={countrySection.countryColumnOrder.filter((columnId) =>
          countrySection.countryCompactColumns.includes(columnId),
        )}
        effectiveGovernmentTypeFilter={countrySection.effectiveGovernmentTypeFilter}
        countrySortKey={countrySection.countrySortKey}
        countrySortDirection={countrySection.countrySortDirection}
        isListExpanded={countrySection.isListExpanded}
        canPaintCountries={countrySection.paintableCountries.length > 0}
        onChangeSort={countrySection.onChangeSort}
        onChangePoliticalPaintMode={(mode) => {
          setPoliticalPaintMode(mode)
          if (mode.startsWith('radius_')) {
            countrySection.setBrushRadius(Number(mode.slice(-1)))
          }
        }}
        onToggleInfoExpanded={() => {
          countrySection.setIsInfoExpanded((current) => !current)
        }}
        onToggleListExpanded={() => {
          countrySection.setIsListExpanded((current) => !current)
        }}
        onClearFilter={() => {
          countrySection.setCountryGovernmentTypeFilter('all')
        }}
        onCreateCountry={() => {
          countrySection.closeObjectEditors()
          countrySection.setIsCountryEditorOpen(true)
          countrySection.setEditingCountryId(null)
          const nextColor = helpers.pickNextColor(countrySection.countries)
          countrySection.setCountryDraftName(
            ui.generated.newCountry(countrySection.countries.length + 1),
          )
          countrySection.setCountryDraftSecondName('')
          countrySection.setCountryDraftIconKey(null)
          countrySection.setCountryDraftColor(nextColor)
          helpers.applyCountryDraftDerivedColors(nextColor)
          countrySection.setCountryDraftGovernmentTypeId('none')
          countrySection.setCountryDraftIsCityState(false)
          countrySection.setCountryDraftDescription('')
          countrySection.setCountryAssignedLabelDrafts(
            helpers.getAssignedLabelDrafts(countrySection.getCountryAssignedLabelGroups()),
          )
        }}
        onDeleteActiveCountry={() => {
          if (!countrySection.activeCountry) {
            return
          }

          const targetId = countrySection.activeCountry.id
          const targetName = countrySection.activeCountry.name || targetId

          countrySection.openSidebarDeleteConfirmation(
            `${ui.common.delete} ${targetName}?`,
            () => {
              countrySection.setWorld((current) => removeCountry(current, targetId))
              setActiveCountryId(null)
              if (countrySection.editingCountryId === targetId) {
                countrySection.closeCountryEditorWithPreviewReset()
              }
            },
          )
        }}
        onOpenExpandedTable={countrySection.onOpenExpandedTable}
        onResetToolMode={countrySection.onResetToolMode}
        onTogglePaintMode={() => {
          if (countryToolMode === 'paint') {
            countrySection.onResetToolMode()
            return
          }

          const fallbackCountryId =
            activeCountryId ??
            countrySection.paintableCountries[0]?.id ??
            null

          if (!fallbackCountryId) {
            return
          }

          setActiveCountryId(fallbackCountryId)
          setCountryToolMode('paint')
        }}
        onToggleEraseMode={() => {
          setCountryToolMode((current) =>
            current === 'erase' ? 'view' : 'erase',
          )
        }}
        onSelectCountry={(countryId) => {
          setActiveCountryId(countryId)
        }}
        onClearSelection={() => {
          setActiveCountryId(null)
        }}
        onOpenCountryEditor={(country) => {
          countrySection.closeObjectEditors()
          helpers.openCountryEditor(
            country,
            countrySection.setIsCountryEditorOpen,
            countrySection.setEditingCountryId,
            countrySection.setCountryDraftName,
            countrySection.setCountryDraftSecondName,
            countrySection.setCountryDraftIconKey,
            countrySection.setCountryDraftColor,
            countrySection.setCountryDraftBorderColor,
            countrySection.setCountryDraftProvinceDefaultColor,
            countrySection.setCountryDraftProvinceBorderColor,
            countrySection.setCountryDraftGovernmentTypeId,
            countrySection.setCountryDraftIsCityState,
            countrySection.setCountryDraftDescription,
            countrySection.setCountryAssignedLabelDrafts,
          )
        }}
        onToggleGovernmentTypeFilter={(governmentTypeId) => {
          const nextFilter = governmentTypeId ?? 'none'
          countrySection.setCountryGovernmentTypeFilter((current) =>
            current === nextFilter ? 'all' : nextFilter,
          )
        }}
        activeCountryProvinceCount={countrySection.activeCountryProvinceCount}
        activeCountryCities={
          countrySection.activeCountry
            ? countrySection.cities.filter(
                (city) => city.countryId === activeCountryId,
              )
            : []
        }
        cityLevels={countrySection.worldCityLevels}
      />
    </section>
  )
}
