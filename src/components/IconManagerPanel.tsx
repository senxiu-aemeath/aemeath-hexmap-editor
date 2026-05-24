import { useMemo, useState } from 'react'
import { useUiMessages } from '../i18n'
import type { IconRegistryEntry } from '../features/icons/iconRegistry'

type IconManagerSortMode = 'alphabetic' | 'upload'

interface IconManagerPanelProps {
  entries: IconRegistryEntry[]
  selectedIconKey: string | null
  usageCountByKey: Record<string, number>
  searchValue: string
  activeTag: string | null
  sortMode: IconManagerSortMode
  availableTags: string[]
  onSearchChange: (value: string) => void
  onSelectTag: (tag: string | null) => void
  onChangeSortMode: (value: IconManagerSortMode) => void
  onSelectIcon: (iconKey: string) => void
  onUpload: () => void
  onRenameKey: (previousKey: string, nextKey: string) => void
  onUpdateLabel: (iconKey: string, nextLabel: string) => void
  onUpdateTags: (iconKey: string, nextTags: string) => void
  onRestoreBuiltIn: (iconKey: string) => void
  onRevert: () => void
  onRemove: (iconKey: string) => void
}

export function IconManagerPanel({
  entries,
  selectedIconKey,
  usageCountByKey,
  searchValue,
  activeTag,
  sortMode,
  availableTags,
  onSearchChange,
  onSelectTag,
  onChangeSortMode,
  onSelectIcon,
  onUpload,
  onRenameKey,
  onUpdateLabel,
  onUpdateTags,
  onRestoreBuiltIn,
  onRevert,
  onRemove,
}: IconManagerPanelProps) {
  const ui = useUiMessages()
  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.key === selectedIconKey) ?? entries[0] ?? null,
    [entries, selectedIconKey],
  )
  const selectedUsageCount = selectedEntry ? usageCountByKey[selectedEntry.key] ?? 0 : 0
  const canRestoreSelectedBuiltIn = Boolean(selectedEntry?.builtIn)
  const canDeleteSelected = Boolean(selectedEntry && !selectedEntry.builtIn && selectedUsageCount === 0)

  return (
    <div className="icon-manager-layout">
      <div className="icon-manager-toolbar">
        <div className="floating-table-toolbar-row">
          <button className="toolbar-action-button" type="button" onClick={onUpload}>
            {ui.icons.upload}
          </button>
          <button
            className="ghost-button"
            type="button"
            disabled={!canRestoreSelectedBuiltIn}
            onClick={() => {
              if (!selectedEntry?.builtIn) {
                return
              }
              onRestoreBuiltIn(selectedEntry.key)
            }}
          >
            {ui.icons.restoreBuiltIn}
          </button>
        </div>
        <div className="floating-table-toolbar-row">
          <label className="control-field compact-control-field icon-manager-sort-field">
            <span>{ui.icons.sortBy}</span>
            <select
              value={sortMode}
              onChange={(event) => {
                onChangeSortMode(event.target.value as IconManagerSortMode)
              }}
            >
              <option value="alphabetic">{ui.icons.sortAlphabetic}</option>
              <option value="upload">{ui.icons.sortUploadTime}</option>
            </select>
          </label>
          <div className="floating-table-search-group">
            <button
              className="ghost-button floating-table-search-clear icon-manager-search-clear"
              type="button"
              disabled={!searchValue}
              onClick={() => {
                onSearchChange('')
              }}
              aria-label={ui.common.clear}
            >
              ×
            </button>
            <input
              className="floating-table-search-input"
              type="text"
              value={searchValue}
              placeholder={ui.icons.searchPlaceholder}
              onChange={(event) => {
                onSearchChange(event.target.value)
              }}
            />
          </div>
        </div>
        <div className="icon-manager-tag-row">
          <button
            className={`icon-manager-tag${activeTag === null ? ' is-active' : ''}`}
            type="button"
            onClick={() => {
              onSelectTag(null)
            }}
          >
            {ui.label.all}
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              className={`icon-manager-tag${activeTag === tag ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                onSelectTag(tag)
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="icon-manager-browser-grid">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <button
              key={entry.key}
              className={`icon-manager-tile${selectedEntry?.key === entry.key ? ' is-active' : ''}`}
              type="button"
              onClick={() => {
                onSelectIcon(entry.key)
              }}
            >
              <span className="icon-manager-tile__preview">
                <img src={entry.src} alt={entry.key} />
              </span>
              <span className="icon-manager-tile__title">{entry.label}</span>
              <span className="icon-manager-tile__subtitle">{entry.key}</span>
            </button>
          ))
        ) : (
          <div className="floating-table-empty">{ui.icons.noIcons}</div>
        )}
      </div>
      <div className="icon-manager-editor">
        {selectedEntry ? (
          <>
            <div className="icon-manager-editor__grid">
              <div className="icon-manager-editor__preview-column">
                <div className="icon-manager-editor__preview">
                  <img src={selectedEntry.src} alt={selectedEntry.key} />
                </div>
              </div>
              <div className="icon-manager-editor__info">
                <div className="icon-manager-editor__heading">
                  <strong>{selectedEntry.label}</strong>
                  <span>{selectedEntry.key}</span>
                  <span>{selectedEntry.builtIn ? ui.icons.builtIn : ui.icons.custom}</span>
                  <span>{`${ui.icons.kind}: ${selectedEntry.kind}`}</span>
                  <span>{ui.icons.usedBy(selectedUsageCount)}</span>
                </div>
                <div className="icon-manager-editor__tags">
                  {selectedEntry.tags.map((tag) => (
                    <span key={tag} className="icon-manager-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <IconManagerEditorForm
                key={selectedEntry.key}
                ui={ui}
                selectedEntry={selectedEntry}
                canDeleteSelected={canDeleteSelected}
                onRenameKey={onRenameKey}
                onUpdateLabel={onUpdateLabel}
                onUpdateTags={onUpdateTags}
                onRevert={onRevert}
                onRemove={onRemove}
              />
            </div>
          </>
        ) : (
          <div className="floating-table-empty">{ui.icons.noIcons}</div>
        )}
      </div>
    </div>
  )
}

function IconManagerEditorForm({
  ui,
  selectedEntry,
  canDeleteSelected,
  onRenameKey,
  onUpdateLabel,
  onUpdateTags,
  onRevert,
  onRemove,
}: {
  ui: ReturnType<typeof useUiMessages>
  selectedEntry: IconRegistryEntry
  canDeleteSelected: boolean
  onRenameKey: (previousKey: string, nextKey: string) => void
  onUpdateLabel: (iconKey: string, nextLabel: string) => void
  onUpdateTags: (iconKey: string, nextTags: string) => void
  onRevert: () => void
  onRemove: (iconKey: string) => void
}) {
  const [draftKey, setDraftKey] = useState(selectedEntry.key)
  const [draftLabel, setDraftLabel] = useState(selectedEntry.label)
  const [draftTags, setDraftTags] = useState(selectedEntry.tags.join(', '))

  return (
    <div className="icon-manager-editor__form">
      <label className="control-field compact-control-field icon-manager-edit-field">
        <span>{ui.icons.rename}</span>
        <input
          type="text"
          value={draftKey}
          disabled={selectedEntry.builtIn}
          onChange={(event) => {
            setDraftKey(event.target.value)
          }}
          onBlur={(event) => {
            onRenameKey(selectedEntry.key, event.target.value)
          }}
        />
      </label>
      <label className="control-field compact-control-field icon-manager-edit-field">
        <span>{ui.icons.label}</span>
        <input
          type="text"
          value={draftLabel}
          onChange={(event) => {
            setDraftLabel(event.target.value)
          }}
          onBlur={(event) => {
            onUpdateLabel(selectedEntry.key, event.target.value)
          }}
        />
      </label>
      <label className="control-field compact-control-field icon-manager-edit-field">
        <span>{ui.common.tags}</span>
        <input
          type="text"
          value={draftTags}
          onChange={(event) => {
            setDraftTags(event.target.value)
          }}
          onBlur={(event) => {
            onUpdateTags(selectedEntry.key, event.target.value)
          }}
        />
      </label>
      <div className="editor-actions">
        <button className="ghost-button" type="button" onClick={onRevert}>
          {ui.icons.revert}
        </button>
        <button
          className="ghost-button danger-button"
          type="button"
          disabled={!canDeleteSelected}
          onClick={() => {
            if (selectedEntry.builtIn) {
              return
            }
            onRemove(selectedEntry.key)
          }}
        >
          {ui.icons.remove}
        </button>
      </div>
    </div>
  )
}
