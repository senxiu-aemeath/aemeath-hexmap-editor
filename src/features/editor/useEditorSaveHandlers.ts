import type { Dispatch, SetStateAction } from 'react'

import type {
  LabelGroup,
  Province,
  WorldDocument,
} from '../../domain/world'
import {
  toggleAssignedLabelVisibilityState,
  toggleDraftAssignedLabelState,
  toggleExistingAssignedLabelState,
} from '../labels/editorAssignedLabelHelpers'
import {
  deleteEditingCityLevelState,
  deleteEditingCountryState,
  deleteEditingGovernmentTypeState,
  deleteEditingProvinceState,
  openProvinceCapitalCityState,
  saveCityLevelEditorState,
  saveCountryEditorState,
  saveGovernmentTypeEditorState,
  saveProvinceEditorState,
} from '../political/editorCommandHelpers'

export function useEditorSaveHandlers(args: {
  // world
  world: WorldDocument
  setWorld: Dispatch<SetStateAction<WorldDocument>>

  // active entity IDs & setters
  activeProvinceId: string | null
  setActiveProvinceId: Dispatch<SetStateAction<string | null>>
  activeCountryId: string | null
  setActiveCountryId: Dispatch<SetStateAction<string | null>>
  activeGovernmentTypeId: string | null
  setActiveGovernmentTypeId: Dispatch<SetStateAction<string | null>>
  setActiveCityLevelId: Dispatch<SetStateAction<string | null>>
  setActiveLabelId: Dispatch<SetStateAction<string | null>>

  // editing entity IDs
  editingProvinceId: string | null
  editingCountryId: string | null
  editingGovernmentTypeId: string | null
  editingCityLevelId: string | null
  editingCityId: string | null

  // derived
  editingProvince: Province | null

  // province drafts
  provinceDraftCapitalCityId: string
  provinceDraftColor: string
  provinceDraftCountryId: string
  provinceDraftDescription: string
  provinceDraftName: string
  provinceAssignedLabelDrafts: Record<string, boolean>
  setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  provinceAssignedLabelGroups: LabelGroup[]

  // country drafts
  countryDraftBorderColor: string
  countryDraftColor: string
  countryDraftDescription: string
  countryDraftGovernmentTypeId: string
  countryDraftIconKey: string | null
  countryDraftIsCityState: boolean
  countryDraftName: string
  countryDraftProvinceBorderColor: string
  countryDraftProvinceDefaultColor: string
  countryDraftSecondName: string
  countryAssignedLabelDrafts: Record<string, boolean>
  setCountryAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  countryAssignedLabelGroups: LabelGroup[]

  // government type drafts
  governmentTypeDraftColor: string
  governmentTypeDraftName: string
  governmentTypesLength: number

  // city level drafts
  cityLevelDraftDisplayInCountryInfo: boolean
  cityLevelDraftIconKey: string
  cityLevelDraftIconScalePercent: number
  cityLevelDraftName: string
  cityLevelDraftRank: number
  cityLevelDraftUniquePerCountry: boolean
  cityLevelsLength: number

  // city editor setters (for openProvinceCapitalCity)
  setCityAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
  setCityDraftCountryId: Dispatch<SetStateAction<string>>
  setCityDraftDescription: Dispatch<SetStateAction<string>>
  setCityDraftLevelId: Dispatch<SetStateAction<string>>
  setCityDraftName: Dispatch<SetStateAction<string>>
  setCityDraftSecondName: Dispatch<SetStateAction<string>>
  setEditingCityId: Dispatch<SetStateAction<string | null>>
  setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
  setPendingCityCellId: Dispatch<SetStateAction<string | null>>

  // close / lifecycle functions
  closeProvinceEditorWithPreviewReset: () => void
  closeCountryEditorWithPreviewReset: () => void
  closeGovernmentTypeEditorWithPreviewReset: () => void
  handleCloseCityLevelEditor: () => void

  // label helpers
  requestAssignedLabelRemoval: (
    targetKind: 'city' | 'country' | 'province',
    targetId: string,
    group: LabelGroup,
  ) => void
  syncDraftDefaultIfNeeded: (group: LabelGroup, checked: boolean) => void

  // misc
  iconSourceMap: Record<string, unknown>
}) {
  const {
    world,
    setWorld,
    activeProvinceId,
    setActiveProvinceId,
    activeCountryId,
    setActiveCountryId,
    activeGovernmentTypeId,
    setActiveGovernmentTypeId,
    setActiveCityLevelId,
    setActiveLabelId,
    editingProvinceId,
    editingCountryId,
    editingGovernmentTypeId,
    editingCityLevelId,
    editingCityId,
    editingProvince,
    provinceDraftCapitalCityId,
    provinceDraftColor,
    provinceDraftCountryId,
    provinceDraftDescription,
    provinceDraftName,
    provinceAssignedLabelDrafts,
    setProvinceAssignedLabelDrafts,
    provinceAssignedLabelGroups,
    countryDraftBorderColor,
    countryDraftColor,
    countryDraftDescription,
    countryDraftGovernmentTypeId,
    countryDraftIconKey,
    countryDraftIsCityState,
    countryDraftName,
    countryDraftProvinceBorderColor,
    countryDraftProvinceDefaultColor,
    countryDraftSecondName,
    countryAssignedLabelDrafts,
    setCountryAssignedLabelDrafts,
    countryAssignedLabelGroups,
    governmentTypeDraftColor,
    governmentTypeDraftName,
    governmentTypesLength,
    cityLevelDraftDisplayInCountryInfo,
    cityLevelDraftIconKey,
    cityLevelDraftIconScalePercent,
    cityLevelDraftName,
    cityLevelDraftRank,
    cityLevelDraftUniquePerCountry,
    cityLevelsLength,
    setCityAssignedLabelDrafts,
    setCityDraftCountryId,
    setCityDraftDescription,
    setCityDraftLevelId,
    setCityDraftName,
    setCityDraftSecondName,
    setEditingCityId,
    setIsCityEditorOpen,
    setPendingCityCellId,
    closeProvinceEditorWithPreviewReset,
    closeCountryEditorWithPreviewReset,
    closeGovernmentTypeEditorWithPreviewReset,
    handleCloseCityLevelEditor,
    requestAssignedLabelRemoval,
    syncDraftDefaultIfNeeded,
    iconSourceMap,
  } = args

  const handleOpenProvinceCapitalCity = () => {
    openProvinceCapitalCityState({
      closeProvinceEditorWithPreviewReset,
      provinceDraftCapitalCityId,
      setCityAssignedLabelDrafts,
      setCityDraftCountryId,
      setCityDraftDescription,
      setCityDraftLevelId,
      setCityDraftName,
      setCityDraftSecondName,
      setEditingCityId,
      setIsCityEditorOpen,
      setPendingCityCellId,
      world,
    })
  }

  const handleDeleteEditingProvince = () => {
    deleteEditingProvinceState({
      activeProvinceId,
      closeProvinceEditorWithPreviewReset,
      editingProvinceId,
      setActiveProvinceId,
      setWorld,
    })
  }

  const handleSaveProvinceEditor = () => {
    saveProvinceEditorState({
      closeProvinceEditorWithPreviewReset,
      editingProvince,
      editingProvinceId,
      provinceAssignedLabelDrafts,
      provinceAssignedLabelGroups,
      provinceDraftCapitalCityId,
      provinceDraftColor,
      provinceDraftCountryId,
      provinceDraftDescription,
      provinceDraftName,
      setActiveCountryId,
      setActiveProvinceId,
      setWorld,
    })
  }

  const handleDeleteEditingCountry = () => {
    deleteEditingCountryState({
      activeCountryId,
      closeCountryEditorWithPreviewReset,
      editingCountryId,
      setActiveCountryId,
      setWorld,
    })
  }

  const handleSaveCountryEditor = () => {
    saveCountryEditorState({
      closeCountryEditorWithPreviewReset,
      countryAssignedLabelDrafts,
      countryAssignedLabelGroups,
      countryDraftBorderColor,
      countryDraftColor,
      countryDraftDescription,
      countryDraftGovernmentTypeId,
      countryDraftIconKey,
      countryDraftIsCityState,
      countryDraftName,
      countryDraftProvinceBorderColor,
      countryDraftProvinceDefaultColor,
      countryDraftSecondName,
      editingCountryId,
      setActiveCountryId,
      setWorld,
      world,
    })
  }

  const handleDeleteEditingGovernmentType = () => {
    deleteEditingGovernmentTypeState({
      activeGovernmentTypeId,
      closeGovernmentTypeEditorWithPreviewReset,
      editingGovernmentTypeId,
      setActiveGovernmentTypeId,
      setWorld,
    })
  }

  const handleSaveGovernmentTypeEditor = () => {
    saveGovernmentTypeEditorState({
      closeGovernmentTypeEditorWithPreviewReset,
      editingGovernmentTypeId,
      governmentTypeDraftColor,
      governmentTypeDraftName,
      governmentTypesLength,
      setActiveGovernmentTypeId,
      setWorld,
      world,
    })
  }

  const handleDeleteEditingCityLevel = () => {
    deleteEditingCityLevelState({
      editingCityLevelId,
      handleCloseCityLevelEditor,
      setActiveCityLevelId,
      setWorld,
      world,
    })
  }

  const handleSaveCityLevel = () => {
    saveCityLevelEditorState({
      cityLevelDraftDisplayInCountryInfo,
      cityLevelDraftIconKey,
      cityLevelDraftIconScalePercent,
      cityLevelDraftName,
      cityLevelDraftRank,
      cityLevelDraftUniquePerCountry,
      cityLevelsLength,
      editingCityLevelId,
      handleCloseCityLevelEditor,
      iconSourceMap,
      setActiveCityLevelId,
      setWorld,
      world,
    })
  }

  const handleProvinceExistingAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleExistingAssignedLabelState({
      checked,
      editingTargetId: editingProvinceId,
      group,
      requestAssignedLabelRemoval,
      setActiveLabelId,
      setWorld,
      targetKind: 'province',
      world,
    })
  }

  const handleProvinceDraftAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleDraftAssignedLabelState({
      checked,
      group,
      setDrafts: setProvinceAssignedLabelDrafts,
      syncDraftDefaultIfNeeded,
    })
  }

  const handleCountryAssignedLabelVisibilityToggle = (labelId: string) => {
    toggleAssignedLabelVisibilityState({
      labelId,
      setWorld,
      world,
    })
  }

  const handleCountryExistingAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleExistingAssignedLabelState({
      checked,
      editingTargetId: editingCountryId,
      group,
      requestAssignedLabelRemoval,
      setActiveLabelId,
      setWorld,
      targetKind: 'country',
      world,
    })
  }

  const handleCountryDraftAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleDraftAssignedLabelState({
      checked,
      group,
      setDrafts: setCountryAssignedLabelDrafts,
      syncDraftDefaultIfNeeded,
    })
  }

  const handleCityExistingAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleExistingAssignedLabelState({
      checked,
      editingTargetId: editingCityId,
      group,
      requestAssignedLabelRemoval,
      setActiveLabelId,
      setWorld,
      targetKind: 'city',
      world,
    })
  }

  const handleCityDraftAssignedLabelToggle = (
    group: LabelGroup,
    checked: boolean,
  ) => {
    toggleDraftAssignedLabelState({
      checked,
      group,
      setDrafts: setCityAssignedLabelDrafts,
      syncDraftDefaultIfNeeded,
    })
  }

  return {
    handleOpenProvinceCapitalCity,
    handleDeleteEditingProvince,
    handleSaveProvinceEditor,
    handleDeleteEditingCountry,
    handleSaveCountryEditor,
    handleDeleteEditingGovernmentType,
    handleSaveGovernmentTypeEditor,
    handleDeleteEditingCityLevel,
    handleSaveCityLevel,
    handleProvinceExistingAssignedLabelToggle,
    handleProvinceDraftAssignedLabelToggle,
    handleCountryAssignedLabelVisibilityToggle,
    handleCountryExistingAssignedLabelToggle,
    handleCountryDraftAssignedLabelToggle,
    handleCityExistingAssignedLabelToggle,
    handleCityDraftAssignedLabelToggle,
  }
}
