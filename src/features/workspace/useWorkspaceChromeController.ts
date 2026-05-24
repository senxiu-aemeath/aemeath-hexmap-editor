import type { Dispatch, MutableRefObject, SetStateAction } from 'react'

import type { WorldDocument } from '../../domain/world'
import type { AppMessages } from '../../i18n'
import type { PoliticalSubMode } from '../../political/types'
import type { EditorModeContextValue } from '../../state/EditorModeContext'
import type { ActiveEntityContextValue } from '../../state/ActiveEntityContext'

type EditorMode = 'world' | 'surface' | 'political' | 'label' | 'move'
type DoubleOpenMode = 'always' | 'matched' | 'never'

interface LayerControlLike {
  id: string
  label: string
  visible: boolean
  meta: string
}

interface LabelGroupLike {
  id: string
  visible: boolean
  locked?: boolean
}

interface UseWorkspaceChromeControllerArgs {
  ui: AppMessages
  contexts: {
    editorMode: Pick<EditorModeContextValue, 'editorMode' | 'politicalSubMode'>
    activeEntity: Pick<ActiveEntityContextValue, 'setActiveSubmapId' | 'setIsSubmapSelectionMode'>
  }
  refs: {
    brandDockCloseTimerRef: MutableRefObject<number | null>
  }
  state: {
    labelDoubleOpenMode: DoubleOpenMode
    cityDoubleOpenMode: DoubleOpenMode
    countryDoubleOpenMode: DoubleOpenMode
    provinceDoubleOpenMode: DoubleOpenMode
    worldLabelGroups: Record<string, LabelGroupLike>
  }
  actions: {
    getThemeById: (themeId: string) => { uiIconInvert: boolean }
    handleEditorModeChange: (mode: EditorMode) => void
    handlePoliticalSubModeChange: (mode: PoliticalSubMode) => void
    moveLayer: (layers: LayerControlLike[], fromIndex: number, toIndex: number) => LayerControlLike[]
    normalizeSidebarNameScale: (value: number, fallback: number) => number
    setEditingSubmapId: Dispatch<SetStateAction<string | null>>
    setSubmapDraftName: Dispatch<SetStateAction<string>>
    setPendingSubmapDeleteId: Dispatch<SetStateAction<string | null>>
    setLayers: Dispatch<SetStateAction<LayerControlLike[]>>
    setWorld: Dispatch<SetStateAction<WorldDocument>>
    upsertLabelGroup: (
      world: WorldDocument,
      group: LabelGroupLike,
    ) => WorldDocument
    setIsModeDockOpen: Dispatch<SetStateAction<boolean>>
    setIsBrandDockOpen: Dispatch<SetStateAction<boolean>>
    setIsProjectDockOpen: Dispatch<SetStateAction<boolean>>
    setIsConfigDockOpen: Dispatch<SetStateAction<boolean>>
    setWesternSidebarNameScale: Dispatch<SetStateAction<number>>
    setChineseSidebarNameScale: Dispatch<SetStateAction<number>>
    setPreviewCellsPerFrame: Dispatch<SetStateAction<number>>
    setActiveThemeId: Dispatch<SetStateAction<string>>
    setUiIconInvert: Dispatch<SetStateAction<boolean>>
    setLabelDoubleOpenMode: Dispatch<SetStateAction<DoubleOpenMode>>
    setCityDoubleOpenMode: Dispatch<SetStateAction<DoubleOpenMode>>
    setCountryDoubleOpenMode: Dispatch<SetStateAction<DoubleOpenMode>>
    setProvinceDoubleOpenMode: Dispatch<SetStateAction<DoubleOpenMode>>
    defaultWesternSidebarNameScale: number
    defaultChineseSidebarNameScale: number
  }
}

