import type { Dispatch, SetStateAction } from 'react'

import { clamp } from '../../utils/appUtilities'
import { clampSurfaceElevation } from '../../domain/world'
import type { PoliticalSubMode } from '../../political/types'
import { getTerrainBrushElevationRange, type TerrainBrushKind, type TerrainPaintMode } from '../../components/surface/terrainBrush'
import type { ShortcutHintScope } from './shortcutHints'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'

export function getCurrentModeShortcutKeyValue(
  editorMode: EditorMode,
  politicalSubMode: PoliticalSubMode,
) {
  if (editorMode === 'world') return '1'
  if (editorMode === 'surface') return '2'
  if (editorMode === 'political') {
    if (politicalSubMode === 'country') return '3'
    if (politicalSubMode === 'province') return '4'
    return '5'
  }
  if (editorMode === 'label') return '6'
  return '7'
}

export function applyModeShortcutKeyState(args: {
  handleEditorModeChange: (mode: EditorMode) => void
  handlePoliticalSubModeChange: (mode: PoliticalSubMode) => void
  key: string
}) {
  if (args.key === '1') {
    args.handleEditorModeChange('world')
  } else if (args.key === '2') {
    args.handleEditorModeChange('surface')
  } else if (args.key === '3') {
    args.handleEditorModeChange('political')
    args.handlePoliticalSubModeChange('country')
  } else if (args.key === '4') {
    args.handleEditorModeChange('political')
    args.handlePoliticalSubModeChange('province')
  } else if (args.key === '5') {
    args.handleEditorModeChange('political')
    args.handlePoliticalSubModeChange('city')
  } else if (args.key === '6') {
    args.handleEditorModeChange('label')
  } else if (args.key === '7') {
    args.handleEditorModeChange('move')
  }
}

export function cyclePendingModeShortcutState(args: {
  altPendingModeKey: string
  applyModeShortcutKey: (key: string) => void
  delta: number
  setAltPendingModeKey: Dispatch<SetStateAction<string>>
}) {
  const ids = ['1', '2', '3', '4', '5', '6', '7']
  const currentIndex = Math.max(0, ids.findIndex((key) => key === args.altPendingModeKey))
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextKey = ids[nextIndex] ?? '1'
  args.setAltPendingModeKey(nextKey)
  args.applyModeShortcutKey(nextKey)
}

export function cycleTerrainBrushKindState(args: {
  delta: number
  focusTerrainSection: (sectionId: 'display' | 'paint' | 'base' | 'topography') => void
  setTerrainBrushElevation: Dispatch<SetStateAction<number>>
  setTerrainBrushKind: Dispatch<SetStateAction<TerrainBrushKind>>
  terrainBrushKind: TerrainBrushKind
}) {
  const ids: TerrainBrushKind[] = ['land', 'water', 'dark_water', 'empty', 'unknown']
  const currentIndex = Math.max(0, ids.findIndex((kind) => kind === args.terrainBrushKind))
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextKind = ids[nextIndex]
  args.focusTerrainSection('paint')
  args.setTerrainBrushKind(nextKind)
  if (nextKind !== 'empty' && nextKind !== 'unknown') {
    args.setTerrainBrushElevation((current) =>
      clamp(
        current,
        getTerrainBrushElevationRange(nextKind).min,
        getTerrainBrushElevationRange(nextKind).max,
      ),
    )
  }
}

export function cycleTerrainPaintModeState(args: {
  delta: number
  focusTerrainSection: (sectionId: 'display' | 'paint' | 'base' | 'topography') => void
  setBrushRadius: Dispatch<SetStateAction<number>>
  setTerrainPaintMode: Dispatch<SetStateAction<TerrainPaintMode>>
  terrainPaintMode: TerrainPaintMode
}) {
  const ids: TerrainPaintMode[] = ['radius_0', 'radius_1', 'radius_2', 'radius_3', 'fill_type', 'fill_height']
  const currentIndex = Math.max(0, ids.findIndex((mode) => mode === args.terrainPaintMode))
  const nextIndex = ((currentIndex + args.delta) % ids.length + ids.length) % ids.length
  const nextMode = ids[nextIndex]
  args.focusTerrainSection('paint')
  args.setTerrainPaintMode(nextMode)
  if (nextMode.startsWith('radius_')) {
    args.setBrushRadius(Number(nextMode.slice(-1)))
  }
}

export function adjustTerrainBrushElevationState(args: {
  delta: number
  setTerrainBrushElevation: Dispatch<SetStateAction<number>>
  terrainBrushKind: TerrainBrushKind
}) {
  if (args.terrainBrushKind === 'empty' || args.terrainBrushKind === 'unknown') {
    return
  }
  const range = getTerrainBrushElevationRange(args.terrainBrushKind)
  args.setTerrainBrushElevation((current) =>
    clampSurfaceElevation(
      args.terrainBrushKind === 'land' ? 'land' : 'water',
      clamp(current + args.delta, range.min, range.max),
    ),
  )
}

