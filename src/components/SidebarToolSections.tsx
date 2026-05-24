import type { RefObject } from 'react'
import type { LabelGroup, Submap } from '../domain/world'
import { useUiMessages } from '../i18n'
import { SectionToggleHeader } from './SectionToggleHeader'
import { useActiveEntityContext } from '../state/ActiveEntityContext'

interface SidebarLayerItem {
  id: string
  label: string
  visible: boolean
  meta: string
}

interface SidebarToolSectionsProps {

  isSubmapsExpanded: boolean
  onToggleSubmapsExpanded: () => void
  submaps: Submap[]
  submapRowRefs: RefObject<Record<string, HTMLDivElement | null>>
  onShowFullMap: () => void
  onToggleSubmapSelectionMode: () => void
  onSelectSubmap: (submapId: string) => void
  onEditSubmap: (submap: Submap) => void
  onToggleSubmapDelete: (submapId: string) => void

  isLayersExpanded: boolean
  onToggleLayersExpanded: () => void
  layers: SidebarLayerItem[]
  draggedLayerId: string | null
  layerDropTargetId: string | null
  onDraggedLayerChange: (layerId: string | null) => void
  onLayerDropTargetChange: (layerId: string | null) => void
  onToggleLayerVisibility: (layerId: string) => void
  onMoveLayer: (sourceLayerId: string, targetLayerId: string) => void

  isLabelGroupsExpanded: boolean
  onToggleLabelGroupsExpanded: () => void
  labelGroups: LabelGroup[]
  labelCountByGroupId: Record<string, number>
  draggedLabelGroupId: string | null
  labelGroupDropTargetId: string | null
  onDraggedLabelGroupChange: (groupId: string | null) => void
  onLabelGroupDropTargetChange: (groupId: string | null) => void
  onToggleLabelGroupVisibility: (groupId: string) => void
  onToggleLabelGroupLocked: (groupId: string, locked: boolean) => void
  onMoveLabelGroup: (sourceGroupId: string, targetGroupId: string) => void

  suppressSidebarRowClickRef: RefObject<boolean>
}

