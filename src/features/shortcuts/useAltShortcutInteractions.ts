import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react'

import { clampSurfaceElevation } from '../../domain/world'
import type {
  CityToolMode,
} from '../../political/types'
import type { ShortcutHintScope } from './shortcutHints'
import { getTerrainBrushElevationRange } from '../../components/surface/terrainBrush'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { TerrainBrushContextValue } from '../../state/TerrainBrushContext'
import type { TerrainStyleContextValue } from '../../state/TerrainStyleContext'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

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
type TerrainSection = 'display' | 'paint' | 'base' | 'topography'
type StateSetter<T> = Dispatch<SetStateAction<T>>

interface IdLike {
  id: string
}

interface ProvinceLike extends IdLike {
  countryId: string | null
}

interface UseAltShortcutInteractionsArgs {
  contexts: {
    editorMode: Pick<
      EditorModeContextValue,
      | 'editorMode'
      | 'politicalSubMode'
      | 'setCountryToolMode'
      | 'setCityToolMode'
      | 'setPoliticalPaintMode'
      | 'setProvinceToolMode'
    >
    terrainBrush: Pick<
      TerrainBrushContextValue,
      | 'terrainBrushKind'
      | 'setTerrainBrushElevation'
      | 'setTerrainBrushKind'
      | 'setTerrainDisplayMode'
      | 'setTerrainPaintMode'
      | 'setBrushRadius'
    >
    terrainStyle: Pick<TerrainStyleContextValue, 'terrainSnowLineElevation'>
    activeEntity: Pick<
      ActiveEntityContextValue,
      | 'setActiveCountryId'
      | 'setActiveProvinceId'
      | 'setActiveSubmapId'
      | 'setIsSubmapSelectionMode'
    >
  }
  state: {
    altShortcutScope: ShortcutHintScope
    isAltShortcutOverlayOpen: boolean
    isAnyObjectEditorOpen: boolean
    isMoveSelectionMode: boolean
    labelGroups: IdLike[]
    layersWithMeta: IdLike[]
    moveSourceCount: number
    provinceChooserProvinces: IdLike[]
    sortedCountries: IdLike[]
    sortedProvinces: ProvinceLike[]
    submaps: IdLike[]
    suppressAltUntilReleaseRef: MutableRefObject<boolean>
    lastPointerViewportPositionRef: MutableRefObject<{ x: number; y: number }>
  }
  actions: {
    adjustTerrainBrushElevation: (delta: number) => void
    activateFullSubmapView: () => void
    applyModeShortcutKey: (key: string) => void
    beginCreateCountry: () => void
    beginCreateProvince: () => void
    beginCreateSubmapSelection: () => void
    clearMoveSelection: () => void
    closeObjectEditors: () => void
    commitPendingMode: () => void
    commitPendingSection: () => void
    commitSectionShortcutKey: (key: string) => void
    cycleInspectorSections: () => void
    cyclePendingModeShortcut: (delta: number) => void
    cycleShortcutSection: (delta: number) => void
    cyclePoliticalCountryTarget: (delta: number) => void
    cyclePoliticalPaintMode: (delta: number) => void
    cyclePoliticalProvinceTarget: (delta: number) => void
    cyclePoliticalTool: (delta: number) => void
    cycleTerrainBrushKind: (delta: number) => void
    cycleTerrainDisplayMode: (delta: number) => void
    cycleTerrainPaintMode: (delta: number) => void
    cycleWorldLabelGroupTarget: (delta: number) => void
    cycleWorldLayerTarget: (delta: number) => void
    cycleWorldSubmapTarget: (delta: number) => void
    cycleZSupportedShortcut: () => boolean
    focusTerrainSection: (section: TerrainSection) => void
    getCurrentModeShortcutKey: () => string
    getCurrentSectionShortcutKey: () => string
    handleSetCityToolMode: (mode: CityToolMode) => void
    redoPaintHistory: () => boolean
    toggleLabelGroupVisibilityById: (groupId: string) => void
    toggleLayerVisibilityById: (layerId: string) => void
    undoPaintHistory: () => boolean
    setAltPendingModeKey: StateSetter<string>
    setAltPendingSectionKey: StateSetter<string>
    setAltRadialMenu: StateSetter<AltRadialMenuId>
    setAltRadialOriginPosition: StateSetter<{ x: number; y: number }>
    setAltShortcutScope: StateSetter<ShortcutHintScope>
    setIsAltRadialSuppressed: StateSetter<boolean>
    setIsAltShortcutOverlayOpen: StateSetter<boolean>
    setWorldLabelGroupShortcutTargetId: (groupId: string | null) => void
    setWorldLayerShortcutTargetId: (layerId: string | null) => void
  }
}

