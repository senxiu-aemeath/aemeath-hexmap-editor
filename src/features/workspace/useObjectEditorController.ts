import { useCallback } from 'react'
import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { WorldDocument } from '../../domain/world'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

type ObjectEditorSidecarAnchor = 'inspector' | 'expanded-table' | 'left-sidebar'
type IconManagerSessionRef = MutableRefObject<unknown | null>

interface UseObjectEditorControllerArgs {
  contexts: {
    activeEntity: Pick<
      ActiveEntityContextValue,
      | 'setActiveCityId'
      | 'setActiveCountryId'
      | 'setActiveLabelId'
      | 'setActiveManagedLabelGroupId'
      | 'setActiveProvinceId'
    >
  }
  state: {
    countryDraftColor: string
    expandedTableId:
      | 'cities'
      | 'countries'
      | 'provinces'
      | 'label-groups'
      | 'text-labels'
      | 'icon-labels'
      | 'icons'
      | 'fonts'
      | null
    isCityEditorOpen: boolean
    isCityLevelEditorOpen: boolean
    isCountryEditorOpen: boolean
    isGovernmentTypeEditorOpen: boolean
    isLabelEditorOpen: boolean
    isLabelGroupEditorOpen: boolean
    isProvinceEditorOpen: boolean
    objectEditorSidecarAnchor: ObjectEditorSidecarAnchor
    world: WorldDocument
  }
  refs: {
    iconManagerOriginKeyByCurrentRef: MutableRefObject<Record<string, string>>
    iconManagerSessionSnapshotRef: IconManagerSessionRef
  }
  actions: {
    applyCountryDraftDerivedColors: (fillColor: string) => {
      borderColor: string
      provinceBorderColor: string
    }
    closeObjectEditors: () => void
    deriveCountryPaletteFromFill: (fillColor: string) => {
      borderColor: string
      provinceDefaultColor: string
      provinceBorderColor: string
    }
    openLabelEditor: (labelId: string) => void
    setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setCityDraftCountryId: Dispatch<SetStateAction<string>>
    setCityDraftDescription: Dispatch<SetStateAction<string>>
    setCityDraftLevelId: Dispatch<SetStateAction<string>>
    setCityDraftName: Dispatch<SetStateAction<string>>
    setCityDraftSecondName: Dispatch<SetStateAction<string>>
    setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setCountryDraftBorderColor: Dispatch<SetStateAction<string>>
    setCountryDraftColor: Dispatch<SetStateAction<string>>
    setCountryDraftDescription: Dispatch<SetStateAction<string>>
    setCountryDraftGovernmentTypeId: Dispatch<SetStateAction<string>>
    setCountryDraftIconKey: Dispatch<SetStateAction<string | null>>
    setCountryDraftIsCityState: Dispatch<SetStateAction<boolean>>
    setCountryDraftName: Dispatch<SetStateAction<string>>
    setCountryDraftProvinceBorderColor: Dispatch<SetStateAction<string>>
    setCountryDraftProvinceDefaultColor: Dispatch<SetStateAction<string>>
    setCountryDraftSecondName: Dispatch<SetStateAction<string>>
    setCountryPreviewBorderColor: Dispatch<SetStateAction<string | null>>
    setCountryPreviewColor: Dispatch<SetStateAction<string | null>>
    setCountryPreviewProvinceBorderColor: Dispatch<SetStateAction<string | null>>
    setEditingCityId: Dispatch<SetStateAction<string | null>>
    setEditingCountryId: Dispatch<SetStateAction<string | null>>
    setEditingGovernmentTypeId: Dispatch<SetStateAction<string | null>>
    setEditingLabelGroupId: Dispatch<SetStateAction<string | null>>
    setEditingProvinceId: Dispatch<SetStateAction<string | null>>
    setExpandedTableId: Dispatch<SetStateAction<
      | 'cities'
      | 'countries'
      | 'provinces'
      | 'label-groups'
      | 'text-labels'
      | 'icon-labels'
      | 'icons'
      | 'fonts'
      | null
    >>
    setGovernmentTypeDraftColor: Dispatch<SetStateAction<string>>
    setGovernmentTypeDraftName: Dispatch<SetStateAction<string>>
    setGovernmentTypePreviewColor: Dispatch<SetStateAction<string | null>>
    setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsGovernmentTypeEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsLabelGroupEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>
    setObjectEditorSidecarAnchor: Dispatch<SetStateAction<ObjectEditorSidecarAnchor>>
    setPendingCityCellId: Dispatch<SetStateAction<string | null>>
    setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>
    setProvinceDraftColor: Dispatch<SetStateAction<string>>
    setProvinceDraftCountryId: Dispatch<SetStateAction<string>>
    setProvinceDraftDescription: Dispatch<SetStateAction<string>>
    setProvinceDraftName: Dispatch<SetStateAction<string>>
    setProvincePreviewColor: Dispatch<SetStateAction<string | null>>
  }
}

