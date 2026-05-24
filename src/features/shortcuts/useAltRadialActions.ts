import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'

import type { HexCell } from '../../domain/grid'
import { clampSurfaceElevation } from '../../domain/world'
import type {
  CityToolMode,
  PoliticalPaintMode,
  PoliticalSubMode,
} from '../../political/types'
import type {
  TerrainBrushKind,
  TerrainPaintMode,
} from '../../components/surface/terrainBrush'
import { getTerrainBrushElevationRange } from '../../components/surface/terrainBrush'
import type { ShortcutHintScope } from './shortcutHints'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { TerrainBrushContextValue } from '../../state/TerrainBrushContext'
import type { TerrainStyleContextValue } from '../../state/TerrainStyleContext'
import type { WorldContextValue } from '../../state/WorldContext'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type LayerId =
  | 'terrainFill'
  | 'terrainEdge'
  | 'countryFill'
  | 'countryBorder'
  | 'provinceFill'
  | 'provinceBorder'
  | 'cities'
  | 'labels'
  | 'overlay'
type LabelAnchorDisplayMode = 'none' | 'all' | 'selected'
type MovePayload = 'terrain' | 'political'
type MoveOperation = 'move' | 'copy'
type ExpandedTableId =
  | 'cities'
  | 'countries'
  | 'provinces'
  | 'label-groups'
  | 'text-labels'
  | 'icon-labels'
  | 'icons'
  | 'fonts'
  | null
type TerrainSection = 'display' | 'paint' | 'base' | 'topography'
type AltRadialMenuId =
  | 'root'
  | 'switch-mode'
  | 'world-submaps'
  | 'world-layers'
  | 'world-label-groups'
  | 'world-sections'
  | 'political-paint'
  | 'political-tool'
  | 'political-country-target'
  | 'political-province-target'
  | 'city-levels'
  | 'terrain-paint'
  | 'terrain-view'
  | 'terrain-brush'
  | 'terrain-elevation'
  | 'move'
  | 'move-selection'
  | 'move-operation'
  | 'move-payload'
  | 'city-place'
  | 'label-create'
  | 'label-anchors'
  | 'label-groups'
  | 'label-tables'
type AltRadialActionId =
  | AltRadialMenuId
  | 'view'
  | 'paint'
  | 'erase'
  | 'move'
  | 'city-place'
  | 'new-selection'
  | 'surface-display'
  | 'topography-display'
  | 'terrain-brush-land'
  | 'terrain-brush-water'
  | 'terrain-brush-dark-water'
  | 'terrain-brush-empty'
  | 'terrain-brush-unknown'
  | 'terrain-elevation-down'
  | 'terrain-elevation-up'
  | 'terrain-elevation-zero'
  | 'terrain-elevation-snow'
  | 'radius_0'
  | 'radius_1'
  | 'radius_2'
  | 'radius_3'
  | 'fill_type'
  | 'fill_height'
  | 'editor-world'
  | 'editor-surface'
  | 'editor-country'
  | 'editor-province'
  | 'editor-city'
  | 'editor-label'
  | 'editor-move'
  | 'move-apply'
  | 'move-clear'
  | 'move-operation-move'
  | 'move-operation-copy'
  | 'move-payload-terrain'
  | 'move-payload-political'
  | 'city-level-capital'
  | 'city-level-province_capital'
  | 'city-level-town'
  | 'city-level-village'
  | 'create-country'
  | 'create-province'
  | 'world-full-map'
  | 'world-new-submap'
  | 'world-section-info'
  | 'world-section-style'
  | 'world-section-grid'
  | 'label-create-free'
  | 'label-create-free-icon'
  | 'label-create-city'
  | 'label-create-country'
  | 'label-create-province'
  | 'label-create-country-icon'
  | 'label-anchor-none'
  | 'label-anchor-all'
  | 'label-anchor-selected'
  | 'label-create-free-group'
  | 'label-create-assigned-group'
  | 'label-groups-table'
  | 'label-text-table'
  | 'label-icon-table'
  | `world-submap:${string}`
  | `world-layer:${LayerId}`
  | `world-label-group:${string}`
  | `political-country:${string}`
  | `political-province:${string}`
  | `city-level:${string}`
  | `label-group:${string}`