export function useAltShortcutInteractions({
  contexts,
  state,
  actions,
}: UseAltShortcutInteractionsArgs) {
  const {
    editorMode,
    politicalSubMode,
    setCountryToolMode,
    setCityToolMode,
    setPoliticalPaintMode,
    setProvinceToolMode,
  } = contexts.editorMode
  const {
    terrainBrushKind,
    setTerrainBrushElevation,
    setTerrainBrushKind,
    setTerrainDisplayMode,
    setTerrainPaintMode,
    setBrushRadius,
  } = contexts.terrainBrush
  const { terrainSnowLineElevation } = contexts.terrainStyle
  const {
    setActiveCountryId,
    setActiveProvinceId,
    setActiveSubmapId,
    setIsSubmapSelectionMode,
  } = contexts.activeEntity
  const {
    altShortcutScope,
    isAltShortcutOverlayOpen,
    isAnyObjectEditorOpen,
    isMoveSelectionMode,
    labelGroups,
    layersWithMeta,
    moveSourceCount,
    provinceChooserProvinces,
    sortedCountries,
    sortedProvinces,
    submaps,
    suppressAltUntilReleaseRef,
    lastPointerViewportPositionRef,
  } = state
  const {
    adjustTerrainBrushElevation,
    activateFullSubmapView,
    applyModeShortcutKey,
    beginCreateCountry,
    beginCreateProvince,
    beginCreateSubmapSelection,
    clearMoveSelection,
    closeObjectEditors,
    commitPendingMode,
    commitPendingSection,
    commitSectionShortcutKey,
    cycleInspectorSections,
    cyclePendingModeShortcut,
    cycleShortcutSection,
    cyclePoliticalCountryTarget,
    cyclePoliticalPaintMode,
    cyclePoliticalProvinceTarget,
    cyclePoliticalTool,
    cycleTerrainBrushKind,
    cycleTerrainDisplayMode,
    cycleTerrainPaintMode,
    cycleWorldLabelGroupTarget,
    cycleWorldLayerTarget,
    cycleWorldSubmapTarget,
    cycleZSupportedShortcut,
    focusTerrainSection,
    getCurrentModeShortcutKey,
    getCurrentSectionShortcutKey,
    handleSetCityToolMode,
    redoPaintHistory,
    toggleLabelGroupVisibilityById,
    toggleLayerVisibilityById,
    undoPaintHistory,
    setAltPendingModeKey,
    setAltPendingSectionKey,
    setAltRadialMenu,
    setAltRadialOriginPosition,
    setAltShortcutScope,
    setIsAltRadialSuppressed,
    setIsAltShortcutOverlayOpen,
    setWorldLabelGroupShortcutTargetId,
    setWorldLayerShortcutTargetId,
  } = actions

  useEffect(() => {
    if (!isAltShortcutOverlayOpen) {
      return
    }
    setAltPendingModeKey(getCurrentModeShortcutKey())
    setAltPendingSectionKey(getCurrentSectionShortcutKey())
  }, [
    getCurrentModeShortcutKey,
    getCurrentSectionShortcutKey,
    isAltShortcutOverlayOpen,
    setAltPendingModeKey,
    setAltPendingSectionKey,
  ])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      const isModifierUndo = (event.ctrlKey || event.metaKey) && !event.altKey

      if (isModifierUndo && !isTypingTarget) {
        const key = event.key.toLowerCase()

        if (key === 'z' && !event.shiftKey) {
          event.preventDefault()
          undoPaintHistory()
          return
        }

        if (key === 'y' || (key === 'z' && event.shiftKey)) {
          event.preventDefault()
          redoPaintHistory()
          return
        }
      }

      if (event.key === 'Alt') {
        event.preventDefault()
        if (suppressAltUntilReleaseRef.current) {
          return
        }
        if (!isAltShortcutOverlayOpen) {
          setIsAltShortcutOverlayOpen(true)
          setAltShortcutScope('sections')
          setAltPendingModeKey(getCurrentModeShortcutKey())
          setAltPendingSectionKey(getCurrentSectionShortcutKey())
          setAltRadialMenu('root')
          setIsAltRadialSuppressed(false)
          setAltRadialOriginPosition(lastPointerViewportPositionRef.current)
        }
        return
      }

      if (event.altKey && !isTypingTarget) {
        const key = event.key.toLowerCase()
        const digitMatch = event.code.match(/^Digit([1-9])$/)
        const digitKey = digitMatch?.[1] ?? null
        let handled = true

        if (key === 'q') {
          setAltShortcutScope((current) => (current === 'mode' ? 'sections' : 'mode'))
        } else if (key === 'x') {
          cycleInspectorSections()
        } else if (key === 'z') {
          handled = cycleZSupportedShortcut()
        } else if (key === 'w') {
          if (altShortcutScope === 'mode') {
            commitPendingMode()
            setAltShortcutScope('sections')
          } else if (altShortcutScope === 'sections') {
            commitPendingSection()
          } else {
            setAltShortcutScope('sections')
          }
        } else if (editorMode === 'political' && key === 'r') {
          cyclePoliticalTool(1)
          setAltShortcutScope('sections')
        } else if (editorMode === 'political' && key === 'a' && politicalSubMode !== 'city') {
          setAltShortcutScope((current) => (current === 'political-country-target' ? 'sections' : 'political-country-target'))
        } else if (editorMode === 'political' && key === 's' && politicalSubMode !== 'city') {
          setAltShortcutScope((current) => (current === 'political-paint-mode' ? 'sections' : 'political-paint-mode'))
        } else if (editorMode === 'political' && key === 'd' && politicalSubMode === 'province') {
          setAltShortcutScope((current) => (current === 'political-province-target' ? 'sections' : 'political-province-target'))
        } else if (editorMode === 'world' && key === 'r') {
          setAltShortcutScope((current) => (current === 'world-submaps' ? 'sections' : 'world-submaps'))
        } else if (editorMode === 'world' && key === 'a') {
          setAltShortcutScope((current) => (current === 'world-layers' ? 'sections' : 'world-layers'))
        } else if (editorMode === 'world' && key === 's') {
          setAltShortcutScope((current) => (current === 'world-label-groups' ? 'sections' : 'world-label-groups'))
        } else if (editorMode === 'surface' && key === 'r') {
          cycleTerrainDisplayMode(1)
          setAltShortcutScope('sections')
        } else if (editorMode === 'surface' && key === 'a') {
          setAltShortcutScope((current) => (current === 'terrain-brush-type' ? 'sections' : 'terrain-brush-type'))
        } else if (editorMode === 'surface' && key === 's') {
          setAltShortcutScope((current) => (current === 'terrain-paint-mode' ? 'sections' : 'terrain-paint-mode'))
        } else if (editorMode === 'surface' && key === 't') {
          setAltShortcutScope((current) => (current === 'terrain-elevation' ? 'sections' : 'terrain-elevation'))
        } else if (altShortcutScope === 'mode' && digitKey) {
          applyModeShortcutKey(digitKey)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'world-submaps' && digitKey === '1') {
          activateFullSubmapView()
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'world-submaps' && digitKey === '2') {
          beginCreateSubmapSelection()
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'world-submaps' && digitKey) {
          const targetIndex = Number(digitKey) - 3
          const target = submaps[targetIndex]
          if (target) {
            setActiveSubmapId(target.id)
            setIsSubmapSelectionMode(false)
            setAltShortcutScope('sections')
          }
        } else if (altShortcutScope === 'world-layers' && digitKey) {
          const targetIndex = Number(digitKey) - 1
          const target = layersWithMeta[targetIndex]
          if (target) {
            setWorldLayerShortcutTargetId(target.id)
            toggleLayerVisibilityById(target.id)
          }
        } else if (altShortcutScope === 'world-label-groups' && digitKey) {
          const targetIndex = Number(digitKey) - 1
          const target = labelGroups[targetIndex]
          if (target) {
            setWorldLabelGroupShortcutTargetId(target.id)
            toggleLabelGroupVisibilityById(target.id)
          }
        } else if (altShortcutScope === 'political-tool' && digitKey === '1') {
          if (politicalSubMode === 'city') {
            setCityToolMode('view')
          } else if (politicalSubMode === 'country') {
            setCountryToolMode('view')
          } else {
            setProvinceToolMode('view')
          }
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-tool' && digitKey === '2') {
          if (politicalSubMode === 'city') {
            handleSetCityToolMode('place_city')
          } else if (politicalSubMode === 'country') {
            setCountryToolMode('paint')
          } else {
            setProvinceToolMode('paint')
          }
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-tool' && digitKey === '3' && politicalSubMode !== 'city') {
          if (politicalSubMode === 'country') {
            setCountryToolMode('erase')
          } else {
            setProvinceToolMode('erase')
          }
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-country-target' && digitKey === '1') {
          beginCreateCountry()
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-country-target' && digitKey) {
          const targetIndex = Number(digitKey) - 2
          const target = sortedCountries[targetIndex]
          if (target) {
            if (politicalSubMode === 'country') {
              setActiveCountryId(target.id)
            } else {
              setActiveCountryId(target.id)
              const nextProvince = sortedProvinces.find((province) => province.countryId === target.id) ?? null
              setActiveProvinceId(nextProvince?.id ?? null)
            }
            setAltShortcutScope('sections')
          }
        } else if (altShortcutScope === 'political-province-target' && digitKey === '1') {
          beginCreateProvince()
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-province-target' && digitKey) {
          const targetIndex = Number(digitKey) - 2
          const target = provinceChooserProvinces[targetIndex]
          if (target) {
            setActiveProvinceId(target.id)
            setAltShortcutScope('sections')
          }
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '1') {
          setPoliticalPaintMode('radius_0')
          setBrushRadius(0)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '2') {
          setPoliticalPaintMode('radius_1')
          setBrushRadius(1)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '3') {
          setPoliticalPaintMode('radius_2')
          setBrushRadius(2)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '4') {
          setPoliticalPaintMode('radius_3')
          setBrushRadius(3)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '5') {
          setPoliticalPaintMode('fill_type')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'political-paint-mode' && digitKey === '6') {
          setPoliticalPaintMode('fill_height')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-display' && digitKey === '1') {
          focusTerrainSection('display')
          setTerrainDisplayMode('surface')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-display' && digitKey === '2') {
          focusTerrainSection('display')
          setTerrainDisplayMode('topography')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '1') {
          focusTerrainSection('paint')
          setTerrainPaintMode('radius_0')
          setBrushRadius(0)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '2') {
          focusTerrainSection('paint')
          setTerrainPaintMode('radius_1')
          setBrushRadius(1)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '3') {
          focusTerrainSection('paint')
          setTerrainPaintMode('radius_2')
          setBrushRadius(2)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '4') {
          focusTerrainSection('paint')
          setTerrainPaintMode('radius_3')
          setBrushRadius(3)
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '5') {
          focusTerrainSection('paint')
          setTerrainPaintMode('fill_type')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-paint-mode' && digitKey === '6') {
          focusTerrainSection('paint')
          setTerrainPaintMode('fill_height')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-brush-type' && digitKey === '1') {
          focusTerrainSection('paint')
          setTerrainBrushKind('land')
          setTerrainBrushElevation((current) =>
            Math.min(
              Math.max(current, getTerrainBrushElevationRange('land').min),
              getTerrainBrushElevationRange('land').max,
            ),
          )
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-brush-type' && digitKey === '2') {
          focusTerrainSection('paint')
          setTerrainBrushKind('water')
          setTerrainBrushElevation((current) =>
            Math.min(
              Math.max(current, getTerrainBrushElevationRange('water').min),
              getTerrainBrushElevationRange('water').max,
            ),
          )
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-brush-type' && digitKey === '3') {
          focusTerrainSection('paint')
          setTerrainBrushKind('dark_water')
          setTerrainBrushElevation((current) =>
            Math.min(
              Math.max(current, getTerrainBrushElevationRange('dark_water').min),
              getTerrainBrushElevationRange('dark_water').max,
            ),
          )
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-brush-type' && digitKey === '4') {
          focusTerrainSection('paint')
          setTerrainBrushKind('empty')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-brush-type' && digitKey === '5') {
          focusTerrainSection('paint')
          setTerrainBrushKind('unknown')
          setAltShortcutScope('sections')
        } else if (altShortcutScope === 'terrain-elevation' && digitKey === '1') {
          focusTerrainSection('paint')
          adjustTerrainBrushElevation(-1)
        } else if (altShortcutScope === 'terrain-elevation' && digitKey === '2') {
          focusTerrainSection('paint')
          adjustTerrainBrushElevation(1)
        } else if (altShortcutScope === 'terrain-elevation' && digitKey === '3') {
          if (terrainBrushKind !== 'empty' && terrainBrushKind !== 'unknown') {
            focusTerrainSection('paint')
            setTerrainBrushElevation(
              clampSurfaceElevation(terrainBrushKind === 'land' ? 'land' : 'water', 0),
            )
          }
        } else if (altShortcutScope === 'terrain-elevation' && digitKey === '4') {
          if (terrainBrushKind === 'land') {
            focusTerrainSection('paint')
            setTerrainBrushElevation(clampSurfaceElevation('land', terrainSnowLineElevation))
          }
        } else if (altShortcutScope === 'sections' && digitKey) {
          setAltPendingSectionKey(digitKey)
          commitSectionShortcutKey(digitKey)
        } else {
          handled = false
        }

        if (handled) {
          event.preventDefault()
          return
        }
      }

      if (event.key !== 'Escape') {
        return
      }

      if (isAnyObjectEditorOpen) {
        closeObjectEditors()
        return
      }

      if (editorMode === 'move' && (isMoveSelectionMode || moveSourceCount > 0)) {
        clearMoveSelection()
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        suppressAltUntilReleaseRef.current = false
        setIsAltShortcutOverlayOpen(false)
        setAltShortcutScope('sections')
        setAltRadialMenu('root')
        setIsAltRadialSuppressed(false)
      }
    }

    const handleWindowBlur = () => {
      suppressAltUntilReleaseRef.current = false
      setIsAltShortcutOverlayOpen(false)
      setAltShortcutScope('sections')
      setAltRadialMenu('root')
      setIsAltRadialSuppressed(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleWindowBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [
    adjustTerrainBrushElevation,
    altShortcutScope,
    activateFullSubmapView,
    applyModeShortcutKey,
    beginCreateCountry,
    beginCreateProvince,
    beginCreateSubmapSelection,
    clearMoveSelection,
    closeObjectEditors,
    commitPendingMode,
    commitPendingSection,
    commitSectionShortcutKey,
    cycleInspectorSections,
    cycleZSupportedShortcut,
    cyclePoliticalCountryTarget,
    cyclePoliticalTool,
    cyclePoliticalProvinceTarget,
    cycleTerrainDisplayMode,
    editorMode,
    getCurrentModeShortcutKey,
    getCurrentSectionShortcutKey,
    handleSetCityToolMode,
    isAltShortcutOverlayOpen,
    isAnyObjectEditorOpen,
    isMoveSelectionMode,
    labelGroups,
    layersWithMeta,
    moveSourceCount,
    politicalSubMode,
    provinceChooserProvinces,
    redoPaintHistory,
    sortedCountries,
    sortedProvinces,
    submaps,
    suppressAltUntilReleaseRef,
    terrainBrushKind,
    terrainSnowLineElevation,
    undoPaintHistory,
    focusTerrainSection,
    lastPointerViewportPositionRef,
    setActiveCountryId,
    setActiveProvinceId,
    setActiveSubmapId,
    setAltPendingModeKey,
    setAltPendingSectionKey,
    setAltRadialMenu,
    setAltRadialOriginPosition,
    setAltShortcutScope,
    setBrushRadius,
    setCountryToolMode,
    setCityToolMode,
    setIsAltRadialSuppressed,
    setIsAltShortcutOverlayOpen,
    setIsSubmapSelectionMode,
    setPoliticalPaintMode,
    setProvinceToolMode,
    setTerrainBrushElevation,
    setTerrainBrushKind,
    setTerrainDisplayMode,
    setTerrainPaintMode,
    setWorldLabelGroupShortcutTargetId,
    setWorldLayerShortcutTargetId,
    toggleLabelGroupVisibilityById,
    toggleLayerVisibilityById,
  ])

  useEffect(() => {
    if (!isAltShortcutOverlayOpen) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      const delta = event.deltaY > 0 ? 1 : -1
      let handled = true

      if (altShortcutScope === 'mode') {
        cyclePendingModeShortcut(delta)
      } else if (altShortcutScope === 'sections') {
        cycleShortcutSection(delta)
      } else if (altShortcutScope === 'world-submaps') {
        cycleWorldSubmapTarget(delta)
      } else if (altShortcutScope === 'world-layers') {
        cycleWorldLayerTarget(delta)
      } else if (altShortcutScope === 'world-label-groups') {
        cycleWorldLabelGroupTarget(delta)
      } else if (altShortcutScope === 'political-tool') {
        cyclePoliticalTool(delta)
      } else if (altShortcutScope === 'political-country-target') {
        cyclePoliticalCountryTarget(delta)
      } else if (altShortcutScope === 'political-province-target') {
        cyclePoliticalProvinceTarget(delta)
      } else if (altShortcutScope === 'political-paint-mode') {
        cyclePoliticalPaintMode(delta)
      } else if (altShortcutScope === 'terrain-display') {
        cycleTerrainDisplayMode(delta)
      } else if (altShortcutScope === 'terrain-brush-type') {
        cycleTerrainBrushKind(delta)
      } else if (altShortcutScope === 'terrain-paint-mode') {
        cycleTerrainPaintMode(delta)
      } else if (altShortcutScope === 'terrain-elevation') {
        adjustTerrainBrushElevation(delta)
      } else {
        handled = false
      }

      if (!handled) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation?.()
    }

    window.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true })
    }
  }, [
    adjustTerrainBrushElevation,
    altShortcutScope,
    cyclePoliticalTool,
    cyclePendingModeShortcut,
    cycleShortcutSection,
    cycleWorldLabelGroupTarget,
    cycleWorldLayerTarget,
    cycleWorldSubmapTarget,
    cyclePoliticalCountryTarget,
    cyclePoliticalPaintMode,
    cyclePoliticalProvinceTarget,
    cycleTerrainDisplayMode,
    cycleTerrainBrushKind,
    cycleTerrainPaintMode,
    isAltShortcutOverlayOpen,
  ])
}