export function useWorkspaceChromeController({
  ui,
  contexts,
  refs,
  state,
  actions,
}: UseWorkspaceChromeControllerArgs) {
  const { editorMode, politicalSubMode } = contexts.editorMode
  const { setActiveSubmapId, setIsSubmapSelectionMode } = contexts.activeEntity
  const { brandDockCloseTimerRef } = refs
  const {
    labelDoubleOpenMode,
    cityDoubleOpenMode,
    countryDoubleOpenMode,
    provinceDoubleOpenMode,
    worldLabelGroups,
  } = state
  const {
    getThemeById,
    handleEditorModeChange,
    handlePoliticalSubModeChange,
    moveLayer,
    normalizeSidebarNameScale,
    setEditingSubmapId,
    setSubmapDraftName,
    setPendingSubmapDeleteId,
    setLayers,
    setWorld,
    upsertLabelGroup,
    setIsModeDockOpen,
    setIsBrandDockOpen,
    setIsProjectDockOpen,
    setIsConfigDockOpen,
    setWesternSidebarNameScale,
    setChineseSidebarNameScale,
    setPreviewCellsPerFrame,
    setActiveThemeId,
    setUiIconInvert,
    setLabelDoubleOpenMode,
    setCityDoubleOpenMode,
    setCountryDoubleOpenMode,
    setProvinceDoubleOpenMode,
    defaultWesternSidebarNameScale,
    defaultChineseSidebarNameScale,
  } = actions

  const clearBrandDockCloseTimer = () => {
    if (brandDockCloseTimerRef.current !== null) {
      window.clearTimeout(brandDockCloseTimerRef.current)
      brandDockCloseTimerRef.current = null
    }
  }

  const closeBrandDockNow = () => {
    clearBrandDockCloseTimer()
    setIsBrandDockOpen(false)
    setIsProjectDockOpen(false)
    setIsConfigDockOpen(false)
  }

  const scheduleBrandDockClose = () => {
    clearBrandDockCloseTimer()
    brandDockCloseTimerRef.current = window.setTimeout(() => {
      closeBrandDockNow()
    }, 140)
  }

  const handleToggleProjectDock = () => {
    setIsProjectDockOpen((current) => {
      const next = !current
      if (next) {
        setIsConfigDockOpen(false)
      }
      return next
    })
  }

  const handleToggleConfigDock = () => {
    setIsConfigDockOpen((current) => {
      const next = !current
      if (next) {
        setIsProjectDockOpen(false)
      }
      return next
    })
  }

  const handleWesternSidebarNameScaleInput = (value: string) => {
    const nextValue = Number.parseFloat(value)
    if (!Number.isFinite(nextValue)) {
      return
    }
    setWesternSidebarNameScale(
      normalizeSidebarNameScale(nextValue, defaultWesternSidebarNameScale),
    )
  }

  const handleChineseSidebarNameScaleInput = (value: string) => {
    const nextValue = Number.parseFloat(value)
    if (!Number.isFinite(nextValue)) {
      return
    }
    setChineseSidebarNameScale(
      normalizeSidebarNameScale(nextValue, defaultChineseSidebarNameScale),
    )
  }

  const handlePreviewCellsPerFrameInput = (value: string) => {
    const nextValue = Number(value)
    if (!Number.isFinite(nextValue)) {
      return
    }
    setPreviewCellsPerFrame(Math.max(1, Math.min(240, Math.round(nextValue))))
  }

  const handleThemeChange = (themeId: string) => {
    const nextTheme = getThemeById(themeId)
    setActiveThemeId(themeId)
    setUiIconInvert(nextTheme.uiIconInvert)
  }

  const handleShowFullMap = () => {
    setActiveSubmapId(null)
    setEditingSubmapId(null)
    setSubmapDraftName('')
    setIsSubmapSelectionMode(false)
  }

  const handleToggleSubmapSelectionMode = () => {
    setActiveSubmapId(null)
    setIsSubmapSelectionMode((current) => !current)
    setEditingSubmapId(null)
    setSubmapDraftName('')
  }

  const handleSelectSidebarSubmap = (submapId: string) => {
    setActiveSubmapId(submapId)
    setIsSubmapSelectionMode(false)
  }

  const handleToggleSidebarPendingSubmapDelete = (submapId: string) => {
    setPendingSubmapDeleteId((current) => (current === submapId ? null : submapId))
  }

  const handleToggleSidebarLayerVisibility = (layerId: string) => {
    setLayers((current) =>
      current.map((entry) =>
        entry.id === layerId ? { ...entry, visible: !entry.visible } : entry,
      ),
    )
  }

  const handleMoveSidebarLayer = (sourceLayerId: string, targetLayerId: string) => {
    setLayers((current) => {
      const fromIndex = current.findIndex((entry) => entry.id === sourceLayerId)
      const toIndex = current.findIndex((entry) => entry.id === targetLayerId)
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return current
      }
      return moveLayer(current, fromIndex, toIndex)
    })
  }

  const handleToggleSidebarLabelGroupVisibility = (groupId: string) => {
    const group = worldLabelGroups[groupId]
    if (!group) {
      return
    }
    setWorld((current) =>
      upsertLabelGroup(current, {
        ...group,
        visible: !group.visible,
      }),
    )
  }

  const handleToggleSidebarLabelGroupLocked = (groupId: string, locked: boolean) => {
    const group = worldLabelGroups[groupId]
    if (!group) {
      return
    }
    setWorld((current) =>
      upsertLabelGroup(current, {
        ...group,
        locked,
      }),
    )
  }

  const handleOpenModeDock = () => {
    setIsModeDockOpen(true)
  }

  const handleCloseModeDock = () => {
    setIsModeDockOpen(false)
  }

  const handleToggleModeDock = () => {
    setIsModeDockOpen((current) => !current)
  }

  const activeModeDockLabel =
    editorMode === 'political'
      ? `${ui.editorMode.political} · ${ui.politicalSubMode[politicalSubMode]}`
      : `${ui.editorMode[editorMode]}`

  const handleSelectPoliticalSubModeFromDock = (subModeId: string) => {
    handleEditorModeChange('political')
    handlePoliticalSubModeChange(subModeId as PoliticalSubMode)
  }

  const brandDockDoubleOpenRows = [
    {
      title: ui.common.labelItem,
      value: labelDoubleOpenMode,
      onChange: setLabelDoubleOpenMode,
    },
    {
      title: ui.common.city,
      value: cityDoubleOpenMode,
      onChange: setCityDoubleOpenMode,
    },
    {
      title: ui.common.country,
      value: countryDoubleOpenMode,
      onChange: setCountryDoubleOpenMode,
    },
    {
      title: ui.common.province,
      value: provinceDoubleOpenMode,
      onChange: setProvinceDoubleOpenMode,
    },
  ]

  return {
    clearBrandDockCloseTimer,
    closeBrandDockNow,
    scheduleBrandDockClose,
    handleToggleProjectDock,
    handleToggleConfigDock,
    handleWesternSidebarNameScaleInput,
    handleChineseSidebarNameScaleInput,
    handlePreviewCellsPerFrameInput,
    handleThemeChange,
    handleShowFullMap,
    handleToggleSubmapSelectionMode,
    handleSelectSidebarSubmap,
    handleToggleSidebarPendingSubmapDelete,
    handleToggleSidebarLayerVisibility,
    handleMoveSidebarLayer,
    handleToggleSidebarLabelGroupVisibility,
    handleToggleSidebarLabelGroupLocked,
    handleOpenModeDock,
    handleCloseModeDock,
    handleToggleModeDock,
    activeModeDockLabel,
    handleSelectPoliticalSubModeFromDock,
    brandDockDoubleOpenRows,
  }
}