export function useObjectEditorController({
  contexts,
  state,
  refs,
  actions,
}: UseObjectEditorControllerArgs) {
  const {
    setActiveCityId,
    setActiveCountryId,
    setActiveLabelId,
    setActiveManagedLabelGroupId,
    setActiveProvinceId,
  } = contexts.activeEntity
  const {
    countryDraftColor,
    expandedTableId,
    isCityEditorOpen,
    isCityLevelEditorOpen,
    isCountryEditorOpen,
    isGovernmentTypeEditorOpen,
    isLabelEditorOpen,
    isLabelGroupEditorOpen,
    isProvinceEditorOpen,
    objectEditorSidecarAnchor,
    world,
  } = state
  const {
    iconManagerOriginKeyByCurrentRef,
    iconManagerSessionSnapshotRef,
  } = refs
  const {
    applyCountryDraftDerivedColors,
    closeObjectEditors,
    deriveCountryPaletteFromFill,
    openLabelEditor,
    setCityAssignedLabelDrafts,
    setCityDraftCountryId,
    setCityDraftDescription,
    setCityDraftLevelId,
    setCityDraftName,
    setCityDraftSecondName,
    setCountryAssignedLabelDrafts,
    setCountryDraftBorderColor,
    setCountryDraftColor,
    setCountryDraftDescription,
    setCountryDraftGovernmentTypeId,
    setCountryDraftIconKey,
    setCountryDraftIsCityState,
    setCountryDraftName,
    setCountryDraftProvinceBorderColor,
    setCountryDraftProvinceDefaultColor,
    setCountryDraftSecondName,
    setCountryPreviewBorderColor,
    setCountryPreviewColor,
    setCountryPreviewProvinceBorderColor,
    setEditingCityId,
    setEditingCountryId,
    setEditingGovernmentTypeId,
    setEditingLabelGroupId,
    setEditingProvinceId,
    setExpandedTableId,
    setGovernmentTypeDraftColor,
    setGovernmentTypeDraftName,
    setGovernmentTypePreviewColor,
    setIsCityEditorOpen,
    setIsCountryEditorOpen,
    setIsGovernmentTypeEditorOpen,
    setIsLabelGroupEditorOpen,
    setIsProvinceEditorOpen,
    setObjectEditorSidecarAnchor,
    setPendingCityCellId,
    setProvinceAssignedLabelDrafts,
    setProvinceDraftCapitalCityId,
    setProvinceDraftColor,
    setProvinceDraftCountryId,
    setProvinceDraftDescription,
    setProvinceDraftName,
    setProvincePreviewColor,
  } = actions

  const closeCountryEditorWithPreviewReset = useCallback(() => {
    setCountryPreviewColor(null)
    setCountryPreviewBorderColor(null)
    setCountryPreviewProvinceBorderColor(null)
    const defaultCountryColor = '#d86f45'
    const defaultCountryPalette = deriveCountryPaletteFromFill(defaultCountryColor)
    setIsCountryEditorOpen(false)
    setEditingCountryId(null)
    setCountryDraftName('')
    setCountryDraftSecondName('')
    setCountryDraftIconKey(null)
    setCountryDraftColor(defaultCountryColor)
    setCountryDraftBorderColor(defaultCountryPalette.borderColor)
    setCountryDraftProvinceDefaultColor(defaultCountryPalette.provinceDefaultColor)
    setCountryDraftProvinceBorderColor(defaultCountryPalette.provinceBorderColor)
    setCountryDraftGovernmentTypeId('none')
    setCountryDraftIsCityState(false)
    setCountryDraftDescription('')
    setCountryAssignedLabelDrafts({})
  }, [
    deriveCountryPaletteFromFill,
    setCountryAssignedLabelDrafts,
    setCountryDraftBorderColor,
    setCountryDraftColor,
    setCountryDraftDescription,
    setCountryDraftGovernmentTypeId,
    setCountryDraftIconKey,
    setCountryDraftIsCityState,
    setCountryDraftName,
    setCountryDraftProvinceBorderColor,
    setCountryDraftProvinceDefaultColor,
    setCountryDraftSecondName,
    setCountryPreviewBorderColor,
    setCountryPreviewColor,
    setCountryPreviewProvinceBorderColor,
    setEditingCountryId,
    setIsCountryEditorOpen,
  ])

  const autoComputeCountryDraftColorsFromFill = useCallback(() => {
    const palette = applyCountryDraftDerivedColors(countryDraftColor)
    setCountryPreviewBorderColor(palette.borderColor)
    setCountryPreviewProvinceBorderColor(palette.provinceBorderColor)
  }, [
    applyCountryDraftDerivedColors,
    countryDraftColor,
    setCountryPreviewBorderColor,
    setCountryPreviewProvinceBorderColor,
  ])

  const closeProvinceEditorWithPreviewReset = useCallback(() => {
    setProvincePreviewColor(null)
    setIsProvinceEditorOpen(false)
    setEditingProvinceId(null)
    setProvinceDraftName('')
    setProvinceDraftColor('#a86a4f')
    setProvinceDraftCountryId('unassigned')
    setProvinceDraftCapitalCityId('none')
    setProvinceDraftDescription('')
    setProvinceAssignedLabelDrafts({})
  }, [
    setEditingProvinceId,
    setIsProvinceEditorOpen,
    setProvinceAssignedLabelDrafts,
    setProvinceDraftCapitalCityId,
    setProvinceDraftColor,
    setProvinceDraftCountryId,
    setProvinceDraftDescription,
    setProvinceDraftName,
    setProvincePreviewColor,
  ])

  const closeGovernmentTypeEditorWithPreviewReset = useCallback(() => {
    setGovernmentTypePreviewColor(null)
    setIsGovernmentTypeEditorOpen(false)
    setEditingGovernmentTypeId(null)
    setGovernmentTypeDraftName('')
    setGovernmentTypeDraftColor('#c79a34')
  }, [
    setEditingGovernmentTypeId,
    setGovernmentTypeDraftColor,
    setGovernmentTypeDraftName,
    setGovernmentTypePreviewColor,
    setIsGovernmentTypeEditorOpen,
  ])

  const isAnyObjectEditorOpen =
    isCountryEditorOpen ||
    isProvinceEditorOpen ||
    isGovernmentTypeEditorOpen ||
    isCityEditorOpen ||
    isCityLevelEditorOpen ||
    isLabelEditorOpen ||
    isLabelGroupEditorOpen

  const closeExpandedTable = useCallback(() => {
    if (expandedTableId === 'icons') {
      iconManagerSessionSnapshotRef.current = null
      iconManagerOriginKeyByCurrentRef.current = {}
    }
    setExpandedTableId(null)
    if (objectEditorSidecarAnchor === 'expanded-table') {
      closeObjectEditors()
    }
  }, [
    closeObjectEditors,
    expandedTableId,
    iconManagerOriginKeyByCurrentRef,
    iconManagerSessionSnapshotRef,
    objectEditorSidecarAnchor,
    setExpandedTableId,
  ])

  const beginExpandedTableEditorOpen = useCallback(() => {
    closeObjectEditors()
    setObjectEditorSidecarAnchor('expanded-table')
  }, [
    closeObjectEditors,
    setObjectEditorSidecarAnchor,
  ])

  const openCountryEditorFromExpandedTable = useCallback((countryId: string) => {
    const country = world.countries[countryId]
    if (!country) {
      return
    }
    beginExpandedTableEditorOpen()
    setActiveCountryId(country.id)
    setIsCountryEditorOpen(true)
    setEditingCountryId(country.id)
    setCountryDraftName(country.name)
    setCountryDraftSecondName(country.secondName ?? '')
    setCountryDraftIconKey(country.iconKey ?? null)
    setCountryDraftColor(country.color)
    setCountryDraftBorderColor(country.borderColor ?? country.color)
    setCountryDraftProvinceDefaultColor(
      country.provinceDefaultColor ?? deriveCountryPaletteFromFill(country.color).provinceDefaultColor,
    )
    setCountryDraftProvinceBorderColor(
      country.provinceBorderColor ?? country.borderColor ?? country.color,
    )
    setCountryDraftGovernmentTypeId(country.governmentTypeId ?? 'none')
    setCountryDraftIsCityState(country.isCityState)
    setCountryDraftDescription(country.description ?? '')
    setCountryAssignedLabelDrafts({})
  }, [
    beginExpandedTableEditorOpen,
    deriveCountryPaletteFromFill,
    setActiveCountryId,
    setCountryAssignedLabelDrafts,
    setCountryDraftBorderColor,
    setCountryDraftColor,
    setCountryDraftDescription,
    setCountryDraftGovernmentTypeId,
    setCountryDraftIconKey,
    setCountryDraftIsCityState,
    setCountryDraftName,
    setCountryDraftProvinceBorderColor,
    setCountryDraftProvinceDefaultColor,
    setCountryDraftSecondName,
    setEditingCountryId,
    setIsCountryEditorOpen,
    world.countries,
  ])

  const openProvinceEditorFromExpandedTable = useCallback((provinceId: string) => {
    const province = world.provinces[provinceId]
    if (!province) {
      return
    }
    beginExpandedTableEditorOpen()
    setActiveProvinceId(province.id)
    setIsProvinceEditorOpen(true)
    setEditingProvinceId(province.id)
    setProvinceDraftName(province.name)
    setProvinceDraftColor(province.color)
    setProvinceDraftCountryId(province.countryId ?? 'unassigned')
    setProvinceDraftCapitalCityId(province.capitalCityId ?? 'none')
    setProvinceDraftDescription(province.description ?? '')
    setProvinceAssignedLabelDrafts({})
  }, [
    beginExpandedTableEditorOpen,
    setActiveProvinceId,
    setEditingProvinceId,
    setIsProvinceEditorOpen,
    setProvinceAssignedLabelDrafts,
    setProvinceDraftCapitalCityId,
    setProvinceDraftColor,
    setProvinceDraftCountryId,
    setProvinceDraftDescription,
    setProvinceDraftName,
    world.provinces,
  ])

  const openCityEditorFromExpandedTable = useCallback((cityId: string) => {
    const city = world.cities[cityId]
    if (!city) {
      return
    }
    beginExpandedTableEditorOpen()
    setActiveCityId(city.id)
    setIsCityEditorOpen(true)
    setEditingCityId(city.id)
    setPendingCityCellId(null)
    setCityDraftName(city.name)
    setCityDraftSecondName(city.secondName ?? '')
    setCityDraftCountryId(city.countryId ?? 'unassigned')
    setCityDraftLevelId(city.levelId)
    setCityDraftDescription(city.description ?? '')
    setCityAssignedLabelDrafts({})
  }, [
    beginExpandedTableEditorOpen,
    setActiveCityId,
    setCityAssignedLabelDrafts,
    setCityDraftCountryId,
    setCityDraftDescription,
    setCityDraftLevelId,
    setCityDraftName,
    setCityDraftSecondName,
    setEditingCityId,
    setIsCityEditorOpen,
    setPendingCityCellId,
    world.cities,
  ])

  const openLabelGroupEditorFromExpandedTable = useCallback((groupId: string) => {
    if (!world.labelGroups[groupId]) {
      return
    }
    beginExpandedTableEditorOpen()
    setActiveManagedLabelGroupId(groupId)
    setEditingLabelGroupId(groupId)
    setIsLabelGroupEditorOpen(true)
  }, [
    beginExpandedTableEditorOpen,
    setActiveManagedLabelGroupId,
    setEditingLabelGroupId,
    setIsLabelGroupEditorOpen,
    world.labelGroups,
  ])

  const openLabelEditorFromExpandedTable = useCallback((labelId: string) => {
    beginExpandedTableEditorOpen()
    setActiveLabelId(labelId)
    openLabelEditor(labelId)
  }, [
    beginExpandedTableEditorOpen,
    openLabelEditor,
    setActiveLabelId,
  ])

  return {
    closeCountryEditorWithPreviewReset,
    autoComputeCountryDraftColorsFromFill,
    closeProvinceEditorWithPreviewReset,
    closeGovernmentTypeEditorWithPreviewReset,
    isAnyObjectEditorOpen,
    closeExpandedTable,
    beginExpandedTableEditorOpen,
    openCountryEditorFromExpandedTable,
    openProvinceEditorFromExpandedTable,
    openCityEditorFromExpandedTable,
    openLabelGroupEditorFromExpandedTable,
    openLabelEditorFromExpandedTable,
  }
}
