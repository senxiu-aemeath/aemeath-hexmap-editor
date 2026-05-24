import { useMemo } from 'react'

import type {
  CityLevel,
  Country,
  LabelGroup,
  Province,
  Submap,
  WorldDocument,
} from '../../domain/world'
import type { AppMessages } from '../../i18n'
import type {
  CityToolMode,
  CountryToolMode,
  PoliticalSubMode,
  ProvinceToolMode,
} from '../../political/types'
import { getCityLevelName } from '../../political/display'
import type {
  TerrainBrushKind,
  TerrainDisplayMode,
  TerrainPaintMode,
} from '../../components/surface/terrainBrush'
import type { MouseStackedMenuRenderableItem } from '../../components/mouseStackedMenu/types'

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

interface LayerControlLike {
  id: LayerId
  label: string
  visible: boolean
}

export type AltRadialMenuId =
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

export type AltRadialActionId =
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

export interface AltRadialActionItem extends MouseStackedMenuRenderableItem {
  id: AltRadialActionId
  slot?: number
  ring?: 'inner' | 'outer'
}

export function getAltRadialPreviewItems<T extends { id: string }>(
  items: T[],
  activeId: string | null,
  maxCount: number,
) {
  if (items.length <= maxCount) {
    return items
  }

  const activeIndex = activeId ? items.findIndex((item) => item.id === activeId) : -1
  const startIndex = activeIndex >= 0 ? activeIndex : 0

  return Array.from({ length: maxCount }, (_, index) => items[(startIndex + index) % items.length]!)
}

function buildSwitchModeAltRadialItems(args: {
  ui: AppMessages
  editorMode: EditorMode
  politicalSubMode: PoliticalSubMode
}): AltRadialActionItem[] {
  const { ui, editorMode, politicalSubMode } = args
  return [
    { id: 'switch-mode', label: ui.common.mode, active: true, slot: 0 },
    { id: 'editor-world', label: ui.common.map, active: editorMode === 'world', slot: 1 },
    { id: 'editor-surface', label: ui.common.terrain, active: editorMode === 'surface', slot: 2 },
    {
      id: 'editor-country',
      label: ui.common.country,
      active: editorMode === 'political' && politicalSubMode === 'country',
      slot: 3,
    },
    {
      id: 'editor-province',
      label: ui.common.province,
      active: editorMode === 'political' && politicalSubMode === 'province',
      slot: 4,
    },
    {
      id: 'editor-city',
      label: ui.common.city,
      active: editorMode === 'political' && politicalSubMode === 'city',
      slot: 5,
    },
    { id: 'editor-label', label: ui.common.labelItem, active: editorMode === 'label', slot: 6 },
    { id: 'editor-move', label: ui.common.moveItem, active: editorMode === 'move', slot: 7 },
  ]
}

function buildWorldAltRadialItems(args: {
  editorMode: EditorMode
  menuId: AltRadialMenuId
  ui: AppMessages
  activeSubmapId: string | null
  isSubmapSelectionMode: boolean
  recentWorldSubmaps: Submap[]
  radialWorldSubmaps: Submap[]
  radialWorldLayers: LayerControlLike[]
  radialWorldLabelGroups: LabelGroup[]
  isWorldInfoExpanded: boolean
  isWorldStyleExpanded: boolean
  isWorldGridExpanded: boolean
}): AltRadialActionItem[] | null {
  const {
    editorMode,
    menuId,
    ui,
    activeSubmapId,
    isSubmapSelectionMode,
    recentWorldSubmaps,
    radialWorldSubmaps,
    radialWorldLayers,
    radialWorldLabelGroups,
    isWorldInfoExpanded,
    isWorldStyleExpanded,
    isWorldGridExpanded,
  } = args

  if (menuId === 'world-submaps') {
    return [
      { id: 'world-full-map', label: ui.common.full, active: activeSubmapId === null && !isSubmapSelectionMode, slot: 0 },
      { id: 'world-new-submap', label: ui.common.addNew, active: isSubmapSelectionMode, slot: 1 },
      ...radialWorldSubmaps.map((submap, index) => ({
        id: `world-submap:${submap.id}` as const,
        label: submap.name,
        active: activeSubmapId === submap.id,
        slot: index + 2,
      })),
    ]
  }

  if (menuId === 'world-layers') {
    return radialWorldLayers.map((layer, index) => ({
      id: `world-layer:${layer.id}` as const,
      label: layer.label,
      active: layer.visible,
      slot: index,
    }))
  }

  if (menuId === 'world-label-groups') {
    return radialWorldLabelGroups.map((group, index) => ({
      id: `world-label-group:${group.id}` as const,
      label: group.name,
      active: group.visible,
      slot: index,
    }))
  }

  if (menuId === 'world-sections') {
    return [
      { id: 'world-section-info', label: ui.world.informationSection, visualLabel: ui.common.info, active: isWorldInfoExpanded, slot: 0 },
      { id: 'world-section-style', label: ui.world.styleSection, visualLabel: ui.common.style, active: isWorldStyleExpanded, slot: 1 },
      { id: 'world-section-grid', label: ui.world.gridSection, active: isWorldGridExpanded, slot: 2 },
    ]
  }

  if (editorMode !== 'world') {
    return null
  }

  const rootItems: AltRadialActionItem[] = [
    { id: 'world-full-map', label: ui.common.full, active: activeSubmapId === null && !isSubmapSelectionMode, slot: 0 },
    { id: 'world-new-submap', label: ui.common.addNew, active: isSubmapSelectionMode, slot: 1 },
  ]
  rootItems.push(
    ...recentWorldSubmaps.map((submap, index) => ({
      id: `world-submap:${submap.id}` as const,
      label: submap.name,
      active: activeSubmapId === submap.id,
      slot: 2 + index,
    })),
  )
  return rootItems
}

