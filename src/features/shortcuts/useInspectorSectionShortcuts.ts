import { useCallback, type Dispatch, type SetStateAction } from 'react'

import type { CityToolSectionId } from '../../political/types'
import type { ShortcutHintScope } from './shortcutHints'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { TerrainBrushContextValue } from '../../state/TerrainBrushContext'

type TerrainSection = 'display' | 'paint' | 'base' | 'topography'
type TerrainDisplayMode = 'surface' | 'topography'
type CityToolSectionsState = Record<CityToolSectionId, boolean>

interface UseInspectorSectionShortcutsArgs {
  contexts: {
    editorMode: Pick<EditorModeContextValue, 'editorMode' | 'politicalSubMode'>
    terrainBrush: Pick<TerrainBrushContextValue, 'terrainDisplayMode' | 'setTerrainDisplayMode'>
  }
  state: {
    altPendingSectionKey: string
    expandedCityToolSections: CityToolSectionsState
    isCityStyleSectionExpanded: boolean
    isCountrySectionExpanded: boolean
    isCountryStyleSectionExpanded: boolean
    isGovernmentTypesSectionExpanded: boolean
    isLabelGroupsSectionExpanded: boolean
    isLabelsSectionExpanded: boolean
    isProvinceInfoExpanded: boolean
    isProvinceListExpanded: boolean
    isTerrainBaseStyleExpanded: boolean
    isTerrainDisplayExpanded: boolean
    isTerrainPaintExpanded: boolean
    isTerrainTopographyExpanded: boolean
    isWorldGridExpanded: boolean
    isWorldInfoExpanded: boolean
    isWorldStyleExpanded: boolean
  }
  actions: {
    setAltPendingSectionKey: Dispatch<SetStateAction<string>>
    setAltShortcutScope: Dispatch<SetStateAction<ShortcutHintScope>>
    setExpandedCityToolSections: Dispatch<SetStateAction<CityToolSectionsState>>
    setIsCityStyleSectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsCountrySectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsCountryStyleSectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsGovernmentTypesSectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsLabelGroupsSectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsLabelsSectionExpanded: Dispatch<SetStateAction<boolean>>
    setIsProvinceInfoExpanded: Dispatch<SetStateAction<boolean>>
    setIsProvinceListExpanded: Dispatch<SetStateAction<boolean>>
    setIsTerrainBaseStyleExpanded: Dispatch<SetStateAction<boolean>>
    setIsTerrainDisplayExpanded: Dispatch<SetStateAction<boolean>>
    setIsTerrainPaintExpanded: Dispatch<SetStateAction<boolean>>
    setIsTerrainTopographyExpanded: Dispatch<SetStateAction<boolean>>
    setIsWorldGridExpanded: Dispatch<SetStateAction<boolean>>
    setIsWorldInfoExpanded: Dispatch<SetStateAction<boolean>>
    setIsWorldStyleExpanded: Dispatch<SetStateAction<boolean>>
  }
  controllers: {
    cyclePoliticalTool: (delta: number) => void
  }
}