export function SidebarToolSections({ isSubmapsExpanded,
  onToggleSubmapsExpanded,
  submaps,
  submapRowRefs,
  onShowFullMap,
  onToggleSubmapSelectionMode,
  onSelectSubmap,
  onEditSubmap,
  onToggleSubmapDelete,
  isLayersExpanded,
  onToggleLayersExpanded,
  layers,
  draggedLayerId,
  layerDropTargetId,
  onDraggedLayerChange,
  onLayerDropTargetChange,
  onToggleLayerVisibility,
  onMoveLayer,
  isLabelGroupsExpanded,
  onToggleLabelGroupsExpanded,
  labelGroups,
  labelCountByGroupId,
  draggedLabelGroupId,
  labelGroupDropTargetId,
  onDraggedLabelGroupChange,
  onLabelGroupDropTargetChange,
  onToggleLabelGroupVisibility,
  onToggleLabelGroupLocked,
  onMoveLabelGroup,
  suppressSidebarRowClickRef,
}: SidebarToolSectionsProps) {
  const ui = useUiMessages()
  const { activeSubmapId, isSubmapSelectionMode } = useActiveEntityContext()
  return (
    <div className="sidebar-tool-stack tool-section-stack">
      <section className="data-table-section section-gap sidebar-tool-section">
        <SectionToggleHeader
          title={ui.common.submaps}
          expanded={isSubmapsExpanded}
          onToggle={onToggleSubmapsExpanded}
        />
        {isSubmapsExpanded ? (
          <>
            <div className="submap-toolbar">
              <button
                className={`mode-button${activeSubmapId === null ? ' is-active' : ''}`}
                type="button"
                onClick={onShowFullMap}
              >
                {ui.common.full}
              </button>
              <button
                className={`mode-button${isSubmapSelectionMode ? ' is-active' : ''}`}
                type="button"
                onClick={onToggleSubmapSelectionMode}
              >
                {isSubmapSelectionMode ? ui.common.cancel : ui.common.new}
              </button>
            </div>
            <div className="submap-toolbar-divider" aria-hidden="true" />
            <div className="submap-list">
              {submaps.length === 0 ? (
                <div className="submap-item submap-item--compact submap-item--empty">
                  <strong>{ui.common.clickNewToCreateSubmap}</strong>
                </div>
              ) : null}
              {submaps.map((submap) => {
                const isActive = activeSubmapId === submap.id

                return (
                  <div
                    className="submap-item-wrap"
                    key={submap.id}
                    ref={(node) => {
                      submapRowRefs.current[submap.id] = node
                    }}
                  >
                    <div
                      className={`submap-item submap-item--compact${isActive ? ' is-active' : ''}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onSelectSubmap(submap.id)
                      }}
                      onDoubleClick={() => {
                        onEditSubmap(submap)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onSelectSubmap(submap.id)
                        }
                      }}
                    >
                      <div className="submap-item-main">
                        <strong>{submap.name}</strong>
                        <span>{submap.cellIds.length}</span>
                      </div>
                      <button
                        className="mini-icon-button"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onToggleSubmapDelete(submap.id)
                        }}
                      >
                        {ui.common.delete}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
      </section>

      <section className="data-table-section section-gap sidebar-tool-section">
        <SectionToggleHeader
          title={ui.layers.title}
          expanded={isLayersExpanded}
          onToggle={onToggleLayersExpanded}
        />
        {isLayersExpanded ? (
          <div className="sidebar-compact-table">
            <div className="sidebar-compact-table-head sidebar-layer-table-head">
              <span>{ui.common.name}</span>
            </div>
            <div className={`layer-list${draggedLayerId ? ' is-reordering' : ''}`}>
              {layers.map((layer) => (
                <div
                  className={`sidebar-compact-table-row sidebar-layer-row${draggedLayerId === layer.id ? ' is-dragging' : ''}${layerDropTargetId === layer.id ? ' is-drop-target' : ''}${layer.visible ? ' is-visible' : ' is-hidden'}`}
                  key={layer.id}
                  draggable
                  onClick={() => {
                    if (suppressSidebarRowClickRef.current) {
                      suppressSidebarRowClickRef.current = false
                      return
                    }
                    onToggleLayerVisibility(layer.id)
                  }}
                  onDragStart={(event) => {
                    suppressSidebarRowClickRef.current = true
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', layer.id)
                    onDraggedLayerChange(layer.id)
                  }}
                  onDragEnd={() => {
                    onDraggedLayerChange(null)
                    onLayerDropTargetChange(null)
                    window.setTimeout(() => {
                      suppressSidebarRowClickRef.current = false
                    }, 0)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    if (draggedLayerId && draggedLayerId !== layer.id) {
                      onLayerDropTargetChange(layer.id)
                    }
                  }}
                  onDragLeave={() => {
                    if (layerDropTargetId === layer.id) {
                      onLayerDropTargetChange(null)
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    const sourceLayerId =
                      event.dataTransfer.getData('text/plain') || draggedLayerId
                    if (!sourceLayerId || sourceLayerId === layer.id) {
                      onDraggedLayerChange(null)
                      onLayerDropTargetChange(null)
                      return
                    }
                    onMoveLayer(sourceLayerId, layer.id)
                    onDraggedLayerChange(null)
                    onLayerDropTargetChange(null)
                  }}
                >
                  <div className="sidebar-compact-table-primary">
                    <strong>{layer.label}</strong>
                    <small>{layer.meta}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="data-table-section section-gap sidebar-tool-section">
        <SectionToggleHeader
          title={ui.label.groups}
          expanded={isLabelGroupsExpanded}
          onToggle={onToggleLabelGroupsExpanded}
        />
        {isLabelGroupsExpanded ? (
          <div className="sidebar-compact-table">
            <div className="sidebar-compact-table-head sidebar-label-groups-head">
              <span>{ui.common.name}</span>
              <span>{ui.label.offsetLocked}</span>
            </div>
            <div className={`label-group-list${draggedLabelGroupId ? ' is-reordering' : ''}`}>
              {labelGroups.map((group) => (
                <div
                  className={`sidebar-compact-table-row sidebar-label-group-row${draggedLabelGroupId === group.id ? ' is-dragging' : ''}${labelGroupDropTargetId === group.id ? ' is-drop-target' : ''}${group.visible ? ' is-visible' : ' is-hidden'}`}
                  key={group.id}
                  draggable
                  onClick={() => {
                    if (suppressSidebarRowClickRef.current) {
                      suppressSidebarRowClickRef.current = false
                      return
                    }
                    onToggleLabelGroupVisibility(group.id)
                  }}
                  onDragStart={(event) => {
                    suppressSidebarRowClickRef.current = true
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', group.id)
                    onDraggedLabelGroupChange(group.id)
                  }}
                  onDragEnd={() => {
                    onDraggedLabelGroupChange(null)
                    onLabelGroupDropTargetChange(null)
                    window.setTimeout(() => {
                      suppressSidebarRowClickRef.current = false
                    }, 0)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    if (draggedLabelGroupId && draggedLabelGroupId !== group.id) {
                      onLabelGroupDropTargetChange(group.id)
                    }
                  }}
                  onDragLeave={() => {
                    if (labelGroupDropTargetId === group.id) {
                      onLabelGroupDropTargetChange(null)
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    const sourceGroupId =
                      event.dataTransfer.getData('text/plain') || draggedLabelGroupId
                    if (!sourceGroupId || sourceGroupId === group.id) {
                      onDraggedLabelGroupChange(null)
                      onLabelGroupDropTargetChange(null)
                      return
                    }
                    onMoveLabelGroup(sourceGroupId, group.id)
                    onDraggedLabelGroupChange(null)
                    onLabelGroupDropTargetChange(null)
                  }}
                >
                  <div className="sidebar-compact-table-primary">
                    <strong>{group.name}</strong>
                    <small>{labelCountByGroupId[group.id] ?? 0}</small>
                  </div>
                  <label className="sidebar-compact-check">
                    <input
                      type="checkbox"
                      checked={group.locked}
                      onClick={(event) => {
                        event.stopPropagation()
                      }}
                      onChange={(event) => {
                        onToggleLabelGroupLocked(group.id, event.target.checked)
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