function buildSurfaceAltRadialItems(args: {
  editorMode: EditorMode
  menuId: AltRadialMenuId
  ui: AppMessages
  terrainDisplayMode: TerrainDisplayMode
  terrainBrushKind: TerrainBrushKind
  terrainBrushElevation: number
  terrainPaintMode: TerrainPaintMode
  terrainSnowLineElevation: number
}): AltRadialActionItem[] | null {
  const {
    editorMode,
    menuId,
    ui,
    terrainDisplayMode,
    terrainBrushKind,
    terrainBrushElevation,
    terrainPaintMode,
    terrainSnowLineElevation,
  } = args

  if (menuId === 'terrain-view') {
    return [
      { id: 'surface-display', label: ui.common.surfaceItem, active: terrainDisplayMode === 'surface' },
      { id: 'topography-display', label: ui.common.topography, active: terrainDisplayMode === 'topography' },
    ]
  }

  if (menuId === 'terrain-brush') {
    return [
      { id: 'terrain-brush-land', label: ui.surface.landBaseColor, active: terrainBrushKind === 'land', slot: 0 },
      { id: 'terrain-brush-water', label: ui.surface.waterBaseSimpleColor, active: terrainBrushKind === 'water', slot: 1 },
      { id: 'terrain-brush-dark-water', label: ui.common.darkWater, active: terrainBrushKind === 'dark_water', slot: 2 },
      { id: 'terrain-brush-empty', label: ui.surface.emptyColor, active: terrainBrushKind === 'empty', slot: 3 },
      { id: 'terrain-brush-unknown', label: ui.common.unknown, active: terrainBrushKind === 'unknown', slot: 4 },
    ]
  }

  if (menuId === 'terrain-elevation') {
    const elevationDisabled = terrainBrushKind === 'empty' || terrainBrushKind === 'unknown'
    return [
      { id: 'terrain-elevation-down', label: '-1', disabled: elevationDisabled, slot: 0 },
      { id: 'terrain-elevation-up', label: '+1', disabled: elevationDisabled, slot: 1 },
      {
        id: 'terrain-elevation-zero',
        label: ui.common.zero,
        active: !elevationDisabled && terrainBrushElevation === 0,
        disabled: elevationDisabled,
        slot: 2,
      },
      {
        id: 'terrain-elevation-snow',
        label: `${ui.surface.snowBoundaryEdge} ${terrainSnowLineElevation}`,
        visualLabel: `${ui.common.snow} ${terrainSnowLineElevation}`,
        active: terrainBrushKind === 'land' && terrainBrushElevation === terrainSnowLineElevation,
        disabled: terrainBrushKind !== 'land',
        slot: 3,
      },
    ]
  }

  if (menuId === 'terrain-paint') {
    return [
      { id: 'radius_0', label: 'R0', active: terrainPaintMode === 'radius_0' },
      { id: 'radius_1', label: 'R1', active: terrainPaintMode === 'radius_1' },
      { id: 'radius_2', label: 'R2', active: terrainPaintMode === 'radius_2' },
      { id: 'radius_3', label: 'R3', active: terrainPaintMode === 'radius_3' },
      { id: 'fill_type', label: ui.surface.fillType, visualLabel: ui.common.fill, active: terrainPaintMode === 'fill_type' },
      { id: 'fill_height', label: ui.surface.fillHeight, visualLabel: ui.common.height, active: terrainPaintMode === 'fill_height' },
    ]
  }

  if (editorMode !== 'surface') {
    return null
  }

  return [
    { id: 'radius_0', label: 'R0', active: terrainPaintMode === 'radius_0', slot: 0, ring: 'inner' },
    { id: 'radius_1', label: 'R1', active: terrainPaintMode === 'radius_1', slot: 1, ring: 'inner' },
    { id: 'radius_2', label: 'R2', active: terrainPaintMode === 'radius_2', slot: 2, ring: 'inner' },
    { id: 'radius_3', label: 'R3', active: terrainPaintMode === 'radius_3', slot: 3, ring: 'inner' },
    { id: 'fill_type', label: ui.surface.fillType, visualLabel: ui.common.fill, active: terrainPaintMode === 'fill_type', slot: 4, ring: 'outer' },
    { id: 'fill_height', label: ui.surface.fillHeight, visualLabel: ui.common.height, active: terrainPaintMode === 'fill_height', slot: 5, ring: 'outer' },
    { id: 'terrain-brush-land', label: ui.surface.landBaseColor, active: terrainBrushKind === 'land', slot: 6 },
    { id: 'terrain-brush-water', label: ui.surface.waterBaseSimpleColor, active: terrainBrushKind === 'water', slot: 7 },
    { id: 'terrain-brush-dark-water', label: ui.common.darkWater, active: terrainBrushKind === 'dark_water', slot: 8 },
    { id: 'terrain-brush-empty', label: ui.surface.emptyColor, active: terrainBrushKind === 'empty', slot: 9 },
    { id: 'terrain-brush-unknown', label: ui.common.unknown, active: terrainBrushKind === 'unknown', slot: 10 },
    { id: 'surface-display', label: ui.common.surfaceItem, active: terrainDisplayMode === 'surface', slot: 11 },
    { id: 'topography-display', label: ui.common.topography, active: terrainDisplayMode === 'topography', slot: 12 },
    {
      id: 'terrain-elevation-snow',
      label: `${ui.surface.snowBoundaryEdge} ${terrainSnowLineElevation}`,
      visualLabel: `${ui.common.snow} ${terrainSnowLineElevation}`,
      active: terrainBrushKind === 'land' && terrainBrushElevation === terrainSnowLineElevation,
      disabled: terrainBrushKind !== 'land',
      slot: 13,
    },
    {
      id: 'terrain-elevation-zero',
      label: ui.common.zero,
      active: terrainBrushKind !== 'empty' && terrainBrushKind !== 'unknown' && terrainBrushElevation === 0,
      disabled: terrainBrushKind === 'empty' || terrainBrushKind === 'unknown',
      slot: 14,
    },
  ]
}

