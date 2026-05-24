import type { ComponentProps, Dispatch, SetStateAction } from 'react'

import { removeProvince, type LabelGroup, type WorldDocument } from '../../domain/world'
import { useUiMessages } from '../../i18n'
import { ProvinceSection } from './ProvinceSection'
import { ProvinceStyleSection } from './ProvinceStyleSection'
import { useEditorModeContext } from '../../state/EditorModeContext'
import { useActiveEntityContext } from '../../state/ActiveEntityContext'

type ProvinceSectionProps = ComponentProps<typeof ProvinceSection>

type OpenSidebarDeleteConfirmation = (
  title: string,
  onConfirm: () => void,
) => void

interface PoliticalProvinceModeContainerProps {
  provinceStyleSection: {
    isSectionExpanded: boolean
    setIsSectionExpanded: Dispatch<SetStateAction<boolean>>
  }
  provinceSection: {
    activeProvince: ProvinceSectionProps['activeProvince']
    activeProvinceCellCount: number
    activeProvinceCapital: ProvinceSectionProps['activeProvinceCapital']
    isInfoExpanded: boolean
    setIsInfoExpanded: Dispatch<SetStateAction<boolean>>
    provinces: ProvinceSectionProps['provinces']
    countries: ProvinceSectionProps['countries']
    cities: ProvinceSectionProps['cities']
    provinceColumnOrder: ProvinceSectionProps['visibleSidebarColumns']
    provinceCompactColumns: ProvinceSectionProps['visibleSidebarColumns']
    provinceSortKey: ProvinceSectionProps['provinceSortKey']
    provinceSortDirection: ProvinceSectionProps['provinceSortDirection']
    isListExpanded: boolean
    setIsListExpanded: Dispatch<SetStateAction<boolean>>
    setBrushRadius: Dispatch<SetStateAction<number>>
    onChangeSort: ProvinceSectionProps['onChangeSort']
    closeObjectEditors: () => void
    setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>
    setEditingProvinceId: Dispatch<SetStateAction<string | null>>
    setProvinceDraftName: Dispatch<SetStateAction<string>>
    getCountryProvinceDefaultColor: (countryId: string | null) => string
    activeCountryId: string | null
    setProvinceDraftColor: Dispatch<SetStateAction<string>>
    setProvinceDraftCountryId: Dispatch<SetStateAction<string>>
    setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>
    setProvinceDraftDescription: Dispatch<SetStateAction<string>>
    setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    getProvinceAssignedLabelGroups: () => LabelGroup[]
    setWorld: Dispatch<SetStateAction<WorldDocument>>
    openSidebarDeleteConfirmation: OpenSidebarDeleteConfirmation
    onOpenExpandedTable: () => void
  }
  helpers: {
    getAssignedLabelDrafts: (groups: LabelGroup[]) => Record<string, boolean>
  }
}