type Setter<T> = Dispatch<SetStateAction<T>>

const ROOT_ACTION_IDS = new Set<AltRadialActionId>([
  'paint',
  'view',
  'erase',
  'move',
  'city-place',
  'new-selection',
  'switch-mode',
  'create-country',
  'create-province',
  'world-submaps',
  'world-layers',
  'world-label-groups',
  'world-sections',
  'terrain-view',
  'terrain-paint',
  'terrain-brush',
  'terrain-elevation',
  'political-tool',
  'political-paint',
  'political-country-target',
  'political-province-target',
  'city-levels',
  'move-selection',
  'move-operation',
  'move-payload',
  'label-create',
  'label-anchors',
  'label-groups',
  'label-tables',
])

interface UseAltRadialActionsArgs {
  contexts: {
    editorMode: Pick<
      EditorModeContextValue,
      | 'editorMode'
      | 'politicalSubMode'
      | 'countryToolMode'
      | 'provinceToolMode'
      | 'setCityToolMode'
      | 'setCountryToolMode'
      | 'setPoliticalPaintMode'
      | 'setProvinceToolMode'
    >
    terrainBrush: Pick<
      TerrainBrushContextValue,
      | 'terrainBrushKind'
      | 'setBrushRadius'
      | 'setTerrainBrushElevation'
      | 'setTerrainBrushKind'
      | 'setTerrainDisplayMode'
      | 'setTerrainPaintMode'
    >
    terrainStyle: Pick<TerrainStyleContextValue, 'terrainSnowLineElevation'>
    world: Pick<WorldContextValue, 'world'>
    activeEntity: Pick<
      ActiveEntityContextValue,
      | 'setActiveCountryId'
      | 'setActiveManagedLabelGroupId'
      | 'setActiveProvinceId'
      | 'setActiveSubmapId'
      | 'setCityBrushLevelId'
      | 'setActiveCityLevelId'
      | 'setIsSubmapSelectionMode'
    >
  }
  state: {
    altRadialMenu: AltRadialMenuId
    effectiveMoveTargetCell: HexCell | null
    movePayload: MovePayload
    sortedProvinces: Array<{ id: string; countryId: string | null }>
  }
  refs: {
    suppressAltUntilReleaseRef: MutableRefObject<boolean>
  }
  actions: {
    activateFullSubmapView: () => void
    activateShortcutSection: (key: string) => void
    adjustTerrainBrushElevation: (delta: number) => void
    applyMoveOperation: (targetCellOverride?: HexCell | null) => void
    beginCreateCountry: () => void
    beginCreateProvince: () => void
    beginCreateSubmapSelection: () => void
    clearMoveSelection: () => void
    createAndEditLabelGroup: (kind: 'free' | 'assigned') => void
    createNewFreeIconLabel: () => void
    createNewFreeLabel: () => void
    createOrSelectCityLabel: () => void
    createOrSelectCountryIconLabel: () => void
    createOrSelectCountryLabel: () => void
    createOrSelectProvinceLabel: () => void
    focusTerrainSection: (section: TerrainSection) => void
    handleEditorModeChange: (nextMode: EditorMode) => void
    handlePoliticalSubModeChange: (nextSubMode: PoliticalSubMode) => void
    handleSetCityToolMode: (mode: CityToolMode) => void
    toggleLabelGroupVisibilityById: (groupId: string) => void
    toggleLayerVisibilityById: (layerId: LayerId) => void
    setAltRadialMenu: Setter<AltRadialMenuId>
    setAltShortcutScope: Setter<ShortcutHintScope>
    setExpandedTableId: Setter<ExpandedTableId>
    setIsAltRadialSuppressed: Setter<boolean>
    setIsAltShortcutOverlayOpen: Setter<boolean>
    setIsLabelGroupsSectionExpanded: Setter<boolean>
    setIsLabelsSectionExpanded: Setter<boolean>
    setIsMoveSelectionMode: Setter<boolean>
    setLabelAnchorDisplayMode: Setter<LabelAnchorDisplayMode>
    setMoveOperation: Setter<MoveOperation>
    setMovePayload: Setter<MovePayload>
    setPendingMoveTargetCellId: Setter<string | null>
    setWorldLabelGroupShortcutTargetId: Setter<string | null>
    setWorldLayerShortcutTargetId: Setter<LayerId | null>
    setMoveSourceCellIds: Setter<string[]>
  }
}