function buildPoliticalAltRadialItems(args: {
  editorMode: EditorMode
  menuId: AltRadialMenuId
  ui: AppMessages
  politicalSubMode: PoliticalSubMode
  countryToolMode: CountryToolMode
  provinceToolMode: ProvinceToolMode
  cityToolMode: CityToolMode
  politicalPaintMode: TerrainPaintMode
  canPaintCountries: boolean
  canPaintProvinces: boolean
  activeCountryId: string | null
  activeProvinceId: string | null
  provinceChooserCountryId: string | null
  radialPoliticalCountries: Country[]
  recentPoliticalCountries: Country[]
  recentPoliticalProvinces: Province[]
  radialPoliticalProvinces: Province[]
  radialCityLevels: CityLevel[]
  effectiveCityBrushLevelId: string | null
  cityLevels: Record<string, CityLevel>
}): AltRadialActionItem[] | null {
  const {
    editorMode,
    menuId,
    ui,
    politicalSubMode,
    countryToolMode,
    provinceToolMode,
    cityToolMode,
    politicalPaintMode,
    canPaintCountries,
    canPaintProvinces,
    activeCountryId,
    activeProvinceId,
    provinceChooserCountryId,
    radialPoliticalCountries,
    recentPoliticalCountries,
    recentPoliticalProvinces,
    radialPoliticalProvinces,
    radialCityLevels,
    effectiveCityBrushLevelId,
    cityLevels,
  } = args

  if (menuId === 'political-tool') {
    const toolMode =
      politicalSubMode === 'country'
        ? countryToolMode
        : politicalSubMode === 'province'
          ? provinceToolMode
          : cityToolMode
    const paintDisabled =
      politicalSubMode === 'country'
        ? !canPaintCountries
        : politicalSubMode === 'province'
          ? !canPaintProvinces
          : false
    const primaryToolActionId: AltRadialActionId = politicalSubMode === 'city' ? 'city-place' : 'paint'
    const createPoliticalActionId: AltRadialActionId =
      politicalSubMode === 'country' ? 'create-country' : 'create-province'
    return [
      { id: 'view', label: ui.politicalTool.view, active: toolMode === 'view', slot: 0 },
      {
        id: primaryToolActionId,
        label: politicalSubMode === 'city' ? ui.politicalTool.place_city : ui.politicalTool.paint,
        visualLabel: politicalSubMode === 'city' ? ui.common.place : undefined,
        active: politicalSubMode === 'city' ? cityToolMode === 'place_city' : toolMode === 'paint',
        disabled: politicalSubMode === 'city' ? false : paintDisabled,
        slot: 1,
      },
      ...(politicalSubMode === 'city'
        ? []
        : ([
            { id: 'erase', label: ui.politicalTool.erase, active: toolMode === 'erase', slot: 2 },
            {
              id: createPoliticalActionId,
              label: `${ui.common.new} ${politicalSubMode === 'country' ? ui.common.country : ui.common.province}`,
              visualLabel: ui.common.new,
              slot: 3,
            },
          ] as AltRadialActionItem[])),
    ]
  }

  if (menuId === 'political-paint') {
    return [
      { id: 'radius_0', label: 'R0', active: politicalPaintMode === 'radius_0' },
      { id: 'radius_1', label: 'R1', active: politicalPaintMode === 'radius_1' },
      { id: 'radius_2', label: 'R2', active: politicalPaintMode === 'radius_2' },
      { id: 'radius_3', label: 'R3', active: politicalPaintMode === 'radius_3' },
      { id: 'fill_type', label: ui.surface.fillType, visualLabel: ui.common.fill, active: politicalPaintMode === 'fill_type' },
      { id: 'fill_height', label: ui.surface.fillHeight, visualLabel: ui.common.height, active: politicalPaintMode === 'fill_height' },
    ]
  }

  if (menuId === 'political-country-target') {
    return [
      { id: 'create-country', label: `${ui.common.new} ${ui.common.country}`, visualLabel: ui.common.new, slot: 0 },
      ...radialPoliticalCountries.map((country, index) => ({
        id: `political-country:${country.id}` as const,
        label: country.name,
        swatchColor: country.color,
        active: politicalSubMode === 'country' ? activeCountryId === country.id : provinceChooserCountryId === country.id,
        slot: index + 1,
      })),
    ]
  }

  if (menuId === 'political-province-target') {
    return [
      { id: 'create-province', label: `${ui.common.new} ${ui.common.province}`, visualLabel: ui.common.new, slot: 0 },
      ...radialPoliticalProvinces.map((province, index) => ({
        id: `political-province:${province.id}` as const,
        label: province.name,
        active: activeProvinceId === province.id,
        slot: index + 1,
      })),
    ]
  }

  if (menuId === 'city-place' || menuId === 'city-levels') {
    return radialCityLevels.map((level, index) => ({
      id: `city-level:${level.id}` as const,
      label: getCityLevelName(level.id, cityLevels, ui),
      active: effectiveCityBrushLevelId === level.id,
      slot: index,
    }))
  }

  if (editorMode !== 'political') {
    return null
  }

  if (politicalSubMode === 'city') {
    const previewCityLevels = getAltRadialPreviewItems(radialCityLevels, effectiveCityBrushLevelId, 4)
    return [
      { id: 'view', label: ui.politicalTool.view, active: cityToolMode === 'view', slot: 0 },
      { id: 'city-place', label: ui.politicalTool.place_city, visualLabel: ui.common.place, active: cityToolMode === 'place_city', slot: 1 },
      ...previewCityLevels.map((level, index) => ({
        id: `city-level:${level.id}` as const,
        label: getCityLevelName(level.id, cityLevels, ui),
        active: effectiveCityBrushLevelId === level.id,
        slot: index + 2,
      })),
    ]
  }

  const toolMode = politicalSubMode === 'country' ? countryToolMode : provinceToolMode
  if (politicalSubMode === 'country') {
    return [
      { id: 'view', label: ui.politicalTool.view, active: toolMode === 'view', slot: 0, ring: 'inner' },
      { id: 'paint', label: ui.politicalTool.paint, active: toolMode === 'paint', disabled: !canPaintCountries, slot: 1, ring: 'inner' },
      { id: 'erase', label: ui.politicalTool.erase, active: toolMode === 'erase', slot: 2, ring: 'inner' },
      { id: 'radius_0', label: 'R0', active: politicalPaintMode === 'radius_0', slot: 3, ring: 'inner' },
      { id: 'radius_1', label: 'R1', active: politicalPaintMode === 'radius_1', slot: 4, ring: 'inner' },
      { id: 'radius_2', label: 'R2', active: politicalPaintMode === 'radius_2', slot: 5, ring: 'inner' },
      { id: 'radius_3', label: 'R3', active: politicalPaintMode === 'radius_3', slot: 6, ring: 'inner' },
      { id: 'fill_type', label: ui.surface.fillType, visualLabel: ui.common.fill, active: politicalPaintMode === 'fill_type', slot: 4, ring: 'outer' },
      { id: 'fill_height', label: ui.surface.fillHeight, visualLabel: ui.common.height, active: politicalPaintMode === 'fill_height', slot: 5, ring: 'outer' },
      { id: 'create-country', label: `${ui.common.new} ${ui.common.country}`, visualLabel: ui.common.new, slot: 8, ring: 'outer' },
      ...recentPoliticalCountries.map((country, index) => ({
        id: `political-country:${country.id}` as const,
        label: country.name,
        swatchColor: country.color,
        active: activeCountryId === country.id,
        slot: 9 + index,
        ring: 'outer' as const,
      })),
    ]
  }

  return [
    { id: 'view', label: ui.politicalTool.view, active: toolMode === 'view', slot: 0, ring: 'inner' },
    { id: 'paint', label: ui.politicalTool.paint, active: toolMode === 'paint', disabled: !canPaintProvinces, slot: 1, ring: 'inner' },
    { id: 'erase', label: ui.politicalTool.erase, active: toolMode === 'erase', slot: 2, ring: 'inner' },
    { id: 'radius_0', label: 'R0', active: politicalPaintMode === 'radius_0', slot: 3, ring: 'inner' },
    { id: 'radius_1', label: 'R1', active: politicalPaintMode === 'radius_1', slot: 4, ring: 'inner' },
    { id: 'radius_2', label: 'R2', active: politicalPaintMode === 'radius_2', slot: 5, ring: 'inner' },
    { id: 'radius_3', label: 'R3', active: politicalPaintMode === 'radius_3', slot: 6, ring: 'inner' },
    { id: 'create-province', label: `${ui.common.new} ${ui.common.province}`, visualLabel: ui.common.new, slot: 7, ring: 'inner' },
    { id: 'fill_type', label: ui.surface.fillType, visualLabel: ui.common.fill, active: politicalPaintMode === 'fill_type', slot: 4, ring: 'outer' },
    { id: 'fill_height', label: ui.surface.fillHeight, visualLabel: ui.common.height, active: politicalPaintMode === 'fill_height', slot: 5, ring: 'outer' },
    ...recentPoliticalCountries.map((country, index) => ({
      id: `political-country:${country.id}` as const,
      label: country.name,
      swatchColor: country.color,
      active: provinceChooserCountryId === country.id,
      slot: 8 + index,
      ring: 'outer' as const,
    })),
    ...recentPoliticalProvinces.map((province, index) => ({
      id: `political-province:${province.id}` as const,
      label: province.name,
      active: activeProvinceId === province.id,
      slot: 20 + index,
      ring: 'outer' as const,
    })),
  ]
}

