import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { City, Label, LabelGroup } from '../../domain/world'
import {
  openCityEditor,
  openCountryEditor,
  openProvinceEditor,
} from '../political/editors/objectEditorOpeners'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { WorldContextValue } from '../../state/WorldContext'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

type DoubleOpenMode = 'always' | 'matched' | 'never'

interface LabelEditorOpenSnapshotLike {
  label: Label
  labelGroups: Record<string, LabelGroup>
}

interface UseCanvasDoubleActivateControllerArgs {
  contexts: {
    editorMode: Pick<
      EditorModeContextValue,
      'editorMode' | 'politicalSubMode' | 'countryToolMode' | 'provinceToolMode'
    >
    world: Pick<WorldContextValue, 'world'>
    activeEntity: Pick<
      ActiveEntityContextValue,
      | 'setActiveCityId'
      | 'setActiveCountryId'
      | 'setActiveManagedLabelGroupId'
      | 'setActiveProvinceId'
      | 'setActiveLabelId'
    >
  }
  state: {
    cityByCellId: Map<string, City>
    cityDoubleOpenMode: DoubleOpenMode
    countryDoubleOpenMode: DoubleOpenMode
    labelDoubleOpenMode: DoubleOpenMode
    provinceDoubleOpenMode: DoubleOpenMode
  }
  refs: {
    labelEditorOpenSnapshotRef: MutableRefObject<LabelEditorOpenSnapshotLike | null>
    labelGroupEditorOpenSnapshotRef: MutableRefObject<LabelGroup | null>
  }
  actions: {
    closeObjectEditors: () => void
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
    setEditingCityId: Dispatch<SetStateAction<string | null>>
    setEditingCountryId: Dispatch<SetStateAction<string | null>>
    setEditingLabelGroupId: Dispatch<SetStateAction<string | null>>
    setEditingLabelId: Dispatch<SetStateAction<string | null>>
    setEditingProvinceId: Dispatch<SetStateAction<string | null>>
    setIsCityEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsCountryEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsLabelEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsLabelGroupEditorOpen: Dispatch<SetStateAction<boolean>>
    setIsProvinceEditorOpen: Dispatch<SetStateAction<boolean>>
    setPendingCityCellId: Dispatch<SetStateAction<string | null>>
    setProvinceAssignedLabelDrafts: Dispatch<SetStateAction<Record<string, boolean>>>
    setProvinceDraftCapitalCityId: Dispatch<SetStateAction<string>>
    setProvinceDraftColor: Dispatch<SetStateAction<string>>
    setProvinceDraftCountryId: Dispatch<SetStateAction<string>>
    setProvinceDraftDescription: Dispatch<SetStateAction<string>>
    setProvinceDraftName: Dispatch<SetStateAction<string>>
  }
}

