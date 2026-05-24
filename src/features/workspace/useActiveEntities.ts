import { useState } from 'react'

export function useActiveEntities() {
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null)
  const [activeSubmapId, setActiveSubmapId] = useState<string | null>(null)
  const [submapRecentSelectionIds, setSubmapRecentSelectionIds] = useState<string[]>([])
  const [isSubmapSelectionMode, setIsSubmapSelectionMode] = useState(false)
  const [labelGroupFilter, setLabelGroupFilter] = useState<string>('all')
  const [activeCountryId, setActiveCountryId] = useState<string | null>(null)
  const [countryRecentSelectionIds, setCountryRecentSelectionIds] = useState<string[]>([])
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null)
  const [provinceRecentSelectionIds, setProvinceRecentSelectionIds] = useState<string[]>([])
  const [activeCityId, setActiveCityId] = useState<string | null>(null)
  const [activeLabelId, setActiveLabelId] = useState<string | null>(null)
  const [activeManagedLabelGroupId, setActiveManagedLabelGroupId] = useState<string | null>(null)
  const [activeCityLevelId, setActiveCityLevelId] = useState<string | null>(null)
  const [cityBrushLevelId, setCityBrushLevelId] = useState<string | null>(null)
  const [activeGovernmentTypeId, setActiveGovernmentTypeId] = useState<string | null>(null)

  return {
    hoveredCellId, setHoveredCellId,
    activeSubmapId, setActiveSubmapId,
    submapRecentSelectionIds, setSubmapRecentSelectionIds,
    isSubmapSelectionMode, setIsSubmapSelectionMode,
    labelGroupFilter, setLabelGroupFilter,
    activeCountryId, setActiveCountryId,
    countryRecentSelectionIds, setCountryRecentSelectionIds,
    activeProvinceId, setActiveProvinceId,
    provinceRecentSelectionIds, setProvinceRecentSelectionIds,
    activeCityId, setActiveCityId,
    activeLabelId, setActiveLabelId,
    activeManagedLabelGroupId, setActiveManagedLabelGroupId,
    activeCityLevelId, setActiveCityLevelId,
    cityBrushLevelId, setCityBrushLevelId,
    activeGovernmentTypeId, setActiveGovernmentTypeId,
  }
}