function buildLabelAltRadialItems(args: {
  editorMode: EditorMode
  menuId: AltRadialMenuId
  ui: AppMessages
  labelAnchorDisplayMode: LabelAnchorDisplayMode
  radialLabelGroups: LabelGroup[]
  activeManagedLabelGroupId: string | null
  hasAnyCountry: boolean
}): AltRadialActionItem[] | null {
  const {
    editorMode,
    menuId,
    ui,
    labelAnchorDisplayMode,
    radialLabelGroups,
    activeManagedLabelGroupId,
    hasAnyCountry,
  } = args

  if (menuId === 'label-create') {
    return [
      { id: 'label-create-free', label: ui.common.labelItem, slot: 0 },
      {
        id: 'label-create-free-icon',
        label: `${ui.common.free} ${ui.common.icon}`,
        visualLabel: ui.common.icon,
        disabled: !hasAnyCountry,
        slot: 1,
      },
    ]
  }

  if (menuId === 'label-anchors') {
    return [
      { id: 'label-anchor-none', label: ui.common.none, active: labelAnchorDisplayMode === 'none', slot: 0 },
      { id: 'label-anchor-all', label: ui.label.all, active: labelAnchorDisplayMode === 'all', slot: 1 },
      { id: 'label-anchor-selected', label: ui.common.selected, active: labelAnchorDisplayMode === 'selected', slot: 2 },
    ]
  }

  if (menuId === 'label-groups') {
    return [
      { id: 'label-create-free-group', label: ui.label.newFreeGroup, visualLabel: ui.common.free, slot: 0 },
      { id: 'label-create-assigned-group', label: ui.label.newAssignedGroup, visualLabel: ui.common.assigned, slot: 1 },
      { id: 'label-groups-table', label: ui.common.fullTable, visualLabel: ui.common.table, slot: 2 },
      ...radialLabelGroups.map((group, index) => ({
        id: `label-group:${group.id}` as const,
        label: group.name,
        active: activeManagedLabelGroupId === group.id,
        slot: index + 3,
      })),
    ]
  }

  if (menuId === 'label-tables') {
    return [
      { id: 'label-groups-table', label: ui.common.labelGroups, visualLabel: ui.common.groups, slot: 0 },
      { id: 'label-text-table', label: ui.label.textFullTable, visualLabel: ui.common.text, slot: 1 },
      { id: 'label-icon-table', label: ui.label.iconFullTable, visualLabel: ui.common.icon, slot: 2 },
    ]
  }

  if (editorMode !== 'label') {
    return null
  }

  return [
    { id: 'label-create-free', label: ui.common.labelItem, slot: 0 },
    {
      id: 'label-create-free-icon',
      label: `${ui.common.free} ${ui.common.icon}`,
      visualLabel: ui.common.icon,
      disabled: !hasAnyCountry,
      slot: 1,
    },
  ]
}

