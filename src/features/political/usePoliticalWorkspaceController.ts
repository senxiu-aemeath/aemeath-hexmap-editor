import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'

import type {
  CityLevelSortDirection,
  CityLevelSortKey,
  CityLevelsSectionSnapshot,
  CityManagementSectionSnapshot,
  CitySortKey,
  CityTypeSortMode,
  CountrySectionSnapshot,
  CountrySortKey,
  PoliticalSubMode,
  PoliticalWorkspaceSnapshot,
  ProvinceSectionSnapshot,
  ProvinceSortKey,
  SortDirection,
} from '../../political/types'
import {
  capturePoliticalWorkspaceSnapshot,
  cloneCityLevelsSectionSnapshot,
  cloneCityManagementSectionSnapshot,
  cloneCountrySectionSnapshot,
  cloneProvinceSectionSnapshot,
} from './politicalWorkspace'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { TerrainBrushContextValue } from '../../state/TerrainBrushContext'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type SnapshotSource = Omit<Parameters<typeof capturePoliticalWorkspaceSnapshot>[0], 'politicalSubMode' | 'activeCountryId' | 'activeProvinceId' | 'activeCityLevelId' | 'activeCityId' | 'cityBrushLevelId'>

interface UsePoliticalWorkspaceControllerArgs {
  contexts: {
    editorMode: Pick<
      EditorModeContextValue,
      | 'editorMode'
      | 'politicalSubMode'
      | 'setEditorMode'
      | 'setPoliticalSubMode'
      | 'setCountryToolMode'
      | 'setProvinceToolMode'
      | 'setPoliticalPaintMode'
      | 'setCityToolMode'
    >
    terrainBrush: Pick<TerrainBrushContextValue, 'setBrushRadius'>
    activeEntity: Pick<
      ActiveEntityContextValue,
      | 'setActiveCountryId'
      | 'setActiveProvinceId'
      | 'setActiveCityLevelId'
      | 'setActiveCityId'
      | 'setCityBrushLevelId'
      | 'activeCountryId'
      | 'activeProvinceId'
      | 'activeCityLevelId'
      | 'activeCityId'
      | 'cityBrushLevelId'
    >
  }
  politicalWorkspaceCacheRef: MutableRefObject<PoliticalWorkspaceSnapshot>
  snapshotSource: SnapshotSource
  actions: {
    setCountryGovernmentTypeFilter: Dispatch<SetStateAction<string>>
    setCountrySortKey: Dispatch<SetStateAction<CountrySortKey>>
    setCountrySortDirection: Dispatch<SetStateAction<SortDirection>>
    setIsCountryListExpanded: Dispatch<SetStateAction<boolean>>
    setProvinceCountryFilter: Dispatch<SetStateAction<string>>
    setProvinceSortKey: Dispatch<SetStateAction<ProvinceSortKey>>
    setProvinceSortDirection: Dispatch<SetStateAction<SortDirection>>
    setIsProvinceListExpanded: Dispatch<SetStateAction<boolean>>
    setCityLevelSortKey: Dispatch<SetStateAction<CityLevelSortKey>>
    setCityLevelSortDirection: Dispatch<SetStateAction<CityLevelSortDirection>>
    setIsCityLevelListExpanded: Dispatch<SetStateAction<boolean>>
    setCityCountryFilter: Dispatch<SetStateAction<string>>
    setCityProvinceFilter: Dispatch<SetStateAction<string>>
    setCityLevelFilter: Dispatch<SetStateAction<string>>
    setCitySortKey: Dispatch<SetStateAction<CitySortKey>>
    setCitySortDirection: Dispatch<SetStateAction<SortDirection>>
    setCityTypeSortMode: Dispatch<SetStateAction<CityTypeSortMode>>
    setIsCityListExpanded: Dispatch<SetStateAction<boolean>>
    setMoveSourceCellIds: Dispatch<SetStateAction<string[]>>
    setIsMoveSelectionMode: Dispatch<SetStateAction<boolean>>
    setPendingMoveTargetCellId: Dispatch<SetStateAction<string | null>>
  }
}