export function useCanvasDoubleActivateController({
  contexts,
  state,
  refs,
  actions,
}: UseCanvasDoubleActivateControllerArgs) {
  const {
    editorMode,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
  } = contexts.editorMode
  const { world } = contexts.world
  const {
    setActiveCityId,
    setActiveCountryId,
    setActiveManagedLabelGroupId,
    setActiveProvinceId,
    setActiveLabelId,
  } = contexts.activeEntity
  const {
    cityByCellId,
    cityDoubleOpenMode,
    countryDoubleOpenMode,
    labelDoubleOpenMode,
    provinceDoubleOpenMode,
  } = state
  const {
    labelEditorOpenSnapshotRef,
    labelGroupEditorOpenSnapshotRef,
  } = refs
  const {
    closeObjectEditors,
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
    setEditingCityId,
    setEditingCountryId,
    setEditingLabelGroupId,
    setEditingLabelId,
    setEditingProvinceId,
    setIsCityEditorOpen,
    setIsCountryEditorOpen,
    setIsLabelEditorOpen,
    setIsLabelGroupEditorOpen,
    setIsProvinceEditorOpen,
    setPendingCityCellId,
    setProvinceAssignedLabelDrafts,
    setProvinceDraftCapitalCityId,
    setProvinceDraftColor,
    setProvinceDraftCountryId,
    setProvinceDraftDescription,
    setProvinceDraftName,
  } = actions

  const openLabelEditor = (labelId: string) => {
    const label = world.labels[labelId]
    if (!label) {
      return
    }

    closeObjectEditors()
    setActiveLabelId(labelId)
    setEditingLabelId(labelId)
    labelEditorOpenSnapshotRef.current = {
      label: structuredClone(label),
      labelGroups: structuredClone(world.labelGroups),
    }
    setIsLabelEditorOpen(true)
  }

  const openLabelGroupEditor = (groupId: string) => {
    const group = world.labelGroups[groupId]
    if (!group) {
      return
    }

    closeObjectEditors()
    setActiveManagedLabelGroupId(groupId)
    setEditingLabelGroupId(groupId)
    labelGroupEditorOpenSnapshotRef.current = structuredClone(group)
    setIsLabelGroupEditorOpen(true)
  }

  const handleCanvasDoubleActivate = (target: { labelId?: string; cellId?: string }) => {
    if (target.labelId) {
      if (labelDoubleOpenMode === 'never') {
        return
      }
      if (labelDoubleOpenMode === 'matched' && editorMode !== 'label') {
        return
      }
      openLabelEditor(target.labelId)
      return
    }

    if (!target.cellId) {
      return
    }

    const isTerrainDrawingMode = editorMode === 'surface'
    const isCountryDrawingMode =
      editorMode === 'political' && politicalSubMode === 'country' && countryToolMode !== 'view'
    const isProvinceDrawingMode =
      editorMode === 'political' && politicalSubMode === 'province' && provinceToolMode !== 'view'
    const shouldTreatAlwaysAsMatched =
      isTerrainDrawingMode || isCountryDrawingMode || isProvinceDrawingMode
    const effectiveCountryDoubleOpenMode =
      shouldTreatAlwaysAsMatched && countryDoubleOpenMode === 'always'
        ? 'matched'
        : countryDoubleOpenMode
    const effectiveProvinceDoubleOpenMode =
      shouldTreatAlwaysAsMatched && provinceDoubleOpenMode === 'always'
        ? 'matched'
        : provinceDoubleOpenMode

    const city = cityByCellId.get(target.cellId)
    if (
      city &&
      (cityDoubleOpenMode === 'always' ||
        (cityDoubleOpenMode === 'matched' &&
          editorMode === 'political' &&
          politicalSubMode === 'city'))
    ) {
      setActiveCityId(city.id)
      closeObjectEditors()
      openCityEditor(
        city,
        setIsCityEditorOpen,
        setEditingCityId,
        setPendingCityCellId,
        setCityDraftName,
        setCityDraftSecondName,
        setCityDraftCountryId,
        setCityDraftLevelId,
        setCityDraftDescription,
        setCityAssignedLabelDrafts,
      )
      return
    }

    const provinceId = world.provinceAssignments[target.cellId] ?? null
    const province = provinceId ? world.provinces[provinceId] : null
    if (
      province &&
      (effectiveProvinceDoubleOpenMode === 'always' ||
        (effectiveProvinceDoubleOpenMode === 'matched' &&
          editorMode === 'political' &&
          politicalSubMode === 'province'))
    ) {
      setActiveProvinceId(province.id)
      closeObjectEditors()
      openProvinceEditor(
        province,
        setIsProvinceEditorOpen,
        setEditingProvinceId,
        setProvinceDraftName,
        setProvinceDraftColor,
        setProvinceDraftCountryId,
        setProvinceDraftCapitalCityId,
        setProvinceDraftDescription,
        setProvinceAssignedLabelDrafts,
        true,
      )
      return
    }

    const countryId = world.countryAssignments[target.cellId] ?? null
    const country = countryId ? world.countries[countryId] : null
    if (
      country &&
      (effectiveCountryDoubleOpenMode === 'always' ||
        (effectiveCountryDoubleOpenMode === 'matched' &&
          editorMode === 'political' &&
          politicalSubMode === 'country'))
    ) {
      setActiveCountryId(country.id)
      closeObjectEditors()
      openCountryEditor(
        country,
        setIsCountryEditorOpen,
        setEditingCountryId,
        setCountryDraftName,
        setCountryDraftSecondName,
        setCountryDraftIconKey,
        setCountryDraftColor,
        setCountryDraftBorderColor,
        setCountryDraftProvinceDefaultColor,
        setCountryDraftProvinceBorderColor,
        setCountryDraftGovernmentTypeId,
        setCountryDraftIsCityState,
        setCountryDraftDescription,
        setCountryAssignedLabelDrafts,
      )
      return
    }

    if (editorMode !== 'political') {
      return
    }

    if (politicalSubMode === 'city') {
      if (!city || cityDoubleOpenMode === 'never') {
        return
      }
      setActiveCityId(city.id)
      closeObjectEditors()
      openCityEditor(
        city,
        setIsCityEditorOpen,
        setEditingCityId,
        setPendingCityCellId,
        setCityDraftName,
        setCityDraftSecondName,
        setCityDraftCountryId,
        setCityDraftLevelId,
        setCityDraftDescription,
        setCityAssignedLabelDrafts,
      )
      return
    }

    if (politicalSubMode === 'country') {
      if (!country || effectiveCountryDoubleOpenMode === 'never') {
        return
      }
      setActiveCountryId(country.id)
      closeObjectEditors()
      openCountryEditor(
        country,
        setIsCountryEditorOpen,
        setEditingCountryId,
        setCountryDraftName,
        setCountryDraftSecondName,
        setCountryDraftIconKey,
        setCountryDraftColor,
        setCountryDraftBorderColor,
        setCountryDraftProvinceDefaultColor,
        setCountryDraftProvinceBorderColor,
        setCountryDraftGovernmentTypeId,
        setCountryDraftIsCityState,
        setCountryDraftDescription,
        setCountryAssignedLabelDrafts,
      )
      return
    }

    if (politicalSubMode === 'province') {
      if (!province || effectiveProvinceDoubleOpenMode === 'never') {
        return
      }
      setActiveProvinceId(province.id)
      closeObjectEditors()
      openProvinceEditor(
        province,
        setIsProvinceEditorOpen,
        setEditingProvinceId,
        setProvinceDraftName,
        setProvinceDraftColor,
        setProvinceDraftCountryId,
        setProvinceDraftCapitalCityId,
        setProvinceDraftDescription,
        setProvinceAssignedLabelDrafts,
        false,
      )
    }
  }

  return {
    openLabelEditor,
    openLabelGroupEditor,
    handleCanvasDoubleActivate,
  }
}