function buildMoveAltRadialItems(args: {
  editorMode: EditorMode
  menuId: AltRadialMenuId
  ui: AppMessages
  moveOperation: MoveOperation
  movePayload: MovePayload
  moveSourceCount: number
  movePreviewCount: number
  hasEffectiveMoveTargetCell: boolean
  isMoveSelectionMode: boolean
}): AltRadialActionItem[] | null {
  const {
    editorMode,
    menuId,
    ui,
    moveOperation,
    movePayload,
    moveSourceCount,
    movePreviewCount,
    hasEffectiveMoveTargetCell,
    isMoveSelectionMode,
  } = args

  if (menuId === 'move') {
    return [
      {
        id: 'move-apply',
        label: moveOperation === 'copy' ? ui.move.applyCopy : ui.move.applyMove,
        visualLabel: ui.common.apply,
        disabled: !(moveSourceCount > 0 && movePreviewCount > 0 && hasEffectiveMoveTargetCell),
        slot: 0,
      },
      { id: 'new-selection', label: ui.move.newSelection, visualLabel: ui.common.new, slot: 1 },
      { id: 'move-clear', label: ui.move.clearSelection, disabled: moveSourceCount === 0 && !isMoveSelectionMode, slot: 2 },
      { id: 'move-operation', label: ui.move.operation, slot: 3 },
      { id: 'move-payload', label: ui.move.payload, slot: 4 },
    ]
  }

  if (menuId === 'move-selection') {
    return [
      { id: 'new-selection', label: ui.move.newSelection, visualLabel: ui.common.new, slot: 0 },
      { id: 'move-clear', label: ui.move.clearSelection, disabled: moveSourceCount === 0 && !isMoveSelectionMode, slot: 1 },
    ]
  }

  if (menuId === 'move-operation') {
    return [
      { id: 'move-operation-move', label: ui.move.move, active: moveOperation === 'move', slot: 0 },
      {
        id: 'move-operation-copy',
        label: ui.move.copy,
        active: moveOperation === 'copy',
        disabled: movePayload !== 'terrain',
        slot: 1,
      },
    ]
  }

  if (menuId === 'move-payload') {
    return [
      { id: 'move-payload-terrain', label: ui.move.terrain, active: movePayload === 'terrain', slot: 0 },
      { id: 'move-payload-political', label: ui.move.political, active: movePayload === 'political', slot: 1 },
    ]
  }

  if (editorMode !== 'move') {
    return null
  }

  return [
    { id: 'move-payload-terrain', label: ui.move.terrain, active: movePayload === 'terrain', slot: 0 },
    { id: 'move-payload-political', label: ui.move.political, active: movePayload === 'political', slot: 1 },
    { id: 'move-operation-move', label: ui.move.move, active: moveOperation === 'move', slot: 2 },
    {
      id: 'move-operation-copy',
      label: ui.move.copy,
      active: moveOperation === 'copy',
      disabled: movePayload !== 'terrain',
      slot: 3,
    },
    {
      id: 'move-apply',
      label: moveOperation === 'copy' ? ui.move.applyCopy : ui.move.applyMove,
      visualLabel: ui.common.apply,
      disabled: !(moveSourceCount > 0 && movePreviewCount > 0 && hasEffectiveMoveTargetCell),
      slot: 4,
    },
    { id: 'new-selection', label: ui.move.newSelection, visualLabel: ui.common.new, slot: 5 },
    { id: 'move-clear', label: ui.move.clearSelection, disabled: moveSourceCount === 0 && !isMoveSelectionMode, slot: 6 },
  ]
}