export function usePoliticalWorkspaceController({
  contexts,
  politicalWorkspaceCacheRef,
  snapshotSource,
  actions,
}: UsePoliticalWorkspaceControllerArgs) {
  const {
    editorMode,
    politicalSubMode,
    setEditorMode,
    setPoliticalSubMode,
    setCountryToolMode,
    setProvinceToolMode,
    setPoliticalPaintMode,
    setCityToolMode,
  } = contexts.editorMode
  const { setBrushRadius } = contexts.terrainBrush
  const {
    setActiveCountryId,
    setActiveProvinceId,
    setActiveCityLevelId,
    setActiveCityId,
    setCityBrushLevelId,
    activeCountryId,
    activeProvinceId,
    activeCityLevelId,
    activeCityId,
    cityBrushLevelId,
  } = contexts.activeEntity
  const {
    setCountryGovernmentTypeFilter,
    setCountrySortKey,
    setCountrySortDirection,
    setIsCountryListExpanded,
    setProvinceCountryFilter,
    setProvinceSortKey,
    setProvinceSortDirection,
    setIsProvinceListExpanded,
    setCityLevelSortKey,
    setCityLevelSortDirection,
    setIsCityLevelListExpanded,
    setCityCountryFilter,
    setCityProvinceFilter,
    setCityLevelFilter,
    setCitySortKey,
    setCitySortDirection,
    setCityTypeSortMode,
    setIsCityListExpanded,
    setMoveSourceCellIds,
    setIsMoveSelectionMode,
    setPendingMoveTargetCellId,
  } = actions
  const {
    governmentTypeFilter,
    provinceCountryFilter,
    countrySortKey,
    countrySortDirection,
    isCountryListExpanded,
    provinceSortKey,
    provinceSortDirection,
    isProvinceListExpanded,
    cityLevelSortKey,
    cityLevelSortDirection,
    isCityLevelListExpanded,
    cityCountryFilter,
    cityProvinceFilter,
    cityLevelFilter,
    citySortKey,
    citySortDirection,
    cityTypeSortMode,
    isCityListExpanded,
  } = snapshotSource

  const clearMoveSelection = useCallback(() => {
    setMoveSourceCellIds([])
    setIsMoveSelectionMode(false)
    setPendingMoveTargetCellId(null)
  }, [
    setIsMoveSelectionMode,
    setMoveSourceCellIds,
    setPendingMoveTargetCellId,
  ])

  const clearPoliticalInteraction = useCallback(() => {
    setCountryToolMode('view')
    setProvinceToolMode('view')
    setPoliticalPaintMode('radius_0')
    setBrushRadius(0)
    setCityToolMode('view')
  }, [
    setBrushRadius,
    setCityToolMode,
    setCountryToolMode,
    setPoliticalPaintMode,
    setProvinceToolMode,
  ])

  const cachePoliticalWorkspaceSnapshot = useCallback(() => {
    politicalWorkspaceCacheRef.current = capturePoliticalWorkspaceSnapshot({
      politicalSubMode,
      activeCountryId,
      activeProvinceId,
      governmentTypeFilter,
      provinceCountryFilter,
      countrySortKey,
      countrySortDirection,
      isCountryListExpanded,
      provinceSortKey,
      provinceSortDirection,
      isProvinceListExpanded,
      activeCityLevelId,
      cityLevelSortKey,
      cityLevelSortDirection,
      isCityLevelListExpanded,
      activeCityId,
      cityCountryFilter,
      cityProvinceFilter,
      cityLevelFilter,
      citySortKey,
      citySortDirection,
      cityTypeSortMode,
      cityBrushLevelId,
      isCityListExpanded,
    })
  }, [
    activeCityId,
    activeCityLevelId,
    activeCountryId,
    activeProvinceId,
    cityBrushLevelId,
    cityCountryFilter,
    cityLevelFilter,
    cityLevelSortDirection,
    cityLevelSortKey,
    cityProvinceFilter,
    citySortDirection,
    citySortKey,
    cityTypeSortMode,
    countrySortDirection,
    countrySortKey,
    governmentTypeFilter,
    isCityLevelListExpanded,
    isCityListExpanded,
    isCountryListExpanded,
    isProvinceListExpanded,
    politicalSubMode,
    politicalWorkspaceCacheRef,
    provinceCountryFilter,
    provinceSortDirection,
    provinceSortKey,
  ])

  const restoreCountrySectionWorkspace = useCallback((snapshot: CountrySectionSnapshot) => {
    const nextSnapshot = cloneCountrySectionSnapshot(snapshot)
    setActiveCountryId(nextSnapshot.activeCountryId)
    setCountryGovernmentTypeFilter(nextSnapshot.governmentTypeFilter)
    setCountrySortKey(nextSnapshot.sortKey)
    setCountrySortDirection(nextSnapshot.sortDirection)
    setIsCountryListExpanded(nextSnapshot.listExpanded)
  }, [
    setActiveCountryId,
    setCountryGovernmentTypeFilter,
    setCountrySortDirection,
    setCountrySortKey,
    setIsCountryListExpanded,
  ])

  const restoreProvinceSectionWorkspace = useCallback((snapshot: ProvinceSectionSnapshot) => {
    const nextSnapshot = cloneProvinceSectionSnapshot(snapshot)
    setActiveProvinceId(nextSnapshot.activeProvinceId)
    setProvinceCountryFilter(nextSnapshot.countryFilter)
    setProvinceSortKey(nextSnapshot.sortKey)
    setProvinceSortDirection(nextSnapshot.sortDirection)
    setIsProvinceListExpanded(nextSnapshot.listExpanded)
  }, [
    setActiveProvinceId,
    setIsProvinceListExpanded,
    setProvinceCountryFilter,
    setProvinceSortDirection,
    setProvinceSortKey,
  ])

  const restoreCityLevelsSectionWorkspace = useCallback((snapshot: CityLevelsSectionSnapshot) => {
    const nextSnapshot = cloneCityLevelsSectionSnapshot(snapshot)
    setActiveCityLevelId(nextSnapshot.activeCityLevelId)
    setCityLevelSortKey(nextSnapshot.sortKey)
    setCityLevelSortDirection(nextSnapshot.sortDirection)
    setIsCityLevelListExpanded(nextSnapshot.listExpanded)
  }, [
    setActiveCityLevelId,
    setCityLevelSortDirection,
    setCityLevelSortKey,
    setIsCityLevelListExpanded,
  ])

  const restoreCityManagementSectionWorkspace = useCallback((snapshot: CityManagementSectionSnapshot) => {
    const nextSnapshot = cloneCityManagementSectionSnapshot(snapshot)
    setActiveCityId(nextSnapshot.activeCityId)
    setCityCountryFilter(nextSnapshot.cityCountryFilter)
    setCityProvinceFilter(nextSnapshot.cityProvinceFilter)
    setCityLevelFilter(nextSnapshot.cityLevelFilter)
    setCitySortKey(nextSnapshot.citySortKey)
    setCitySortDirection(nextSnapshot.citySortDirection)
    setCityTypeSortMode(nextSnapshot.cityTypeSortMode)
    setCityBrushLevelId(nextSnapshot.cityBrushLevelId)
    setIsCityListExpanded(nextSnapshot.listExpanded)
  }, [
    setActiveCityId,
    setCityBrushLevelId,
    setCityCountryFilter,
    setCityLevelFilter,
    setCityProvinceFilter,
    setCitySortDirection,
    setCitySortKey,
    setCityTypeSortMode,
    setIsCityListExpanded,
  ])

  const applyPoliticalWorkspaceSnapshot = useCallback((snapshot: PoliticalWorkspaceSnapshot) => {
    setPoliticalSubMode(snapshot.subMode)
    restoreCountrySectionWorkspace(snapshot.countrySection)
    restoreProvinceSectionWorkspace(snapshot.provinceSection)
    restoreCityLevelsSectionWorkspace(snapshot.cityLevelsSection)
    restoreCityManagementSectionWorkspace(snapshot.cityManagementSection)
  }, [
    restoreCityLevelsSectionWorkspace,
    restoreCityManagementSectionWorkspace,
    restoreCountrySectionWorkspace,
    restoreProvinceSectionWorkspace,
    setPoliticalSubMode,
  ])

  const handleEditorModeChange = useCallback((nextMode: EditorMode) => {
    cachePoliticalWorkspaceSnapshot()
    clearPoliticalInteraction()
    if (!(editorMode === 'move' && nextMode === 'move')) {
      clearMoveSelection()
    }
    setEditorMode(nextMode)
    if (nextMode === 'political') {
      applyPoliticalWorkspaceSnapshot(politicalWorkspaceCacheRef.current)
    }
  }, [
    applyPoliticalWorkspaceSnapshot,
    cachePoliticalWorkspaceSnapshot,
    clearMoveSelection,
    clearPoliticalInteraction,
    editorMode,
    politicalWorkspaceCacheRef,
    setEditorMode,
  ])

  const handlePoliticalSubModeChange = useCallback((nextSubMode: PoliticalSubMode) => {
    cachePoliticalWorkspaceSnapshot()
    clearPoliticalInteraction()
    setPoliticalSubMode(nextSubMode)
  }, [
    cachePoliticalWorkspaceSnapshot,
    clearPoliticalInteraction,
    setPoliticalSubMode,
  ])

  return {
    clearMoveSelection,
    clearPoliticalInteraction,
    cachePoliticalWorkspaceSnapshot,
    restoreCountrySectionWorkspace,
    restoreProvinceSectionWorkspace,
    restoreCityLevelsSectionWorkspace,
    restoreCityManagementSectionWorkspace,
    applyPoliticalWorkspaceSnapshot,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
  }
}
