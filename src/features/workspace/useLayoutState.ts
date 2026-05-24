import { useRef, useState } from 'react'

import type { CanvasViewState } from '../../render/HexMapCanvas'

type ObjectEditorPresentation = 'sidecar'
type ObjectEditorSidecarAnchor = 'inspector' | 'expanded-table' | 'left-sidebar'
type LabelAnchorDisplayMode = 'none' | 'all' | 'selected'
type DoubleOpenMode = 'always' | 'matched' | 'never'
type ExpandedTableId = 'cities' | 'countries' | 'provinces' | 'label-groups' | 'text-labels' | 'icon-labels' | 'icons' | 'fonts' | null
type ActiveSidebarResize = 'left' | 'right' | 'floating-table' | 'icon-manager-width' | 'icon-manager-height' | null

const FLOATING_TABLE_WIDTH_STORAGE_KEY = 'hex-map-editor:floating-table-width'
const ICON_MANAGER_WIDTH_STORAGE_KEY = 'hex-map-editor:icon-manager-width'
const ICON_MANAGER_HEIGHT_OFFSET_STORAGE_KEY = 'hex-map-editor:icon-manager-height-offset'
const DEFAULT_FLOATING_TABLE_WIDTH = 1120

function restoreStoredInt(key: string, fallback: number, min: number, max: number): number {
  if (typeof window === 'undefined') return fallback
  const stored = window.localStorage.getItem(key)
  const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), max) : fallback
}

export function useLayoutState() {
  const [objectEditorPresentation, setObjectEditorPresentation] =
    useState<ObjectEditorPresentation>('sidecar')
  const [objectEditorSidecarAnchor, setObjectEditorSidecarAnchor] =
    useState<ObjectEditorSidecarAnchor>('inspector')
  const [labelAnchorDisplayMode, setLabelAnchorDisplayMode] =
    useState<LabelAnchorDisplayMode>('none')
  const [labelDoubleOpenMode, setLabelDoubleOpenMode] = useState<DoubleOpenMode>('always')
  const [cityDoubleOpenMode, setCityDoubleOpenMode] = useState<DoubleOpenMode>('always')
  const [countryDoubleOpenMode, setCountryDoubleOpenMode] = useState<DoubleOpenMode>('always')
  const [provinceDoubleOpenMode, setProvinceDoubleOpenMode] = useState<DoubleOpenMode>('matched')
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(360)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(400)
  const [canvasViewStates, setCanvasViewStates] = useState<Record<string, CanvasViewState>>({})
  const [expandedTableId, setExpandedTableId] = useState<ExpandedTableId>(null)
  const [expandedCountriesSearch, setExpandedCountriesSearch] = useState('')
  const [expandedProvincesSearch, setExpandedProvincesSearch] = useState('')
  const [expandedCitiesSearch, setExpandedCitiesSearch] = useState('')
  const [expandedLabelGroupsSearch, setExpandedLabelGroupsSearch] = useState('')
  const [expandedLabelsSearch, setExpandedLabelsSearch] = useState('')
  const [floatingTableWidth, setFloatingTableWidth] = useState(() =>
    restoreStoredInt(FLOATING_TABLE_WIDTH_STORAGE_KEY, DEFAULT_FLOATING_TABLE_WIDTH, 760, 1440),
  )
  const [iconManagerWidth, setIconManagerWidth] = useState(() =>
    restoreStoredInt(ICON_MANAGER_WIDTH_STORAGE_KEY, 860, 640, 1080),
  )
  const [iconManagerHeightOffset, setIconManagerHeightOffset] = useState(() =>
    restoreStoredInt(ICON_MANAGER_HEIGHT_OFFSET_STORAGE_KEY, 0, -160, 320),
  )
  const [activeSidebarResize, setActiveSidebarResize] = useState<ActiveSidebarResize>(null)
  const [submapEditorCardOffsetTop, setSubmapEditorCardOffsetTop] = useState<number>(72)
  const [submapEditorLeft, setSubmapEditorLeft] = useState<number | null>(null)
  const [submapConfirmPosition, setSubmapConfirmPosition] = useState<{ top: number; left: number } | null>(null)
  const sidebarRef = useRef<HTMLElement | null>(null)
  const submapRowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const projectFileInputRef = useRef<HTMLInputElement | null>(null)
  const configFileInputRef = useRef<HTMLInputElement | null>(null)
  const iconFileInputRef = useRef<HTMLInputElement | null>(null)
  const suppressSidebarRowClickRef = useRef(false)

  return {
    objectEditorPresentation, setObjectEditorPresentation,
    objectEditorSidecarAnchor, setObjectEditorSidecarAnchor,
    labelAnchorDisplayMode, setLabelAnchorDisplayMode,
    labelDoubleOpenMode, setLabelDoubleOpenMode,
    cityDoubleOpenMode, setCityDoubleOpenMode,
    countryDoubleOpenMode, setCountryDoubleOpenMode,
    provinceDoubleOpenMode, setProvinceDoubleOpenMode,
    leftSidebarWidth, setLeftSidebarWidth,
    rightSidebarWidth, setRightSidebarWidth,
    canvasViewStates, setCanvasViewStates,
    expandedTableId, setExpandedTableId,
    expandedCountriesSearch, setExpandedCountriesSearch,
    expandedProvincesSearch, setExpandedProvincesSearch,
    expandedCitiesSearch, setExpandedCitiesSearch,
    expandedLabelGroupsSearch, setExpandedLabelGroupsSearch,
    expandedLabelsSearch, setExpandedLabelsSearch,
    floatingTableWidth, setFloatingTableWidth,
    iconManagerWidth, setIconManagerWidth,
    iconManagerHeightOffset, setIconManagerHeightOffset,
    activeSidebarResize, setActiveSidebarResize,
    submapEditorCardOffsetTop, setSubmapEditorCardOffsetTop,
    submapEditorLeft, setSubmapEditorLeft,
    submapConfirmPosition, setSubmapConfirmPosition,
    sidebarRef,
    submapRowRefs,
    projectFileInputRef,
    configFileInputRef,
    iconFileInputRef,
    suppressSidebarRowClickRef,
    FLOATING_TABLE_WIDTH_STORAGE_KEY,
    ICON_MANAGER_WIDTH_STORAGE_KEY,
    ICON_MANAGER_HEIGHT_OFFSET_STORAGE_KEY,
  }
}

export const MIN_RIGHT_SIDEBAR_WIDTH = 375

export type LayoutState = ReturnType<typeof useLayoutState>
export type { ObjectEditorPresentation, ObjectEditorSidecarAnchor, LabelAnchorDisplayMode, DoubleOpenMode, ExpandedTableId, ActiveSidebarResize }