function buildFallbackAltRadialItems(ui: AppMessages): AltRadialActionItem[] {
  return [
    { id: 'switch-mode', label: ui.common.mode },
    { id: 'move', label: ui.common.moveItem },
    { id: 'new-selection', label: ui.common.new },
  ]
}

interface UseAltRadialItemsArgs {
  ui: AppMessages
  altRadialMenu: AltRadialMenuId
  editorMode: EditorMode
  politicalSubMode: PoliticalSubMode
  world: WorldDocument
  worldState: {
    activeSubmapId: string | null
    isSubmapSelectionMode: boolean
    recentWorldSubmaps: Submap[]
    radialWorldSubmaps: Submap[]
    radialWorldLayers: LayerControlLike[]
    radialWorldLabelGroups: LabelGroup[]
    isWorldInfoExpanded: boolean
    isWorldStyleExpanded: boolean
    isWorldGridExpanded: boolean
  }
  surfaceState: {
    terrainDisplayMode: TerrainDisplayMode
    terrainBrushKind: TerrainBrushKind
    terrainBrushElevation: number
    terrainPaintMode: TerrainPaintMode
    terrainSnowLineElevation: number
  }
  politicalState: {
    countryToolMode: CountryToolMode
    provinceToolMode: ProvinceToolMode
    cityToolMode: CityToolMode
    politicalPaintMode: TerrainPaintMode
    canPaintCountries: boolean
    canPaintProvinces: boolean
    activeCountryId: string | null
    activeProvinceId: string | null
    provinceChooserCountryId: string | null
    radialPoliticalCountries: Country[]
    recentPoliticalCountries: Country[]
    recentPoliticalProvinces: Province[]
    radialPoliticalProvinces: Province[]
    radialCityLevels: CityLevel[]
    effectiveCityBrushLevelId: string | null
  }
  labelState: {
    labelAnchorDisplayMode: LabelAnchorDisplayMode
    radialLabelGroups: LabelGroup[]
    activeManagedLabelGroupId: string | null
    hasAnyCountry: boolean
  }
  moveState: {
    moveOperation: MoveOperation
    movePayload: MovePayload
    moveSourceCount: number
    movePreviewCount: number
    hasEffectiveMoveTargetCell: boolean
    isMoveSelectionMode: boolean
  }
}