export function PoliticalProvinceModeContainer({ provinceStyleSection,
  provinceSection,
  helpers,
}: PoliticalProvinceModeContainerProps) {
  const { provinceToolMode, setProvinceToolMode, setPoliticalPaintMode, setRestrictProvinceBrushToOwnerCountry } = useEditorModeContext()
  const { activeProvinceId, setActiveProvinceId } = useActiveEntityContext()
  const ui = useUiMessages()
  return (
    <section className="tool-section-stack section-gap">
      <ProvinceStyleSection
        isSectionExpanded={provinceStyleSection.isSectionExpanded}
        onToggleSection={() => {
          provinceStyleSection.setIsSectionExpanded((current) => !current)
        }}
      />

      <ProvinceSection
        isSectionExpanded
        onToggleSection={() => {}}
        activeProvince={provinceSection.activeProvince}
        activeProvinceCellCount={provinceSection.activeProvinceCellCount}
        activeProvinceCapital={provinceSection.activeProvinceCapital}
        isInfoExpanded={provinceSection.isInfoExpanded}
        provinces={provinceSection.provinces}
        countries={provinceSection.countries}
        cities={provinceSection.cities}
        visibleSidebarColumns={provinceSection.provinceColumnOrder.filter((columnId) =>
          provinceSection.provinceCompactColumns.includes(columnId),
        )}
        provinceSortKey={provinceSection.provinceSortKey}
        provinceSortDirection={provinceSection.provinceSortDirection}
        isListExpanded={provinceSection.isListExpanded}
        onChangeSort={provinceSection.onChangeSort}
        onChangePoliticalPaintMode={(mode) => {
          setPoliticalPaintMode(mode)
          if (mode.startsWith('radius_')) {
            provinceSection.setBrushRadius(Number(mode.slice(-1)))
          }
        }}
        onChangeRestrictProvinceBrushToOwnerCountry={
          setRestrictProvinceBrushToOwnerCountry
        }
        onToggleInfoExpanded={() => {
          provinceSection.setIsInfoExpanded((current) => !current)
        }}
        onToggleListExpanded={() => {
          provinceSection.setIsListExpanded((current) => !current)
        }}
        onCreateProvince={() => {
          provinceSection.closeObjectEditors()
          provinceSection.setIsProvinceEditorOpen(true)
          provinceSection.setEditingProvinceId(null)
          provinceSection.setProvinceDraftName(
            ui.generated.newProvince(provinceSection.provinces.length + 1),
          )
          const nextCountryId = provinceSection.activeCountryId
          provinceSection.setProvinceDraftColor(
            provinceSection.getCountryProvinceDefaultColor(nextCountryId),
          )
          provinceSection.setProvinceDraftCountryId(nextCountryId ?? 'unassigned')
          provinceSection.setProvinceDraftCapitalCityId('none')
          provinceSection.setProvinceDraftDescription('')
          provinceSection.setProvinceAssignedLabelDrafts(
            helpers.getAssignedLabelDrafts(
              provinceSection.getProvinceAssignedLabelGroups(),
            ),
          )
        }}
        onDeleteActiveProvince={() => {
          if (!provinceSection.activeProvince) {
            return
          }

          const targetId = provinceSection.activeProvince.id
          const targetName = provinceSection.activeProvince.name || targetId

          provinceSection.openSidebarDeleteConfirmation(
            `${ui.common.delete} ${targetName}?`,
            () => {
              provinceSection.setWorld((current) => removeProvince(current, targetId))
              setActiveProvinceId(null)
            },
          )
        }}
        onOpenExpandedTable={provinceSection.onOpenExpandedTable}
        onResetToolMode={() => {
          setProvinceToolMode('view')
        }}
        onTogglePaintMode={() => {
          if (provinceToolMode === 'paint') {
            setProvinceToolMode('view')
            return
          }
          if (!activeProvinceId && provinceSection.provinces[0]?.id) {
            setActiveProvinceId(provinceSection.provinces[0].id)
          }
          setProvinceToolMode('paint')
        }}
        onToggleEraseMode={() => {
          setProvinceToolMode((current) =>
            current === 'erase' ? 'view' : 'erase',
          )
        }}
        onSelectProvince={(provinceId) => {
          setActiveProvinceId(provinceId)
        }}
        onClearSelection={() => {
          setActiveProvinceId(null)
        }}
        onEditProvince={(province) => {
          provinceSection.closeObjectEditors()
          setActiveProvinceId(province.id)
          provinceSection.setIsProvinceEditorOpen(true)
          provinceSection.setEditingProvinceId(province.id)
          provinceSection.setProvinceDraftName(province.name)
          provinceSection.setProvinceDraftColor(province.color)
          provinceSection.setProvinceDraftCountryId(province.countryId ?? 'unassigned')
          provinceSection.setProvinceDraftCapitalCityId(province.capitalCityId ?? 'none')
          provinceSection.setProvinceDraftDescription(province.description ?? '')
          provinceSection.setProvinceAssignedLabelDrafts({})
        }}
      />
    </section>
  )
}