export function useAltRadialActions({
  contexts,
  state,
  refs,
  actions,
}: UseAltRadialActionsArgs) {
  const {
    editorMode,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    setCityToolMode,
    setCountryToolMode,
    setPoliticalPaintMode,
    setProvinceToolMode,
  } = contexts.editorMode
  const {
    terrainBrushKind,
    setBrushRadius,
    setTerrainBrushElevation,
    setTerrainBrushKind,
    setTerrainDisplayMode,
    setTerrainPaintMode,
  } = contexts.terrainBrush
  const { terrainSnowLineElevation } = contexts.terrainStyle
  const { world } = contexts.world
  const {
    setActiveCountryId,
    setActiveManagedLabelGroupId,
    setActiveProvinceId,
    setActiveSubmapId,
    setCityBrushLevelId,
    setActiveCityLevelId,
    setIsSubmapSelectionMode,
  } = contexts.activeEntity
  const {
    altRadialMenu,
    effectiveMoveTargetCell,
    movePayload,
    sortedProvinces,
  } = state
  const { suppressAltUntilReleaseRef } = refs
  const {
    activateFullSubmapView,
    activateShortcutSection,
    adjustTerrainBrushElevation,
    applyMoveOperation,
    beginCreateCountry,
    beginCreateProvince,
    beginCreateSubmapSelection,
    clearMoveSelection,
    createAndEditLabelGroup,
    createNewFreeIconLabel,
    createNewFreeLabel,
    createOrSelectCityLabel,
    createOrSelectCountryIconLabel,
    createOrSelectCountryLabel,
    createOrSelectProvinceLabel,
    focusTerrainSection,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
    handleSetCityToolMode,
    toggleLabelGroupVisibilityById,
    toggleLayerVisibilityById,
    setAltRadialMenu,
    setAltShortcutScope,
    setExpandedTableId,
    setIsAltRadialSuppressed,
    setIsAltShortcutOverlayOpen,
    setIsLabelGroupsSectionExpanded,
    setIsLabelsSectionExpanded,
    setIsMoveSelectionMode,
    setLabelAnchorDisplayMode,
    setMoveOperation,
    setMovePayload,
    setPendingMoveTargetCellId,
    setWorldLabelGroupShortcutTargetId,
    setWorldLayerShortcutTargetId,
    setMoveSourceCellIds,
  } = actions

  const setAltRadialMenuInPlace = useCallback((menuId: AltRadialMenuId) => {
    setAltRadialMenu(menuId)
    setIsAltRadialSuppressed(false)
  }, [
    setAltRadialMenu,
    setIsAltRadialSuppressed,
  ])

  const closeAltRadialMenuInPlace = useCallback(() => {
    setIsAltShortcutOverlayOpen(false)
    setAltShortcutScope('sections')
    setAltRadialMenuInPlace('root')
  }, [
    setAltRadialMenuInPlace,
    setAltShortcutScope,
    setIsAltShortcutOverlayOpen,
  ])

  const closeAltRadialMenu = useCallback((suppressUntilRelease: boolean = true) => {
    if (suppressUntilRelease) {
      suppressAltUntilReleaseRef.current = true
    }
    closeAltRadialMenuInPlace()
  }, [
    closeAltRadialMenuInPlace,
    suppressAltUntilReleaseRef,
  ])

  const beginAltRadialNewSelection = useCallback(() => {
    handleEditorModeChange('move')
    setIsMoveSelectionMode(true)
    setMoveSourceCellIds([])
    setPendingMoveTargetCellId(null)
  }, [
    handleEditorModeChange,
    setIsMoveSelectionMode,
    setMoveSourceCellIds,
    setPendingMoveTargetCellId,
  ])

  const setTerrainBrushKindWithClampedElevation = useCallback((kind: TerrainBrushKind) => {
    setTerrainBrushKind(kind)
    if (kind === 'empty' || kind === 'unknown') {
      return
    }
    const range = getTerrainBrushElevationRange(kind)
    setTerrainBrushElevation((current) => Math.min(Math.max(current, range.min), range.max))
  }, [
    setTerrainBrushElevation,
    setTerrainBrushKind,
  ])

  const setPoliticalPaintModeWithRadius = useCallback((mode: PoliticalPaintMode) => {
    setPoliticalPaintMode(mode)
    if (mode.startsWith('radius_')) {
      setBrushRadius(Number(mode.slice(-1)))
    }
  }, [
    setBrushRadius,
    setPoliticalPaintMode,
  ])

  const setTerrainPaintModeWithRadius = useCallback((mode: TerrainPaintMode) => {
    setTerrainPaintMode(mode)
    if (mode.startsWith('radius_')) {
      setBrushRadius(Number(mode.slice(-1)))
    }
  }, [
    setBrushRadius,
    setTerrainPaintMode,
  ])

  const activateAltRadialRootAction = useCallback((actionId: AltRadialActionId) => {
    if (
      actionId === 'world-submaps' ||
      actionId === 'world-layers' ||
      actionId === 'world-label-groups' ||
      actionId === 'world-sections' ||
      actionId === 'terrain-view' ||
      actionId === 'terrain-paint' ||
      actionId === 'terrain-brush' ||
      actionId === 'terrain-elevation' ||
      actionId === 'political-tool' ||
      actionId === 'political-paint' ||
      actionId === 'political-country-target' ||
      actionId === 'political-province-target' ||
      actionId === 'city-levels' ||
      actionId === 'move-selection' ||
      actionId === 'move-operation' ||
      actionId === 'move-payload' ||
      actionId === 'label-create' ||
      actionId === 'label-anchors' ||
      actionId === 'label-groups' ||
      actionId === 'label-tables' ||
      actionId === 'switch-mode'
    ) {
      setAltRadialMenuInPlace(actionId)
      return
    }

    if (actionId === 'paint') {
      if (editorMode === 'surface') {
        setAltRadialMenuInPlace('terrain-paint')
        return
      }
      if (editorMode === 'political' && politicalSubMode !== 'city') {
        if (politicalSubMode === 'country') {
          setCountryToolMode('paint')
        } else {
          setProvinceToolMode('paint')
        }
        setAltRadialMenuInPlace('root')
        return
      }
    }

    if (actionId === 'move') {
      handleEditorModeChange('move')
      setAltRadialMenuInPlace('root')
      return
    }

    if (actionId === 'city-place') {
      handleEditorModeChange('political')
      handlePoliticalSubModeChange('city')
      handleSetCityToolMode('place_city')
      setAltRadialMenuInPlace('root')
      return
    }

    if (actionId === 'new-selection') {
      beginAltRadialNewSelection()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'create-country') {
      beginCreateCountry()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'create-province') {
      handleEditorModeChange('political')
      handlePoliticalSubModeChange('province')
      beginCreateProvince()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'erase' && editorMode === 'political' && politicalSubMode !== 'city') {
      if (politicalSubMode === 'country') {
        setCountryToolMode('erase')
      } else {
        setProvinceToolMode('erase')
      }
      return
    }

    if (actionId === 'view') {
      if (editorMode === 'political') {
        if (politicalSubMode === 'city') {
          setCityToolMode('view')
        } else if (politicalSubMode === 'country') {
          setCountryToolMode('view')
        } else {
          setProvinceToolMode('view')
        }
        setAltRadialMenuInPlace('root')
        return
      }
      closeAltRadialMenu(false)
    }
  }, [
    beginAltRadialNewSelection,
    beginCreateCountry,
    beginCreateProvince,
    closeAltRadialMenu,
    editorMode,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
    handleSetCityToolMode,
    politicalSubMode,
    setAltRadialMenuInPlace,
    setCityToolMode,
    setCountryToolMode,
    setProvinceToolMode,
  ])

  const handleAltRadialAction = useCallback((actionId: AltRadialActionId) => {
    if (ROOT_ACTION_IDS.has(actionId)) {
      activateAltRadialRootAction(actionId)
      return
    }

    if (actionId === 'world-full-map') {
      handleEditorModeChange('world')
      activateFullSubmapView()
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'world-new-submap') {
      handleEditorModeChange('world')
      beginCreateSubmapSelection()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'world-section-info') {
      handleEditorModeChange('world')
      activateShortcutSection('1')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'world-section-style') {
      handleEditorModeChange('world')
      activateShortcutSection('2')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'world-section-grid') {
      handleEditorModeChange('world')
      activateShortcutSection('3')
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('world-submap:')) {
      handleEditorModeChange('world')
      const submapId = actionId.slice('world-submap:'.length)
      if (world.submaps[submapId]) {
        setActiveSubmapId(submapId)
        setIsSubmapSelectionMode(false)
      }
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('world-layer:')) {
      const layerId = actionId.slice('world-layer:'.length) as LayerId
      setWorldLayerShortcutTargetId(layerId)
      toggleLayerVisibilityById(layerId)
      return
    }

    if (actionId.startsWith('world-label-group:')) {
      const groupId = actionId.slice('world-label-group:'.length)
      setWorldLabelGroupShortcutTargetId(groupId)
      toggleLabelGroupVisibilityById(groupId)
      return
    }

    if (actionId === 'label-create-free') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createNewFreeLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-free-icon') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createNewFreeIconLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-city') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createOrSelectCityLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-country') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createOrSelectCountryLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-province') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createOrSelectProvinceLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-country-icon') {
      handleEditorModeChange('label')
      setIsLabelsSectionExpanded(true)
      createOrSelectCountryIconLabel()
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-anchor-none') {
      handleEditorModeChange('label')
      setLabelAnchorDisplayMode('none')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'label-anchor-all') {
      handleEditorModeChange('label')
      setLabelAnchorDisplayMode('all')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'label-anchor-selected') {
      handleEditorModeChange('label')
      setLabelAnchorDisplayMode('selected')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'label-create-free-group') {
      handleEditorModeChange('label')
      setIsLabelGroupsSectionExpanded(true)
      createAndEditLabelGroup('free')
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-create-assigned-group') {
      handleEditorModeChange('label')
      setIsLabelGroupsSectionExpanded(true)
      createAndEditLabelGroup('assigned')
      closeAltRadialMenu()
      return
    }

    if (actionId === 'label-groups-table') {
      handleEditorModeChange('label')
      setExpandedTableId('label-groups')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'label-text-table') {
      handleEditorModeChange('label')
      setExpandedTableId('text-labels')
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'label-icon-table') {
      handleEditorModeChange('label')
      setExpandedTableId('icon-labels')
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('label-group:')) {
      const groupId = actionId.slice('label-group:'.length)
      handleEditorModeChange('label')
      setIsLabelGroupsSectionExpanded(true)
      setIsLabelsSectionExpanded(false)
      setActiveManagedLabelGroupId(groupId)
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'surface-display' || actionId === 'topography-display') {
      handleEditorModeChange('surface')
      focusTerrainSection('display')
      setTerrainDisplayMode(actionId === 'surface-display' ? 'surface' : 'topography')
      closeAltRadialMenu(false)
      return
    }

    if (
      actionId === 'terrain-brush-land' ||
      actionId === 'terrain-brush-water' ||
      actionId === 'terrain-brush-dark-water' ||
      actionId === 'terrain-brush-empty' ||
      actionId === 'terrain-brush-unknown'
    ) {
      const nextKind: TerrainBrushKind =
        actionId === 'terrain-brush-land'
          ? 'land'
          : actionId === 'terrain-brush-water'
            ? 'water'
            : actionId === 'terrain-brush-dark-water'
              ? 'dark_water'
              : actionId === 'terrain-brush-empty'
                ? 'empty'
                : 'unknown'
      handleEditorModeChange('surface')
      focusTerrainSection('paint')
      setTerrainBrushKindWithClampedElevation(nextKind)
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'terrain-elevation-down' || actionId === 'terrain-elevation-up') {
      handleEditorModeChange('surface')
      focusTerrainSection('paint')
      adjustTerrainBrushElevation(actionId === 'terrain-elevation-down' ? -1 : 1)
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'terrain-elevation-zero') {
      if (terrainBrushKind === 'empty' || terrainBrushKind === 'unknown') {
        return
      }
      handleEditorModeChange('surface')
      focusTerrainSection('paint')
      setTerrainBrushElevation(clampSurfaceElevation(terrainBrushKind === 'land' ? 'land' : 'water', 0))
      closeAltRadialMenu(false)
      return
    }

    if (actionId === 'terrain-elevation-snow') {
      if (terrainBrushKind !== 'land') {
        return
      }
      handleEditorModeChange('surface')
      focusTerrainSection('paint')
      setTerrainBrushElevation(clampSurfaceElevation('land', terrainSnowLineElevation))
      closeAltRadialMenu(false)
      return
    }

    if (
      actionId === 'radius_0' ||
      actionId === 'radius_1' ||
      actionId === 'radius_2' ||
      actionId === 'radius_3' ||
      actionId === 'fill_type' ||
      actionId === 'fill_height'
    ) {
      if (editorMode === 'surface') {
        focusTerrainSection('paint')
        setTerrainPaintModeWithRadius(actionId)
      } else if (editorMode === 'political' && politicalSubMode !== 'city') {
        setPoliticalPaintModeWithRadius(actionId)
        if (actionId !== 'fill_type' && actionId !== 'fill_height') {
          if (politicalSubMode === 'country' && countryToolMode === 'view') {
            setCountryToolMode('paint')
          }
          if (politicalSubMode === 'province' && provinceToolMode === 'view') {
            setProvinceToolMode('paint')
          }
        }
      }
      if (
        altRadialMenu === 'root' ||
        altRadialMenu === 'terrain-paint' ||
        altRadialMenu === 'political-paint'
      ) {
        setAltRadialMenuInPlace(altRadialMenu)
        return
      }
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('political-country:')) {
      const countryId = actionId.slice('political-country:'.length)
      if (editorMode !== 'political') {
        handleEditorModeChange('political')
      }
      if (world.countries[countryId]) {
        setActiveCountryId(countryId)
        if (politicalSubMode !== 'country') {
          const nextProvince = sortedProvinces.find((province) => province.countryId === countryId) ?? null
          setActiveProvinceId(nextProvince?.id ?? null)
        }
      }
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('political-province:')) {
      const provinceId = actionId.slice('political-province:'.length)
      handleEditorModeChange('political')
      handlePoliticalSubModeChange('province')
      const nextProvince = world.provinces[provinceId]
      if (nextProvince) {
        if (nextProvince.countryId) {
          setActiveCountryId(nextProvince.countryId)
        }
        setActiveProvinceId(provinceId)
      }
      closeAltRadialMenu(false)
      return
    }

    if (
      actionId === 'editor-world' ||
      actionId === 'editor-surface' ||
      actionId === 'editor-country' ||
      actionId === 'editor-province' ||
      actionId === 'editor-city' ||
      actionId === 'editor-label' ||
      actionId === 'editor-move'
    ) {
      if (actionId === 'editor-world') {
        handleEditorModeChange('world')
        closeAltRadialMenu()
        return
      }
      if (actionId === 'editor-surface') {
        handleEditorModeChange('surface')
        closeAltRadialMenu()
        return
      }
      if (actionId === 'editor-country') {
        handleEditorModeChange('political')
        handlePoliticalSubModeChange('country')
        closeAltRadialMenu()
        return
      }
      if (actionId === 'editor-province') {
        handleEditorModeChange('political')
        handlePoliticalSubModeChange('province')
        closeAltRadialMenu()
        return
      }
      if (actionId === 'editor-city') {
        handleEditorModeChange('political')
        handlePoliticalSubModeChange('city')
        closeAltRadialMenu()
        return
      }
      if (actionId === 'editor-label') {
        handleEditorModeChange('label')
        closeAltRadialMenu()
        return
      }
      handleEditorModeChange('move')
      setAltRadialMenuInPlace('root')
      return
    }

    if (actionId === 'move-apply') {
      applyMoveOperation(effectiveMoveTargetCell)
      closeAltRadialMenu()
      return
    }
    if (actionId === 'move-clear') {
      clearMoveSelection()
      closeAltRadialMenu()
      return
    }
    if (actionId === 'move-operation-move') {
      handleEditorModeChange('move')
      setMoveOperation('move')
      closeAltRadialMenu(false)
      return
    }
    if (actionId === 'move-operation-copy') {
      handleEditorModeChange('move')
      if (movePayload === 'terrain') {
        setMoveOperation('copy')
      }
      closeAltRadialMenu(false)
      return
    }
    if (actionId === 'move-payload-terrain') {
      handleEditorModeChange('move')
      setMovePayload('terrain')
      closeAltRadialMenu(false)
      return
    }
    if (actionId === 'move-payload-political') {
      handleEditorModeChange('move')
      setMovePayload('political')
      setMoveOperation('move')
      closeAltRadialMenu(false)
      return
    }

    if (
      actionId === 'city-level-capital' ||
      actionId === 'city-level-province_capital' ||
      actionId === 'city-level-town' ||
      actionId === 'city-level-village'
    ) {
      const levelId =
        actionId === 'city-level-capital'
          ? 'capital'
          : actionId === 'city-level-province_capital'
            ? 'province_capital'
            : actionId === 'city-level-town'
              ? 'town'
              : 'village'
      handleEditorModeChange('political')
      handlePoliticalSubModeChange('city')
      handleSetCityToolMode('place_city')
      setCityBrushLevelId(levelId)
      setActiveCityLevelId(levelId)
      closeAltRadialMenu(false)
      return
    }

    if (actionId.startsWith('city-level:')) {
      const levelId = actionId.slice('city-level:'.length)
      if (!world.cityLevels[levelId]) {
        return
      }
      handleEditorModeChange('political')
      handlePoliticalSubModeChange('city')
      handleSetCityToolMode('place_city')
      setCityBrushLevelId(levelId)
      setActiveCityLevelId(levelId)
      closeAltRadialMenu(false)
    }
  }, [
    activateAltRadialRootAction,
    activateFullSubmapView,
    activateShortcutSection,
    adjustTerrainBrushElevation,
    altRadialMenu,
    applyMoveOperation,
    beginCreateSubmapSelection,
    clearMoveSelection,
    closeAltRadialMenu,
    countryToolMode,
    createAndEditLabelGroup,
    createNewFreeIconLabel,
    createNewFreeLabel,
    createOrSelectCityLabel,
    createOrSelectCountryIconLabel,
    createOrSelectCountryLabel,
    createOrSelectProvinceLabel,
    editorMode,
    effectiveMoveTargetCell,
    focusTerrainSection,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
    handleSetCityToolMode,
    movePayload,
    politicalSubMode,
    provinceToolMode,
    setActiveCityLevelId,
    setActiveCountryId,
    setActiveManagedLabelGroupId,
    setActiveProvinceId,
    setActiveSubmapId,
    setAltRadialMenuInPlace,
    setCityBrushLevelId,
    setCountryToolMode,
    setExpandedTableId,
    setIsLabelGroupsSectionExpanded,
    setIsLabelsSectionExpanded,
    setIsSubmapSelectionMode,
    setLabelAnchorDisplayMode,
    setMoveOperation,
    setMovePayload,
    setPoliticalPaintModeWithRadius,
    setProvinceToolMode,
    setTerrainBrushElevation,
    setTerrainBrushKindWithClampedElevation,
    setTerrainDisplayMode,
    setTerrainPaintModeWithRadius,
    setWorldLabelGroupShortcutTargetId,
    setWorldLayerShortcutTargetId,
    sortedProvinces,
    terrainBrushKind,
    terrainSnowLineElevation,
    toggleLabelGroupVisibilityById,
    toggleLayerVisibilityById,
    world,
  ])

  return {
    setAltRadialMenuInPlace,
    handleAltRadialAction,
  }
}