export function cycleZSupportedShortcutState(args: {
  activeSubmapId: string | null
  altPendingSectionKey: string
  altShortcutScope: ShortcutHintScope
  cyclePoliticalCountryTarget: (delta: number) => void
  cyclePoliticalPaintMode: (delta: number) => void
  cyclePoliticalProvinceTarget: (delta: number) => void
  cyclePoliticalTool: (delta: number) => void
  cycleTerrainBrushKind: (delta: number) => void
  cycleTerrainDisplayMode: (delta: number) => void
  cycleTerrainPaintMode: (delta: number) => void
  cycleWorldSubmapTarget: (delta: number) => void
  editorMode: EditorMode
  politicalSubMode: PoliticalSubMode
  provinceChooserProvinceCount: number
  sortedCountryCount: number
  submapCount: number
  toggleWorldLabelGroupShortcutTarget: () => boolean
  toggleWorldLayerShortcutTarget: () => boolean
}) {
  if (args.altShortcutScope === 'world-submaps') {
    args.cycleWorldSubmapTarget(1)
    return true
  }
  if (args.altShortcutScope === 'world-layers') {
    return args.toggleWorldLayerShortcutTarget()
  }
  if (args.altShortcutScope === 'world-label-groups') {
    return args.toggleWorldLabelGroupShortcutTarget()
  }
  if (args.altShortcutScope === 'political-tool') {
    args.cyclePoliticalTool(1)
    return true
  }
  if (args.altShortcutScope === 'political-country-target') {
    if (args.sortedCountryCount === 0) {
      return false
    }
    args.cyclePoliticalCountryTarget(1)
    return true
  }
  if (args.altShortcutScope === 'political-province-target') {
    if (args.provinceChooserProvinceCount === 0) {
      return false
    }
    args.cyclePoliticalProvinceTarget(1)
    return true
  }
  if (args.altShortcutScope === 'political-paint-mode') {
    args.cyclePoliticalPaintMode(1)
    return true
  }
  if (args.altShortcutScope === 'terrain-display') {
    args.cycleTerrainDisplayMode(1)
    return true
  }
  if (args.altShortcutScope === 'terrain-brush-type') {
    args.cycleTerrainBrushKind(1)
    return true
  }
  if (args.altShortcutScope === 'terrain-paint-mode') {
    args.cycleTerrainPaintMode(1)
    return true
  }
  if (args.altShortcutScope !== 'sections') {
    return false
  }

  if (args.editorMode === 'surface') {
    if (args.altPendingSectionKey === '1') {
      args.cycleTerrainDisplayMode(1)
      return true
    }
    if (args.altPendingSectionKey === '2') {
      args.cycleTerrainBrushKind(1)
      return true
    }
    if (args.altPendingSectionKey === '3') {
      args.cycleTerrainPaintMode(1)
      return true
    }
    return false
  }

  if (args.editorMode === 'political') {
    if (args.politicalSubMode === 'country') {
      if (args.altPendingSectionKey === '1') {
        args.cyclePoliticalTool(1)
        return true
      }
      if (args.altPendingSectionKey === '2') {
        if (args.sortedCountryCount === 0) {
          return false
        }
        args.cyclePoliticalCountryTarget(1)
        return true
      }
      if (args.altPendingSectionKey === '3') {
        args.cyclePoliticalPaintMode(1)
        return true
      }
      return false
    }
    if (args.politicalSubMode === 'province') {
      if (args.altPendingSectionKey === '1') {
        args.cyclePoliticalTool(1)
        return true
      }
      if (args.altPendingSectionKey === '2') {
        if (args.sortedCountryCount === 0) {
          return false
        }
        args.cyclePoliticalCountryTarget(1)
        return true
      }
      if (args.altPendingSectionKey === '3') {
        if (args.provinceChooserProvinceCount === 0) {
          return false
        }
        args.cyclePoliticalProvinceTarget(1)
        return true
      }
      if (args.altPendingSectionKey === '4') {
        args.cyclePoliticalPaintMode(1)
        return true
      }
      return false
    }
    if (args.politicalSubMode === 'city' && args.altPendingSectionKey === '1') {
      args.cyclePoliticalTool(1)
      return true
    }
  }

  if (args.editorMode === 'world' && args.altPendingSectionKey === '1') {
    if (args.submapCount === 0 && args.activeSubmapId === null) {
      return false
    }
    args.cycleWorldSubmapTarget(1)
    return true
  }

  return false
}