export function useInspectorSectionShortcuts({
  contexts,
  state,
  actions,
  controllers,
}: UseInspectorSectionShortcutsArgs) {
  const { editorMode, politicalSubMode } = contexts.editorMode
  const { terrainDisplayMode, setTerrainDisplayMode } = contexts.terrainBrush
  const {
    altPendingSectionKey,
    expandedCityToolSections,
    isCityStyleSectionExpanded,
    isCountrySectionExpanded,
    isCountryStyleSectionExpanded,
    isGovernmentTypesSectionExpanded,
    isLabelGroupsSectionExpanded,
    isLabelsSectionExpanded,
    isProvinceInfoExpanded,
    isProvinceListExpanded,
    isTerrainBaseStyleExpanded,
    isTerrainDisplayExpanded,
    isTerrainPaintExpanded,
    isTerrainTopographyExpanded,
    isWorldGridExpanded,
    isWorldInfoExpanded,
    isWorldStyleExpanded,
  } = state
  const {
    setAltPendingSectionKey,
    setAltShortcutScope,
    setExpandedCityToolSections,
    setIsCityStyleSectionExpanded,
    setIsCountrySectionExpanded,
    setIsCountryStyleSectionExpanded,
    setIsGovernmentTypesSectionExpanded,
    setIsLabelGroupsSectionExpanded,
    setIsLabelsSectionExpanded,
    setIsProvinceInfoExpanded,
    setIsProvinceListExpanded,
    setIsTerrainBaseStyleExpanded,
    setIsTerrainDisplayExpanded,
    setIsTerrainPaintExpanded,
    setIsTerrainTopographyExpanded,
    setIsWorldGridExpanded,
    setIsWorldInfoExpanded,
    setIsWorldStyleExpanded,
  } = actions
  const { cyclePoliticalTool } = controllers

  const focusTerrainSection = useCallback((section: TerrainSection) => {
    setIsTerrainDisplayExpanded(section === 'display')
    setIsTerrainPaintExpanded(section === 'paint')
    setIsTerrainBaseStyleExpanded(section === 'base')
    setIsTerrainTopographyExpanded(section === 'topography')
  }, [
    setIsTerrainBaseStyleExpanded,
    setIsTerrainDisplayExpanded,
    setIsTerrainPaintExpanded,
    setIsTerrainTopographyExpanded,
  ])

  const cycleTerrainDisplayMode = useCallback((delta: number) => {
    const ids: TerrainDisplayMode[] = ['surface', 'topography']
    const currentIndex = Math.max(0, ids.findIndex((mode) => mode === terrainDisplayMode))
    const nextIndex = ((currentIndex + delta) % ids.length + ids.length) % ids.length
    focusTerrainSection('display')
    setTerrainDisplayMode(ids[nextIndex]!)
  }, [
    focusTerrainSection,
    setTerrainDisplayMode,
    terrainDisplayMode,
  ])

  const activateShortcutSection = useCallback((key: string) => {
    if (editorMode === 'world') {
      if (key === '1') {
        setIsWorldInfoExpanded(true)
        setIsWorldStyleExpanded(false)
        setIsWorldGridExpanded(false)
      } else if (key === '2') {
        setIsWorldInfoExpanded(false)
        setIsWorldStyleExpanded(true)
        setIsWorldGridExpanded(false)
      } else if (key === '3') {
        setIsWorldInfoExpanded(false)
        setIsWorldStyleExpanded(false)
        setIsWorldGridExpanded(true)
      }
      return
    }

    if (editorMode === 'surface') {
      if (key === '1') {
        setIsTerrainDisplayExpanded(true)
        setIsTerrainPaintExpanded(false)
        setIsTerrainBaseStyleExpanded(false)
        setIsTerrainTopographyExpanded(false)
      } else if (key === '2') {
        setIsTerrainDisplayExpanded(false)
        setIsTerrainPaintExpanded(true)
        setIsTerrainBaseStyleExpanded(false)
        setIsTerrainTopographyExpanded(false)
      } else if (key === '3') {
        setIsTerrainDisplayExpanded(false)
        setIsTerrainPaintExpanded(false)
        setIsTerrainBaseStyleExpanded(true)
        setIsTerrainTopographyExpanded(false)
      } else if (key === '4') {
        setIsTerrainDisplayExpanded(false)
        setIsTerrainPaintExpanded(false)
        setIsTerrainBaseStyleExpanded(false)
        setIsTerrainTopographyExpanded(true)
      }
      return
    }

    if (editorMode === 'political') {
      if (politicalSubMode === 'country') {
        if (key === '1') {
          setIsCountrySectionExpanded(true)
          setIsGovernmentTypesSectionExpanded(false)
          setIsCountryStyleSectionExpanded(false)
        } else if (key === '2') {
          setIsCountrySectionExpanded(false)
          setIsGovernmentTypesSectionExpanded(true)
          setIsCountryStyleSectionExpanded(false)
        } else if (key === '3') {
          setIsCountrySectionExpanded(false)
          setIsGovernmentTypesSectionExpanded(false)
          setIsCountryStyleSectionExpanded(true)
        }
      } else if (politicalSubMode === 'province') {
        if (key === '1') {
          setIsProvinceListExpanded(true)
          setIsProvinceInfoExpanded(true)
          setIsCountryStyleSectionExpanded(false)
        } else if (key === '2') {
          setIsProvinceListExpanded(false)
          setIsProvinceInfoExpanded(false)
          setIsCountryStyleSectionExpanded(true)
        }
      } else if (politicalSubMode === 'city') {
        if (key === '1') {
          setExpandedCityToolSections({
            city_levels: true,
            city_management: false,
            city_automation: false,
          })
          setIsCityStyleSectionExpanded(false)
        } else if (key === '2') {
          setExpandedCityToolSections({
            city_levels: false,
            city_management: true,
            city_automation: false,
          })
          setIsCityStyleSectionExpanded(false)
        } else if (key === '3') {
          setExpandedCityToolSections({
            city_levels: false,
            city_management: false,
            city_automation: true,
          })
          setIsCityStyleSectionExpanded(false)
        } else if (key === '4') {
          setExpandedCityToolSections({
            city_levels: false,
            city_management: false,
            city_automation: false,
          })
          setIsCityStyleSectionExpanded(true)
        }
      }
      return
    }

    if (editorMode === 'label') {
      if (key === '1') {
        setIsLabelGroupsSectionExpanded(true)
        setIsLabelsSectionExpanded(false)
      } else if (key === '2') {
        setIsLabelGroupsSectionExpanded(false)
        setIsLabelsSectionExpanded(true)
      }
    }
  }, [
    editorMode,
    politicalSubMode,
    setExpandedCityToolSections,
    setIsCityStyleSectionExpanded,
    setIsCountrySectionExpanded,
    setIsCountryStyleSectionExpanded,
    setIsGovernmentTypesSectionExpanded,
    setIsLabelGroupsSectionExpanded,
    setIsLabelsSectionExpanded,
    setIsProvinceInfoExpanded,
    setIsProvinceListExpanded,
    setIsTerrainBaseStyleExpanded,
    setIsTerrainDisplayExpanded,
    setIsTerrainPaintExpanded,
    setIsTerrainTopographyExpanded,
    setIsWorldGridExpanded,
    setIsWorldInfoExpanded,
    setIsWorldStyleExpanded,
  ])

  const cycleInspectorSections = useCallback(() => {
    if (editorMode === 'world') {
      const ids = ['1', '2', '3']
      const current = isWorldInfoExpanded ? 0 : isWorldStyleExpanded ? 1 : isWorldGridExpanded ? 2 : -1
      if (current === -1) {
        activateShortcutSection('1')
        return
      }
      if (current === ids.length - 1) {
        setIsWorldInfoExpanded(false)
        setIsWorldStyleExpanded(false)
        setIsWorldGridExpanded(false)
        return
      }
      activateShortcutSection(ids[current + 1] ?? '1')
      return
    }

    if (editorMode === 'surface') {
      const ids = ['1', '2', '3', '4']
      const current = isTerrainDisplayExpanded
        ? 0
        : isTerrainPaintExpanded
          ? 1
          : isTerrainBaseStyleExpanded
            ? 2
            : isTerrainTopographyExpanded
              ? 3
              : -1
      if (current === -1) {
        activateShortcutSection('1')
        return
      }
      if (current === ids.length - 1) {
        setIsTerrainDisplayExpanded(false)
        setIsTerrainPaintExpanded(false)
        setIsTerrainBaseStyleExpanded(false)
        setIsTerrainTopographyExpanded(false)
        return
      }
      activateShortcutSection(ids[current + 1] ?? '1')
      return
    }

    if (editorMode === 'political') {
      if (politicalSubMode === 'country') {
        const ids = ['1', '2', '3']
        const current = isCountrySectionExpanded
          ? 0
          : isGovernmentTypesSectionExpanded
            ? 1
            : isCountryStyleSectionExpanded
              ? 2
              : -1
        if (current === -1) {
          activateShortcutSection('1')
          return
        }
        if (current === ids.length - 1) {
          setIsCountrySectionExpanded(false)
          setIsGovernmentTypesSectionExpanded(false)
          setIsCountryStyleSectionExpanded(false)
          return
        }
        activateShortcutSection(ids[current + 1] ?? '1')
        return
      }

      if (politicalSubMode === 'province') {
        const ids = ['1', '2']
        const current = isProvinceListExpanded || isProvinceInfoExpanded ? 0 : isCountryStyleSectionExpanded ? 1 : -1
        if (current === -1) {
          activateShortcutSection('1')
          return
        }
        if (current === ids.length - 1) {
          setIsProvinceListExpanded(false)
          setIsProvinceInfoExpanded(false)
          setIsCountryStyleSectionExpanded(false)
          return
        }
        activateShortcutSection(ids[current + 1] ?? '1')
        return
      }

      const ids = ['1', '2', '3', '4']
      const current = expandedCityToolSections.city_levels
        ? 0
        : expandedCityToolSections.city_management
          ? 1
          : expandedCityToolSections.city_automation
            ? 2
            : isCityStyleSectionExpanded
              ? 3
              : -1
      if (current === -1) {
        activateShortcutSection('1')
        return
      }
      if (current === ids.length - 1) {
        setExpandedCityToolSections({
          city_levels: false,
          city_management: false,
          city_automation: false,
        })
        setIsCityStyleSectionExpanded(false)
        return
      }
      activateShortcutSection(ids[current + 1] ?? '1')
      return
    }

    if (editorMode === 'label') {
      const ids = ['1', '2']
      const current = isLabelGroupsSectionExpanded ? 0 : isLabelsSectionExpanded ? 1 : -1
      if (current === -1) {
        activateShortcutSection('1')
        return
      }
      if (current === ids.length - 1) {
        setIsLabelGroupsSectionExpanded(false)
        setIsLabelsSectionExpanded(false)
        return
      }
      activateShortcutSection(ids[current + 1] ?? '1')
    }
  }, [
    activateShortcutSection,
    editorMode,
    expandedCityToolSections,
    isCityStyleSectionExpanded,
    isCountrySectionExpanded,
    isCountryStyleSectionExpanded,
    isGovernmentTypesSectionExpanded,
    isLabelGroupsSectionExpanded,
    isLabelsSectionExpanded,
    isProvinceInfoExpanded,
    isProvinceListExpanded,
    isTerrainBaseStyleExpanded,
    isTerrainDisplayExpanded,
    isTerrainPaintExpanded,
    isTerrainTopographyExpanded,
    isWorldGridExpanded,
    isWorldInfoExpanded,
    isWorldStyleExpanded,
    politicalSubMode,
    setExpandedCityToolSections,
    setIsCityStyleSectionExpanded,
    setIsCountrySectionExpanded,
    setIsCountryStyleSectionExpanded,
    setIsGovernmentTypesSectionExpanded,
    setIsLabelGroupsSectionExpanded,
    setIsLabelsSectionExpanded,
    setIsProvinceInfoExpanded,
    setIsProvinceListExpanded,
    setIsTerrainBaseStyleExpanded,
    setIsTerrainDisplayExpanded,
    setIsTerrainPaintExpanded,
    setIsTerrainTopographyExpanded,
    setIsWorldGridExpanded,
    setIsWorldInfoExpanded,
    setIsWorldStyleExpanded,
  ])

  const getCurrentSectionShortcutKey = useCallback(() => {
    if (editorMode === 'world') {
      return isWorldInfoExpanded ? '1' : isWorldStyleExpanded ? '2' : '3'
    }
    if (editorMode === 'surface') {
      return isTerrainDisplayExpanded ? '1' : isTerrainPaintExpanded ? '2' : isTerrainBaseStyleExpanded ? '3' : '4'
    }
    if (editorMode === 'political') {
      if (politicalSubMode === 'country') {
        return isCountrySectionExpanded ? '1' : isGovernmentTypesSectionExpanded ? '2' : '3'
      }
      if (politicalSubMode === 'province') {
        return isProvinceListExpanded || isProvinceInfoExpanded ? '1' : '2'
      }
      return expandedCityToolSections.city_levels
        ? '1'
        : expandedCityToolSections.city_management
          ? '2'
          : expandedCityToolSections.city_automation
            ? '3'
            : '4'
    }
    return isLabelGroupsSectionExpanded ? '1' : '2'
  }, [
    editorMode,
    expandedCityToolSections,
    isCountrySectionExpanded,
    isGovernmentTypesSectionExpanded,
    isLabelGroupsSectionExpanded,
    isProvinceInfoExpanded,
    isProvinceListExpanded,
    isTerrainBaseStyleExpanded,
    isTerrainDisplayExpanded,
    isTerrainPaintExpanded,
    isWorldInfoExpanded,
    isWorldStyleExpanded,
    politicalSubMode,
  ])

  const cycleShortcutSection = useCallback((delta: number) => {
    const ids =
      editorMode === 'world'
        ? ['1', '2', '3']
        : editorMode === 'surface'
          ? ['1', '2', '3', '4']
          : editorMode === 'political'
            ? politicalSubMode === 'country'
              ? ['1', '2', '3']
              : politicalSubMode === 'province'
                ? ['1', '2', '3', '4']
                : ['1']
            : ['1', '2']
    const currentIndex = Math.max(0, ids.findIndex((key) => key === altPendingSectionKey))
    const nextIndex = ((currentIndex + delta) % ids.length + ids.length) % ids.length
    setAltPendingSectionKey(ids[nextIndex] ?? '1')
  }, [
    altPendingSectionKey,
    editorMode,
    politicalSubMode,
    setAltPendingSectionKey,
  ])

  const commitSectionShortcutKey = useCallback((sectionKey: string) => {
    if (editorMode === 'world') {
      setAltShortcutScope(
        sectionKey === '1'
          ? 'world-submaps'
          : sectionKey === '2'
            ? 'world-layers'
            : sectionKey === '3'
              ? 'world-label-groups'
              : 'sections',
      )
      return
    }
    if (editorMode === 'surface') {
      if (sectionKey === '1') {
        cycleTerrainDisplayMode(1)
        setAltShortcutScope('sections')
        return
      }
      if (sectionKey === '1') {
        focusTerrainSection('display')
      } else {
        focusTerrainSection('paint')
      }
      setAltShortcutScope(
        sectionKey === '1'
          ? 'terrain-display'
          : sectionKey === '2'
            ? 'terrain-brush-type'
            : sectionKey === '3'
              ? 'terrain-paint-mode'
              : sectionKey === '4'
                ? 'terrain-elevation'
                : 'sections',
      )
      return
    }
    if (editorMode === 'political') {
      if (politicalSubMode === 'country') {
        if (sectionKey === '1') {
          cyclePoliticalTool(1)
          setAltShortcutScope('sections')
          return
        }
        activateShortcutSection(sectionKey === '3' ? '3' : '1')
        setAltShortcutScope(
          sectionKey === '1'
            ? 'political-tool'
            : sectionKey === '2'
              ? 'political-country-target'
              : sectionKey === '3'
                ? 'political-paint-mode'
                : 'sections',
        )
        return
      }
      if (politicalSubMode === 'province') {
        if (sectionKey === '1') {
          cyclePoliticalTool(1)
          setAltShortcutScope('sections')
          return
        }
        activateShortcutSection(sectionKey === '4' ? '2' : '1')
        setAltShortcutScope(
          sectionKey === '1'
            ? 'political-tool'
            : sectionKey === '2'
              ? 'political-country-target'
              : sectionKey === '3'
                ? 'political-province-target'
                : sectionKey === '4'
                  ? 'political-paint-mode'
                  : 'sections',
        )
        return
      }
      if (politicalSubMode === 'city') {
        if (sectionKey === '1') {
          cyclePoliticalTool(1)
          setAltShortcutScope('sections')
          return
        }
        activateShortcutSection('1')
        setAltShortcutScope('sections')
        return
      }
    }
    activateShortcutSection(sectionKey)
  }, [
    activateShortcutSection,
    cyclePoliticalTool,
    cycleTerrainDisplayMode,
    editorMode,
    focusTerrainSection,
    politicalSubMode,
    setAltShortcutScope,
  ])

  return {
    activateShortcutSection,
    cycleInspectorSections,
    getCurrentSectionShortcutKey,
    focusTerrainSection,
    cycleTerrainDisplayMode,
    cycleShortcutSection,
    commitSectionShortcutKey,
  }
}
