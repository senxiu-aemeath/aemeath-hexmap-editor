import { useState } from 'react'

import type { CityToolSectionId } from '../../political/types'

export function useSidebarSections() {
  // Political sections
  const [isCountrySectionExpanded, setIsCountrySectionExpanded] = useState(true)
  const [isCountryListExpanded, setIsCountryListExpanded] = useState(true)
  const [isCountryInfoExpanded, setIsCountryInfoExpanded] = useState(false)
  const [isGovernmentTypesSectionExpanded, setIsGovernmentTypesSectionExpanded] = useState(true)
  const [isCountryStyleSectionExpanded, setIsCountryStyleSectionExpanded] = useState(true)
  const [isCityStyleSectionExpanded, setIsCityStyleSectionExpanded] = useState(true)
  const [isGovernmentTypeListExpanded, setIsGovernmentTypeListExpanded] = useState(true)
  const [isGovernmentTypeInfoExpanded, setIsGovernmentTypeInfoExpanded] = useState(false)
  const [isCityListExpanded, setIsCityListExpanded] = useState(true)
  const [isCityInfoExpanded, setIsCityInfoExpanded] = useState(false)
  const [isProvinceListExpanded, setIsProvinceListExpanded] = useState(true)
  const [isProvinceInfoExpanded, setIsProvinceInfoExpanded] = useState(false)
  const [isCityLevelListExpanded, setIsCityLevelListExpanded] = useState(true)
  const [isCityLevelInfoExpanded, setIsCityLevelInfoExpanded] = useState(false)

  // Debug & world sections
  const [isDebugSectionExpanded, setIsDebugSectionExpanded] = useState(false)
  const [isWorldInfoExpanded, setIsWorldInfoExpanded] = useState(true)
  const [isWorldStyleExpanded, setIsWorldStyleExpanded] = useState(true)
  const [isWorldGridExpanded, setIsWorldGridExpanded] = useState(true)

  // Terrain sections
  const [isTerrainDisplayExpanded, setIsTerrainDisplayExpanded] = useState(true)
  const [isTerrainPaintExpanded, setIsTerrainPaintExpanded] = useState(true)
  const [isTerrainBaseStyleExpanded, setIsTerrainBaseStyleExpanded] = useState(true)
  const [isTerrainTopographyExpanded, setIsTerrainTopographyExpanded] = useState(true)

  // Left sidebar sections
  const [isSidebarSubmapsExpanded, setIsSidebarSubmapsExpanded] = useState(true)
  const [isSidebarLayersExpanded, setIsSidebarLayersExpanded] = useState(true)
  const [isSidebarLabelsExpanded, setIsSidebarLabelsExpanded] = useState(true)

  // Label sections
  const [isLabelGroupsSectionExpanded, setIsLabelGroupsSectionExpanded] = useState(true)
  const [isLabelGroupsListExpanded, setIsLabelGroupsListExpanded] = useState(true)
  const [isLabelGroupInfoExpanded, setIsLabelGroupInfoExpanded] = useState(false)
  const [isLabelsSectionExpanded, setIsLabelsSectionExpanded] = useState(true)
  const [isLabelsListExpanded, setIsLabelsListExpanded] = useState(true)
  const [isLabelInfoExpanded, setIsLabelInfoExpanded] = useState(false)

  // City tool expanded sections
  const [expandedCityToolSections, setExpandedCityToolSections] = useState<
    Record<CityToolSectionId, boolean>
  >({
    city_levels: true,
    city_automation: true,
    city_management: true,
  })

  // Dock open states
  const [isModeDockOpen, setIsModeDockOpen] = useState(false)
  const [isBrandDockOpen, setIsBrandDockOpen] = useState(false)
  const [isProjectDockOpen, setIsProjectDockOpen] = useState(false)
  const [isConfigDockOpen, setIsConfigDockOpen] = useState(false)

  return {
    isCountrySectionExpanded, setIsCountrySectionExpanded,
    isCountryListExpanded, setIsCountryListExpanded,
    isCountryInfoExpanded, setIsCountryInfoExpanded,
    isGovernmentTypesSectionExpanded, setIsGovernmentTypesSectionExpanded,
    isCountryStyleSectionExpanded, setIsCountryStyleSectionExpanded,
    isCityStyleSectionExpanded, setIsCityStyleSectionExpanded,
    isGovernmentTypeListExpanded, setIsGovernmentTypeListExpanded,
    isGovernmentTypeInfoExpanded, setIsGovernmentTypeInfoExpanded,
    isCityListExpanded, setIsCityListExpanded,
    isCityInfoExpanded, setIsCityInfoExpanded,
    isProvinceListExpanded, setIsProvinceListExpanded,
    isProvinceInfoExpanded, setIsProvinceInfoExpanded,
    isCityLevelListExpanded, setIsCityLevelListExpanded,
    isCityLevelInfoExpanded, setIsCityLevelInfoExpanded,
    isDebugSectionExpanded, setIsDebugSectionExpanded,
    isWorldInfoExpanded, setIsWorldInfoExpanded,
    isWorldStyleExpanded, setIsWorldStyleExpanded,
    isWorldGridExpanded, setIsWorldGridExpanded,
    isTerrainDisplayExpanded, setIsTerrainDisplayExpanded,
    isTerrainPaintExpanded, setIsTerrainPaintExpanded,
    isTerrainBaseStyleExpanded, setIsTerrainBaseStyleExpanded,
    isTerrainTopographyExpanded, setIsTerrainTopographyExpanded,
    isSidebarSubmapsExpanded, setIsSidebarSubmapsExpanded,
    isSidebarLayersExpanded, setIsSidebarLayersExpanded,
    isSidebarLabelsExpanded, setIsSidebarLabelsExpanded,
    isLabelGroupsSectionExpanded, setIsLabelGroupsSectionExpanded,
    isLabelGroupsListExpanded, setIsLabelGroupsListExpanded,
    isLabelGroupInfoExpanded, setIsLabelGroupInfoExpanded,
    isLabelsSectionExpanded, setIsLabelsSectionExpanded,
    isLabelsListExpanded, setIsLabelsListExpanded,
    isLabelInfoExpanded, setIsLabelInfoExpanded,
    expandedCityToolSections, setExpandedCityToolSections,
    isModeDockOpen, setIsModeDockOpen,
    isBrandDockOpen, setIsBrandDockOpen,
    isProjectDockOpen, setIsProjectDockOpen,
    isConfigDockOpen, setIsConfigDockOpen,
  }
}

export type SidebarSections = ReturnType<typeof useSidebarSections>