export function useAltRadialItems({
  ui,
  altRadialMenu,
  editorMode,
  politicalSubMode,
  world,
  worldState,
  surfaceState,
  politicalState,
  labelState,
  moveState,
}: UseAltRadialItemsArgs) {
  return useMemo<AltRadialActionItem[]>(() => {
    if (altRadialMenu === 'switch-mode') {
      return buildSwitchModeAltRadialItems({
        ui,
        editorMode,
        politicalSubMode,
      })
    }

    const worldAltRadialItems = buildWorldAltRadialItems({
      editorMode,
      menuId: altRadialMenu,
      ui,
      activeSubmapId: worldState.activeSubmapId,
      isSubmapSelectionMode: worldState.isSubmapSelectionMode,
      recentWorldSubmaps: worldState.recentWorldSubmaps,
      radialWorldSubmaps: worldState.radialWorldSubmaps,
      radialWorldLayers: worldState.radialWorldLayers,
      radialWorldLabelGroups: worldState.radialWorldLabelGroups,
      isWorldInfoExpanded: worldState.isWorldInfoExpanded,
      isWorldStyleExpanded: worldState.isWorldStyleExpanded,
      isWorldGridExpanded: worldState.isWorldGridExpanded,
    })
    if (worldAltRadialItems) {
      return worldAltRadialItems
    }

    const surfaceAltRadialItems = buildSurfaceAltRadialItems({
      editorMode,
      menuId: altRadialMenu,
      ui,
      terrainDisplayMode: surfaceState.terrainDisplayMode,
      terrainBrushKind: surfaceState.terrainBrushKind,
      terrainBrushElevation: surfaceState.terrainBrushElevation,
      terrainPaintMode: surfaceState.terrainPaintMode,
      terrainSnowLineElevation: surfaceState.terrainSnowLineElevation,
    })
    if (surfaceAltRadialItems) {
      return surfaceAltRadialItems
    }

    const politicalAltRadialItems = buildPoliticalAltRadialItems({
      editorMode,
      menuId: altRadialMenu,
      ui,
      politicalSubMode,
      countryToolMode: politicalState.countryToolMode,
      provinceToolMode: politicalState.provinceToolMode,
      cityToolMode: politicalState.cityToolMode,
      politicalPaintMode: politicalState.politicalPaintMode,
      canPaintCountries: politicalState.canPaintCountries,
      canPaintProvinces: politicalState.canPaintProvinces,
      activeCountryId: politicalState.activeCountryId,
      activeProvinceId: politicalState.activeProvinceId,
      provinceChooserCountryId: politicalState.provinceChooserCountryId,
      radialPoliticalCountries: politicalState.radialPoliticalCountries,
      recentPoliticalCountries: politicalState.recentPoliticalCountries,
      recentPoliticalProvinces: politicalState.recentPoliticalProvinces,
      radialPoliticalProvinces: politicalState.radialPoliticalProvinces,
      radialCityLevels: politicalState.radialCityLevels,
      effectiveCityBrushLevelId: politicalState.effectiveCityBrushLevelId,
      cityLevels: world.cityLevels,
    })
    if (politicalAltRadialItems) {
      return politicalAltRadialItems
    }

    const labelAltRadialItems = buildLabelAltRadialItems({
      editorMode,
      menuId: altRadialMenu,
      ui,
      labelAnchorDisplayMode: labelState.labelAnchorDisplayMode,
      radialLabelGroups: labelState.radialLabelGroups,
      activeManagedLabelGroupId: labelState.activeManagedLabelGroupId,
      hasAnyCountry: labelState.hasAnyCountry,
    })
    if (labelAltRadialItems) {
      return labelAltRadialItems
    }

    const moveAltRadialItems = buildMoveAltRadialItems({
      editorMode,
      menuId: altRadialMenu,
      ui,
      moveOperation: moveState.moveOperation,
      movePayload: moveState.movePayload,
      moveSourceCount: moveState.moveSourceCount,
      movePreviewCount: moveState.movePreviewCount,
      hasEffectiveMoveTargetCell: moveState.hasEffectiveMoveTargetCell,
      isMoveSelectionMode: moveState.isMoveSelectionMode,
    })
    if (moveAltRadialItems) {
      return moveAltRadialItems
    }

    return buildFallbackAltRadialItems(ui)
  }, [
    altRadialMenu,
    editorMode,
    labelState.activeManagedLabelGroupId,
    labelState.hasAnyCountry,
    labelState.labelAnchorDisplayMode,
    labelState.radialLabelGroups,
    moveState.hasEffectiveMoveTargetCell,
    moveState.isMoveSelectionMode,
    moveState.moveOperation,
    moveState.movePayload,
    moveState.movePreviewCount,
    moveState.moveSourceCount,
    politicalState.activeCountryId,
    politicalState.activeProvinceId,
    politicalState.canPaintCountries,
    politicalState.canPaintProvinces,
    politicalState.cityToolMode,
    politicalState.countryToolMode,
    politicalState.effectiveCityBrushLevelId,
    politicalState.politicalPaintMode,
    politicalState.provinceChooserCountryId,
    politicalState.provinceToolMode,
    politicalState.radialCityLevels,
    politicalState.radialPoliticalCountries,
    politicalState.radialPoliticalProvinces,
    politicalState.recentPoliticalCountries,
    politicalState.recentPoliticalProvinces,
    politicalSubMode,
    surfaceState.terrainBrushElevation,
    surfaceState.terrainBrushKind,
    surfaceState.terrainDisplayMode,
    surfaceState.terrainPaintMode,
    surfaceState.terrainSnowLineElevation,
    ui,
    world.cityLevels,
    worldState.activeSubmapId,
    worldState.isSubmapSelectionMode,
    worldState.isWorldGridExpanded,
    worldState.isWorldInfoExpanded,
    worldState.isWorldStyleExpanded,
    worldState.radialWorldLabelGroups,
    worldState.radialWorldLayers,
    worldState.radialWorldSubmaps,
    worldState.recentWorldSubmaps,
  ])
}
